import React from "@rbxts/react";
import { MotionTween, MotionTweenProps } from "./motion-tween";

export interface MotionSlideProps extends Omit<MotionTweenProps, "Goal" | "From"> {
	From?: UDim2;
	To: UDim2;
	Property?: string;
	Speed?: number;
}

export interface MotionDirectionProps extends MotionSlideProps {
	Distance?: number;
}

const defaultProps: Partial<MotionSlideProps> = {
	Duration: 1,
	Looped: false,
	Easing: Enum.EasingStyle.Sine,
	EasingDirection: Enum.EasingDirection.InOut,
	Delay: 0,
	RepeatDelay: 0,
	Speed: 1,
	Property: "Position",
};

export function MotionSlide(props: MotionSlideProps) {
	const {
		From,
		To,
		Property = defaultProps.Property!,
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

	const goal = { [Property]: To };
	const from = From !== undefined ? { [Property]: From } : undefined;

	return (
		<MotionTween
			Goal={goal}
			From={from}
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
