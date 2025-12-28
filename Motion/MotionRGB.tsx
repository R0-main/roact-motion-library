import Roact from "@rbxts/roact";
import { RunService } from "@rbxts/services";

export interface MotionRGBProps {
	Speed: number; // Time in seconds for a full hue cycle
	CycleSpeed?: number; // Alias for Speed
	Duration: number; // Total duration of the effect in seconds. If undefined, it loops forever.
	Saturation?: number;
	Value?: number;
	Property: "BackgroundColor3" | "TextColor3" | "ImageColor3" | "ScrollBarImageColor3" | "BorderColor3";
	OnStart?: () => void;
	OnFinished?: () => void;
}

export class MotionRGB extends Roact.Component<MotionRGBProps> {
	private ref: Roact.Ref<Folder> | undefined;
	private conn?: RBXScriptConnection;
	private stopTask?: thread;

	public static defaultProps: Partial<MotionRGBProps> = {
		CycleSpeed: 5,
		Saturation: 1,
		Value: 1,
		Property: "BackgroundColor3",
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
		const { Speed, CycleSpeed, Duration, Saturation, Value, Property, OnStart, OnFinished } = this.props;

		this.stopAnimation();

		if (OnStart) {
			OnStart();
		}

		const cycleTime = CycleSpeed ?? Speed ?? 5;
		const s = Saturation ?? 1;
		const v = Value ?? 1;
		const prop = Property ?? "BackgroundColor3";

		// Use RenderStepped on client, Heartbeat on server
		const event = RunService.IsClient() ? RunService.RenderStepped : RunService.Heartbeat;

		this.conn = event.Connect(() => {
			const hue = (tick() % cycleTime) / cycleTime;
			const color = Color3.fromHSV(hue, s, v);
			(target as unknown as Record<string, unknown>)[prop] = color;
		});

		if (Duration !== undefined && Duration > 0) {
			this.stopTask = task.delay(Duration, () => {
				this.stopTask = undefined;
				this.stopAnimation();
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
