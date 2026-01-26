import React from "@rbxts/react";
import { MotionTween, MotionTweenProps } from "./motion-tween";

export interface MotionGradientProps extends Omit<MotionTweenProps, "Goal" | "From"> {
	OffsetSpeed?: number;
	RotationSpeed?: number;
	Rotate?: boolean | number;
	Move?: boolean | Vector2;
}

const defaultProps: Partial<MotionGradientProps> = {
	Duration: 1,
	Looped: true,
	Easing: Enum.EasingStyle.Linear,
	EasingDirection: Enum.EasingDirection.InOut,
	Delay: 0,
	RepeatDelay: 0,
};

export function MotionGradient(props: MotionGradientProps) {
	const {
		Duration = defaultProps.Duration,
		OffsetSpeed,
		RotationSpeed,
		Rotate,
		Move,
		Looped = defaultProps.Looped,
		Easing = defaultProps.Easing,
		OnFinished,
		DestroyAfterFinished,
	} = props;

	// Determine goals
	const goals: Record<string, unknown> = {};
	const froms: Record<string, unknown> = {};

	let duration = Duration ?? 1;

	if (Rotate !== undefined) {
		if (typeIs(Rotate, "boolean") && Rotate === true) {
			goals.Rotation = 360;
			froms.Rotation = 0;
			if (RotationSpeed !== undefined) duration = 360 / RotationSpeed;
		} else if (typeIs(Rotate, "number")) {
			goals.Rotation = Rotate;
			// Assume starting from current or 0? MotionTween handles undefined From by using current.
			if (RotationSpeed !== undefined) duration = math.abs(Rotate as number) / RotationSpeed;
		}
	}

	if (Move !== undefined) {
		if (typeIs(Move, "boolean") && Move === true) {
			goals.Offset = new Vector2(1, 0); // Default slide right
			froms.Offset = new Vector2(-1, 0);
			if (OffsetSpeed !== undefined) duration = 2 / OffsetSpeed; // Distance 2 units
		} else if (typeIs(Move, "Vector2")) {
			goals.Offset = Move;
			if (OffsetSpeed !== undefined) duration = (Move as Vector2).Magnitude / OffsetSpeed;
		}
	}

	const hasFroms = next(froms)[0] !== undefined;

	return (
		<MotionTween
			Goal={goals}
			From={hasFroms ? froms : undefined}
			Duration={duration}
			Looped={Looped}
			Easing={Easing}
			EasingDirection={Enum.EasingDirection.InOut}
			OnFinished={OnFinished}
			DestroyAfterFinished={DestroyAfterFinished}
		/>
	);
}
