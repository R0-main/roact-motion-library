import Roact from "@rbxts/roact";
import { SoundService } from "@rbxts/services";

interface SoundProps {
	Id: string | number;
	Volume?: number;
	PlaybackSpeed?: number;
	Looped?: boolean;
	TimePosition?: number;
	RollOffMaxDistance?: number;
	RollOffMinDistance?: number;
	RollOffMode?: Enum.RollOffMode;
	SoundGroup?: SoundGroup;
	PlayOnRemove?: boolean;
	OnFinished?: () => void;
	At?: Instance;
}

class SoundComponent extends Roact.Component<SoundProps> {
	public static defaultProps = {
		Volume: 0.5,
		PlaybackSpeed: 1,
		Looped: false,
	};

	public render() {
		print("Rendering Sound Component");
		const props = this.props;
		const { Id, OnFinished } = props;

		let finalId: string;
		if (typeIs(Id, "number")) {
			finalId = `rbxassetid://${Id}`;
		} else if (typeIs(Id, "string")) {
			// Check if it's purely a number string and doesn't already have a protocol
			if (tonumber(Id) !== undefined && Id.find("://")[0] === undefined) {
				finalId = `rbxassetid://${Id}`;
			} else {
				finalId = Id;
			}
		} else {
			finalId = tostring(Id);
		}

		const soundElement = Roact.createElement("Sound", {
			SoundId: finalId,
			Playing: true,
			Volume: props.Volume,
			PlaybackSpeed: props.PlaybackSpeed,
			Looped: props.Looped,
			TimePosition: props.TimePosition,
			RollOffMaxDistance: props.RollOffMaxDistance,
			RollOffMinDistance: props.RollOffMinDistance,
			RollOffMode: props.RollOffMode,
			SoundGroup: props.SoundGroup,
			PlayOnRemove: props.PlayOnRemove,
			[Roact.Event.Ended]: () => {
				if (OnFinished) {
					OnFinished();
				}
			},
		});

		// Always use a Portal to ensure the Sound has a parent
		return <Roact.Portal target={props.At ?? SoundService}>{soundElement}</Roact.Portal>;
	}
}

export { SoundComponent as Sound };
