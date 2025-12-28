import Roact from "@rbxts/roact";
import { MotionTween } from "./motion-tween";

export interface MotionRotateProps {
	From?: number;
	To: number;
	Speed?: number; // Duration in seconds
	Looped?: boolean;
	Easing?: Enum.EasingStyle;
	EasingDirection?: Enum.EasingDirection;
	Delay?: number;
	RepeatDelay?: number;
	OnStart?: () => void;
	OnFinished?: () => void;
}

export class MotionRotate extends Roact.Component<MotionRotateProps> {
	public static defaultProps: Partial<MotionRotateProps> = {
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
				Goal={{ Rotation: To }}
				From={From !== undefined ? { Rotation: From } : undefined}
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
