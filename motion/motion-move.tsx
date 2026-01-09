import Roact from "@rbxts/roact";
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

export class MotionMove extends Roact.Component<MotionMoveProps> {
	public static defaultProps: Partial<MotionMoveProps> = {
		Duration: 1,
		Looped: false,
		Easing: Enum.EasingStyle.Sine,
		EasingDirection: Enum.EasingDirection.InOut,
		Delay: 0,
		RepeatDelay: 0,
		Speed: 1,
	};

	public render() {
		const {
			From,
			To,
			Speed,
			Looped,
			Easing,
			EasingDirection,
			Delay,
			RepeatDelay,
			OnStart,
			OnFinished,
			DestroyAfterFinished,
		} = this.props;

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
}
