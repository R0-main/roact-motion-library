import React from "@rbxts/react";
import { RunService } from "@rbxts/services";

export interface MotionShakeProps {
	Duration?: number; // How long to shake (defaults to 0.5s)
	Intensity?: number; // Magnitude of the shake (defaults to 5 pixels)
	Decay?: boolean; // If true, shake reduces over time
	Delay?: number;
	OnFinished?: () => void;
	OnStart?: () => void;
}

const defaultProps: Partial<MotionShakeProps> = {
	Duration: 0.5,
	Intensity: 5,
	Decay: true,
	Delay: 0,
};

export function MotionShake(props: MotionShakeProps) {
	const ref = React.useRef<Folder>();
	const connectionRef = React.useRef<RBXScriptConnection>();
	const originalPositionRef = React.useRef<UDim2>();
	const targetRef = React.useRef<GuiObject>();

	function cleanup(parent?: GuiObject) {
		if (connectionRef.current) {
			connectionRef.current.Disconnect();
			connectionRef.current = undefined;
		}
		// Reset to original position if we have it and the parent is still there
		if (originalPositionRef.current && parent) {
			parent.Position = originalPositionRef.current;
		}
	}

	function startShake(target: GuiObject) {
		const {
			Duration = defaultProps.Duration!,
			Intensity = defaultProps.Intensity!,
			Decay = defaultProps.Decay!,
			Delay = defaultProps.Delay!,
			OnStart,
			OnFinished,
		} = props;

		const runShake = () => {
			if (OnStart) OnStart();

			const startTime = tick();

			connectionRef.current = RunService.Heartbeat.Connect(() => {
				const elapsed = tick() - startTime;

				if (Duration !== -1 && elapsed >= Duration) {
					cleanup(target);
					if (OnFinished) OnFinished();
					return;
				}

				// Calculate current intensity
				let currentIntensity = Intensity;
				if (Decay && Duration !== -1) {
					const alpha = 1 - elapsed / Duration;
					currentIntensity *= alpha;
				}

				// Random offset
				const offsetX = (math.random() - 0.5) * 2 * currentIntensity;
				const offsetY = (math.random() - 0.5) * 2 * currentIntensity;

				// Apply to original position
				if (originalPositionRef.current) {
					target.Position = new UDim2(
						originalPositionRef.current.X.Scale,
						originalPositionRef.current.X.Offset + offsetX,
						originalPositionRef.current.Y.Scale,
						originalPositionRef.current.Y.Offset + offsetY,
					);
				}
			});
		};

		if (Delay !== undefined && Delay > 0) {
			task.delay(Delay, runShake);
		} else {
			runShake();
		}
	}

	React.useEffect(() => {
		const folder = ref.current;
		const parent = folder?.Parent;

		if (parent && parent.IsA("GuiObject")) {
			originalPositionRef.current = parent.Position; // Capture original position
			targetRef.current = parent;
			startShake(parent);
		} else {
			warn("MotionShake must be a child of a GuiObject");
		}

		return () => {
			cleanup(targetRef.current);
		};
	}, [props.Duration, props.Intensity, props.Decay, props.Delay]);

	React.useEffect(() => {
		if (ref.current) {
			ref.current.Name = "MotionShake";
		}
	}, []);

	return <folder ref={ref} />;
}
