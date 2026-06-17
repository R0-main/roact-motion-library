import React from "@rbxts/react";

export type DraggableId = string;
export type ContainerId = string;

export type DropInfo = {
	draggableId: DraggableId;
	containerId: ContainerId;
	draggable: GuiObject;
	container: GuiObject;
};

export type DropContainerRecord = {
	containerId: ContainerId;
	guiObject: GuiObject;
	accepts?: (draggableId: DraggableId) => boolean;
	priority: number;
	onDrop?: (info: DropInfo) => void;
	/** Called live on each hit-test. Return value (pixels) is added to the cursor Y before comparison. */
	hitboxYOffset?: (gui: GuiObject) => number;
};

export type DragRegistry = {
	registerContainer: (record: DropContainerRecord) => void;
	unregisterContainer: (containerId: ContainerId) => void;
	getContainers: () => ReadonlyArray<DropContainerRecord>;
};

const defaultRegistryState = new Map<ContainerId, DropContainerRecord>();

function createDefaultRegistry(): DragRegistry {
	return {
		registerContainer: (record) => {
			defaultRegistryState.set(record.containerId, record);
		},
		unregisterContainer: (containerId) => {
			defaultRegistryState.delete(containerId);
		},
		getContainers: () => {
			const result = new Array<DropContainerRecord>();
			defaultRegistryState.forEach((value) => result.push(value));
			return result;
		},
	};
}

export const DragContext = React.createContext<DragRegistry>(createDefaultRegistry());

export function findNearestGuiObjectFromFolder(folder: Folder): GuiObject | undefined {
	const parent = folder.Parent;
	if (parent && parent.IsA("GuiObject")) return parent as GuiObject;

	const ancestor = folder.FindFirstAncestorWhichIsA("GuiObject");
	if (ancestor && ancestor.IsA("GuiObject")) return ancestor as GuiObject;

	return undefined;
}

export function isPointInGuiObject(point: Vector2, gui: GuiObject): boolean {
	const pos = gui.AbsolutePosition;
	const size = gui.AbsoluteSize;
	return point.X >= pos.X && point.Y >= pos.Y && point.X <= pos.X + size.X && point.Y <= pos.Y + size.Y;
}

export function pickBestContainer(
	containers: ReadonlyArray<DropContainerRecord>,
	point: Vector2,
	draggableId: DraggableId,
): DropContainerRecord | undefined {
	let best: DropContainerRecord | undefined;

	for (const container of containers) {
		if (!container.guiObject.Parent) continue;
		const yOffset = container.hitboxYOffset ? container.hitboxYOffset(container.guiObject) : 0;
		const adjustedPoint = yOffset !== 0 ? new Vector2(point.X, point.Y + yOffset) : point;
		if (!isPointInGuiObject(adjustedPoint, container.guiObject)) continue;
		if (container.accepts && !container.accepts(draggableId)) continue;

		if (!best) {
			best = container;
			continue;
		}

		const priA = container.priority;
		const priB = best.priority;
		if (priA !== priB) {
			if (priA > priB) best = container;
			continue;
		}

		const zA = container.guiObject.ZIndex;
		const zB = best.guiObject.ZIndex;
		if (zA > zB) best = container;
	}

	return best;
}
