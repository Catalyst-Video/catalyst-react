import { Room } from "livekit-client";
import { RoomState } from "../hooks/useRoom";
import { ControlsProps } from "../components/Toolbar";
import { ParticipantProps } from "../components/ParticipantView";

export interface StageProps {
  roomState: RoomState;
  participantRenderer?: (props: ParticipantProps) => React.ReactElement | null;
  controlRenderer?: (props: ControlsProps) => React.ReactElement | null;
  onLeave?: (room: Room) => void;
  adaptiveVideo?: Boolean;
}
