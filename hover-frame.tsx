import React from "@rbxts/react";
import { createPortal } from "@rbxts/react-roblox";
import { Players, RunService, UserInputService } from "@rbxts/services";
import { MotionFade } from "./motion/motion-fade";

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
	const {
		FadeTime = defaultProps.FadeTime!,
		Offset = defaultProps.Offset!,
		ZIndex,
		DisplayOrder = defaultProps.DisplayOrder!,
		Size,
		children,
	} = props;

	const triggerRef = React.useRef<Folder>();
	const [hovered, setHovered] = React.useState(false);
	const [rendering, setRendering] = React.useState(false);
	const [position, setPosition] = React.useState<UDim2>(UDim2.fromOffset(0, 0));
	const [playerGui, setPlayerGui] = React.useState<Instance | undefined>(undefined);
	const connEnterRef = React.useRef<RBXScriptConnection>();
	const connLeaveRef = React.useRef<RBXScriptConnection>();
	const connRenderRef = React.useRef<RBXScriptConnection>();

	React.useEffect(() => {
		if (!RunService.IsClient()) return;

		const player = Players.LocalPlayer;
		const playerGuiInstance = player?.WaitForChild("PlayerGui") as PlayerGui;
		setPlayerGui(playerGuiInstance);

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

		connRenderRef.current = RunService.RenderStepped.Connect(() => {
			if (rendering) {
				const mousePos = UserInputService.GetMouseLocation();

				// Using IgnoreGuiInset=true on ScreenGui means (0,0) is top-left of screen, matching GetMouseLocation
				setPosition(UDim2.fromOffset(mousePos.X + Offset.X, mousePos.Y + Offset.Y));
			}
		});

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
			{rendering && playerGui && (
				createPortal(
					<screengui
						DisplayOrder={DisplayOrder}
						IgnoreGuiInset={true}
						ResetOnSpawn={false}
						ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
					>
						<canvasgroup
							GroupTransparency={1} // Start invisible, MotionFade will handle it
							Position={position}
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
					</screengui>,
					playerGui
				)
			)}
		</>
	);
}
