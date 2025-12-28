import Roact from "@rbxts/roact";
import { MotionTween } from "./motion-tween";

export interface MotionFadeProps {
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
	Property?:
		| "BackgroundTransparency"
		| "TextTransparency"
		| "ImageTransparency"
		| "GroupTransparency"
		| "TextStrokeTransparency";
}

export class MotionFade extends Roact.Component<MotionFadeProps> {
	public static defaultProps: Partial<MotionFadeProps> = {
		Speed: 1,
		Looped: false,
		Easing: Enum.EasingStyle.Sine,
		EasingDirection: Enum.EasingDirection.InOut,
		Delay: 0,
		RepeatDelay: 0,
		Property: "BackgroundTransparency",
	};

	public render() {
		const { From, To, Speed, Looped, Easing, EasingDirection, Delay, RepeatDelay, OnStart, OnFinished, Property } =
			this.props;

		return (
			<MotionTween
				Goal={{ [Property!]: To }}
				From={From !== undefined ? { [Property!]: From } : undefined}
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
