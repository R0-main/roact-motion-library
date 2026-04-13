import React from "@rbxts/react";

import { DragContext, DropInfo, findNearestGuiObjectFromFolder } from "./drag-context";

export type DraggableContainerProps = {
	containerId: string;
	priority?: number;
	accepts?: (draggableId: string) => boolean;
	onDrop?: (info: DropInfo) => void;
	children?: React.ReactNode;
};

export function DraggableContainer(props: DraggableContainerProps) {
	const { containerId, priority = 0, accepts, onDrop, children } = props;

	const registry = React.useContext(DragContext);
	const ref = React.useRef<Folder>();

	React.useEffect(() => {
		let registered = false;
		const folder = ref.current;
		if (!folder) return;

		const tryRegister = () => {
			const target = findNearestGuiObjectFromFolder(folder);
			if (!target) return false;

			registry.registerContainer({
				containerId,
				guiObject: target,
				accepts,
				priority,
				onDrop,
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
	}, [containerId, priority, accepts, onDrop]);

	return (
		<>
			<folder ref={ref} />
			{children}
		</>
	);
}

