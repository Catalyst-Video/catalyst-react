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
// import { debounce } from 'ts-debounce';
import Chat from './Chat';
import { ChatMessage, RoomData } from '../typings/interfaces';
import { useFullScreenHandle } from 'react-full-screen';
import { DEFAULT_WELCOME_MESSAGE } from '../utils/globals';
import useEventListener from '../hooks/useEventListener';
import useIsMounted from '../hooks/useIsMounted';
import useTimeout from '../hooks/useTimeout';
import SlowLoadingMessage from './messages/SlowLoadingMessage';
import LoadingIndicator from './LoadingIndicator';
import { syncCurrentSharedScreens, resizeWrapper } from '../utils/ui';

const RoomWrapper = ({
  roomState,
  onLeave,
  speakerMode,
  setSpeakerMode,
  chatOpen,
  setChatOpen,
  disableChat,
  disableSelfieMode,
  chatMessages,
  setChatMessages,
  cstmWelcomeMsg,
  handleComponentRefresh,
}: {
  roomState: RoomData;
  onLeave?: (room: Room) => void;
  speakerMode: boolean;
  setSpeakerMode: Function;
  chatOpen: boolean;
  disableChat?: boolean;
  disableSelfieMode?: boolean;
  setChatOpen: Function;
  chatMessages: ChatMessage[];
  setChatMessages: Function;
  cstmWelcomeMsg?: string | HTMLElement;
  handleComponentRefresh: () => void;
  }) => {
  // user data
  const { isConnecting: connecting, error, localMember: localParticipant, members, room } = roomState;
  const [sharedScreens, setNumShared] = useState<number>(0);
  // ux
  const isMounted = useIsMounted();
  const [slowLoading, setSlowLoading] = useState<boolean>(false);
  // ui
  const fsHandle = useFullScreenHandle();
  const [mainVid, setMainVid] = useState<string>();
  const [vidDims, setVidDims] = useState({ width: '0px',  height: '0px' });
  const vidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMounted()) {
      if (!mainVid) setMainVid(members[0]?.sid);
      resizeWrapper(vidRef, members, sharedScreens, setVidDims);
    }
  }, [members, sharedScreens, chatOpen, fsHandle.active, speakerMode]);

  useEventListener('load', () => {
    if (!isMounted()) return;
    resizeWrapper(vidRef, members, sharedScreens, setVidDims);
  });
  useEventListener('resize', () => {
    if (!isMounted()) return;
    resizeWrapper(vidRef, members, sharedScreens, setVidDims);
  });

  useTimeout(() => {
    if (!isMounted()) return;
    setSlowLoading(true);
  }, 8000);

  if (members.length === 0 || error || !room || connecting) {
    return (
      <div className="absolute not-selectable top-0 left-1 w-full h-full flex justify-center items-center text-xl text-quinary">
        <div className="flex flex-col items-center justify-between p-2">
          <LoadingIndicator />         
          <div className="pt-4">
            {error && <span>⚠️ {error.message}</span>}
            {connecting && <span>⚡ Connecting...</span>}
            {!room && !connecting && !error && (
              <span>🚀 Preparing room...</span>
            )}
            {members.length === 0 && room && !connecting && (
              <span>{cstmWelcomeMsg ?? DEFAULT_WELCOME_MESSAGE}</span>
            )}
          </div>
        </div>
        {slowLoading && (
          <SlowLoadingMessage onRefresh={() => {
              room?.disconnect();
              handleComponentRefresh();
         }} />
        )}
      </div>
    );
  }

  let currentSharedScreens = syncCurrentSharedScreens(setNumShared, sharedScreens, members, setMainVid, mainVid);

  return (
    <>
      {!speakerMode && (
        <div
          id="remote-vid-wrapper"
          ref={vidRef}
          className={`flex justify-center content-center items-center flex-wrap align-middle z-2 w-full h-full max-h-screen max-w-screen box-border animate-fade-in-left`}
        >
          {currentSharedScreens &&
            currentSharedScreens.map((s, i) => {
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
                disableSelfieMode={disableSelfieMode}
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
                <span>{cstmWelcomeMsg ?? DEFAULT_WELCOME_MESSAGE}</span>
              </div>
            </div>
          )}
        </div>
      )}
      {speakerMode && (
        <div
          className={`speaker-view flex z-20 w-full justify-center sm:justify-around  animate-fade-in-right`}
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
                    disableSelfieMode={disableSelfieMode}
                    classes={'aspect-w-16 aspect-h-9'}
                    quality={VideoQuality.HIGH}
                    onClick={() => setSpeakerMode(sm => !sm)}
                  />
                );
              } else return;
            })}
            {currentSharedScreens.map(s => {
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
              } else return;
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
                    <span>{cstmWelcomeMsg ?? DEFAULT_WELCOME_MESSAGE}</span>
                  </div>
                </div>
              </>
            )}
            {sharedScreens &&
              currentSharedScreens.map((s, i) => {
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
                else return;
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
                    disableSelfieMode={disableSelfieMode}
                    classes={'box vid-p w-full h-auto aspect-w-16 aspect-h-9'}
                    quality={i > 4 ? VideoQuality.LOW : VideoQuality.HIGH}
                    onClick={() => {
                      setMainVid(m.sid);
                      setSpeakerMode(sm => !sm);
                    }}
                  />
                );
              else return;
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
