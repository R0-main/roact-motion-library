import React from "@rbxts/react";
import { RunService } from "@rbxts/services";
import { MotionTween, MotionTweenProps } from "./motion-tween";

export interface MotionScaleProps extends Omit<MotionTweenProps, "Goal" | "From"> {
	From?: number;
	To?: number;
	/** Seconds of idle at `From` between scale bursts. When > 0, pulses during `Duration` then pauses, repeating. */
	PauseDuration?: number;
}

const defaultProps: Partial<MotionScaleProps> = {
	Duration: 1,
	Looped: false,
	Easing: Enum.EasingStyle.Sine,
	EasingDirection: Enum.EasingDirection.InOut,
	Delay: 0,
	RepeatDelay: 0,
	PauseDuration: 0,
};

export function MotionScale(props: MotionScaleProps) {
	const ref = React.useRef<UIScale>();
	const connectionRef = React.useRef<RBXScriptConnection>();
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

	const {
		From,
		To,
		Duration = defaultProps.Duration,
		Looped = defaultProps.Looped,
		Easing = defaultProps.Easing,
		EasingDirection = defaultProps.EasingDirection,
		Delay = defaultProps.Delay,
		RepeatDelay = defaultProps.RepeatDelay,
		PauseDuration = defaultProps.PauseDuration,
		OnStart,
		OnFinished,
	} = props;

	const fromScale = From ?? initialScale;
	const toScale = To ?? initialScale;
	const useCyclicPulse = (PauseDuration ?? 0) > 0;

	React.useEffect(() => {
		if (!useCyclicPulse) return;

		const uiScale = ref.current;
		if (!uiScale) return;

		const segmentDuration = Duration ?? defaultProps.Duration ?? 1;
		const pauseDuration = PauseDuration ?? 0;
		const phaseDelay = Delay ?? 0;
		const scaleDelta = toScale - fromScale;

		OnStart?.();

		const startTime = tick();
		connectionRef.current = RunService.Heartbeat.Connect(() => {
			const elapsed = tick() - startTime;
			const cycleLength = pauseDuration + segmentDuration;
			const t = (elapsed + phaseDelay) % cycleLength;

			if (t < pauseDuration) {
				uiScale.Scale = fromScale;
				return;
			}

			const pulseElapsed = t - pauseDuration;
			const wave = math.sin((pulseElapsed / segmentDuration) * math.pi);
			uiScale.Scale = fromScale + scaleDelta * wave;
		});

		return () => {
			connectionRef.current?.Disconnect();
			connectionRef.current = undefined;
			uiScale.Scale = fromScale;
		};
	}, [useCyclicPulse, fromScale, toScale, Duration, PauseDuration, Delay, OnStart]);

	return (
		<uiscale ref={ref}>
			{!useCyclicPulse && (
				<MotionTween
					Goal={{ Scale: toScale }}
					From={{ Scale: fromScale }}
					Duration={Duration}
					Looped={Looped}
					Easing={Easing}
					EasingDirection={EasingDirection}
					Delay={Delay}
					RepeatDelay={RepeatDelay}
					OnStart={OnStart}
					OnFinished={OnFinished}
				/>
			)}
		</uiscale>
	);
}
