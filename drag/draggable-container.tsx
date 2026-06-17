import React from "@rbxts/react";

import { DragContext, DropInfo, findNearestGuiObjectFromFolder } from "./drag-context";

export type DraggableContainerProps = {
	containerId: string;
	priority?: number;
	accepts?: (draggableId: string) => boolean;
	onDrop?: (info: DropInfo) => void;
	/** When provided, this GuiObject is registered directly as the drop zone instead of using folder-parent lookup. */
	refObject?: React.RefObject<GuiObject>;
	/** Called live on each hit-test. Return value (pixels) is added to the cursor Y before comparison. */
	hitboxYOffset?: (gui: GuiObject) => number;
	children?: React.ReactNode;
};

export function DraggableContainer(props: DraggableContainerProps) {
	const { containerId, priority = 0, accepts, onDrop, refObject, hitboxYOffset, children } = props;

	const registry = React.useContext(DragContext);
	const folderRef = React.useRef<Folder>();

	// Keep latest callbacks in refs so re-registration only happens when identity changes.
	const onDropRef = React.useRef(onDrop);
	onDropRef.current = onDrop;
	const acceptsRef = React.useRef(accepts);
	acceptsRef.current = accepts;

	React.useEffect(() => {
		let registered = false;

		const tryRegister = () => {
			const target = refObject
				? refObject.current
				: folderRef.current
					? findNearestGuiObjectFromFolder(folderRef.current)
					: undefined;
			if (!target) return false;

			registry.registerContainer({
				containerId,
				guiObject: target,
				priority,
				accepts: acceptsRef.current !== undefined ? (id) => acceptsRef.current!(id) : undefined,
				onDrop: (info) => onDropRef.current?.(info),
				hitboxYOffset,
			});
			registered = true;
			return true;
		};

		if (!tryRegister()) {
			task.spawn(() => {
				task.wait(0);
				tryRegister();
			});
		}

		return () => {
			if (registered) registry.unregisterContainer(containerId);
		};
	}, [containerId, priority, refObject]);

	return (
		<>
			<folder ref={folderRef} />
			{children}
		</>
	);
}
