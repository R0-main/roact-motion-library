import React from "@rbxts/react";
import { RunService } from "@rbxts/services";

export interface MotionRotationShakeProps {
	Duration?: number;
	/** Seconds of idle between shake bursts. When > 0, shakes for `Duration` (or 1s if Duration is -1) then pauses, repeating. */
	PauseDuration?: number;
	/** Phase offset in seconds within each pause/shake cycle (stagger multiple instances). */
	Delay?: number;
	Intensity?: number;
	Speed?: number;
	Decay?: boolean;
	OnFinished?: () => void;
	OnStart?: () => void;
}

const defaultProps: Partial<MotionRotationShakeProps> = {
	Duration: -1,
	PauseDuration: 0,
	Delay: 0,
	Intensity: 1,
	Speed: 18,
	Decay: false,
};

export function MotionRotationShake(props: MotionRotationShakeProps) {
	const ref = React.useRef<Folder>();
	const connectionRef = React.useRef<RBXScriptConnection>();
	const originalRotationRef = React.useRef<number>();
	const targetRef = React.useRef<GuiObject>();

	function cleanup(parent?: GuiObject) {
		if (connectionRef.current) {
			connectionRef.current.Disconnect();
			connectionRef.current = undefined;
		}
		if (originalRotationRef.current !== undefined && parent) {
			parent.Rotation = originalRotationRef.current;
		}
	}

	function startShake(target: GuiObject) {
		const {
			Duration = defaultProps.Duration!,
			PauseDuration = defaultProps.PauseDuration!,
			Delay = defaultProps.Delay!,
			Intensity = defaultProps.Intensity!,
			Speed = defaultProps.Speed!,
			Decay = defaultProps.Decay!,
			OnStart,
			OnFinished,
		} = props;

		originalRotationRef.current = target.Rotation;
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
					target.Rotation = originalRotationRef.current!;
					return;
				}
				const shakeElapsed = t - PauseDuration;
				let amplitude = Intensity;
				if (Decay) {
					amplitude *= 1 - shakeElapsed / shakeSegmentDuration;
				}
				target.Rotation = originalRotationRef.current! + amplitude * math.sin(shakeElapsed * Speed);
				return;
			}

			if (shakeSegmentDuration !== -1 && elapsed >= shakeSegmentDuration) {
				cleanup(target);
				if (OnFinished) OnFinished();
				return;
			}

			let amplitude = Intensity;
			if (Decay && shakeSegmentDuration !== -1) {
				amplitude *= 1 - elapsed / shakeSegmentDuration;
			}

			target.Rotation = originalRotationRef.current! + amplitude * math.sin(elapsed * Speed);
		});
	}

	React.useEffect(() => {
		const folder = ref.current;
		const parent = folder?.Parent;

		if (parent && parent.IsA("GuiObject")) {
			targetRef.current = parent;
			startShake(parent);
		} else {
			warn("MotionRotationShake must be a child of a GuiObject");
		}

		return () => {
			cleanup(targetRef.current);
		};
	}, [props.Duration, props.PauseDuration, props.Delay, props.Intensity, props.Speed, props.Decay]);

	React.useEffect(() => {
		if (ref.current) {
			ref.current.Name = "MotionRotationShake";
		}
	}, []);

	return <folder ref={ref} />;
}
