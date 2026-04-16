import React from "@rbxts/react";
import { createPortal } from "@rbxts/react-roblox";
import { Players, RunService, UserInputService } from "@rbxts/services";
import { DragContext, DropInfo, pickBestContainer } from "./drag-context";

const DRAG_THRESHOLD = 6;

// ── Module-level ghost store ──────────────────────────────────────────────────

type ContentListener = (content: React.ReactNode) => void;
type PositionListener = (pos: UDim2) => void;
type HoveredListener = (containerId: string | undefined) => void;

let _ghostContent: React.ReactNode = undefined;
let _contentListeners: ContentListener[] = [];
let _positionListeners: PositionListener[] = [];
let _hoveredContainerId: string | undefined = undefined;
let _hoveredListeners: HoveredListener[] = [];

const ghostStore = {
	setContent(content: React.ReactNode) {
		_ghostContent = content;
		_contentListeners.forEach((l) => l(content));
	},
	setPosition(pos: Vector2) {
		const udim = UDim2.fromOffset(pos.X, pos.Y);
		_positionListeners.forEach((l) => l(udim));
	},
	setHoveredContainer(containerId: string | undefined) {
		if (_hoveredContainerId === containerId) return;
		_hoveredContainerId = containerId;
		_hoveredListeners.forEach((l) => l(containerId));
	},
	getContent() {
		return _ghostContent;
	},
	getHoveredContainer() {
		return _hoveredContainerId;
	},
	subscribeContent(listener: ContentListener): () => void {
		_contentListeners.push(listener);
		return () => {
			_contentListeners = _contentListeners.filter((l) => l !== listener);
		};
	},
	subscribePosition(listener: PositionListener): () => void {
		_positionListeners.push(listener);
		return () => {
			_positionListeners = _positionListeners.filter((l) => l !== listener);
		};
	},
	subscribeHoveredContainer(listener: HoveredListener): () => void {
		_hoveredListeners.push(listener);
		return () => {
			_hoveredListeners = _hoveredListeners.filter((l) => l !== listener);
		};
	},
};

// ── useIsDragging ─────────────────────────────────────────────────────────────

/** Returns true whenever any useDragClone drag is active. */
export function useIsDragging(): boolean {
	const [dragging, setDragging] = React.useState(ghostStore.getContent() !== undefined);
	React.useEffect(() => {
		return ghostStore.subscribeContent((content) => setDragging(content !== undefined));
	}, []);
	return dragging;
}

/** Returns true when a drag is active AND the cursor is over this specific container. */
export function useIsHoveredDropTarget(containerId: string): boolean {
	const [hovered, setHovered] = React.useState(ghostStore.getHoveredContainer() === containerId);
	React.useEffect(() => {
		return ghostStore.subscribeHoveredContainer((id) => setHovered(id === containerId));
	}, [containerId]);
	return hovered;
}

// ── DragCloneLayer ────────────────────────────────────────────────────────────

/**
 * Renders the floating ghost clone at the cursor position via a portal ScreenGui.
 * Place this once inside your UI tree (e.g. inside Braindex).
 */
export function DragCloneLayer() {
	const [content, setContent] = React.useState<React.ReactNode>(ghostStore.getContent());
	const [posBinding, setPosBinding] = React.useBinding(UDim2.fromOffset(0, 0));
	const [portalTarget, setPortalTarget] = React.useState<Instance | undefined>(undefined);

	React.useEffect(() => {
		const unsubContent = ghostStore.subscribeContent(setContent);
		const unsubPos = ghostStore.subscribePosition(setPosBinding);
		return () => {
			unsubContent();
			unsubPos();
		};
	}, []);

	React.useEffect(() => {
		if (!RunService.IsClient()) return;
		const player = Players.LocalPlayer;
		if (!player) return;

		const existing = player.FindFirstChildOfClass("PlayerGui");
		if (existing) {
			setPortalTarget(existing);
			return;
		}

		const waited = player.WaitForChild("PlayerGui", 15);
		if (waited && waited.IsA("PlayerGui")) {
			setPortalTarget(waited);
		}
	}, []);

	return (
		<>
			{content &&
				portalTarget &&
				createPortal(
					<screengui
						DisplayOrder={200}
						IgnoreGuiInset={true}
						ResetOnSpawn={false}
						ZIndexBehavior={Enum.ZIndexBehavior.Global}
					>
						<canvasgroup
							Position={posBinding}
							AnchorPoint={new Vector2(0.5, 0.5)}
							Size={new UDim2(0, 220, 0, 68)}
							GroupTransparency={0.15}
							BackgroundTransparency={1}
							BorderSizePixel={0}
						>
							{content}
						</canvasgroup>
					</screengui>,
					portalTarget,
				)}
		</>
	);
}

// ── useDragClone ──────────────────────────────────────────────────────────────

