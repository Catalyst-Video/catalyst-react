import {
  LocalParticipant,
  Participant,
  RemoteVideoTrack,
  Room,
  RoomEvent,
  TrackPublication,
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

function merge(a1, a2) {
  const merged = Array(a1.length + a2.length);
  let index = 0,
    i1 = 0,
    i2 = 0;
  while (i1 < a1.length || i2 < a2.length) {
    if (a1[i1] && a2[i2]) {
      const item1 = a1[i1];
      const item2 = a2[i2].charCodeAt(0) - 96;
      merged[index++] = item1 < item2 ? a1[i1++] : a2[i2++];
    } else if (a1[i1]) merged[index++] = a1[i1++];
    else if (a2[i2]) merged[index++] = a2[i2++];
  }
  return merged;
}

const RoomWrapper = ({
  roomState,
  onLeave,
  theme,
  speakerMode,
  setSpeakerMode,
}: {
  roomState: RoomState;
  onLeave?: (room: Room) => void;
  theme: string;
  speakerMode: boolean;
  setSpeakerMode: Function
}) => {
  const { isConnecting, error, participants: members, room } = roomState;
  const [showOverlay, setShowOverlay] = useState(false);
  const [screens, setSharedScreens] = useState<RemoteVideoTrack[]>([]);
  const [mainVid, setMainVid] = useState<Participant | RemoteVideoTrack>(members[0]);
  const [otherVids, setOtherVids] =
    useState<Array<RemoteVideoTrack | Participant>>(members.slice(1).map(m => m));
  const vidRef = useRef<HTMLDivElement>(null);
  const [vidDims, setVidDims] = useState({
    width: '0px',
    height: '0px',
    // margin: '2px',
  });

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
      let l = (members.length < 1 ? 1 : members.length) + screens.length;
      // TODO:   let l = 4 + screens.length;
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
      // margin: margin + 'px',
    });
  };

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

  const reconfigureSpeakerView = (v: Participant | RemoteVideoTrack, stopSwap?: boolean) => {
    setMainVid(v);
    let newOtherVids: Array<RemoteVideoTrack | Participant> = merge(
      screens.filter(p => p !== v),
      members.filter(p => p !== v)
    );
    setOtherVids(newOtherVids);
    if (!speakerMode || !stopSwap) setSpeakerMode(sm => !sm);
   }

   const debouncedResize = debounce(resizeWrapper, 15);

   useEffect(() => {
     window.addEventListener(
       'load',
       () => {
         resizeWrapper();
         window.onresize = debouncedResize;
       },
       false
     );
   }, []);

   useEffect(() => {
     resizeWrapper();
   }, [members, screens]);
  
  useEffect(() => {
    if (screens.length > 0)
     reconfigureSpeakerView(screens[screens.length - 1], true);
  }, [screens])

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

   let screenTrack: RemoteVideoTrack;
   members.forEach(m => {
     //  TODO: don't show local screen share if (p instanceof LocalParticipant) {
     //    return;
     //  }
     m.videoTracks.forEach(track => {
       if (track.trackName === 'screen' && track.track) {
         screenTrack = track.track as RemoteVideoTrack;
        //  console.log(screenTrack);
         if (!screens.includes(screenTrack)) {
           setSharedScreens([...screens, screenTrack]);
          //  reconfigureSpeakerView(screenTrack, true)
         }
       }
     });
   });

   return (
     <>
       {/* grid min-h-0 grid-container */}
       {/* TODO: {members.length <= 1 && (
         <div className="absolute not-selectable top-0 left-1 w-full h-full flex justify-center items-center z-0 text-xl text-white">
           <span>👋 Waiting for others to join...</span>
         </div>
       )} */}
       {/* {!speakerMode && (
         <div
           id="remote-vid-wrapper"
           ref={vidRef}
           className={`flex justify-center content-center items-center flex-wrap align-middle z-2 w-full h-full max-h-screen max-w-screen box-border`}
         >
           {screens &&
             screens.map((s, i) => {
               return (
                 <ScreenShareView
                   track={s}
                   height={vidDims.height}
                   width={vidDims.width}
                   key={`${i}-screen`}
                   onClick={() => reconfigureSpeakerView(s)}
                 />
               );
             })}
           {members.map((m, i) => {
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
                 onClick={() => reconfigureSpeakerView(m)}
               />
             );
           })}
         </div>
       )} */}
       {!speakerMode && (
         <div className="flex flex-col sm:flex-row z-20 py-10 px-1 w-full lg:px-10 xl:px-20 justify-around">
           <div className="flex flex-col w-full p-1 justify-center content-center sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg">
             {screens &&
               screens.map((s, i) => {
                 return (
                   <ScreenShareView
                     track={s}
                     height={'100%'}
                     width={'100%'}
                     classes={'aspect-w-16 aspect-h-9'}
                     key={`${i}-screen`}
                     onClick={() => reconfigureSpeakerView(s)}
                   />
                 );
               })}
             {members.map((m, i) => {
               return (
                 <MemberView
                   key={m.identity}
                   member={m}
                   height={'100%'}
                   width={'100%'}
                   classes={'aspect-w-16 aspect-h-9'}
                   showOverlay={showOverlay}
                   quality={i > 4 ? VideoQuality.LOW : VideoQuality.HIGH}
                   onMouseEnter={() => setShowOverlay(true)}
                   onMouseLeave={() => setShowOverlay(false)}
                   theme={theme}
                   onClick={() => reconfigureSpeakerView(m)}
                 />
               );
             })}
           </div>
         </div>
       )}
       {speakerMode && mainVid && (
         <div className="flex flex-col sm:flex-row z-20 py-10 px-1 w-full lg:px-10 xl:px-20 justify-around">
           <div className="flex flex-col sm:w-4/5 p-1 justify-center content-center">
             {'identity' in mainVid ? (
               <MemberView
                 key={mainVid.identity}
                 member={mainVid}
                 height={'100%'}
                 width={'100%'}
                 classes={'aspect-w-16 aspect-h-9'}
                 showOverlay={showOverlay}
                 quality={VideoQuality.HIGH}
                 onMouseEnter={() => setShowOverlay(true)}
                 onMouseLeave={() => setShowOverlay(false)}
                 theme={theme}
                 onClick={() => setSpeakerMode(sm => !sm)}
               />
             ) : (
               <ScreenShareView
                 track={mainVid}
                 height={'100%'}
                 width={'100%'}
                 classes={'aspect-w-16 aspect-h-9'}
                 key={`main-screen`}
                 onClick={() => setSpeakerMode(sm => !sm)}
               />
             )}
           </div>
           <div
             className={
               'flex flex-row sm:flex-col sm:w-1/5 p-1 justify-center content-center no-scrollbar'
             }
           >
             {otherVids.map((m, i) => {
               let quality = VideoQuality.HIGH;
               if (i > 4) {
                 quality = VideoQuality.LOW;
               }
               if ('identity' in m) {
                 return (
                   <MemberView
                     key={m.identity}
                     member={m}
                     height={'100%'}
                     width={'100%'}
                     classes={
                       'ml-1 mr-1 sm:mt-1 sm:mb-1 aspect-w-16 aspect-h-9'
                     }
                     showOverlay={showOverlay}
                     quality={quality}
                     onMouseEnter={() => setShowOverlay(true)}
                     onMouseLeave={() => setShowOverlay(false)}
                     theme={theme}
                     onClick={() => reconfigureSpeakerView(m, true)}
                   />
                 );
               } else {
                 return (
                   <ScreenShareView
                     track={m}
                     height={'100%'}
                     width={'100%'}
                     classes={
                       'ml-1 mr-1 sm:mt-1 sm:mb-1 aspect-w-16 aspect-h-9'
                     }
                     key={`${m.sid}-screen`}
                     onClick={() => reconfigureSpeakerView(m, true)}
                   />
                 );
               }
             })}
           </div>
         </div>
       )}
     </>
   );
 };
export default RoomWrapper