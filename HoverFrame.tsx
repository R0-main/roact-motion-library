import Roact from "@rbxts/roact";
import { Players, RunService, UserInputService } from "@rbxts/services";
import { MotionFade } from "./motion/motion-fade";

export interface HoverFrameProps {
	FadeTime?: number;
	Offset?: Vector2;
	ZIndex?: number;
	DisplayOrder?: number;
	Size?: UDim2;
}

interface HoverFrameState {
	hovered: boolean;
	rendering: boolean;
	position: UDim2;
	playerGui?: Instance;
}

export class HoverFrame extends Roact.Component<HoverFrameProps, HoverFrameState> {
	private triggerRef: Roact.Ref<Folder> | undefined;
	private connEnter?: RBXScriptConnection;
	private connLeave?: RBXScriptConnection;
	private connRender?: RBXScriptConnection;

	public static defaultProps: Partial<HoverFrameProps> = {
		FadeTime: 0.2,
		Offset: new Vector2(15, 15),
		DisplayOrder: 100,
	};

	public init() {
		this.triggerRef = Roact.createRef<Folder>();
		this.setState({
			hovered: false,
			rendering: false,
			position: UDim2.fromOffset(0, 0),
		});
	}

	public didMount() {
		if (!RunService.IsClient()) return;

		const player = Players.LocalPlayer;
		const playerGui = player?.WaitForChild("PlayerGui") as PlayerGui;
		this.setState({ playerGui });

		const folder = this.triggerRef?.getValue();
		const parent = folder?.Parent;

		if (parent && parent.IsA("GuiObject")) {
			this.connEnter = parent.MouseEnter.Connect(() => {
				this.setState({ hovered: true, rendering: true });
			});
			this.connLeave = parent.MouseLeave.Connect(() => {
				this.setState({ hovered: false });
			});
		} else {
			warn("HoverFrame must be a child of a GuiObject");
		}

		this.connRender = RunService.RenderStepped.Connect(() => {
			if (this.state.rendering) {
				const mousePos = UserInputService.GetMouseLocation();
				const offset = this.props.Offset!;

				// Using IgnoreGuiInset=true on ScreenGui means (0,0) is top-left of screen, matching GetMouseLocation
				this.setState({
					position: UDim2.fromOffset(mousePos.X + offset.X, mousePos.Y + offset.Y),
				});
			}
		});
	}

	public willUnmount() {
		this.connEnter?.Disconnect();
		this.connLeave?.Disconnect();
		this.connRender?.Disconnect();
	}

	public render() {
		const { hovered, rendering, position, playerGui } = this.state;
		const { FadeTime, DisplayOrder, ZIndex } = this.props;

		return (
			<>
				{Roact.createElement("Folder", {
					[Roact.Ref]: this.triggerRef,
					Name: "HoverFrameTrigger",
				})}
				{rendering && playerGui && (
					<Roact.Portal target={playerGui}>
						<screengui
							DisplayOrder={DisplayOrder}
							IgnoreGuiInset={true}
							ResetOnSpawn={false}
							ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
						>
							<canvasgroup
								GroupTransparency={1} // Start invisible, MotionFade will handle it
								Position={position}
								Size={this.props.Size ?? UDim2.fromOffset(0, 0)}
								AutomaticSize={Enum.AutomaticSize.XY}
								BorderSizePixel={0}
								BackgroundTransparency={1}
								ZIndex={ZIndex}
							>
								<MotionFade
									To={hovered ? 0 : 1}
									Speed={FadeTime}
									Property="GroupTransparency"
									OnFinished={() => {
										if (!this.state.hovered) {
											this.setState({ rendering: false });
										}
									}}
								/>
								{this.props[Roact.Children]}
							</canvasgroup>
						</screengui>
					</Roact.Portal>
				)}
			</>
		);
	}
}
