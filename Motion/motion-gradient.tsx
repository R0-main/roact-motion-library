import Roact from "@rbxts/roact";
import { MotionTween } from "./motion-tween";

export interface MotionGradientProps {
	Speed?: number;
	OffsetSpeed?: number;
	RotationSpeed?: number;

	// If true, rotates 360 degrees. If number, rotates to that angle.
	Rotate?: boolean | number;

	// If true, moves offset to (1,0) or specified Vector2.
	Move?: boolean | Vector2;

	Looped?: boolean;
	Easing?: Enum.EasingStyle;
	OnFinished?: () => void;
}

export class MotionGradient extends Roact.Component<MotionGradientProps> {
	private ref = Roact.createRef<Folder>();

	public static defaultProps: Partial<MotionGradientProps> = {
		Speed: 1,
		Looped: true,
		Easing: Enum.EasingStyle.Linear,
	};

	public render() {
		const { Speed, OffsetSpeed, RotationSpeed, Rotate, Move, Looped, Easing, OnFinished } = this.props;

		// Determine goals
		const goals: Record<string, unknown> = {};
		const froms: Record<string, unknown> = {};

		let duration = Speed ?? 1;

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
				Speed={duration}
				Looped={Looped}
				Easing={Easing}
				EasingDirection={Enum.EasingDirection.InOut}
				OnFinished={OnFinished}
			/>
		);
	}
}
