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
import MemberView from "./MemberView";
import ScreenShareWrapper from "./wrapper/ScreenShareView";
import { RoomState } from "../hooks/useRoom";
import { debounce } from 'ts-debounce';
import Chat from "./Chat";
import { ChatMessage } from "../typings/interfaces";
import { useFullScreenHandle } from "react-full-screen";

const RoomWrapper = ({
  roomState,
  onLeave,
  speakerMode,
  setSpeakerMode,
  chatOpen,
  disableChat,
  chatMessages,
  setChatMessages,
}: {
  roomState: RoomState;
  onLeave?: (room: Room) => void;
  speakerMode: boolean;
  setSpeakerMode: Function;
  chatOpen: boolean;
  disableChat?: boolean;
  chatMessages: ChatMessage[];
  setChatMessages: Function;
}) => {
  const {
    isConnecting,
    error,
    localParticipant,
    participants: members,
    room,
  } = roomState;
  const [showOverlay, setShowOverlay] = useState(false);
  // const [screens, setNumScreens] = useState<number>(0);
  const [screens, setNumScreens] = useState<number>(0);
  const [mainVid, setMainVid] = useState<string>();
  const vidRef = useRef<HTMLDivElement>(null);
  const [vidDims, setVidDims] = useState({
    width: '0px',
    height: '0px',
  });
  const fsHandle = useFullScreenHandle();

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
  }, []);

  useEffect(() => {
    if (!mainVid) setMainVid(members[0]?.sid);
    resizeWrapper();
  }, [members, screens, chatOpen, fsHandle.active, speakerMode]);

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
    //  TODO: don't show local screen share if (p instanceof LocalParticipant) {
    //    return;
    //  }
    m.videoTracks.forEach(track => {
      if (track.trackName === 'screen' && track.track) {
        screenTrack = track.track as RemoteVideoTrack;
        //  console.log(screenTrack);
        if (!sharedScreens.includes(screenTrack)) {
          // screenTrack.addListener('')
          sharedScreens = [...sharedScreens, screenTrack];
          if (mainVid !== screenTrack.sid && sharedScreens.length != screens) {
            setMainVid(screenTrack.sid);
            // setSpeakerMode(true);
          }
        }
      }
    });
  });
  if (sharedScreens.length != screens) {
    setNumScreens(sharedScreens.length);
    if (!members.find(m => m.sid === mainVid) && !sharedScreens.find(s => s.sid === mainVid)) {
      setMainVid(members[0].sid);
    }
  }

  // var mainTrack = members.find(m => m.sid === mainVid) ?? sharedScreens.find(s => s.sid === mainVid) ?? members[0].getTracks()[0];

  return (
    <>
      {!speakerMode && (
        <div
          id="remote-vid-wrapper"
          ref={vidRef}
          className={`flex justify-center content-center items-center flex-wrap align-middle z-2 w-full h-full max-h-screen max-w-screen box-border ${
            chatOpen ? 'sm:animate-fade-in-right' : 'sm:animate-fade-in-left'
          }`}
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
                    setMainVid(s.sid);
                    setSpeakerMode(sm => !sm);
                  }}
                />
              );
            })}
          {members.map((m, i) => {
            return (
              <MemberView
                key={m.identity}
                participant={m}
                height={vidDims.height}
                width={vidDims.width}
                showOverlay={showOverlay}
                quality={i > 4 ? VideoQuality.LOW : VideoQuality.HIGH}
                onMouseEnter={() => setShowOverlay(true)}
                onMouseLeave={() => setShowOverlay(false)}
                onClick={() => {
                  setMainVid(m.sid);
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
        <div
          className={`flex flex-col sm:flex-row z-20 py-10 px-1 w-full lg:px-10 xl:px-20 justify-center sm:justify-around  ${
            chatOpen ? 'sm:animate-fade-in-right' : 'sm:animate-fade-in-left'
          }`}
        >
          <div className="flex flex-col sm:w-4/5 p-1 justify-center content-center">
            {members.map((m, i) => {
              if (m.sid === mainVid) {
                return (
                  <MemberView
                    key={m.identity ?? 'first-vid'}
                    participant={m ?? members[0]}
                    height={'100%'}
                    width={'100%'}
                    classes={'aspect-w-16 aspect-h-9'}
                    showOverlay={showOverlay}
                    quality={VideoQuality.HIGH}
                    onMouseEnter={() => setShowOverlay(true)}
                    onMouseLeave={() => setShowOverlay(false)}
                    onClick={() => setSpeakerMode(sm => !sm)}
                  />
                );
              } else return null;
            })}
            {sharedScreens.map(s => {
              if (s.sid === mainVid) {
                return (
                  <ScreenShareWrapper
                    track={s}
                    height={'100%'}
                    width={'100%'}
                    classes={'aspect-w-16 aspect-h-9'}
                    key={`main-screen`}
                    onClick={() => setSpeakerMode(sm => !sm)}
                  />
                );
              } else return null;
            })}
          </div>
          <div
            className={
              'flex flex-row sm:flex-col w-full h-1/4 sm:h-full sm:w-1/5 p-1 justify-center content-center no-scrollbar overflow-x-auto sm:overflow-y-auto top-0 left-0'
            }
            onClick={() => setSpeakerMode(sm => !sm)}
          >
            {members.length === 1 && (
              <>
                <div
                  className={`box ml-1 mr-1 w-full sm:w-auto sm:mt-1 sm:mb-1 sm:ml-0 sm:mr-0 aspect-w-16 aspect-h-9 bg-gray-800 rounded-xl`}
                >
                  <div className="absolute not-selectable top-0 left-1 w-full h-full flex justify-center items-center z-0 text-sm md:text-md xl:text-lg text-white text-center px-1 sm:px-2 md:px-3 ">
                    <span>👋 Waiting for others to join...</span>
                  </div>
                </div>
              </>
            )}
            {sharedScreens &&
              sharedScreens.map((s, i) => {
                if (s.sid !== mainVid)
                  return (
                    <ScreenShareWrapper
                      track={s}
                      height={'fit-content'}
                      width={'100%'}
                      classes={
                        'box ml-1 mr-1  w-full sm:w-auto h-auto sm:mt-1 sm:mb-1 sm:ml-0 sm:mr-0 aspect-w-16 aspect-h-9'
                      }
                      key={`sidebar-screen-${i}`}
                      onClick={() => {
                        setMainVid(s.sid);
                        setSpeakerMode(sm => !sm);
                      }}
                    />
                  );
                else return null;
              })}
            {members.map((m, i) => {
              if (m.sid !== mainVid)
                return (
                  <MemberView
                    key={m.identity}
                    participant={m}
                    height={'fit-content'}
                    width={'100%'}
                    classes={
                      'box ml-1 mr-1 w-full sm:w-auto h-auto sm:mt-1 sm:mb-1 sm:ml-0 sm:mr-0 aspect-w-16 aspect-h-9'
                    }
                    showOverlay={showOverlay}
                    quality={i > 4 ? VideoQuality.LOW : VideoQuality.HIGH}
                    onMouseEnter={() => setShowOverlay(true)}
                    onMouseLeave={() => setShowOverlay(false)}
                    onClick={() => {
                      setMainVid(m.sid);
                      setSpeakerMode(sm => !sm);
                    }}
                  />
                );
              else return null;
            })}
          </div>
        </div>
      )}
      {!disableChat && (
        <Chat
          chatOpen={chatOpen}
          localParticipant={localParticipant}
          chatMessages={chatMessages}
          setChatMessages={setChatMessages}
        />
      )}
    </>
  );
};
export default RoomWrapper