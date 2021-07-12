import {
  LocalParticipant,
  Participant,
  RemoteVideoTrack,
  Room,
} from "livekit-client";
import { VideoQuality } from "livekit-client/dist/proto/livekit_rtc";
import React, { ReactElement, useState } from "react";
import Toolbar from "../Toolbar";
import { ParticipantView } from "../ParticipantView";
import { ScreenShareView } from "../ScreenShareView";
import "./styles.module.css";
import { RoomState } from "../../hooks/useRoom";

export const DesktopStage = ({
         roomState,
         onLeave,
         adaptiveVideo,
       }: {
         roomState: RoomState;
         onLeave?: (room: Room) => void;
         adaptiveVideo?: Boolean;
       }) => {
         const { isConnecting, error, participants, room } = roomState;
         const [showOverlay, setShowOverlay] = useState(false);

         if (error || isConnecting || !room || participants.length === 0) {
           return (
             <div className="absolute top-0 left-1 w-full h-full flex justify-center items-center text-xl text-white">
               {error && error.message}
               {isConnecting && <span>⚡ Connecting...</span>}
               {!room && !isConnecting && <span>🚀 Preparing room...</span>}
               {participants.length === 0 && room && !isConnecting && (
                 <span>👋 Waiting for others to join...</span>
               )}
             </div>
           );
         }
         // find first participant with screen shared
         let screenTrack: RemoteVideoTrack | undefined;
         participants.forEach(p => {
           if (p instanceof LocalParticipant) {
             return;
           }
           p.videoTracks.forEach(track => {
             if (track.trackName === 'screen' && track.track) {
               screenTrack = track.track as RemoteVideoTrack;
             }
           });
         });

         let otherParticipants: Participant[];
         let mainView: ReactElement;
         if (screenTrack) {
           otherParticipants = participants;
           mainView = (
             <ScreenShareView track={screenTrack} height="100%" width="100%" />
           );
         } else {
           otherParticipants = participants.slice(1);
           mainView = (
             <ParticipantView
               key={participants[0].identity}
               participant={participants[0]}
               showOverlay={showOverlay}
               quality={VideoQuality.HIGH}
               onMouseEnter={() => setShowOverlay(true)}
               onMouseLeave={() => setShowOverlay(false)}
             />
           );
         }

         return (
           <div className="w-full h-full grid min-h-0 grid-container relative">
             {participants.length <= 1 && (
               <div className="absolute top-0 left-1 w-full h-full flex justify-center items-center z-10 text-xl text-white">
                 <span>👋 Waiting for others to join...</span>
               </div>
             )}

             <div className="grid grid-cols-12 gap-2 auto-rows-min z-20">
               <div className={'stageCenter'}>{mainView}</div>
               <div className={'sidebar'}>
                 {otherParticipants.map((participant, i) => {
                   let quality = VideoQuality.HIGH;
                   if (adaptiveVideo && i > 4) {
                     quality = VideoQuality.LOW;
                   }
                   return (
                     <ParticipantView
                       key={participant.identity}
                       participant={participant}
                       width="100%"
                       aspectWidth={16}
                       aspectHeight={9}
                       showOverlay={showOverlay}
                       quality={quality}
                       onMouseEnter={() => setShowOverlay(true)}
                       onMouseLeave={() => setShowOverlay(false)}
                       adaptiveVideo={adaptiveVideo}
                     />
                   );
                 })}
               </div>
             </div>
             <div className={'grid items-center justify-center mb-3 z-20'}>
               <Toolbar room={room} onLeave={onLeave} />
             </div>
           </div>
         );
       };
