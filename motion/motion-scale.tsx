import Roact from "@rbxts/roact";
import { MotionTween, MotionTweenProps } from "./motion-tween";

export interface MotionScaleProps extends Omit<MotionTweenProps, "Goal" | "From"> {
	From?: number;
	To?: number;
}

interface MotionScaleState {
	initialScale: number;
}

export class MotionScale extends Roact.Component<MotionScaleProps, MotionScaleState> {
	private ref: Roact.Ref<UIScale> | undefined;

	public static defaultProps: Partial<MotionScaleProps> = {
		Duration: 1,
		Looped: false,
		Easing: Enum.EasingStyle.Sine,
		EasingDirection: Enum.EasingDirection.InOut,
		Delay: 0,
		RepeatDelay: 0,
	};

	public init() {
		this.ref = Roact.createRef<UIScale>();
		this.setState({ initialScale: 1 });
	}

	public didMount() {
		const uiScale = this.ref?.getValue();
		const parent = uiScale?.Parent;
		if (parent && parent.IsA("GuiObject")) {
			const existingScale = parent.FindFirstChildOfClass("UIScale");
			if (existingScale && existingScale !== uiScale) {
				this.setState({ initialScale: existingScale.Scale });
			}
		}
	}

	public render() {
		const { From, To, Duration, Looped, Easing, EasingDirection, Delay, RepeatDelay, OnStart, OnFinished } =
			this.props;

		return (
			<uiscale Ref={this.ref}>
				<MotionTween
					Goal={{ Scale: To ?? this.state.initialScale }}
					From={From !== undefined ? { Scale: From } : { Scale: this.state.initialScale }}
					Duration={Duration}
					Looped={Looped}
					Easing={Easing}
					EasingDirection={EasingDirection}
					Delay={Delay}
					RepeatDelay={RepeatDelay}
					OnStart={OnStart}
					OnFinished={OnFinished}
				/>
			</uiscale>
		);
	}
}
