import Roact from "@rbxts/roact";
import { MotionTween, MotionTweenProps } from "./motion-tween";

export interface MotionRotateProps extends Omit<MotionTweenProps, "Goal" | "From"> {
	From?: number;
	To: number;
	Speed?: number;
}

export class MotionRotate extends Roact.Component<MotionRotateProps> {
	public static defaultProps: Partial<MotionRotateProps> = {
		Duration: 1,
		Looped: false,
		Easing: Enum.EasingStyle.Sine,
		EasingDirection: Enum.EasingDirection.InOut,
		Delay: 0,
		RepeatDelay: 0,
	};

	public render() {
		const { From, To } = this.props;

		return (
			<MotionTween
				{...this.props}
				Goal={{ Rotation: To }}
				From={From !== undefined ? { Rotation: From } : undefined}
			/>
		);
	}
}
