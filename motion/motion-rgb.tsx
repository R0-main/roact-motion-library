import Roact from "@rbxts/roact";
import { RunService } from "@rbxts/services";

export interface MotionRGBProps {
	Speed: number; // Time in seconds for a full hue cycle
	Duration?: number; // Total duration of the effect in seconds.
	Looped?: boolean;
	Saturation?: number;
	Value?: number;
	Property: "BackgroundColor3" | "TextColor3" | "Color" | "ImageColor3" | "ScrollBarImageColor3" | "BorderColor3";
	Seed?: number;
	OnStart?: () => void;
	OnFinished?: () => void;
	DestroyAfterFinished?: boolean;
}

export class MotionRGB extends Roact.Component<MotionRGBProps> {
	private ref: Roact.Ref<Folder> | undefined;
	private conn?: RBXScriptConnection;
	private stopTask?: thread;

	public static defaultProps: Partial<MotionRGBProps> = {
		Duration: 5,
		Looped: true,
		Saturation: 1,
		Value: 1,
		Property: "BackgroundColor3",
		Seed: 0,
	};

	public init() {
		this.ref = Roact.createRef<Folder>();
	}

	public didMount() {
		const folder = this.ref?.getValue();
		const parent = folder?.Parent;

		if (parent) {
			this.animate(parent);
		} else {
			warn("MotionRGB must be a child of an Instance");
		}
	}

	public willUnmount() {
		this.stopAnimation();
	}

	private stopAnimation() {
		if (this.conn) {
			this.conn.Disconnect();
			this.conn = undefined;
		}
		if (this.stopTask) {
			task.cancel(this.stopTask);
			this.stopTask = undefined;
		}
	}

	private animate(target: Instance) {
		const { Duration, Looped, Saturation, Value, Property, Seed, OnStart, OnFinished, DestroyAfterFinished } =
			this.props;

		this.stopAnimation();

		if (OnStart) {
			OnStart();
		}

		const cycleTime = Duration ?? 5;
		const s = Saturation ?? 1;
		const v = Value ?? 1;
		const prop = Property ?? "BackgroundColor3";
		const seedOffset = Seed ?? 0;

		// Use RenderStepped on client, Heartbeat on server
		const event = RunService.IsClient() ? RunService.RenderStepped : RunService.Heartbeat;

		this.conn = event.Connect(() => {
			const hue = ((tick() + seedOffset) % cycleTime) / cycleTime;
			const color = Color3.fromHSV(hue, s, v);
			(target as unknown as Record<string, unknown>)[prop] = color;
		});

		if (!Looped && Duration !== undefined && Duration > 0) {
			this.stopTask = task.delay(Duration, () => {
				this.stopTask = undefined;
				this.stopAnimation();
				if (DestroyAfterFinished) {
					this.ref?.getValue()?.Destroy();
				}
				if (OnFinished) {
					OnFinished();
				}
			});
		}
	}

	public render() {
		return Roact.createElement("Folder", {
			Name: "MotionRGB",
			[Roact.Ref]: this.ref,
		});
	}
}
