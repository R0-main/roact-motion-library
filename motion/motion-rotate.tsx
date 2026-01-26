import React from "@rbxts/react";
import { MotionTween, MotionTweenProps } from "./motion-tween";

export interface MotionRotateProps extends Omit<MotionTweenProps, "Goal" | "From"> {
	From?: number;
	To: number;
	Speed?: number;
}

const defaultProps: Partial<MotionRotateProps> = {
	Duration: 1,
	Looped: false,
	Easing: Enum.EasingStyle.Sine,
	EasingDirection: Enum.EasingDirection.InOut,
	Delay: 0,
	RepeatDelay: 0,
};

export function MotionRotate(props: MotionRotateProps) {
	const { From, To, Duration, Looped, Easing, EasingDirection, Delay, RepeatDelay, OnStart, OnFinished, DestroyAfterFinished } = props;

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
			Goal={{ Rotation: To }}
			From={From !== undefined ? { Rotation: From } : undefined}
		/>
	);
}
