import Roact from "@rbxts/roact";
import { TweenService } from "@rbxts/services";

function shallowEqual(a: Record<string, unknown> | undefined, b: Record<string, unknown> | undefined) {
	if (a === b) return true;
	if (a === undefined || b === undefined) return false;

	for (const [k, v] of pairs(a)) {
		if (b[k] !== v) return false;
	}
	for (const [k] of pairs(b)) {
		if (a[k] === undefined) return false;
	}
	return true;
}

export interface MotionTweenProps {
	Goal: Record<string, unknown>; // The properties to tween to
	From?: Record<string, unknown>; // Initial properties
	Speed?: number; // Duration in seconds
	Looped?: boolean;
	Easing?: Enum.EasingStyle;
	EasingDirection?: Enum.EasingDirection;
	Delay?: number;
	RepeatDelay?: number;
	OnStart?: () => void;
	OnFinished?: () => void;
}

export class MotionTween extends Roact.Component<MotionTweenProps> {
	private ref: Roact.Ref<Folder> | undefined;
	private tween?: Tween;
	private conn?: RBXScriptConnection;

	public static defaultProps: Partial<MotionTweenProps> = {
		Speed: 1,
		Looped: false,
		Easing: Enum.EasingStyle.Sine,
		EasingDirection: Enum.EasingDirection.InOut,
		Delay: 0,
		RepeatDelay: 0,
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
			warn("MotionTween must be a child of an Instance");
		}
	}

	public didUpdate(prevProps: MotionTweenProps) {
		if (!shallowEqual(this.props.Goal, prevProps.Goal) || !shallowEqual(this.props.From, prevProps.From)) {
			const folder = this.ref?.getValue();
			const parent = folder?.Parent;
			if (parent) {
				this.animate(parent);
			}
		}
	}

	public willUnmount() {
		if (this.conn) {
			this.conn.Disconnect();
			this.conn = undefined;
		}
		if (this.tween) {
			this.tween.Cancel();
			this.tween = undefined;
		}
	}

	private animate(target: Instance) {
		const { Goal, From, Speed, Looped, Easing, EasingDirection, Delay, RepeatDelay, OnStart, OnFinished } =
			this.props;

		if (this.conn) {
			this.conn.Disconnect();
			this.conn = undefined;
		}
		if (this.tween) {
			this.tween.Cancel();
		}

		// Apply initial values if provided
		if (From !== undefined) {
			for (const [key, value] of pairs(From)) {
				(target as unknown as Record<string, unknown>)[key] = value;
			}
		}

		const tweenInfo = new TweenInfo(
			Speed!,
			Easing!,
			EasingDirection!,
			Looped ? -1 : 0, // Repeat count (-1 is infinite)
			Looped, // Reverses
			RepeatDelay!,
		);

		this.tween = TweenService.Create(target, tweenInfo, Goal as never);

		if (OnFinished) {
			this.conn = this.tween.Completed.Connect(() => {
				OnFinished();
			});
		}

		const playTween = () => {
			if (OnStart) OnStart();
			this.tween?.Play();
		};

		if (Delay !== undefined && Delay > 0) {
			task.delay(Delay, playTween);
		} else {
			playTween();
		}
	}

	public render() {
		return Roact.createElement("Folder", {
			Name: "MotionTween",
			[Roact.Ref]: this.ref,
		});
	}
}
