import React from "@rbxts/react";
import { MotionMove, MotionMoveDirectionProps } from "../motion-move";

const defaultProps: Partial<MotionMoveDirectionProps> = {
	Duration: 1,
	Looped: false,
	Easing: Enum.EasingStyle.Sine,
	EasingDirection: Enum.EasingDirection.InOut,
	Delay: 0,
	RepeatDelay: 0,
	Speed: 1,
	Distance: 1,
};

export function MotionMoveRight(props: MotionMoveDirectionProps) {
	const {
		Distance = defaultProps.Distance!,
		Speed,
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
	const dist = Distance;
	const defaultFrom = UDim2.fromScale(dist, 0);

	return (
		<MotionMove
			Speed={Speed}
			Duration={Duration}
			Looped={Looped}
			Easing={Easing}
			EasingDirection={EasingDirection}
			Delay={Delay}
			RepeatDelay={RepeatDelay}
			OnStart={OnStart}
			OnFinished={OnFinished}
			DestroyAfterFinished={DestroyAfterFinished}
			To={defaultFrom}
		/>
	);
}
