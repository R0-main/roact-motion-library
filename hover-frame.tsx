import React from "@rbxts/react";
import { createPortal } from "@rbxts/react-roblox";
import { Players, RunService, UserInputService } from "@rbxts/services";
import { MotionFade } from "./motion/motion-fade";
import { DeviceUtils } from "shared/utils/device-utils";

export interface HoverFrameProps {
	FadeTime?: number;
	Offset?: Vector2;
	ZIndex?: number;
	DisplayOrder?: number;
	Size?: UDim2;
	children?: React.ReactNode;
}

const defaultProps: Partial<HoverFrameProps> = {
	FadeTime: 0.2,
	Offset: new Vector2(15, 15),
	DisplayOrder: 100,
};

export function HoverFrame(props: HoverFrameProps) {
	let {
		FadeTime = defaultProps.FadeTime!,
		Offset = defaultProps.Offset!,
		ZIndex,
		DisplayOrder = defaultProps.DisplayOrder!,
		Size,
		children,
	} = props;

	if (DeviceUtils.IsMobile() || DeviceUtils.IsTablet()) {
		Offset = new Vector2(0, 0);
	}

	const triggerRef = React.useRef<Folder>();
	const [hovered, setHovered] = React.useState(false);
	const [rendering, setRendering] = React.useState(false);
	const [positionBinding, setPositionBinding] = React.useBinding(UDim2.fromOffset(0, 0));
	const [portalTarget, setPortalTarget] = React.useState<Instance | undefined>(undefined);
	const [dynamicOffset, setDynamicOffset] = React.useState(Offset);
	const rootGuiRef = React.useRef<Frame>();
	const canvasGroupRef = React.useRef<CanvasGroup>();
	const connEnterRef = React.useRef<RBXScriptConnection>();
	const connLeaveRef = React.useRef<RBXScriptConnection>();
	const connRenderRef = React.useRef<RBXScriptConnection>();
	const connPlayerGuiRef = React.useRef<RBXScriptConnection>();

	React.useEffect(() => {
		const folder = triggerRef.current;
		const guiObjectParent = folder?.Parent;

		if (guiObjectParent) {
			const layerCollector = guiObjectParent.FindFirstAncestorWhichIsA("LayerCollector");
			if (layerCollector) {
				setPortalTarget(layerCollector);
				return;
			}
		}

		// Fallback for in-game usage where we're under PlayerGui.
		if (!RunService.IsClient()) return;

		const player = Players.LocalPlayer;
		if (!player) return;

		const existing = player.FindFirstChildOfClass("PlayerGui");
		if (existing) {
			setPortalTarget(existing);
			return;
		}

		const timeoutSeconds = 15;
		const waited = player.WaitForChild("PlayerGui", timeoutSeconds);
		if (waited && waited.IsA("PlayerGui")) {
			setPortalTarget(waited);
			return;
		}

		connPlayerGuiRef.current?.Disconnect();
		connPlayerGuiRef.current = player.ChildAdded.Connect((child) => {
			if (child.IsA("PlayerGui")) {
				setPortalTarget(child);
				connPlayerGuiRef.current?.Disconnect();
				connPlayerGuiRef.current = undefined;
			}
		});

		warn(`HoverFrame: PlayerGui was not available after ${timeoutSeconds}s; waiting for it to be added.`);
		return () => {
			connPlayerGuiRef.current?.Disconnect();
			connPlayerGuiRef.current = undefined;
		};
	}, []);

	React.useEffect(() => {
		if (!RunService.IsClient()) return;

		const folder = triggerRef.current;
		const parent = folder?.Parent;

		if (parent && parent.IsA("GuiObject")) {
			connEnterRef.current = parent.MouseEnter.Connect(() => {
				setHovered(true);
				setRendering(true);
			});
			connLeaveRef.current = parent.MouseLeave.Connect(() => {
				setHovered(false);
			});
		} else {
			warn("HoverFrame must be a child of a GuiObject");
		}

		if (rendering) {
			connRenderRef.current = RunService.RenderStepped.Connect(() => {
				const canvasGroup = canvasGroupRef.current;
				const mousePos = UserInputService.GetMouseLocation();
				const origin = rootGuiRef.current?.AbsolutePosition ?? new Vector2(0, 0);
				const relative = mousePos.sub(origin);

				// Calculate offset based on the first child's absolute size
				let computedOffset = new Vector2(0, 0);
				if (canvasGroup) {
					const firstChild = canvasGroup.FindFirstChildWhichIsA("Frame") ?? canvasGroup.FindFirstChildWhichIsA("ImageLabel") ?? canvasGroup.FindFirstChildWhichIsA("TextLabel") ?? canvasGroup.FindFirstChildWhichIsA("CanvasGroup") ?? canvasGroup.FindFirstChildWhichIsA("ImageButton");
					if (firstChild && firstChild.IsA("GuiObject")) {
						const absoluteSize = firstChild.AbsoluteSize;
						computedOffset = new Vector2(absoluteSize.X, absoluteSize.Y);
					}
				}

				if (DeviceUtils.IsMobile() || DeviceUtils.IsTablet()) {
					computedOffset.add(new Vector2(-50, 0));
				}

				setPositionBinding(UDim2.fromOffset(relative.X - (computedOffset.X), relative.Y - computedOffset.Y));
			});
		}

		return () => {
			connEnterRef.current?.Disconnect();
			connLeaveRef.current?.Disconnect();
			connRenderRef.current?.Disconnect();
		};
	}, [Offset, rendering]);

	React.useEffect(() => {
		if (triggerRef.current) {
			triggerRef.current.Name = "HoverFrameTrigger";
		}
	}, []);

	return (
		<>
			<folder ref={triggerRef} />
			{rendering &&
				portalTarget &&
				createPortal(
					portalTarget.IsA("PlayerGui") ? (
						<screengui
							DisplayOrder={DisplayOrder}
							IgnoreGuiInset={true}
							ResetOnSpawn={false}
							ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
						>
							<frame
								ref={rootGuiRef}
								BackgroundTransparency={0}
								BorderSizePixel={0}
								BackgroundColor3={new Color3(255, 0, 0)}
								Size={UDim2.fromScale(1, 1)}
								Position={UDim2.fromOffset(0, 0)}
							>
								<canvasgroup
									ref={canvasGroupRef}
									GroupTransparency={1} // Start invisible, MotionFade will handle it
									Position={positionBinding}
									Size={UDim2.fromOffset(0, 0)}
									AutomaticSize={Enum.AutomaticSize.XY}
									BorderSizePixel={0}
									BackgroundTransparency={0}
									BackgroundColor3={new Color3(255, 0, 0)}
									ZIndex={ZIndex}
								>
									<MotionFade
										To={hovered ? 0 : 1}
										Duration={FadeTime}
										Property="GroupTransparency"
										OnFinished={() => {
											if (!hovered) {
												setRendering(false);
											}
										}}
									/>
									{children}
								</canvasgroup>
							</frame>
						</screengui>
					) : (
						<frame
							ref={rootGuiRef}
							BackgroundTransparency={1}
							BorderSizePixel={0}
							Size={UDim2.fromScale(1, 1)}
							Position={UDim2.fromOffset(0, 0)}
							ZIndex={ZIndex}
						>
							<canvasgroup
								ref={canvasGroupRef}
								GroupTransparency={1} // Start invisible, MotionFade will handle it
								Position={positionBinding}
								Size={Size ?? UDim2.fromOffset(0, 0)}
								AutomaticSize={Enum.AutomaticSize.XY}
								BorderSizePixel={0}
								BackgroundTransparency={1}
								ZIndex={ZIndex}
							>
								<MotionFade
									To={hovered ? 0 : 1}
									Duration={FadeTime}
									Property="GroupTransparency"
									OnFinished={() => {
										if (!hovered) {
											setRendering(false);
										}
									}}
								/>
								{children}
							</canvasgroup>
						</frame>
					),
					portalTarget,
				)}
		</>
	);
}
