import { HoverBase } from "./HoverBase";

export class OnHoverEnd extends HoverBase {
	protected shouldRender(hovered: boolean) {
		return !hovered;
	}
}