export interface UseDragCloneConfig {
	draggableId: string;
	enabled?: boolean;
	renderGhost: () => React.ReactNode;
	onDrop?: (info: DropInfo) => void;
}

/**
 * Hook that makes a GuiObject a drag-clone source.
 *
 * Returns:
 * - `isDragging` — true while the element is being dragged (ghost is visible)
 * - `onInputBegan` — attach to the element's InputBegan event
 *
 * When the user drags past DRAG_THRESHOLD pixels, a ghost clone is shown
 * following the cursor.  On release, `pickBestContainer` is called and
 * `onDrop` is fired if a valid DraggableContainer was found.
 */
export function useDragClone(config: UseDragCloneConfig): {
	isDragging: boolean;
	onInputBegan: (rbx: ImageButton, input: InputObject) => void;
} {
	const registry = React.useContext(DragContext);

	// Keep latest config + registry in refs so the stable callbacks always see fresh values.
	const enabledRef = React.useRef(config.enabled ?? true);
	enabledRef.current = config.enabled ?? true;

	const draggableIdRef = React.useRef(config.draggableId);
	draggableIdRef.current = config.draggableId;

	const renderGhostRef = React.useRef(config.renderGhost);
	renderGhostRef.current = config.renderGhost;

	const onDropRef = React.useRef(config.onDrop);
	onDropRef.current = config.onDrop;

	const registryRef = React.useRef(registry);
	registryRef.current = registry;

	const [isDragging, setIsDragging] = React.useState(false);

	// Internal drag state (never triggers re-renders by themselves)
	const isDraggingRef = React.useRef(false);
	const startPosRef = React.useRef(new Vector2(0, 0));
	const thresholdMetRef = React.useRef(false);
	const sourceGuiRef = React.useRef<ImageButton | undefined>(undefined);
	const renderSteppedConnRef = React.useRef<RBXScriptConnection | undefined>(undefined);
	const inputEndedConnRef = React.useRef<RBXScriptConnection | undefined>(undefined);

	// Stable stop function — all captured values are refs.
	const stopDrag = React.useRef(() => {
		renderSteppedConnRef.current?.Disconnect();
		renderSteppedConnRef.current = undefined;
		inputEndedConnRef.current?.Disconnect();
		inputEndedConnRef.current = undefined;
		isDraggingRef.current = false;
		thresholdMetRef.current = false;
		sourceGuiRef.current = undefined;
		setIsDragging(false);
		ghostStore.setContent(undefined);
		ghostStore.setHoveredContainer(undefined);
	}).current;

	// Stable input handler — reads all values through refs so it never needs to be recreated.
	const onInputBegan = React.useRef((rbx: ImageButton, input: InputObject) => {
		if (!enabledRef.current) return;
		if (input.UserInputType !== Enum.UserInputType.MouseButton1) return;
		if (isDraggingRef.current) return;

		isDraggingRef.current = true;
		thresholdMetRef.current = false;
		sourceGuiRef.current = rbx;
		startPosRef.current = UserInputService.GetMouseLocation();

		renderSteppedConnRef.current?.Disconnect();
		renderSteppedConnRef.current = RunService.RenderStepped.Connect(() => {
			const pos = UserInputService.GetMouseLocation();

			if (!thresholdMetRef.current) {
				const delta = pos.sub(startPosRef.current);
				if (math.abs(delta.X) > DRAG_THRESHOLD || math.abs(delta.Y) > DRAG_THRESHOLD) {
					thresholdMetRef.current = true;
					setIsDragging(true);
					ghostStore.setContent(renderGhostRef.current());
					ghostStore.setPosition(pos);
				}
			} else {
				ghostStore.setPosition(pos);
				const containers = registryRef.current.getContainers();
				const best = pickBestContainer(containers, pos, draggableIdRef.current);
				ghostStore.setHoveredContainer(best?.containerId);
			}
		});

		inputEndedConnRef.current?.Disconnect();
		inputEndedConnRef.current = UserInputService.InputEnded.Connect((endInput) => {
			if (endInput.UserInputType !== Enum.UserInputType.MouseButton1) return;

			if (thresholdMetRef.current) {
				const finalPos = UserInputService.GetMouseLocation();
				const containers = registryRef.current.getContainers();
				const best = pickBestContainer(containers, finalPos, draggableIdRef.current);
				if (best) {
					const src = sourceGuiRef.current;
					if (!src) return;
					const info: DropInfo = {
						draggableId: draggableIdRef.current,
						containerId: best.containerId,
						draggable: src,
						container: best.guiObject,
					};
					best.onDrop?.(info);
					onDropRef.current?.(info);
				}
			}

			stopDrag();
		});
	}).current;

	// Cleanup on unmount
	React.useEffect(() => {
		return () => stopDrag();
	}, []);

	return { isDragging, onInputBegan };
}
