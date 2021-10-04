import { createLocalTracks, DataPacket_Kind, LocalTrack, Participant, Room, RoomEvent } from "livekit-client";
import { isMobile } from "react-device-detect";
import { RoomData, RoomMetaData } from "../typings/interfaces";
import { applyBgFilterToTracks, initBgFilter } from "./bg_removal";

export async function initRoom(
         token: string,
         roomState: RoomData,
         meta: RoomMetaData,
         audioDeviceId: string,
         videoDeviceId: string,
         bgRemovalKey: string,
         setChatMessages: Function,
         setMemberCount: Function,
         setBgFilter: Function,
         bgRemovalEffect?: string,
         onJoinCall?: Function,
         onMemberJoin?: Function,
         onMemberLeave?: Function,
         handleReceiveArbData?: Function
       ): Promise<() => void> {
         if (token && token.length > 0 && token !== 'INVALID') {
           const room = await roomState.connectAll(
             'wss://infra.catalyst.chat',
             token,
             meta
           );
           if (!room) return () => {};
           if (onJoinCall) onJoinCall();
           if (onConnected)
             onConnected(
               room,
               meta,
               audioDeviceId,
               videoDeviceId,
               bgRemovalKey,
               setChatMessages,
               setMemberCount,
               setBgFilter,
               bgRemovalEffect,
               onMemberJoin,
               onMemberLeave,
               handleReceiveArbData
             );
           return () => {
             room.disconnect();
           };
         }
         return () => {};
       }

export async function onConnected(
         room: Room,
         meta: RoomMetaData,
         audioDeviceId: string,
         videoDeviceId: string,
         bgRemovalKey: string,
         setChatMessages: Function,
         setMemberCount: Function,
         setBgFilter: Function,
         bgRemovalEffect?: string,
         onMemberJoin?: Function,
         onMemberLeave?: Function,
         handleReceiveArbData?: Function
       ): Promise<void> {
         room.on(RoomEvent.ParticipantConnected, () => {
           setMemberCount(room.participants.size + 1);
           if (onMemberJoin) onMemberJoin();
         });
         room.on(RoomEvent.ParticipantDisconnected, () => {
           setMemberCount(room.participants.size + 1);
           if (onMemberLeave) onMemberLeave();
         });
         room.on(RoomEvent.DataReceived, (data: Uint8Array, member: Participant, kind: DataPacket_Kind) => {
               handleChatMessages(data, setChatMessages, room, handleReceiveArbData);
           }
         );
         setMemberCount(room.participants.size + 1);
         // console.log(room);
         if (meta.audioEnabled || meta.videoEnabled) {
           let localTracks = await createLocalTracks({
             audio: meta.audioEnabled
               ? audioDeviceId
                 ? { deviceId: audioDeviceId }
                 : true
               : false,
             video: meta.videoEnabled
               ? videoDeviceId
                 ? { deviceId: videoDeviceId }
                 : true
               : false,
           });
           // apply bg removal filters
           // console.log('bgRemovalKey', bgRemovalKey);
           if (
             bgRemovalEffect &&
             bgRemovalEffect !== 'none' &&
             bgRemovalKey.length > 0 &&
             !isMobile
           ) {
             const vidTrack = localTracks.find(track => track.kind === 'video');
             if (vidTrack) {
               const filter = await initBgFilter(
                 bgRemovalKey,
                 vidTrack,
                 bgRemovalEffect
               );
               if (filter) {
                 setBgFilter(filter);
                 localTracks = await applyBgFilterToTracks(localTracks, filter);
               }
             }
           }

           publishAllTracks(localTracks, room, meta.simulcast ?? true)
         }
};

export function handleChatMessages(
         data: Uint8Array,
         setChatMessages: Function,
         room: Room,
         handleReceiveArbData?: Function
       ): void {
         const decoder = new TextDecoder();
         const strData = decoder.decode(data);
         const parsedData = JSON.parse(strData);
         if (JSON.parse(strData)?.type === 'ctw-chat') {
           // console.log('received chat ', JSON.parse(strData).text);
           setChatMessages(chatMessages => [
             ...chatMessages,
             {
               text: parsedData.text,
               sender: room.participants?.get(parsedData.sender) ?? '',
             },
           ]);
         } else {
           if (handleReceiveArbData) handleReceiveArbData(data);
         }
       }
       
export function publishAllTracks(tracks: LocalTrack[], room: Room, simulcast: boolean): void {
    tracks.forEach(track => {
        room.localParticipant.publishTrack(track, simulcast ? {
        simulcast: true,
        } : {});
    });
};