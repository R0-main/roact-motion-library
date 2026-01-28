import React from "@rbxts/react";
import { TweenService } from "@rbxts/services";
import { HoverContext, ResetProps } from "../hover-context";

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

const defaultProps: Partial<MotionTweenProps> = {
	Duration: 1,
	Looped: false,
	Easing: Enum.EasingStyle.Sine,
	EasingDirection: Enum.EasingDirection.InOut,
	Delay: 0,
	RepeatDelay: 0,
};

function MotionTweenInner(props: MotionTweenProps) {
	const {
		Goal,
		From,
		Duration = defaultProps.Duration!,
		Looped = defaultProps.Looped!,
		Easing = defaultProps.Easing!,
		EasingDirection = defaultProps.EasingDirection!,
		Delay = defaultProps.Delay!,
		RepeatDelay = defaultProps.RepeatDelay!,
		OnStart,
		OnFinished,
		DestroyAfterFinished,
		_hovered,
		_isResetEnabled,
		_resetProps,
	} = props;

	const ref = React.useRef<Folder>();
	const tweenRef = React.useRef<Tween>();
	const connRef = React.useRef<RBXScriptConnection>();
	const initialValuesRef = React.useRef<Record<string, unknown>>({});
	const prevPropsRef = React.useRef<MotionTweenProps>();

	React.useEffect(() => {
		const folder = ref.current;
		const parent = folder?.Parent;

		if (parent && typeIs(parent, "Instance")) {
			// Capture initial values for properties in Goal
			for (const [key] of pairs(Goal)) {
				// Safety check: ensure parent is still valid (though it should be)
				if (parent !== undefined) {
					const val = (parent as unknown as Record<string, unknown>)[key];
					if (val !== undefined && initialValuesRef.current !== undefined) {
						initialValuesRef.current[key] = val;
					}
				}
			}

			animate(parent);
		} else {
			// warn("MotionTween must be a child of an Instance");
		}
	}, []);

	React.useEffect(() => {
		const folder = ref.current;
		const parent = folder?.Parent;

		if (!parent) return;

		const prevProps = prevPropsRef.current;
		if (!prevProps) {
			prevPropsRef.current = props;
			return;
		}

		const propsChanged =
			!shallowEqual(Goal, prevProps.Goal) ||
			!shallowEqual(From, prevProps.From) ||
			_hovered !== prevProps._hovered;

		if (propsChanged) {
			animate(parent);
		}

		prevPropsRef.current = props;
	}, [Goal, From, _hovered]);

	React.useEffect(() => {
		return () => {
			if (connRef.current) {
				connRef.current.Disconnect();
				connRef.current = undefined;
			}
			if (tweenRef.current) {
				tweenRef.current.Cancel();
				tweenRef.current = undefined;
			}
		};
	}, []);

	function animate(target: Instance) {
		if (connRef.current) {
			connRef.current.Disconnect();
			connRef.current = undefined;
		}
		if (tweenRef.current) {
			tweenRef.current.Cancel();
		}

		// Determine Effective Goal and Start handling
		let effectiveGoal = Goal;
		let shouldApplyFrom = true;

		let effectiveDuration = Duration;
		let effectiveEasing = Easing;
		let effectiveEasingDirection = EasingDirection;
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
					effectiveGoal = initialValuesRef.current || {};
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
			RepeatDelay,
		);

		// If effectiveGoal is missing keys (e.g. initialValues empty), this might error or do nothing.
		// Usually initialValues will be populated in didMount.
		if (next(effectiveGoal)[0] === undefined) {
			return; // Nothing to tween
		}

		tweenRef.current = TweenService.Create(target, tweenInfo, effectiveGoal as never);

		if (OnFinished || DestroyAfterFinished) {
			connRef.current = tweenRef.current.Completed.Connect(() => {
				if (DestroyAfterFinished && !Looped) {
					ref.current?.Destroy();
				}
				if (OnFinished) {
					OnFinished();
				}
			});
		}

		const playTween = () => {
			if (OnStart) OnStart();
			tweenRef.current?.Play();
		};

		if (effectiveDelay !== undefined && effectiveDelay > 0) {
			task.delay(effectiveDelay, playTween);
		} else {
			playTween();
		}
	}

	React.useEffect(() => {
		if (ref.current) {
			ref.current.Name = "MotionTween";
		}
	}, []);

	return <folder ref={ref} />;
}

// Wrapper component to consume Context
export function MotionTween(props: MotionTweenProps) {
	const context = React.useContext(HoverContext);
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
	} = props;

	return (
		<MotionTweenInner
			Goal={Goal}
			From={From}
			Duration={Duration}
			Looped={Looped}
			Easing={Easing}
			EasingDirection={EasingDirection}
			Delay={Delay}
			RepeatDelay={RepeatDelay}
			OnStart={OnStart}
			OnFinished={OnFinished}
			DestroyAfterFinished={DestroyAfterFinished}
			_hovered={context.hovered}
			_isResetEnabled={context.isResetEnabled}
			_resetProps={context.resetProps}
		/>
	);
}
