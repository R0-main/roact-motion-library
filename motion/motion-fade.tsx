import Roact from "@rbxts/roact";
import { MotionTween, MotionTweenProps } from "./motion-tween";

export interface MotionFadeProps extends Omit<MotionTweenProps, "Goal" | "From"> {
	From?: number;
	To: number;
	Property?:
		| "BackgroundTransparency"
		| "TextTransparency"
		| "ImageTransparency"
		| "GroupTransparency"
		| "TextStrokeTransparency"
		| "ScrollBarImageTransparency"
		| "ScrollBarThickness"
		| "SelectionImageTransparency";
}

export class MotionFade extends Roact.Component<MotionFadeProps> {
	public static defaultProps: Partial<MotionFadeProps> = {
		...(MotionTween.defaultProps as Partial<MotionFadeProps>),
		Property: "BackgroundTransparency",
	};

	public render() {
		const {
			From,
			To,
			Duration,
			Looped,
			Easing,
			EasingDirection,
			Delay,
			RepeatDelay,
			OnStart,
			OnFinished,
			Property,
			DestroyAfterFinished,
		} = this.props;

		return (
			<MotionTween
				Goal={{ [Property!]: To }}
				From={From !== undefined ? { [Property!]: From } : undefined}
				Duration={Duration}
				Looped={Looped}
				Easing={Easing}
				EasingDirection={EasingDirection}
				Delay={Delay}
				RepeatDelay={RepeatDelay}
				OnStart={OnStart}
				OnFinished={OnFinished}
				DestroyAfterFinished={DestroyAfterFinished}
			/>
		);
	}
}
