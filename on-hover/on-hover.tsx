import React from "@rbxts/react";
import { HoverBase, OnHoverProps } from "./hover-base";

export function OnHover(props: OnHoverProps) {
	const { ResetToBeforeHover, ResetDuration, ResetEasing, ResetEasingDirection, ResetDelay, children } = props;
	return (
		<HoverBase
			ResetToBeforeHover={ResetToBeforeHover}
			ResetDuration={ResetDuration}
			ResetEasing={ResetEasing}
			ResetEasingDirection={ResetEasingDirection}
			ResetDelay={ResetDelay}
			children={children}
			shouldRender={(hovered) => hovered}
		/>
	);
}
