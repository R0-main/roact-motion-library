import React from "@rbxts/react";
import { MotionColor, MotionColorProps } from "./motion-color";

export interface MotionDarkenProps extends Omit<MotionColorProps, "To" | "From"> {
	Factor?: number; // 0 to 1, how much to darken (default 0.2)
}

interface MotionDarkenState {
	initialColor: Color3;
	targetColor: Color3;
}

const defaultProps: Partial<MotionDarkenProps> = {
	Duration: 0.2,
	Looped: false,
	Easing: Enum.EasingStyle.Sine,
	EasingDirection: Enum.EasingDirection.InOut,
	Delay: 0,
	RepeatDelay: 0,
	Factor: 0.2,
};

export function MotionDarken(props: MotionDarkenProps) {
	const ref = React.useRef<Folder>();
	const [state, setState] = React.useState<MotionDarkenState>({
		initialColor: new Color3(1, 1, 1),
		targetColor: new Color3(1, 1, 1),
	});

	React.useEffect(() => {
		const folder = ref.current;
		const parent = folder?.Parent;

		if (parent) {
			const prop = props.Property ?? "BackgroundColor3";
			const initial = (parent as unknown as Record<string, Color3>)[prop];

			if (typeIs(initial, "Color3")) {
				const factor = props.Factor ?? 0.2;
				// Lerp towards Black
				const target = initial.Lerp(new Color3(0, 0, 0), factor);

				setState({
					initialColor: initial,
					targetColor: target,
				});
			}
		}
	}, [props.Property, props.Factor]);

	const { initialColor, targetColor } = state;
	const {
		Factor,
		Property,
		Duration,
		Looped,
		Easing,
		EasingDirection,
		Delay,
		RepeatDelay,
		OnStart,
		OnFinished,
		DestroyAfterFinished,
	} = props;

	React.useEffect(() => {
		if (ref.current) {
			ref.current.Name = "MotionDarkenReference";
		}
	}, []);

	return (
		<>
			<folder ref={ref} />
			<MotionColor
				Property={Property}
				Duration={Duration}
				Looped={Looped}
				Easing={Easing}
				EasingDirection={EasingDirection}
				Delay={Delay}
				RepeatDelay={RepeatDelay}
				OnStart={OnStart}
				OnFinished={OnFinished}
				DestroyAfterFinished={DestroyAfterFinished}
				To={targetColor}
				From={initialColor}
			/>
		</>
	);
}
