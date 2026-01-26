import React from "@rbxts/react";
import { RunService } from "@rbxts/services";

export interface MotionRGBProps {
	Speed: number; // Time in seconds for a full hue cycle
	Duration?: number; // Total duration of the effect in seconds.
	Looped?: boolean;
	Saturation?: number;
	Value?: number;
	Property: "BackgroundColor3" | "TextColor3" | "Color" | "ImageColor3" | "ScrollBarImageColor3" | "BorderColor3";
	Seed?: number;
	OnStart?: () => void;
	OnFinished?: () => void;
	DestroyAfterFinished?: boolean;
}

const defaultProps: Partial<MotionRGBProps> = {
	Duration: 5,
	Looped: true,
	Saturation: 1,
	Value: 1,
	Property: "BackgroundColor3",
	Seed: 0,
};

export function MotionRGB(props: MotionRGBProps) {
	const ref = React.useRef<Folder>();
	const connRef = React.useRef<RBXScriptConnection>();
	const stopTaskRef = React.useRef<thread>();

	function stopAnimation() {
		if (connRef.current) {
			connRef.current.Disconnect();
			connRef.current = undefined;
		}
		if (stopTaskRef.current) {
			task.cancel(stopTaskRef.current);
			stopTaskRef.current = undefined;
		}
	}

	function animate(target: Instance) {
		const {
			Duration = defaultProps.Duration!,
			Looped = defaultProps.Looped!,
			Saturation = defaultProps.Saturation!,
			Value = defaultProps.Value!,
			Property = defaultProps.Property!,
			Seed = defaultProps.Seed!,
			OnStart,
			OnFinished,
			DestroyAfterFinished,
		} = props;

		stopAnimation();

		if (OnStart) {
			OnStart();
		}

		const cycleTime = Duration;
		const s = Saturation;
		const v = Value;
		const prop = Property;
		const seedOffset = Seed;

		// Use RenderStepped on client, Heartbeat on server
		const event = RunService.IsClient() ? RunService.RenderStepped : RunService.Heartbeat;

		connRef.current = event.Connect(() => {
			const hue = ((tick() + seedOffset) % cycleTime) / cycleTime;
			const color = Color3.fromHSV(hue, s, v);
			(target as unknown as Record<string, unknown>)[prop] = color;
		});

		if (!Looped && Duration !== undefined && Duration > 0) {
			stopTaskRef.current = task.delay(Duration, () => {
				stopTaskRef.current = undefined;
				stopAnimation();
				if (DestroyAfterFinished) {
					ref.current?.Destroy();
				}
				if (OnFinished) {
					OnFinished();
				}
			});
		}
	}

	React.useEffect(() => {
		const folder = ref.current;
		const parent = folder?.Parent;

		if (parent) {
			animate(parent);
		} else {
			warn("MotionRGB must be a child of an Instance");
		}

		return () => {
			stopAnimation();
		};
	}, [props.Duration, props.Looped, props.Saturation, props.Value, props.Property, props.Seed]);

	React.useEffect(() => {
		if (ref.current) {
			ref.current.Name = "MotionRGB";
		}
	}, []);

	return <folder ref={ref} />;
}
