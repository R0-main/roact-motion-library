import Roact from "@rbxts/roact";

export interface MotionTypewriterProps {
	Speed: number; // Seconds per character
	Delay?: number;
	OnFinished?: () => void;
	OnStart?: () => void;
}

export class MotionTypewriter extends Roact.Component<MotionTypewriterProps> {
	private ref: Roact.Ref<Folder> | undefined;
	private connection?: RBXScriptConnection;
	private typewriterThread?: thread;

	public static defaultProps: Partial<MotionTypewriterProps> = {
		Speed: 0.05,
		Delay: 0,
	};

	public init() {
		this.ref = Roact.createRef<Folder>();
	}

	public didMount() {
		const folder = this.ref?.getValue();
		const parent = folder?.Parent;

		if (parent && (parent.IsA("TextLabel") || parent.IsA("TextButton") || parent.IsA("TextBox"))) {
			this.startTypewriter(parent);
			this.connection = parent.GetPropertyChangedSignal("Text").Connect(() => {
				this.startTypewriter(parent);
			});
		} else {
			warn("MotionTypewriter must be a child of a TextObject (TextLabel, TextButton, TextBox)");
		}
	}

	public willUnmount() {
		this.stopTypewriter();
		if (this.connection) {
			this.connection.Disconnect();
		}
	}

	private stopTypewriter() {
		if (this.typewriterThread) {
			task.cancel(this.typewriterThread);
			this.typewriterThread = undefined;
		}
	}

	private startTypewriter(target: TextLabel | TextButton | TextBox) {
		this.stopTypewriter();

		this.typewriterThread = task.spawn(() => {
			const { Speed, Delay, OnStart, OnFinished } = this.props;

			target.MaxVisibleGraphemes = 0;

			if (Delay !== undefined && Delay > 0) {
				task.wait(Delay);
			}

			if (OnStart) OnStart();

			const text = target.Text;
			const length = text.size();
			const speed = Speed ?? 0.05;

			for (let i = 1; i <= length; i++) {
				target.MaxVisibleGraphemes = i;
				task.wait(speed);
			}

			this.typewriterThread = undefined;
			if (OnFinished) OnFinished();
		});
	}

	public render() {
		return Roact.createElement("Folder", {
			[Roact.Ref]: this.ref,
			Name: "MotionTypewriter",
		});
	}
}
