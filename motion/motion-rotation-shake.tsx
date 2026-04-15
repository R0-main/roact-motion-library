import React from "@rbxts/react";
import { RunService } from "@rbxts/services";

export interface MotionRotationShakeProps {
	Duration?: number;
	Intensity?: number;
	Speed?: number;
	Decay?: boolean;
	OnFinished?: () => void;
	OnStart?: () => void;
}

const defaultProps: Partial<MotionRotationShakeProps> = {
	Duration: -1,
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
			Intensity = defaultProps.Intensity!,
			Speed = defaultProps.Speed!,
			Decay = defaultProps.Decay!,
			OnStart,
			OnFinished,
		} = props;

		originalRotationRef.current = target.Rotation;
		if (OnStart) OnStart();

		const startTime = tick();

		connectionRef.current = RunService.Heartbeat.Connect(() => {
			const elapsed = tick() - startTime;

			if (Duration !== -1 && elapsed >= Duration) {
				cleanup(target);
				if (OnFinished) OnFinished();
				return;
			}

			let amplitude = Intensity;
			if (Decay && Duration !== -1) {
				amplitude *= 1 - elapsed / Duration;
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
	}, [props.Duration, props.Intensity, props.Speed, props.Decay]);

	React.useEffect(() => {
		if (ref.current) {
			ref.current.Name = "MotionRotationShake";
		}
	}, []);

	return <folder ref={ref} />;
}
