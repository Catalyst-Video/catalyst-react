import { faDesktop } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Property } from "csstype";
import { Track } from "livekit-client";
import React from "react";
import VidWrapper from "./VidWrapper";


 const ScreenShareWrapper = ({
         track,
         width,
         height,
         classes,
         onClick,
}: {
  track: Track;
  width?: Property.Width;
  height?: Property.Height;
  classes?: string
  onClick?: () => void;
}) => {
         return (
           <div className={classes} onClick={onClick}>
             <div
               className="relative z-0 inline-block align-middle self-center overflow-hidden text-center bg-gray-800 rounded-lg m-1"
               style={{
                 height: height,
                 width: width,
               }}
             >
               <VidWrapper track={track} isLocal={false} />
               <div className="absolute bottom-0 left-0 flex text-white justify-end p-2 w-full">
                 <div className="relative h-7 w-7 md:h-8 md:w-8 flex items-center justify-center p-1">
                   <span className="absolute rounded-full top-0 left-0 opacity-50 bg-secondary  w-full h-full"></span>
                   <FontAwesomeIcon
                     icon={faDesktop}
                     size="2x"
                     className={`text-white not-selectable p-2 z-30`}
                   />
                 </div>
               </div>
             </div>
           </div>
     );
       };
       
export default ScreenShareWrapper;