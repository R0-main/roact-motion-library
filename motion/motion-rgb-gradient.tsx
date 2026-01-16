import Roact from "@rbxts/roact";
import { RunService } from "@rbxts/services";

export interface MotionRgbGradientProps {
	Speed?: number;
	Direction?: "Left" | "Right";
	Rotation?: number;
}

export class MotionRgbGradient extends Roact.Component<MotionRgbGradientProps> {
	public static defaultProps: Partial<MotionRgbGradientProps> = {
		Speed: 0.5,
		Direction: "Right",
		Rotation: 0,
	};

	private colorBinding: Roact.Binding<ColorSequence> | undefined;
	private updateColor?: (newValue: ColorSequence) => void;
	private connection?: RBXScriptConnection;

	init(props: MotionRgbGradientProps) {
		[this.colorBinding, this.updateColor] = Roact.createBinding(new ColorSequence(Color3.fromRGB(255, 0, 0)));
	}

	public didMount() {
		this.connection = RunService.Heartbeat.Connect(() => {
			const { Speed, Direction } = this.props;
			const speedVal = Speed ?? 0.5;
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

			this.updateColor?.(new ColorSequence(keypoints));
		});
	}

	public willUnmount() {
		this.connection?.Disconnect();
	}

	public render() {
		return <uigradient Color={this.colorBinding} Rotation={this.props.Rotation} />;
	}
}
