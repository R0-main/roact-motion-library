import React from "@rbxts/react";
import { MotionTween, MotionTweenProps } from "./motion-tween";

export interface MotionMoveProps extends Omit<MotionTweenProps, "Goal" | "From"> {
	From?: UDim2;
	To: UDim2;
	Speed?: number;
}

export type MotionMovePropsWithoutFromTo = Omit<MotionMoveProps, "From" | "To">;

export interface MotionMoveDirectionProps extends MotionMovePropsWithoutFromTo {
	Distance?: number;
}

const defaultProps: Partial<MotionMoveProps> = {
	Duration: 1,
	Looped: false,
	Easing: Enum.EasingStyle.Sine,
	EasingDirection: Enum.EasingDirection.InOut,
	Delay: 0,
	RepeatDelay: 0,
	Speed: 1,
};

export function MotionMove(props: MotionMoveProps) {
	const {
		From,
		To,
		Speed = defaultProps.Speed!,
		Looped = defaultProps.Looped,
		Easing = defaultProps.Easing,
		EasingDirection = defaultProps.EasingDirection,
		Delay = defaultProps.Delay,
		RepeatDelay = defaultProps.RepeatDelay,
		OnStart,
		OnFinished,
		DestroyAfterFinished,
	} = props;

	return (
		<MotionTween
			Goal={{ Position: To } as unknown as Record<string, unknown>}
			From={From !== undefined ? ({ Position: From } as unknown as Record<string, unknown>) : undefined}
			Duration={Speed}
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
