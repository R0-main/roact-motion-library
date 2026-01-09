import Roact from "@rbxts/roact";
import { MotionColor, MotionColorProps } from "./motion-color";

export interface MotionDarkenProps extends Omit<MotionColorProps, "To" | "From"> {
	Factor?: number; // 0 to 1, how much to darken (default 0.2)
}

interface MotionDarkenState {
	initialColor: Color3;
	targetColor: Color3;
}

export class MotionDarken extends Roact.Component<MotionDarkenProps, MotionDarkenState> {
	private ref: Roact.Ref<Folder> | undefined;

	public static defaultProps: Partial<MotionDarkenProps> = {
		...MotionColor.defaultProps,
		Factor: 0.2,
		Duration: 0.2,
	};

	public init() {
		this.ref = Roact.createRef<Folder>();
		this.setState({
			initialColor: new Color3(1, 1, 1),
			targetColor: new Color3(1, 1, 1),
		});
	}

	public didMount() {
		const folder = this.ref?.getValue();
		const parent = folder?.Parent;

		if (parent) {
			const prop = this.props.Property ?? "BackgroundColor3";
			const initial = (parent as unknown as Record<string, Color3>)[prop];

			if (typeIs(initial, "Color3")) {
				const factor = this.props.Factor ?? 0.2;
				// Lerp towards Black
				const target = initial.Lerp(new Color3(0, 0, 0), factor);

				this.setState({
					initialColor: initial,
					targetColor: target,
				});
			}
		}
	}

	public render() {
		const motionProps = this.props;
		const { initialColor, targetColor } = this.state;

		return (
			<>
				{Roact.createElement("Folder", {
					[Roact.Ref]: this.ref,
					Name: "MotionDarkenReference",
				})}
				<MotionColor {...motionProps} To={targetColor} From={initialColor} />
			</>
		);
	}
}
