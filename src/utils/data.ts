import { DataPacket_Kind, LocalParticipant } from "livekit-client";

export function sendArbitraryData(
  arbData: Uint8Array,
  sender: LocalParticipant
): void {
    sender.publishData(arbData, DataPacket_Kind.RELIABLE);
}