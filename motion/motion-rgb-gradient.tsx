import React from "@rbxts/react";
import { RunService } from "@rbxts/services";

export interface MotionRgbGradientProps {
	Speed?: number;
	Direction?: "Left" | "Right";
	Rotation?: number;
	/** When true, recomputes the gradient every `Heartbeat`; when false (default), every 3rd tick to reduce work. */
	UpdateEveryFrame?: boolean;
}

const defaultProps: Partial<MotionRgbGradientProps> = {
	Speed: 0.5,
	Direction: "Right",
	Rotation: 0,
};

export function MotionRgbGradient(props: MotionRgbGradientProps) {
	const {
		Speed = defaultProps.Speed!,
		Direction = defaultProps.Direction!,
		Rotation = defaultProps.Rotation,
		UpdateEveryFrame = false,
	} = props;
	const frameStride = UpdateEveryFrame ? 1 : 3;
	const [colorBinding, setColorBinding] = React.useBinding(new ColorSequence(Color3.fromRGB(255, 0, 0)));
	const connectionRef = React.useRef<RBXScriptConnection>();

	React.useEffect(() => {
		let frameSkip = 0;
		connectionRef.current = RunService.Heartbeat.Connect(() => {
			frameSkip++;
			if (frameSkip % frameStride !== 0) return;
			const speedVal = Speed;
			const time = os.clock();

			const dirMultiplier = Direction === "Left" ? 1 : -1;
			const offset = time * speedVal * dirMultiplier;

			const keypoints: ColorSequenceKeypoint[] = [];

			for (let i = 0; i <= 6; i++) {
				const t = i / 6;
				let hue = (t + offset) % 1;
				if (hue < 0) hue += 1;

				keypoints.push(new ColorSequenceKeypoint(t, Color3.fromHSV(hue, 1, 1)));
			}

			setColorBinding(new ColorSequence(keypoints));
		});

		return () => {
			connectionRef.current?.Disconnect();
		};
	}, [Speed, Direction, UpdateEveryFrame]);

	return <uigradient Color={colorBinding} Rotation={Rotation} />;
}
