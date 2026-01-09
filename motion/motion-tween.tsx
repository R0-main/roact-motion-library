import Roact from "@rbxts/roact";
import { TweenService } from "@rbxts/services";
import { HoverContext, ResetProps, HoverContextValue } from "../hover-context";

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
	Duration?: number; // Duration in seconds
	Looped?: boolean;
	Easing?: Enum.EasingStyle;
	EasingDirection?: Enum.EasingDirection;
	Delay?: number;
	RepeatDelay?: number;
	OnStart?: () => void;
	OnFinished?: () => void;
	DestroyAfterFinished?: boolean;
	_hovered?: boolean;
	_isResetEnabled?: boolean;
	_resetProps?: ResetProps;
}

class MotionTweenInner extends Roact.Component<MotionTweenProps> {
	private ref: Roact.Ref<Folder> | undefined;
	private tween?: Tween;
	private conn?: RBXScriptConnection;
	private initialValues: Record<string, unknown> | undefined;

	public static defaultProps: Partial<MotionTweenProps> = {
		Duration: 1,
		Looped: false,
		Easing: Enum.EasingStyle.Sine,
		EasingDirection: Enum.EasingDirection.InOut,
		Delay: 0,
		RepeatDelay: 0,
	};

	public init() {
		this.ref = Roact.createRef<Folder>();
		this.initialValues = {};
	}

	public didMount() {
		const folder = this.ref?.getValue();
		const parent = folder?.Parent;

		if (parent && typeIs(parent, "Instance")) {
			// Capture initial values for properties in Goal
			for (const [key] of pairs(this.props.Goal)) {
				// Safety check: ensure parent is still valid (though it should be)
				if (parent !== undefined) {
					const val = (parent as unknown as Record<string, unknown>)[key];
					if (val !== undefined && this.initialValues !== undefined) {
						this.initialValues[key] = val;
					}
				}
			}

			this.animate(parent);
		} else {
			// warn("MotionTween must be a child of an Instance");
		}
	}

	public didUpdate(prevProps: MotionTweenProps) {
		const propsChanged =
			!shallowEqual(this.props.Goal, prevProps.Goal) ||
			!shallowEqual(this.props.From, prevProps.From) ||
			this.props._hovered !== prevProps._hovered;

		if (propsChanged) {
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
		const {
			Goal,
			From,
			Duration,
			Looped,
			Easing,
			EasingDirection,
			Delay,
			RepeatDelay,
			OnStart,
			OnFinished,
			DestroyAfterFinished,
			_hovered,
			_isResetEnabled,
			_resetProps,
		} = this.props;

		if (this.conn) {
			this.conn.Disconnect();
			this.conn = undefined;
		}
		if (this.tween) {
			this.tween.Cancel();
		}

		// Determine Effective Goal and Start handling
		let effectiveGoal = Goal;
		let shouldApplyFrom = true;

		let effectiveDuration = Duration!;
		let effectiveEasing = Easing!;
		let effectiveEasingDirection = EasingDirection!;
		let effectiveDelay = Delay;

		// If we are in ResetToBeforeHover mode
		if (_isResetEnabled && _hovered !== undefined) {
			if (_hovered) {
				// Hovering: Goal is target. Apply From if exists.
				effectiveGoal = Goal;
				shouldApplyFrom = true;
			} else {
				// Not Hovering: Goal is From (or Initial). Do NOT apply From.
				// We want to tween BACK to the start.
				// Use From if available, otherwise use captured initial values.
				if (From !== undefined) {
					effectiveGoal = From;
				} else {
					effectiveGoal = this.initialValues || {};
				}
				shouldApplyFrom = false;

				// Overrides for reset animation
				if (_resetProps !== undefined) {
					if (_resetProps.Duration !== undefined) effectiveDuration = _resetProps.Duration;
					if (_resetProps.Easing !== undefined) effectiveEasing = _resetProps.Easing;
					if (_resetProps.EasingDirection !== undefined)
						effectiveEasingDirection = _resetProps.EasingDirection;
					if (_resetProps.Delay !== undefined) effectiveDelay = _resetProps.Delay;
				}
			}
		}

		// Apply initial values if provided and applicable
		if (shouldApplyFrom && From !== undefined) {
			for (const [key, value] of pairs(From)) {
				(target as unknown as Record<string, unknown>)[key] = value;
			}
		}

		const tweenInfo = new TweenInfo(
			effectiveDuration,
			effectiveEasing,
			effectiveEasingDirection,
			Looped ? -1 : 0, // Repeat count (-1 is infinite)
			Looped, // Reverses
			RepeatDelay!,
		);

		// If effectiveGoal is missing keys (e.g. initialValues empty), this might error or do nothing.
		// Usually initialValues will be populated in didMount.
		if (next(effectiveGoal)[0] === undefined) {
			return; // Nothing to tween
		}

		this.tween = TweenService.Create(target, tweenInfo, effectiveGoal as never);

		if (OnFinished || DestroyAfterFinished) {
			this.conn = this.tween.Completed.Connect(() => {
				if (DestroyAfterFinished && !Looped) {
					this.ref?.getValue()?.Destroy();
				}
				if (OnFinished) {
					OnFinished();
				}
			});
		}

		const playTween = () => {
			if (OnStart) OnStart();
			this.tween?.Play();
		};

		if (effectiveDelay !== undefined && effectiveDelay > 0) {
			task.delay(effectiveDelay, playTween);
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

// Wrapper component to consume Context
export class MotionTween extends Roact.Component<MotionTweenProps> {
	public static defaultProps = MotionTweenInner.defaultProps;

	public render() {
		return (
			<HoverContext.Consumer
				render={(context: HoverContextValue) => {
					return (
						<MotionTweenInner
							{...this.props}
							_hovered={context.hovered}
							_isResetEnabled={context.isResetEnabled}
							_resetProps={context.resetProps}
						/>
					);
				}}
			/>
		);
	}
}
