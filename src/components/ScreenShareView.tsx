import { faDesktop } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Property } from "csstype";
import { Track } from "livekit-client";
import React from "react";
import VideoWrapper from "./VideoWrapper";

interface ScreenShareProps {
  track: Track;
  width?: Property.Width;
  height?: Property.Height;
  classes?: string
  onClick?: () => void;
}

export const ScreenShareView = ({
         track,
         width,
         height,
         classes,
         onClick,
}: ScreenShareProps) => {

         return (
           <div className={classes} onClick={onClick}>
             <div
               className="relative z-0 inline-block align-middle self-center overflow-hidden text-center bg-gray-800 rounded-lg m-1"
               style={{
                 height: height,
                 width: width,
               }}
             >
               <VideoWrapper track={track} isLocal={false} />
               <div className="absolute bottom-0 left-0 flex text-white justify-between p-2 w-full">
                 <div className="text-white text-sm not-selectable flex items-center justify-center bg-gray-700 bg-opacity-40 px-2 py-1 rounded-xl">
                   {'Sharing'}
                 </div>
                 <div>
                   <FontAwesomeIcon
                     icon={faDesktop}
                     size="2x"
                     className={`text-white not-selectable bg-gray-700 h-10 w-10 bg-opacity-40 p-2 rounded-full`}
                   />
                 </div>
               </div>
             </div>
           </div>
         );
       };
