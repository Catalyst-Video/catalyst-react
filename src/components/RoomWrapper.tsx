import {
  LocalMember,
  Member,
  RemoteVideoTrack,
  Room,
  RoomEvent,
  TrackPublication,
} from "catalyst-client";
import { VideoQuality } from "catalyst-client/dist/proto/livekit_rtc";
import React, { ReactElement, Ref, useEffect, useRef, useState } from "react";
import MemberView from "./MemberView";
import ScreenShareWrapper from "./wrapper/ScreenShareView";
import { RoomState } from "../hooks/useRoom";
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
  speakerMode,
  setSpeakerMode,
}: {
  roomState: RoomState;
  onLeave?: (room: Room) => void;
  speakerMode: boolean;
  setSpeakerMode: Function
}) => {
  const { isConnecting, error, members: members, room } = roomState;
  const [showOverlay, setShowOverlay] = useState(false);
  const [screens, setNumScreens] = useState<number>(0);
  const [mainVid, setMainVid] = useState<Member | RemoteVideoTrack>();
  const vidRef = useRef<HTMLDivElement>(null);
  const [vidDims, setVidDims] = useState({
    width: '0px',
    height: '0px',
  });

  const resizeWrapper = () => {
    let margin = 2;
    let width = 0;
    let height = 0;
    if (vidRef.current) {
      width = vidRef.current.offsetWidth - margin * 2;
      height = vidRef.current.offsetHeight - margin * 2;
    }
    // console.log(width, height)
    let max = 0;
    //  TODO: loop needs to be optimized
    let i = 1;
    let l =
      (members.length < 1 ? 1 : members.length) +
      screens +
      (members.length < 2 ? 1 : 0);
      // console.log(l)
    while (i < 5000) {
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

  // const reconfigureSpeakerView = (v: Member | RemoteVideoTrack, stopSwap?: boolean) => {
  //   setMainVid(v);
  //   if (!speakerMode || !stopSwap) setSpeakerMode(sm => !sm);
  //  }

  // useEffect(() => {
  //     if (members.findIndex(m => m === mainVid) < 1) {
  //     //   setSpeakerMode(true);
  //     // } else {
  //       setSpeakerMode(sm => !sm);
  //     }
  //  }, [mainVid]);

   const debouncedResize = debounce(resizeWrapper, 15);

   useEffect(() => {
     window.addEventListener(
       'load',
       () => {
         resizeWrapper();
        //  window.onresize = debouncedResize;
        window.onresize = resizeWrapper;
       },
       false
     );
     setMainVid(members[0]);
   }, []);

   useEffect(() => {
     resizeWrapper();
   }, [members, screens]);

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
  var sharedScreens = [] as Array<RemoteVideoTrack>;
   members.forEach(m => {
     //  TODO: don't show local screen share if (p instanceof LocalMember) {
     //    return;
     //  }
     m.videoTracks.forEach(track => {
       if (track.trackName === 'screen' && track.track) {
         screenTrack = track.track as RemoteVideoTrack;
        //  console.log(screenTrack);
         if (!sharedScreens.includes(screenTrack)) {
           sharedScreens = [...sharedScreens, screenTrack];
           if (mainVid !== screenTrack && sharedScreens.length != screens) {
             setMainVid(screenTrack);
            //  setSpeakerMode(true);
           }
         }
       }
     });
   });
  if (sharedScreens.length != screens) {
     setNumScreens(sharedScreens.length);
  }
  

   return (
     <>
       {!speakerMode && (
         <div
           id="remote-vid-wrapper"
           ref={vidRef}
           className={`flex justify-center content-center items-center flex-wrap align-middle z-2 w-full h-full max-h-screen max-w-screen box-border animate-fade-in-left`}
         >
           {sharedScreens &&
             sharedScreens.map((s, i) => {
               return (
                 <ScreenShareWrapper
                   track={s}
                   height={vidDims.height}
                   width={vidDims.width}
                   key={`${i}-screen`}
                   onClick={() => {
                     setMainVid(s);
                     setSpeakerMode(sm => !sm);
                   }}
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
                 onClick={() => {
                   setMainVid(m);
                   setSpeakerMode(sm => !sm);
                 }}
               />
             );
           })}
           {members.length === 1 && (
             <div
               className={`relative z-0 inline-block align-middle self-center overflow-hidden text-center m-1 bg-gray-800 rounded-xl`}
               style={{
                 height: vidDims.height,
                 width: vidDims.width,
               }}
               onClick={() => setSpeakerMode(sm => !sm)}
             >
               <div className="absolute not-selectable top-0 left-1 w-full h-full flex justify-center items-center z-0 text-xl text-white">
                 <span>👋 Waiting for others to join...</span>
               </div>
             </div>
           )}
         </div>
       )}
       {speakerMode && (
         <div className="flex flex-col sm:flex-row z-20 py-10 px-1 w-full lg:px-10 xl:px-20 justify-center sm:justify-around animate-fade-in-left">
           <div className="flex flex-col sm:w-4/5 p-1 justify-center content-center">
             {!mainVid || 'identity' in mainVid ? (
               <MemberView
                 key={mainVid?.identity ?? 'first-vid'}
                 member={mainVid ?? members[0]}
                 height={'100%'}
                 width={'100%'}
                 classes={'aspect-w-16 aspect-h-9'}
                 showOverlay={showOverlay}
                 quality={VideoQuality.HIGH}
                 onMouseEnter={() => setShowOverlay(true)}
                 onMouseLeave={() => setShowOverlay(false)}
                 onClick={() => setSpeakerMode(sm => !sm)}
               />
             ) : (
               <ScreenShareWrapper
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
             onClick={() => setSpeakerMode(sm => !sm)}
           >
             {members.length === 1 && (
               <>
                 {/*TODO: fix mobile sizing <div
                 className={`ml-1 mr-1 w-full sm:w-auto sm:mt-1 sm:mb-1 sm:ml-0 sm:mr-0 aspect-w-16 aspect-h-9 bg-gray-800 rounded-xl`}
               >
                 <div className="absolute not-selectable top-0 left-1 w-full h-full flex justify-center items-center z-0 text-sm md:text-md xl:text-lg text-white text-center px-1 sm:px-2 md:px-3 ">
                   <span>👋 Waiting for others to join...</span>
                 </div>
                 </div> */}
                 <div
                   className={`ml-1 mr-1 w-full sm:w-auto sm:mt-1 sm:mb-1 sm:ml-0 sm:mr-0 aspect-w-16 aspect-h-9 bg-gray-800 rounded-xl`}
                 >
                   <div className="absolute not-selectable top-0 left-1 w-full h-full flex justify-center items-center z-0 text-sm md:text-md xl:text-lg text-white text-center px-1 sm:px-2 md:px-3 ">
                     <span>👋 Waiting for others to join...</span>
                   </div>
                 </div>
               </>
             )}
             {sharedScreens &&
               sharedScreens.map((s, i) => {
                 if (s !== mainVid)
                   return (
                     <ScreenShareWrapper
                       track={s}
                       height={'100%'}
                       width={'100%'}
                       classes={
                         'ml-1 mr-1 sm:mt-1 sm:mb-1 sm:ml-0 sm:mr-0 aspect-w-16 aspect-h-9'
                       }
                       key={`sidebar-screen-${i}`}
                       onClick={() => {
                         setMainVid(s);
                         setSpeakerMode(sm => !sm);
                       }}
                     />
                   );
                 else return null;
               })}
             {members.map((m, i) => {
               if (m !== mainVid)
                 return (
                   <MemberView
                     key={m.identity}
                     member={m}
                     height={'100%'}
                     width={'100%'}
                     classes={
                       'ml-1 mr-1 sm:mt-1 sm:mb-1 sm:ml-0 sm:mr-0 aspect-w-16 aspect-h-9'
                     }
                     showOverlay={showOverlay}
                     quality={i > 4 ? VideoQuality.LOW : VideoQuality.HIGH}
                     onMouseEnter={() => setShowOverlay(true)}
                     onMouseLeave={() => setShowOverlay(false)}
                     onClick={() => {
                       setMainVid(m);
                       setSpeakerMode(sm => !sm);
                     }}
                   />
                 );
               else return null;
             })}
           </div>
         </div>
       )}
     </>
   );
 };
export default RoomWrapper