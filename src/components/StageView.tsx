import React, { ReactElement } from "react";
import { useMediaQuery } from "react-responsive";
import { AudioRenderer } from "./AudioRenderer";
import { DesktopStage } from "./desktop/DesktopStage";
import { MobileStage } from "./mobile/MobileStage";
import { StageProps } from "../typings/StageProps";
// import './styles.module.css';

export const StageView = ({ roomState, onLeave, adaptiveVideo }: StageProps) => {
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
