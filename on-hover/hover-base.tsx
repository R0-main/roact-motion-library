import Roact from "@rbxts/roact";
import { HoverContext, ResetProps } from "../hover-context";

export interface OnHoverProps {
	ResetToBeforeHover?: boolean | ResetProps;
	ResetDuration?: number;
	ResetEasing?: Enum.EasingStyle;
	ResetEasingDirection?: Enum.EasingDirection;
	ResetDelay?: number;
}

export interface OnHoverState {
	hovered: boolean;
}

export abstract class HoverBase extends Roact.Component<OnHoverProps, OnHoverState> {
	protected ref: Roact.Ref<Folder> | undefined;
	private connEnter?: RBXScriptConnection;
	private connLeave?: RBXScriptConnection;

	public static defaultProps: Partial<OnHoverProps> = {
		ResetToBeforeHover: true,
	};

	public init() {
		this.ref = Roact.createRef<Folder>();
		this.setState({
			hovered: false,
		});
	}

	public didMount() {
		task.spawn(() => {
			const folder = this.ref?.getValue();
			if (!folder) return;

			let target = folder.Parent;
			let attempts = 0;

			while (attempts < 20) {
				if (target && target.IsA("GuiObject")) {
					break;
				}

				if (target) {
					const ancestor = target.FindFirstAncestorWhichIsA("GuiObject");
					if (ancestor) {
						target = ancestor;
						break;
					}
				}

				attempts++;
				task.wait(0.1);
			}

			if (target && target.IsA("GuiObject")) {
				this.connEnter = target.MouseEnter.Connect(() => {
					this.setState({ hovered: true });
				});
				this.connLeave = target.MouseLeave.Connect(() => {
					this.setState({ hovered: false });
				});
			} else {
				// warn(`Hover component must be a descendant of a GuiObject. Parent is ${folder.Parent?.ClassName} | ${target}`);
			}
		});
	}

	public willUnmount() {
		this.connEnter?.Disconnect();
		this.connEnter = undefined;
		this.connLeave?.Disconnect();
		this.connLeave = undefined;
	}

	protected abstract shouldRender(hovered: boolean): boolean;

	public render() {
		const { ResetToBeforeHover, ResetDuration, ResetEasing, ResetEasingDirection, ResetDelay } = this.props;
		const { hovered } = this.state;
		print(`[HoverBase] render. hovered: ${hovered}`);

		const showChildren = ResetToBeforeHover ? true : this.shouldRender(hovered);

		let isResetEnabled = !!ResetToBeforeHover;
		// If any individual reset prop is present, enable reset
		if (
			ResetDuration !== undefined ||
			ResetEasing !== undefined ||
			ResetEasingDirection !== undefined ||
			ResetDelay !== undefined
		) {
			isResetEnabled = true;
		}

		let resetProps: ResetProps | undefined;

		if (typeIs(ResetToBeforeHover, "table")) {
			// Legacy/Object style
			resetProps = ResetToBeforeHover as ResetProps;
		}

		// If individual props are used, they override or create the object
		if (
			ResetDuration !== undefined ||
			ResetEasing !== undefined ||
			ResetEasingDirection !== undefined ||
			ResetDelay !== undefined
		) {
			if (resetProps === undefined) resetProps = {};
			if (ResetDuration !== undefined) resetProps.Duration = ResetDuration;
			if (ResetEasing !== undefined) resetProps.Easing = ResetEasing;
			if (ResetEasingDirection !== undefined) resetProps.EasingDirection = ResetEasingDirection;
			if (ResetDelay !== undefined) resetProps.Delay = ResetDelay;
		}

		return (
			<>
				{Roact.createElement("Folder", {
					[Roact.Ref]: this.ref,
				})}
				<HoverContext.Provider
					value={{
						hovered: hovered,
						isResetEnabled: isResetEnabled,
						resetProps: resetProps,
					}}
				>
					{showChildren && this.props[Roact.Children]}
				</HoverContext.Provider>
			</>
		);
	}
}
