import Roact from "@rbxts/roact";
import { MotionTween, MotionTweenProps } from "../motion-tween";

export interface MotionYScaleProps extends Omit<MotionTweenProps, "Goal" | "From"> {
	From?: number;
	To?: number;
}

interface MotionYScaleState {
	initialSize: UDim2;
	initialized: boolean;
}

export class MotionYScale extends Roact.Component<MotionYScaleProps, MotionYScaleState> {
	private ref!: Roact.Ref<Folder>;

	public static defaultProps: Partial<MotionYScaleProps> = {
		Duration: 1,
		Looped: false,
		Easing: Enum.EasingStyle.Sine,
		EasingDirection: Enum.EasingDirection.InOut,
		Delay: 0,
		RepeatDelay: 0,
	};

	public init() {
		this.setState({
			initialSize: new UDim2(),
			initialized: false,
		});
		this.ref = Roact.createRef<Folder>();
	}

	public didMount() {
		const folder = this.ref.getValue();
		const parent = folder?.Parent;
		if (parent && parent.IsA("GuiObject")) {
			this.setState({ initialSize: parent.Size, initialized: true });
		}
	}

	public render() {
		const { From, To } = this.props;
		const motionProps: Omit<MotionYScaleProps, "From" | "To"> = { ...this.props };
		const { initialSize, initialized } = this.state;

		// We use a Folder to grab the Parent instance
		const refElement = Roact.createElement("Folder", {
			[Roact.Ref]: this.ref,
		});

		if (!initialized) {
			return refElement;
		}

		const targetYScale = initialSize.Y.Scale * (To ?? 1);
		const targetYOffset = initialSize.Y.Offset * (To ?? 1);
		const goalSize = new UDim2(initialSize.X.Scale, initialSize.X.Offset, targetYScale, targetYOffset);

		let fromSize: UDim2 | undefined;
		if (From !== undefined) {
			const fromYScale = initialSize.Y.Scale * From;
			const fromYOffset = initialSize.Y.Offset * From;
			fromSize = new UDim2(initialSize.X.Scale, initialSize.X.Offset, fromYScale, fromYOffset);
		}

		return (
			<>
				{refElement}
				<MotionTween
					{...motionProps}
					Goal={{ Size: goalSize }}
					From={fromSize ? { Size: fromSize } : undefined}
				/>
			</>
		);
	}
}
