import Roact from "@rbxts/roact";
import { MotionTween, MotionTweenProps } from "./motion-tween";

export interface MotionColorProps extends Omit<MotionTweenProps, "Goal" | "From"> {
	From?: Color3;
	To: Color3;
	Property?:
		| "BackgroundColor3"
		| "TextColor3"
		| "Color"
		| "ImageColor3"
		| "ScrollBarImageColor3"
		| "BorderColor3"
		| "ScrollBarThickness";
}

export class MotionColor extends Roact.Component<MotionColorProps> {
	public static defaultProps: Partial<MotionColorProps> = {
		Duration: 1,
		Looped: false,
		Easing: Enum.EasingStyle.Sine,
		EasingDirection: Enum.EasingDirection.InOut,
		Delay: 0,
		RepeatDelay: 0,
	};

	public render() {
		const { From, To, Property } = this.props;

		return (
			<MotionTween
				{...this.props}
				Goal={{ [Property!]: To }}
				From={From !== undefined ? { [Property!]: From } : undefined}
			/>
		);
	}
}
