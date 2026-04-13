import React from "@rbxts/react";

import { UserInputService } from "@rbxts/services";

import { DragContext, DropInfo, findNearestGuiObjectFromFolder, pickBestContainer } from "./drag-context";

export type DraggableProps = {
	draggableId: string;
	enabled?: boolean;
	canDropInto?: (containerId: string) => boolean;
	onDragStart?: () => void;
	onDragEnd?: () => void;
	onDrop?: (info: DropInfo) => void;
	children?: React.ReactNode;
};

export function Draggable(props: DraggableProps) {
	const { draggableId, enabled = true, canDropInto, onDragStart, onDragEnd, onDrop, children } = props;

	const registry = React.useContext(DragContext);
	const ref = React.useRef<Folder>();

	const detectorRef = React.useRef<UIDragDetector>();
	const dragStartConnRef = React.useRef<RBXScriptConnection>();
	const dragEndConnRef = React.useRef<RBXScriptConnection>();

	React.useEffect(() => {
		const folder = ref.current;
		if (!folder) return;

		let target = findNearestGuiObjectFromFolder(folder);
		if (!target) {
			task.spawn(() => {
				task.wait(0);
				target = folder ? findNearestGuiObjectFromFolder(folder) : undefined;
			});
		}

		if (!target) return;

		let detector = detectorRef.current;
		if (!detector) {
			detector = new Instance("UIDragDetector");
			detectorRef.current = detector;
		}

		detector.Enabled = enabled;
		detector.Parent = target;

		dragStartConnRef.current?.Disconnect();
		dragStartConnRef.current = detector.DragStart.Connect(() => {
			onDragStart?.();
		});

		dragEndConnRef.current?.Disconnect();
		dragEndConnRef.current = detector.DragEnd.Connect((inputPosition) => {
			onDragEnd?.();

			const containers = registry.getContainers();
			const best = pickBestContainer(containers, inputPosition, draggableId);
			if (!best) return;
			if (canDropInto && !canDropInto(best.containerId)) return;

			const currentTarget = findNearestGuiObjectFromFolder(folder);
			if (!currentTarget) return;

			currentTarget.Parent = best.guiObject;

			const info: DropInfo = {
				draggableId,
				containerId: best.containerId,
				draggable: currentTarget,
				container: best.guiObject,
			};

			best.onDrop?.(info);
			onDrop?.(info);
		});

		return () => {
			dragStartConnRef.current?.Disconnect();
			dragStartConnRef.current = undefined;
			dragEndConnRef.current?.Disconnect();
			dragEndConnRef.current = undefined;

			if (detectorRef.current && detectorRef.current.Parent === target) {
				detectorRef.current.Destroy();
			}
			detectorRef.current = undefined;
		};
	}, [draggableId, enabled, canDropInto, onDragStart, onDragEnd, onDrop]);

	// Ensure dragging works even if InputService is required to be initialized in some environments.
	// (Read access only; keeps dependency for Roblox environments where needed.)
	React.useEffect(() => {
		if (!enabled) return;
		const _ = UserInputService.GetMouseLocation();
		return;
	}, [enabled]);

	return (
		<>
			<folder ref={ref} />
			{children}
		</>
	);
}

