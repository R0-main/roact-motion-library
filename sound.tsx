import React from "@rbxts/react";
import { createPortal } from "@rbxts/react-roblox";
import { SoundService } from "@rbxts/services";
import { HoverContext } from "./hover-context";

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

const defaultProps = {
	Volume: 0.5,
	PlaybackSpeed: 1,
	Looped: false,
};

export function Sound(props: SoundProps) {

	const {
		Id,
		Volume = defaultProps.Volume,
		PlaybackSpeed = defaultProps.PlaybackSpeed,
		Looped = defaultProps.Looped,
		TimePosition,
		RollOffMaxDistance,
		RollOffMinDistance,
		RollOffMode,
		SoundGroup,
		PlayOnRemove,
		OnFinished,
		At,
	} = props;

	const context = React.useContext(HoverContext);
	const { hovered } = context;
	const shouldPlay = hovered ?? true;

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

	const soundElement = (
		<sound
			SoundId={finalId}
			Playing={shouldPlay}
			Volume={Volume}
			PlaybackSpeed={PlaybackSpeed}
			Looped={Looped}
			TimePosition={TimePosition}
			RollOffMaxDistance={RollOffMaxDistance}
			RollOffMinDistance={RollOffMinDistance}
			RollOffMode={RollOffMode}
			SoundGroup={SoundGroup}
			PlayOnRemove={PlayOnRemove}
			Event={{
				Ended: () => {
					if (OnFinished) {
						OnFinished();
					}
				},
			}}
		/>
	);

	return createPortal(soundElement, At ?? SoundService);
}
