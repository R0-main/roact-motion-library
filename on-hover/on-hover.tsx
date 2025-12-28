import { HoverBase } from "./hover-base";

export class OnHover extends HoverBase {
	protected shouldRender(hovered: boolean) {
		return hovered;
	}
}
