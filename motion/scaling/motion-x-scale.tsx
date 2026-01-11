import Roact from "@rbxts/roact";
import { MotionTween, MotionTweenProps } from "../motion-tween";

export interface MotionXScaleProps extends Omit<MotionTweenProps, "Goal" | "From"> {
	From?: number;
	To?: number;
}

interface MotionXScaleState {
	initialSize: UDim2;
	initialized: boolean;
}

export class MotionXScale extends Roact.Component<MotionXScaleProps, MotionXScaleState> {
	private ref!: Roact.Ref<Folder>;

	public static defaultProps: Partial<MotionXScaleProps> = {
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
		const motionProps: Omit<MotionXScaleProps, "From" | "To"> = { ...this.props };
		const { initialSize, initialized } = this.state;

		// We use a Folder to grab the Parent instance
		const refElement = Roact.createElement("Folder", {
			[Roact.Ref]: this.ref,
		});

		if (!initialized) {
			return refElement;
		}

		const targetXScale = initialSize.X.Scale * (To ?? 1);
		const targetXOffset = initialSize.X.Offset * (To ?? 1);
		const goalSize = new UDim2(targetXScale, targetXOffset, initialSize.Y.Scale, initialSize.Y.Offset);

		let fromSize: UDim2 | undefined;
		if (From !== undefined) {
			const fromXScale = initialSize.X.Scale * From;
			const fromXOffset = initialSize.X.Offset * From;
			fromSize = new UDim2(fromXScale, fromXOffset, initialSize.Y.Scale, initialSize.Y.Offset);
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
