import { Room } from "livekit-client";
import React from "react";
import { useMediaQuery } from "react-responsive";
import { RoomState } from "../hooks/useRoom";
import { AudioRenderer } from "./AudioRenderer";
import { DesktopStage } from "./desktop/DesktopStage";
import { MobileStage } from "./mobile/MobileStage";

 const VideoView = ({
         roomState,
         onLeave,
         adaptiveVideo,
       }: {
         roomState: RoomState;
         onLeave?: (room: Room) => void;
         adaptiveVideo?: Boolean;
       }) => {
         const isMobile = useMediaQuery({ query: '(max-width: 800px)' });

         return (
           <React.Fragment>
             {isMobile ? (
               <MobileStage
                 roomState={roomState}
                 onLeave={onLeave}
                 adaptiveVideo={adaptiveVideo}
               />
             ) : (
               <DesktopStage
                 roomState={roomState}
                 onLeave={onLeave}
                 adaptiveVideo={adaptiveVideo}
               />
             )}
             {roomState.audioTracks.map(track => (
               <AudioRenderer key={track.sid} track={track} isLocal={false} />
             ))}
           </React.Fragment>
         );
       };
export default VideoView;