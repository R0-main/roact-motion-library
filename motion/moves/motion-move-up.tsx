import Roact from "@rbxts/roact";
import { MotionMove, MotionMoveDirectionProps } from "../motion-move";

export class MotionMoveUp extends Roact.Component<MotionMoveDirectionProps> {
	public static defaultProps: Partial<MotionMoveDirectionProps> = {
		...MotionMove.defaultProps,
		Distance: 1,
	};

	public render() {
		const { Distance } = this.props;
		const dist = Distance ?? 1;
		const defaultFrom = UDim2.fromScale(0, -dist);

		return <MotionMove {...(this.props as unknown as MotionMoveDirectionProps)} To={defaultFrom} />;
	}
}
