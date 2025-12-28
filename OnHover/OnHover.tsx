import { HoverBase } from "./HoverBase";

export class OnHover extends HoverBase {
	protected shouldRender(hovered: boolean) {
		return hovered;
	}
}
