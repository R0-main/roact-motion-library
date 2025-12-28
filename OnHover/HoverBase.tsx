import Roact from "@rbxts/roact";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface OnHoverProps {}

export interface OnHoverState {
	hovered: boolean;
}

export abstract class HoverBase extends Roact.Component<OnHoverProps, OnHoverState> {
	protected ref: Roact.Ref<Folder> | undefined;
	private connEnter?: RBXScriptConnection;
	private connLeave?: RBXScriptConnection;

	public init() {
		this.ref = Roact.createRef<Folder>();
		this.setState({
			hovered: false,
		});
	}

	public didMount() {
		const folder = this.ref?.getValue();
		const parent = folder?.Parent;

		if (parent && parent.IsA("GuiObject")) {
			this.connEnter = parent.MouseEnter.Connect(() => {
				this.setState({ hovered: true });
			});
			this.connLeave = parent.MouseLeave.Connect(() => {
				this.setState({ hovered: false });
			});
		} else {
			warn("Hover component must be a child of a GuiObject");
		}
	}

	public willUnmount() {
		this.connEnter?.Disconnect();
		this.connEnter = undefined;
		this.connLeave?.Disconnect();
		this.connLeave = undefined;
	}

	protected abstract shouldRender(hovered: boolean): boolean;

	public render() {
		return (
			<>
				{Roact.createElement("Folder", {
					[Roact.Ref]: this.ref,
				})}
				{this.shouldRender(this.state.hovered) && this.props[Roact.Children]}
			</>
		);
	}
}
