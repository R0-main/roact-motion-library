import Roact from "@rbxts/roact";
import { MotionTween } from "./motion-tween";

export interface MotionSlideProps {
	From?: UDim2;
	To: UDim2;
	Speed?: number; // Duration in seconds
	Looped?: boolean;
	Easing?: Enum.EasingStyle;
	EasingDirection?: Enum.EasingDirection;
	Delay?: number;
	RepeatDelay?: number;
	OnStart?: () => void;
	OnFinished?: () => void;
}

export class MotionSlide extends Roact.Component<MotionSlideProps> {
	public static defaultProps: Partial<MotionSlideProps> = {
		Speed: 1,
		Looped: false,
		Easing: Enum.EasingStyle.Sine,
		EasingDirection: Enum.EasingDirection.InOut,
		Delay: 0,
		RepeatDelay: 0,
	};

	public render() {
		const { From, To, Speed, Looped, Easing, EasingDirection, Delay, RepeatDelay, OnStart, OnFinished } =
			this.props;

		return (
			<MotionTween
				Goal={{ Position: To }}
				From={From !== undefined ? { Position: From } : undefined}
				Speed={Speed}
				Looped={Looped}
				Easing={Easing}
				EasingDirection={EasingDirection}
				Delay={Delay}
				RepeatDelay={RepeatDelay}
				OnStart={OnStart}
				OnFinished={OnFinished}
			/>
		);
	}
}
