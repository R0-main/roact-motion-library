import React from "@rbxts/react";
import { MotionTween, MotionTweenProps } from "../motion-tween";

export interface MotionYScaleProps extends Omit<MotionTweenProps, "Goal" | "From"> {
	From?: number;
	To?: number;
}

const defaultProps: Partial<MotionYScaleProps> = {
	Duration: 1,
	Looped: false,
	Easing: Enum.EasingStyle.Sine,
	EasingDirection: Enum.EasingDirection.InOut,
	Delay: 0,
	RepeatDelay: 0,
};

export function MotionYScale(props: MotionYScaleProps) {
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

	const targetYScale = initialSize.Y.Scale * (To ?? 1);
	const targetYOffset = initialSize.Y.Offset * (To ?? 1);
	const goalSize = new UDim2(initialSize.X.Scale, initialSize.X.Offset, targetYScale, targetYOffset);

	let fromSize: UDim2 | undefined;
	if (From !== undefined) {
		const fromYScale = initialSize.Y.Scale * From;
		const fromYOffset = initialSize.Y.Offset * From;
		fromSize = new UDim2(initialSize.X.Scale, initialSize.X.Offset, fromYScale, fromYOffset);
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
