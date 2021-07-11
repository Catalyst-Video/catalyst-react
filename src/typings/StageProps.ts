import { Room } from "livekit-client";
import { RoomState } from "../hooks/useRoom";

export interface StageProps {
  roomState: RoomState
  onLeave?: (room: Room) => void;
  adaptiveVideo?: Boolean;
}
