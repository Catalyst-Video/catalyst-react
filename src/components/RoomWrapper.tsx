import {
  LocalParticipant,
  Participant,
  RemoteVideoTrack,
  Room,
} from "livekit-client";
import { VideoQuality } from "livekit-client/dist/proto/livekit_rtc";
import React, { ReactElement, Ref, useEffect, useRef, useState } from "react";
import Toolbar from "./Toolbar";
import MemberView from "./MemberView";
import { ScreenShareView } from "./ScreenShareView";
import "./styles.module.css";
import { RoomState } from "../hooks/useRoom";
import { AudioRenderer } from "./AudioRenderer";
import { debounce } from 'ts-debounce';

 const RoomWrapper = ({
   roomState,
   onLeave,
   theme,
 }: {
   roomState: RoomState;
   onLeave?: (room: Room) => void;
   theme: string;
 }) => {
   const { isConnecting, error, participants: members, room } = roomState;
   const [showOverlay, setShowOverlay] = useState(false);
   const [gridView, setGridView] = useState(true);
   const [screens, setSharedScreens] = useState <RemoteVideoTrack[]>([]);
   const vidRef = useRef<HTMLDivElement>(null);
   const [vidDims, setVidDims] = useState({
     width: '0px',
     height: '0px',
     margin: '2px',
   });

   useEffect(() => {
     window.addEventListener(
       'load',
       () => {
         resizeWrapper();
         window.onresize = debounce(resizeWrapper, 15);
       },
       false
     );
   }, []);

   useEffect(() => {
     resizeWrapper();
   }, [members, screens]);

   const area = (
     increment: number,
     count: number,
     width: number,
     height: number,
     margin: number = 10
   ) => {
     let i = 0;
     let w = 0;
     let h = increment * 0.75 + margin * 2;
     while (i < count) {
       if (w + increment > width) {
         w = 0;
         h = h + increment * 0.75 + margin * 2;
       }
       w = w + increment + margin * 2;
       i++;
     }
     if (h > height) return false;
     else return increment;
   };

   const resizeWrapper = () => {
     let margin = 2;
     let width = 0;
     let height = 0;
     if (vidRef.current) {
       width = vidRef.current.offsetWidth - margin * 2;
       height = vidRef.current.offsetHeight - margin * 2;
     }
    //  console.log('res', width, height);
     let max = 0;
     //  TODO: loop needs to be optimized
     let i = 1;
     while (i < 5000) {
      //  TODO: let l = (members.length < 1 ? 1 : members.length) + screens.length;
       let l = 4 + screens.length;
       let w = area(i, l, width, height, margin);
       if (w === false) {
         max = i - 1;
         break;
       }
       i++;
     }
     max = max - margin * 2;
     setVidDims({
       width: max + 'px',
       height: max * 0.5625 + 'px', // 0.5625 enforce 16:9 (vs 0.75 for 4:3)
       margin: margin + 'px',
     });
   };

   if (error || isConnecting || !room || members.length === 0) {
     return (
       <div className="absolute not-selectable top-0 left-1 w-full h-full flex justify-center items-center text-xl text-white">
         {error && <span>⚠️ {error.message}</span>}
         {isConnecting && <span>⚡ Connecting...</span>}
         {!room && !isConnecting && !error && <span>🚀 Preparing room...</span>}
         {members.length === 0 && room && !isConnecting && (
           <span>👋 Waiting for others to join...</span>
         )}
       </div>
     );
   }
   // find first participant with screen shared
   let screenTrack: RemoteVideoTrack | undefined;
   members.forEach(p => {
    //  TODO: don't show local screen share if (p instanceof LocalParticipant) {
    //    return;
    //  }
     
     p.videoTracks.forEach(track => {
       if (track.trackName === 'screen' && track.track) {
         screenTrack = track.track as RemoteVideoTrack;
         if (!screens.includes(screenTrack)) {
           setSharedScreens([...screens, screenTrack]);
         }
       }
     });
   });

   let otherParticipants: Participant[];
   let mainView: ReactElement;
   if (screenTrack) {
     otherParticipants = members;
     mainView = (
       <ScreenShareView track={screenTrack} height="100%" width="100%" />
     );
   } else {
     otherParticipants = members.slice(1);
     mainView = (
       <MemberView
         key={members[0].identity}
         member={members[0]}
         showOverlay={showOverlay}
         aspectWidth={16}
         height={vidDims.height}
         width={vidDims.width}
         aspectHeight={9}
         theme={theme}
         quality={VideoQuality.HIGH}
         onMouseEnter={() => setShowOverlay(true)}
         onMouseLeave={() => setShowOverlay(false)}
       />
     );
   }

   return (
     <>
       {/* grid min-h-0 grid-container */}
       {members.length <= 1 && (
         <div className="absolute not-selectable top-0 left-1 w-full h-full flex justify-center items-center z-0 text-xl text-white">
           <span>👋 Waiting for others to join...</span>
         </div>
       )}
       <div
         id="remote-vid-wrapper"
         ref={vidRef}
         className={`flex justify-center content-center items-center flex-wrap align-middle z-2 w-full h-full max-h-screen max-w-screen box-border`}
       >
         {members.map((m, i) => {
           m.videoTracks.forEach(track => {
             if (track.trackName === 'screen' && track.track) {
               screenTrack = track.track as RemoteVideoTrack;
               console.log(screenTrack);
              return (
                <ScreenShareView
                  track={screenTrack}
                  height={vidDims.height}
                  width={vidDims.width}
                  key={`${i}-screen`}
                />
              );
             } else return null
           });
         })}
         {/* {screens &&
           screens.map((s, i) => {
             return (
               <ScreenShareView
                 track={s}
                 height={vidDims.height}
                 width={vidDims.width}
                 key={`${i}-screen`}
               />
             );
           })} */}
         {gridView &&
           [0,1,2,3].map((m, i) => {
             return (
               <MemberView
                 key={members[0].identity}
                 member={members[0]}
                 height={vidDims.height}
                 width={vidDims.width}
                 showOverlay={showOverlay}
                 quality={i > 4 ? VideoQuality.LOW : VideoQuality.HIGH}
                 onMouseEnter={() => setShowOverlay(true)}
                 onMouseLeave={() => setShowOverlay(false)}
                 theme={theme}
               />
             );
           })}
         {/* {gridView &&
           members.map((m, i) => {
             return (
               <MemberView
                 key={m.identity}
                 member={m}
                 height={vidDims.height}
                 width={vidDims.width}
                 showOverlay={showOverlay}
                 quality={i > 4 ? VideoQuality.LOW : VideoQuality.HIGH}
                 onMouseEnter={() => setShowOverlay(true)}
                 onMouseLeave={() => setShowOverlay(false)}
                 theme={theme}
               />
             );
           })} */}
       </div>
       {!gridView && (
         <div className="grid grid-cols-12 gap-2 z-20 overflow-hidden py-10 px-1">
           {/* auto-rows-min */}
           <div className="col-start-1 col-end-11">{mainView}</div>
           <div className={'sidebar overflow-auto'}>
             {[0, 1, 2, 3].map((participant, i) => {
               let quality = VideoQuality.HIGH;
               if (i > 4) {
                 quality = VideoQuality.LOW;
               }
               return (
                 <MemberView
                   key={members[0].identity}
                   member={members[0]}
                   aspectWidth={16}
                   aspectHeight={9}
                   height={vidDims.height}
                   width={vidDims.width}
                   showOverlay={showOverlay}
                   quality={quality}
                   onMouseEnter={() => setShowOverlay(true)}
                   onMouseLeave={() => setShowOverlay(false)}
                   theme={theme}
                 />
               );
             })}
             {otherParticipants.map((participant, i) => {
               let quality = VideoQuality.HIGH;
               if (i > 4) {
                 quality = VideoQuality.LOW;
               }
               return (
                 <MemberView
                   key={participant.identity}
                   member={participant}
                   aspectWidth={16}
                   height={vidDims.height}
                   width={vidDims.width}
                   aspectHeight={9}
                   showOverlay={showOverlay}
                   quality={quality}
                   theme={theme}
                   onMouseEnter={() => setShowOverlay(true)}
                   onMouseLeave={() => setShowOverlay(false)}
                 />
               );
             })}
           </div>
         </div>
       )}
     </>
   );
 };
export default RoomWrapper