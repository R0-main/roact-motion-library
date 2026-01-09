import Roact from "@rbxts/roact";

interface SoundProps {
	Id: string | number;
	Volume?: number;
	Pitch?: number;
	PlayOnRemove?: boolean;
	Looped?: boolean;
	TimePosition?: number;
	PlaybackSpeed?: number;
}

export class Sound extends Roact.Component<SoundProps> {
	public render() {
		const {
			Id,
			Volume = 0.5,
			Pitch = 1,
			PlayOnRemove = false,
			Looped = false,
			TimePosition = 0,
			PlaybackSpeed = 1,
		} = this.props;

		return Roact.createElement("Sound", {
			SoundId: typeOf(Id) === "number" ? `rbxassetid://${Id}` : (Id as string),
			Volume,
			Pitch,
			PlayOnRemove,
			Looped,
			TimePosition,
			PlaybackSpeed,
		});
	}
}
