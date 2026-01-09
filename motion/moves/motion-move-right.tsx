import Roact from "@rbxts/roact";
import { MotionMove, MotionMoveDirectionProps } from "../motion-move";

export class MotionMoveRight extends Roact.Component<MotionMoveDirectionProps> {
	public static defaultProps: Partial<MotionMoveDirectionProps> = {
		...MotionMove.defaultProps,
		Distance: 1,
	};

	public render() {
		const { Distance } = this.props;
		const dist = Distance ?? 1;
		const defaultFrom = UDim2.fromScale(dist, 0);

		return <MotionMove {...(this.props as unknown as MotionMoveDirectionProps)} To={defaultFrom} />;
	}
}
