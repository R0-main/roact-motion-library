import React from "@rbxts/react";
import { RunService } from "@rbxts/services";

export interface MotionShakeProps {
	Duration?: number;
	/** Seconds of idle between shake bursts. When > 0, shakes for `Duration` then pauses, repeating. */
	PauseDuration?: number;
	Intensity?: number;
	Decay?: boolean;
	/** One-shot: delay before shake starts. Cyclic: phase offset within each pause/shake cycle. */
	Delay?: number;
	OnFinished?: () => void;
	OnStart?: () => void;
}

const defaultProps: Partial<MotionShakeProps> = {
	Duration: 0.5,
	PauseDuration: 0,
	Intensity: 5,
	Decay: true,
	Delay: 0,
};

export function MotionShake(props: MotionShakeProps) {
	const ref = React.useRef<Folder>();
	const connectionRef = React.useRef<RBXScriptConnection>();
	const originalPositionRef = React.useRef<UDim2>();
	const targetRef = React.useRef<GuiObject>();

	function resetPosition(parent?: GuiObject) {
		if (originalPositionRef.current && parent) {
			parent.Position = originalPositionRef.current;
		}
	}

	function cleanup(parent?: GuiObject) {
		if (connectionRef.current) {
			connectionRef.current.Disconnect();
			connectionRef.current = undefined;
		}
		resetPosition(parent);
	}

	function applyShakeOffset(target: GuiObject, intensity: number) {
		if (!originalPositionRef.current) return;

		const offsetX = (math.random() - 0.5) * 2 * intensity;
		const offsetY = (math.random() - 0.5) * 2 * intensity;

		target.Position = new UDim2(
			originalPositionRef.current.X.Scale,
			originalPositionRef.current.X.Offset + offsetX,
			originalPositionRef.current.Y.Scale,
			originalPositionRef.current.Y.Offset + offsetY,
		);
	}

	function startShake(target: GuiObject) {
		const {
			Duration = defaultProps.Duration!,
			PauseDuration = defaultProps.PauseDuration!,
			Intensity = defaultProps.Intensity!,
			Decay = defaultProps.Decay!,
			Delay = defaultProps.Delay!,
			OnStart,
			OnFinished,
		} = props;

		const runShake = () => {
			if (OnStart) OnStart();

			const startTime = tick();
			const cyclic = PauseDuration > 0;
			const shakeSegmentDuration = cyclic ? (Duration === -1 ? 1 : Duration) : Duration;

			connectionRef.current = RunService.Heartbeat.Connect(() => {
				const elapsed = tick() - startTime;

				if (cyclic) {
					const cycleLength = PauseDuration + shakeSegmentDuration;
					const t = (elapsed + Delay) % cycleLength;
					if (t < PauseDuration) {
						resetPosition(target);
						return;
					}

					const shakeElapsed = t - PauseDuration;
					let currentIntensity = Intensity;
					if (Decay) {
						currentIntensity *= 1 - shakeElapsed / shakeSegmentDuration;
					}
					applyShakeOffset(target, currentIntensity);
					return;
				}

				if (Duration !== -1 && elapsed >= Duration) {
					cleanup(target);
					if (OnFinished) OnFinished();
					return;
				}

				let currentIntensity = Intensity;
				if (Decay && Duration !== -1) {
					currentIntensity *= 1 - elapsed / Duration;
				}
				applyShakeOffset(target, currentIntensity);
			});
		};

		if (!PauseDuration && Delay > 0) {
			task.delay(Delay, runShake);
		} else {
			runShake();
		}
	}

	React.useEffect(() => {
		const folder = ref.current;
		const parent = folder?.Parent;

		if (parent && parent.IsA("GuiObject")) {
			originalPositionRef.current = parent.Position;
			targetRef.current = parent;
			startShake(parent);
		} else {
			warn("MotionShake must be a child of a GuiObject");
		}

		return () => {
			cleanup(targetRef.current);
		};
	}, [props.Duration, props.PauseDuration, props.Intensity, props.Decay, props.Delay]);

	React.useEffect(() => {
		if (ref.current) {
			ref.current.Name = "MotionShake";
		}
	}, []);

	return <folder ref={ref} />;
}
