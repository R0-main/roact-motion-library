import React from "@rbxts/react";
import { MotionTween, MotionTweenProps } from "../motion-tween";

export interface MotionXScaleProps extends Omit<MotionTweenProps, "Goal" | "From"> {
	From?: number;
	To?: number;
}

const defaultProps: Partial<MotionXScaleProps> = {
	Duration: 1,
	Looped: false,
	Easing: Enum.EasingStyle.Sine,
	EasingDirection: Enum.EasingDirection.InOut,
	Delay: 0,
	RepeatDelay: 0,
};

export function MotionXScale(props: MotionXScaleProps) {
	const ref = React.useRef<Folder>();
	const [initialSize, setInitialSize] = React.useState<UDim2>(new UDim2());
	const [initialized, setInitialized] = React.useState(false);

	React.useEffect(() => {
		const folder = ref.current;
		const parent = folder?.Parent;
		if (parent && parent.IsA("GuiObject")) {
			setInitialSize(parent.Size);
			setInitialized(true);
		}
	}, []);

	const { From, To, Duration, Looped, Easing, EasingDirection, Delay, RepeatDelay, OnStart, OnFinished, DestroyAfterFinished } = props;

	if (!initialized) {
		return <folder ref={ref} />;
	}

	const targetXScale = initialSize.X.Scale * (To ?? 1);
	const targetXOffset = initialSize.X.Offset * (To ?? 1);
	const goalSize = new UDim2(targetXScale, targetXOffset, initialSize.Y.Scale, initialSize.Y.Offset);

	let fromSize: UDim2 | undefined;
	if (From !== undefined) {
		const fromXScale = initialSize.X.Scale * From;
		const fromXOffset = initialSize.X.Offset * From;
		fromSize = new UDim2(fromXScale, fromXOffset, initialSize.Y.Scale, initialSize.Y.Offset);
	}

	return (
		<>
			<folder ref={ref} />
			<MotionTween
				Duration={Duration}
				Looped={Looped}
				Easing={Easing}
				EasingDirection={EasingDirection}
				Delay={Delay}
				RepeatDelay={RepeatDelay}
				OnStart={OnStart}
				OnFinished={OnFinished}
				DestroyAfterFinished={DestroyAfterFinished}
				Goal={{ Size: goalSize }}
				From={fromSize ? { Size: fromSize } : undefined}
			/>
		</>
	);
}
