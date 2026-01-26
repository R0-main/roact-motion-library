import React from "@rbxts/react";

export interface ResetProps {
	Duration?: number;
	Easing?: Enum.EasingStyle;
	EasingDirection?: Enum.EasingDirection;
	Delay?: number;
}

export interface HoverContextValue {
	hovered?: boolean;
	isResetEnabled?: boolean;
	resetProps?: ResetProps;
}

export const HoverContext = React.createContext<HoverContextValue>({
	hovered: undefined,
	isResetEnabled: false,
	resetProps: undefined,
});
