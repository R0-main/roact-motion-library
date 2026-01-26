import React from "@rbxts/react";

export interface MotionTypewriterProps {
	Speed: number; // Seconds per character
	Delay?: number;
	OnFinished?: () => void;
	OnStart?: () => void;
}

const defaultProps: Partial<MotionTypewriterProps> = {
	Speed: 0.05,
	Delay: 0,
};

export function MotionTypewriter(props: MotionTypewriterProps) {
	const ref = React.useRef<Folder>();
	const connectionRef = React.useRef<RBXScriptConnection>();
	const typewriterThreadRef = React.useRef<thread>();

	function stopTypewriter() {
		if (typewriterThreadRef.current) {
			task.cancel(typewriterThreadRef.current);
			typewriterThreadRef.current = undefined;
		}
	}

	function startTypewriter(target: TextLabel | TextButton | TextBox) {
		stopTypewriter();

		typewriterThreadRef.current = task.spawn(() => {
			const { Speed = defaultProps.Speed!, Delay = defaultProps.Delay, OnStart, OnFinished } = props;

			target.MaxVisibleGraphemes = 0;

			if (Delay !== undefined && Delay > 0) {
				task.wait(Delay);
			}

			if (OnStart) OnStart();

			const text = target.Text;
			const length = text.size();
			const speed = Speed;

			for (let i = 1; i <= length; i++) {
				target.MaxVisibleGraphemes = i;
				task.wait(speed);
			}

			typewriterThreadRef.current = undefined;
			if (OnFinished) OnFinished();
		});
	}

	React.useEffect(() => {
		const folder = ref.current;
		const parent = folder?.Parent;

		if (parent && (parent.IsA("TextLabel") || parent.IsA("TextButton") || parent.IsA("TextBox"))) {
			startTypewriter(parent);
			connectionRef.current = parent.GetPropertyChangedSignal("Text").Connect(() => {
				startTypewriter(parent);
			});
		} else {
			warn("MotionTypewriter must be a child of a TextObject (TextLabel, TextButton, TextBox)");
		}

		return () => {
			stopTypewriter();
			if (connectionRef.current) {
				connectionRef.current.Disconnect();
			}
		};
	}, [props.Speed, props.Delay]);

	React.useEffect(() => {
		if (ref.current) {
			ref.current.Name = "MotionTypewriter";
		}
	}, []);

	return <folder ref={ref} />;
}
