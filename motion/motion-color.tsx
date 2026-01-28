import React from "@rbxts/react";
import { MotionTween, MotionTweenProps } from "./motion-tween";

export interface MotionColorProps extends Omit<MotionTweenProps, "Goal" | "From"> {
	From?: Color3;
	To: Color3;
	Property?:
		| "BackgroundColor3"
		| "TextColor3"
		| "Color"
		| "ImageColor3"
		| "ScrollBarImageColor3"
		| "BorderColor3"
		| "ScrollBarThickness";
}

const defaultProps: Partial<MotionColorProps> = {
	Duration: 1,
	Looped: false,
	Easing: Enum.EasingStyle.Sine,
	EasingDirection: Enum.EasingDirection.InOut,
	Delay: 0,
	RepeatDelay: 0,
};

export function MotionColor(props: MotionColorProps) {
	const {
		From,
		To,
		Property,
		Duration,
		Looped,
		Easing,
		EasingDirection,
		Delay,
		RepeatDelay,
		OnStart,
		OnFinished,
		DestroyAfterFinished,
	} = props;

	return (
		<MotionTween
			Duration={Duration ?? defaultProps.Duration}
			Looped={Looped ?? defaultProps.Looped}
			Easing={Easing ?? defaultProps.Easing}
			EasingDirection={EasingDirection ?? defaultProps.EasingDirection}
			Delay={Delay ?? defaultProps.Delay}
			RepeatDelay={RepeatDelay ?? defaultProps.RepeatDelay}
			OnStart={OnStart}
			OnFinished={OnFinished}
			DestroyAfterFinished={DestroyAfterFinished}
			Goal={{ [Property!]: To }}
			From={From !== undefined ? { [Property!]: From } : undefined}
		/>
	);
}
