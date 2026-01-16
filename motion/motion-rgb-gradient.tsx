import Roact from "@rbxts/roact";
import { MotionGradient } from "./motion-gradient";

export interface MotionRgbGradientProps {
	Duration?: number;
	RotationSpeed?: number;
	Looped?: boolean;
}

export class MotionRgbGradient extends Roact.Component<MotionRgbGradientProps> {
	render() {
		const { Duration, RotationSpeed, Looped = true } = this.props;

		return (
			<uigradient
				Color={
					new ColorSequence([
						new ColorSequenceKeypoint(0, Color3.fromRGB(255, 0, 0)),
						new ColorSequenceKeypoint(0.166, Color3.fromRGB(255, 255, 0)),
						new ColorSequenceKeypoint(0.333, Color3.fromRGB(0, 255, 0)),
						new ColorSequenceKeypoint(0.5, Color3.fromRGB(0, 255, 255)),
						new ColorSequenceKeypoint(0.666, Color3.fromRGB(0, 0, 255)),
						new ColorSequenceKeypoint(0.833, Color3.fromRGB(255, 0, 255)),
						new ColorSequenceKeypoint(1, Color3.fromRGB(255, 0, 0)),
					])
				}
			>
				<MotionGradient Duration={Duration} RotationSpeed={RotationSpeed} Looped={Looped} Rotate={true} />
			</uigradient>
		);
	}
}
