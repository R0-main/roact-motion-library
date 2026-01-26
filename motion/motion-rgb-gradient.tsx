import React from "@rbxts/react";
import { RunService } from "@rbxts/services";

export interface MotionRgbGradientProps {
	Speed?: number;
	Direction?: "Left" | "Right";
	Rotation?: number;
}

const defaultProps: Partial<MotionRgbGradientProps> = {
	Speed: 0.5,
	Direction: "Right",
	Rotation: 0,
};

export function MotionRgbGradient(props: MotionRgbGradientProps) {
	const { Speed = defaultProps.Speed!, Direction = defaultProps.Direction!, Rotation = defaultProps.Rotation } = props;
	const [colorBinding, setColorBinding] = React.useBinding(new ColorSequence(Color3.fromRGB(255, 0, 0)));
	const connectionRef = React.useRef<RBXScriptConnection>();

	React.useEffect(() => {
		connectionRef.current = RunService.Heartbeat.Connect(() => {
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
	}, [Speed, Direction]);

	return <uigradient Color={colorBinding} Rotation={Rotation} />;
}
