import React from "@rbxts/react";
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
		| "SelectionImageTransparency"
		| "Transparency";
}

const defaultProps: Partial<MotionFadeProps> = {
	Duration: 1,
	Looped: false,
	Easing: Enum.EasingStyle.Sine,
	EasingDirection: Enum.EasingDirection.InOut,
	Delay: 0,
	RepeatDelay: 0,
	Property: "BackgroundTransparency",
};

export function MotionFade(props: MotionFadeProps) {
	const {
		From,
		To,
		Duration = defaultProps.Duration,
		Looped = defaultProps.Looped,
		Easing = defaultProps.Easing,
		EasingDirection = defaultProps.EasingDirection,
		Delay = defaultProps.Delay,
		RepeatDelay = defaultProps.RepeatDelay,
		OnStart,
		OnFinished,
		Property = defaultProps.Property!,
		DestroyAfterFinished,
	} = props;

	return (
		<MotionTween
			Goal={{ [Property]: To }}
			From={From !== undefined ? { [Property]: From } : undefined}
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
