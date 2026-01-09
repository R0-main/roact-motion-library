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

		return <MotionGradient Duration={Duration} RotationSpeed={RotationSpeed} Looped={Looped} Rotate={true} />;
	}
}
