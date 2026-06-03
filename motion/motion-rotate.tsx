import React from "@rbxts/react";
import { RunService } from "@rbxts/services";
import { MotionTween, MotionTweenProps } from "./motion-tween";

export interface MotionRotateProps extends Omit<MotionTweenProps, "Goal" | "From"> {
	From?: number;
	To: number;
	Speed?: number;
	/** Spins in one direction forever without reversing at the end of each cycle. */
	Continuous?: boolean;
}

const defaultProps: Partial<MotionRotateProps> = {
	Duration: 1,
	Looped: false,
	Easing: Enum.EasingStyle.Sine,
	EasingDirection: Enum.EasingDirection.InOut,
	Delay: 0,
	RepeatDelay: 0,
};

export function MotionRotate(props: MotionRotateProps) {
	const {
		From,
		To,
		Duration,
		Looped,
		Easing,
		EasingDirection,
		Delay,
		RepeatDelay,
		OnStart,
		OnFinished,
		DestroyAfterFinished,
		Continuous,
	} = props;

	const ref = React.useRef<Folder>();

	React.useEffect(() => {
		if (!Continuous) return;

		const folder = ref.current;
		const parent = folder?.Parent;
		if (!parent || !parent.IsA("GuiObject")) return;

		const duration = Duration ?? defaultProps.Duration ?? 1;
		const delay = Delay ?? defaultProps.Delay ?? 0;
		const speedDegPerSec = To / duration;
		const baseRotation = From ?? parent.Rotation;
		const phaseOffset = (delay / duration) * To;

		parent.Rotation = baseRotation + phaseOffset;

		OnStart?.();

		let elapsed = 0;
		const connection = RunService.RenderStepped.Connect((dt) => {
			elapsed += dt;
			parent.Rotation = baseRotation + phaseOffset + speedDegPerSec * elapsed;
		});

		return () => {
			connection.Disconnect();
		};
	}, [Continuous, From, To, Duration, Delay, OnStart]);

	if (Continuous) {
		return <folder ref={ref} />;
	}

	return (
		<MotionTween
			Duration={Duration ?? defaultProps.Duration}
			Looped={Looped ?? defaultProps.Looped}
			Easing={Easing ?? defaultProps.Easing}
			EasingDirection={EasingDirection ?? defaultProps.EasingDirection}
			Delay={Delay ?? defaultProps.Delay}
			RepeatDelay={RepeatDelay ?? defaultProps.RepeatDelay}
			OnStart={OnStart}
			OnFinished={OnFinished}
			DestroyAfterFinished={DestroyAfterFinished}
			Goal={{ Rotation: To }}
			From={From !== undefined ? { Rotation: From } : undefined}
		/>
	);
}
