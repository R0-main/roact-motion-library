import { HoverBase } from "./hover-base";

export class OnHoverEnd extends HoverBase {
	protected shouldRender(hovered: boolean) {
		return !hovered;
	}
}
