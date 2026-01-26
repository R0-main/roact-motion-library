import React from "@rbxts/react";
import { MotionTween, MotionTweenProps } from "./motion-tween";

export interface MotionScaleProps extends Omit<MotionTweenProps, "Goal" | "From"> {
	From?: number;
	To?: number;
}

const defaultProps: Partial<MotionScaleProps> = {
	Duration: 1,
	Looped: false,
	Easing: Enum.EasingStyle.Sine,
	EasingDirection: Enum.EasingDirection.InOut,
	Delay: 0,
	RepeatDelay: 0,
};

export function MotionScale(props: MotionScaleProps) {
	const ref = React.useRef<UIScale>();
	const [initialScale, setInitialScale] = React.useState(1);

	React.useEffect(() => {
		const uiScale = ref.current;
		const parent = uiScale?.Parent;
		if (parent && parent.IsA("GuiObject")) {
			const existingScale = parent.FindFirstChildOfClass("UIScale");
			if (existingScale && existingScale !== uiScale) {
				setInitialScale(existingScale.Scale);
			}
		}
	}, []);

	const { From, To, Duration = defaultProps.Duration, Looped = defaultProps.Looped, Easing = defaultProps.Easing, EasingDirection = defaultProps.EasingDirection, Delay = defaultProps.Delay, RepeatDelay = defaultProps.RepeatDelay, OnStart, OnFinished } = props;

	return (
		<uiscale ref={ref}>
			<MotionTween
				Goal={{ Scale: To ?? initialScale }}
				From={From !== undefined ? { Scale: From } : { Scale: initialScale }}
				Duration={Duration}
				Looped={Looped}
				Easing={Easing}
				EasingDirection={EasingDirection}
				Delay={Delay}
				RepeatDelay={RepeatDelay}
				OnStart={OnStart}
				OnFinished={OnFinished}
			/>
		</uiscale>
	);
}
