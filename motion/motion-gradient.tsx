import Roact from "@rbxts/roact";
import { MotionTween, MotionTweenProps } from "./motion-tween";

export interface MotionGradientProps extends Omit<MotionTweenProps, "Goal" | "From"> {
	OffsetSpeed?: number;
	RotationSpeed?: number;
	Rotate?: boolean | number;
	Move?: boolean | Vector2;
}

export class MotionGradient extends Roact.Component<MotionGradientProps> {
	private ref = Roact.createRef<Folder>();

	public static defaultProps: Partial<MotionGradientProps> = {
		...MotionTween.defaultProps,
		Looped: true,
		Easing: Enum.EasingStyle.Linear,
	};

	public render() {
		const { Duration, OffsetSpeed, RotationSpeed, Rotate, Move, Looped, Easing, OnFinished, DestroyAfterFinished } =
			this.props;

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
}
