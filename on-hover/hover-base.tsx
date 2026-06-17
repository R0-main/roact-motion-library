import React from "@rbxts/react";
import { HoverContext, ResetProps } from "../hover-context";

export interface OnHoverProps {
	ResetToBeforeHover?: boolean | ResetProps;
	ResetDuration?: number;
	ResetEasing?: Enum.EasingStyle;
	ResetEasingDirection?: Enum.EasingDirection;
	ResetDelay?: number;
	children?: React.ReactNode;
}

export interface HoverBaseProps extends OnHoverProps {
	shouldRender: (hovered: boolean) => boolean;
}

const defaultProps: Partial<OnHoverProps> = {
	ResetToBeforeHover: true,
};

export function HoverBase(props: HoverBaseProps) {
	const {
		ResetToBeforeHover = defaultProps.ResetToBeforeHover,
		ResetDuration,
		ResetEasing,
		ResetEasingDirection,
		ResetDelay,
		shouldRender,
		children,
	} = props;

	const ref = React.useRef<Folder>();
	const [hovered, setHovered] = React.useState(false);
	const connEnterRef = React.useRef<RBXScriptConnection>();
	const connLeaveRef = React.useRef<RBXScriptConnection>();

	React.useEffect(() => {
		task.spawn(() => {
			const folder = ref.current;
			if (!folder) return;

			let target: GuiObject | undefined = folder.Parent?.IsA("GuiObject")
				? (folder.Parent as GuiObject)
				: (folder.FindFirstAncestorWhichIsA("GuiObject") as GuiObject | undefined);

			if (!target) {
				task.wait(0);
				target = folder.FindFirstAncestorWhichIsA("GuiObject") as GuiObject | undefined;
			}

			if (target) {
				connEnterRef.current = target.MouseEnter.Connect(() => {
					setHovered(true);
				});
				connLeaveRef.current = target.MouseLeave.Connect(() => {
					setHovered(false);
				});
			}
		});

		return () => {
			connEnterRef.current?.Disconnect();
			connEnterRef.current = undefined;
			connLeaveRef.current?.Disconnect();
			connLeaveRef.current = undefined;
		};
	}, []);

	const showChildren = ResetToBeforeHover ? true : shouldRender(hovered);

	let isResetEnabled = !!ResetToBeforeHover;
	// If any individual reset prop is present, enable reset
	if (
		ResetDuration !== undefined ||
		ResetEasing !== undefined ||
		ResetEasingDirection !== undefined ||
		ResetDelay !== undefined
	) {
		isResetEnabled = true;
	}

	let resetProps: ResetProps | undefined;

	if (typeIs(ResetToBeforeHover, "table")) {
		// Legacy/Object style
		resetProps = ResetToBeforeHover as ResetProps;
	}

	// If individual props are used, they override or create the object
	if (
		ResetDuration !== undefined ||
		ResetEasing !== undefined ||
		ResetEasingDirection !== undefined ||
		ResetDelay !== undefined
	) {
		if (resetProps === undefined) resetProps = {};
		if (ResetDuration !== undefined) resetProps.Duration = ResetDuration;
		if (ResetEasing !== undefined) resetProps.Easing = ResetEasing;
		if (ResetEasingDirection !== undefined) resetProps.EasingDirection = ResetEasingDirection;
		if (ResetDelay !== undefined) resetProps.Delay = ResetDelay;
	}

	return (
		<>
			<folder ref={ref} />
			<HoverContext.Provider
				value={{
					hovered: hovered,
					isResetEnabled: isResetEnabled,
					resetProps: resetProps,
				}}
			>
				{showChildren && children}
			</HoverContext.Provider>
		</>
	);
}
