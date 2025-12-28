import Roact from "@rbxts/roact";
import { RunService } from "@rbxts/services";

export interface MotionShakeProps {
	Duration?: number; // How long to shake (defaults to 0.5s)
	Intensity?: number; // Magnitude of the shake (defaults to 5 pixels)
	Decay?: boolean; // If true, shake reduces over time
	Delay?: number;
	OnFinished?: () => void;
	OnStart?: () => void;
}

export class MotionShake extends Roact.Component<MotionShakeProps> {
	private ref: Roact.Ref<Folder> | undefined;
	private connection?: RBXScriptConnection;
	private originalPosition?: UDim2;

	public static defaultProps: Partial<MotionShakeProps> = {
		Duration: 0.5,
		Intensity: 5,
		Decay: true,
		Delay: 0,
	};

	public init() {
		this.ref = Roact.createRef<Folder>();
	}

	public didMount() {
		const folder = this.ref?.getValue();
		const parent = folder?.Parent;

		if (parent && parent.IsA("GuiObject")) {
			this.originalPosition = parent.Position; // Capture original position
			this.startShake(parent);
		} else {
			warn("MotionShake must be a child of a GuiObject");
		}
	}

	public willUnmount() {
		this.cleanup();
	}

	private cleanup(parent?: GuiObject) {
		if (this.connection) {
			this.connection.Disconnect();
			this.connection = undefined;
		}
		// Reset to original position if we have it and the parent is still there
		if (this.originalPosition && parent) {
			parent.Position = this.originalPosition;
		}
	}

	private startShake(target: GuiObject) {
		const { Duration, Intensity, Decay, Delay, OnStart, OnFinished } = this.props;

		const runShake = () => {
			if (OnStart) OnStart();

			const startTime = tick();

			this.connection = RunService.Heartbeat.Connect(() => {
				const elapsed = tick() - startTime;

				if (Duration !== -1 && elapsed >= Duration!) {
					this.cleanup(target);
					if (OnFinished) OnFinished();
					return;
				}

				// Calculate current intensity
				let currentIntensity = Intensity!;
				if (Decay && Duration !== -1) {
					const alpha = 1 - elapsed / Duration!;
					currentIntensity *= alpha;
				}

				// Random offset
				const offsetX = (math.random() - 0.5) * 2 * currentIntensity;
				const offsetY = (math.random() - 0.5) * 2 * currentIntensity;

				// Apply to original position
				if (this.originalPosition) {
					target.Position = new UDim2(
						this.originalPosition.X.Scale,
						this.originalPosition.X.Offset + offsetX,
						this.originalPosition.Y.Scale,
						this.originalPosition.Y.Offset + offsetY,
					);
				}
			});
		};

		if (Delay !== undefined && Delay > 0) {
			task.delay(Delay, runShake);
		} else {
			runShake();
		}
	}

	public render() {
		return Roact.createElement("Folder", {
			Name: "MotionShake",
			[Roact.Ref]: this.ref,
		});
	}
}
