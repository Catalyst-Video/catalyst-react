/*  Catalyst Scientific Video Chat Component File
Copyright (C) 2021 Catalyst Scientific LLC, Seth Goldin & Joseph Semrai

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version. 

While this code is open-source, you may not use your own version of this
program commerically for free (whether as a business or attempting to sell a variation
of Catalyst for a profit). If you are interested in using Catalyst in an 
enterprise setting, please either visit our website at https://catalyst.chat 
or contact us for more information.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

You can contact us for more details at support@catalyst.chat. */

import {
  RemoteVideoTrack,
  Room,
} from 'livekit-client';
import { VideoQuality } from 'livekit-client/dist/proto/livekit_rtc';
import React, { useEffect, useRef, useState } from 'react';
import MemberView from './MemberView';
import ScreenShareWrapper from './wrapper/ScreenShareView';
import { RoomState } from '../hooks/useRoom';
import { debounce } from 'ts-debounce';
import Chat from './Chat';
import { ChatMessage } from '../typings/interfaces';
import { useFullScreenHandle } from 'react-full-screen';

const RoomWrapper = ({
  roomState,
  onLeave,
  speakerMode,
  setSpeakerMode,
  chatOpen,
  setChatOpen,
  disableChat,
  chatMessages,
  setChatMessages,
  cstmWelcomeMsg,
}: {
  roomState: RoomState;
  onLeave?: (room: Room) => void;
  speakerMode: boolean;
  setSpeakerMode: Function;
  chatOpen: boolean;
  disableChat?: boolean;
  setChatOpen: Function;
  chatMessages: ChatMessage[];
  setChatMessages: Function;
  cstmWelcomeMsg?: string | HTMLElement;
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
    let margin = 4;
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

  // TODO: const debouncedResize = debounce(resizeWrapper, 15);

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
      <div className="absolute not-selectable top-0 left-1 w-full h-full flex justify-center items-center text-xl text-quinary ">
        {error && <span>⚠️ {error.message}</span>}
        {isConnecting && <span>⚡ Connecting...</span>}
        {!room && !isConnecting && !error && <span>🚀 Preparing room...</span>}
        {members.length === 0 && room && !isConnecting && (
          <span>{cstmWelcomeMsg ?? "👋 Waiting for others to join..."}</span>
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
    if (
      !members.find(m => m.sid === mainVid) &&
      !sharedScreens.find(s => s.sid === mainVid)
    ) {
      setMainVid(members[0].sid);
    }
  }
  return (
    <>
      {!speakerMode && (
        <div
          id="remote-vid-wrapper"
          ref={vidRef}
          className={`flex justify-center content-center items-center flex-wrap align-middle z-2 w-full h-full max-h-screen max-w-screen box-border`}
          // ${
          //   chatOpen ? 'sm:animate-fade-in-right' : 'sm:animate-fade-in-left'
          // }`}
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
                member={m}
                height={vidDims.height}
                width={vidDims.width}
                showOverlay={showOverlay}
                quality={i > 4 ? VideoQuality.LOW : VideoQuality.HIGH}
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
              <div className="absolute not-selectable top-0 left-1 w-full h-full flex justify-center items-center z-0 text-c text-quinary ">
                <span>
                  {cstmWelcomeMsg ?? '👋 Waiting for others to join...'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
      {speakerMode && (
        <div
          className={`speaker-view flex z-20 w-full justify-center sm:justify-around  `}
          // ${
          //   chatOpen ? 'sm:animate-fade-in-right' : 'sm:animate-fade-in-left' // lg:px-10 xl:px-20
          // }`}
        >
          <div className="speaker-vid flex flex-col p-1 justify-center content-center">
            {members.map((m, i) => {
              if (m.sid === mainVid) {
                return (
                  <MemberView
                    key={m.identity ?? 'first-vid'}
                    member={m ?? members[0]}
                    height={'100%'}
                    width={'100%'}
                    classes={'aspect-w-16 aspect-h-9'}
                    showOverlay={showOverlay}
                    quality={VideoQuality.HIGH}
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
              'other-vids flex p-1 justify-center content-center no-scrollbar overflow-x-auto top-0 left-0'
            }
            onClick={() => setSpeakerMode(sm => !sm)}
          >
            {members.length === 1 && (
              <>
                <div
                  className={`box ml-1 mr-1 w-full sm:mt-1 sm:mb-1 sm:ml-0 sm:mr-0 aspect-w-16 aspect-h-9 bg-gray-800 rounded-xl`}
                >
                  <div className="absolute not-selectable top-0 left-1 w-full h-full flex justify-center items-center z-0 text-c text-quinary  text-center px-1 sm:px-2 md:px-3 ">
                    <span>
                      {cstmWelcomeMsg ?? '👋 Waiting for others to join...'}
                    </span>
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
                      height={'100%'}
                      //height={'fit-content'}
                      width={'100%'}
                      classes={'box w-full vid-p h-auto aspect-w-16 aspect-h-9'}
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
                    member={m}
                    height={'100%'}
                    //height={'fit-content'}
                    width={'100%'}
                    classes={'box vid-p w-full h-auto aspect-w-16 aspect-h-9'}
                    showOverlay={showOverlay}
                    quality={i > 4 ? VideoQuality.LOW : VideoQuality.HIGH}
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
          setChatOpen={setChatOpen}
          localParticipant={localParticipant}
          chatMessages={chatMessages}
          setChatMessages={setChatMessages}
        />
      )}
    </>
  );
};
export default RoomWrapper;
