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
  faChevronLeft,
  faChevronRight,
  faCommentAlt,
  faCompressAlt,
  faExpandAlt,
  faQuestion,
  faSync,
  faTh,
  faThLarge,
  faUserFriends,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  RoomEvent,
  Participant,
  Room,
  createLocalTracks,
  DataPacket_Kind,
} from 'livekit-client';
import React, { useEffect, useRef, useState } from 'react';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import AudWrapper from '../components/wrapper/AudWrapper';
import { ChatMessage, RoomMetaData } from '../typings/interfaces';
import RoomWrapper from '../components/RoomWrapper';
import HeaderLogo from '../components/header/Header';
import Toolbar from '../components/toolbar/Toolbar';
import useRoom from '../hooks/useRoom';
import { debounce } from 'ts-debounce';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { contactSupport } from '../utils/general';
import { isMobile } from 'react-device-detect';
import { SUPPORT_EMAIL } from '../utils/globals';

const CatalystChatView = ({
  token,
  meta,
  fade,
  disableChat,
  disableRefreshBtn,
  cstmWelcomeMsg,
  cstmSupportUrl,
  arbData,
  handleReceiveArbData,
  onJoinCall,
  onMemberJoin,
  onMemberLeave,
  onLeaveCall,
  handleComponentRefresh,
}: {
  token: string;
  meta: RoomMetaData;
  fade: number;
  disableChat?: boolean;
  disableRefreshBtn?: boolean;
  cstmWelcomeMsg?: string | HTMLElement;
  cstmSupportUrl?: string;
  arbData?: Uint8Array;
  handleReceiveArbData?: (arbData: Uint8Array) => void;
  onJoinCall?: () => void;
  onMemberJoin?: () => void;
  onMemberLeave?: () => void;
  onLeaveCall?: () => void;
  handleComponentRefresh: () => void;
}) => {
  const fsHandle = useFullScreenHandle();
  const [memberCount, setMemberCount] = useState(0);
  const [speakerMode, setSpeakerMode] = useState(false);
  const [roomClosed, setRoomClosed] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [outputDevice, setOutputDevice] = useState<MediaDeviceInfo>();
  const roomState = useRoom();

  const toolbarRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const videoChatRef = useRef<HTMLDivElement>(null);
  const decoder = new TextDecoder();
  const mounted = useRef(true);

  const onConnected = async room => {
    if (onJoinCall) onJoinCall();
    room.on(RoomEvent.ParticipantConnected, () => {
      bumpMemberSize(room);
      if (onMemberJoin) onMemberJoin();
    });
    room.on(RoomEvent.ParticipantDisconnected, () => {
      bumpMemberSize(room);
      if (onMemberLeave) onMemberLeave();
    });
    room.on(
      RoomEvent.DataReceived,
      (data: Uint8Array, member: Participant, kind: DataPacket_Kind) => {
        const strData = decoder.decode(data);
        // console.log(strData);
        const parsedData = JSON.parse(strData);
        if (JSON.parse(strData)?.type === 'ctw-chat') {
          // console.log('received chat ', JSON.parse(strData).text);
          setChatMessages(chatMessages => [
            ...chatMessages,
            {
              text: parsedData.text,
              sender: room.participants?.get(parsedData.sender) ?? '',
            },
          ]);
        } else {
          if (handleReceiveArbData) handleReceiveArbData(data);
        }
      }
    );
    bumpMemberSize(room);
    // console.log(room);
    const audDId = localStorage.getItem('PREFERRED_AUDIO_DEVICE_ID');
    const vidDId = localStorage.getItem('PREFERRED_VIDEO_DEVICE_ID');
    const tracks = await createLocalTracks({
      audio: meta.audioEnabled ? (audDId ? { deviceId: audDId } : true) : false,
      video: meta.videoEnabled ? (vidDId ? { deviceId: vidDId } : true) : false,
    });
    // TODO: apply bg removal
  
    tracks.forEach(track => {
      room.localParticipant.publishTrack(
        track,
        meta.simulcast
          ? {
              simulcast: true,
            }
          : {}
      );
    });
  };

  useEffect(() => {
    if (arbData)
      roomState.localMember?.publishData(
        arbData,
        DataPacket_Kind.RELIABLE
      );
  }, [arbData]);

  useEffect(() => {
    if (token && token.length > 0 && token !== 'INVALID') {
      // console.log('attempting to connect');
      roomState.connect('wss://infra.catalyst.chat', token, meta).then(room => {
          // console.log('connected');
          if (!mounted.current) return;
          if (!room) return; 
          if (onConnected) onConnected(room);
          return () => {
            room.disconnect();
          };
        })
        .catch(err => {
          console.error(err);
        });
    }
  }, [token]);

  const bumpMemberSize = (room: Room) => {
    setMemberCount(room.participants.size + 1);
  };

  const onLeave = () => {
    if (onLeaveCall) onLeaveCall();
    setRoomClosed(true);
  };

  const updateOutputDevice = (device: MediaDeviceInfo) => {
    setOutputDevice(device);
    localStorage.setItem('PREFERRED_OUTPUT_DEVICE_ID', device.deviceId);
  };

  // roomState.audioTracks.map(track => console.log(track));

  // animate toolbar & header fade in/out
  useEffect(() => {
    if (fade > 0) {
      const delayCheck = () => {
        const hClasses = headerRef.current?.classList;
        const tClasses = toolbarRef.current?.classList;
        if (hClasses && tClasses) {
          if (timedelay === 5 && !isHidden) {
            hClasses?.remove('animate-fade-in-down');
            hClasses?.add('animate-fade-out-up');
            tClasses?.remove('animate-fade-in-up');
            tClasses?.add('animate-fade-out-down');
            setTimeout(() => {
              hClasses?.remove('animate-fade-out-up');
              hClasses?.add('hidden');
              tClasses?.remove('animate-fade-out-down');
              tClasses?.add('hidden');
              isHidden = true;
            }, 170); // 190);
            timedelay = 1;
          }
          timedelay += 1;
        }
      };

      const handleMouse = () => {
        const hClasses = headerRef.current?.classList;
        const tClasses = toolbarRef.current?.classList;
        if (hClasses && tClasses) {
          hClasses?.remove('hidden');
          hClasses?.add('animate-fade-in-down');
          tClasses?.remove('hidden');
          tClasses?.add('animate-fade-in-up');
          isHidden = false;
          timedelay = 1;
          clearInterval(_delay);
          _delay = setInterval(delayCheck, fade);
        }
      };

      var timedelay = 1;
      var isHidden = false;
      const debounceHandleMouse = debounce(handleMouse, 25);
      videoChatRef.current?.addEventListener('mousemove', debounceHandleMouse);
      var _delay = setInterval(delayCheck, fade);

      () => {
        clearInterval(_delay);
        videoChatRef.current?.removeEventListener(
          'mousemove',
          debounceHandleMouse
        );
        mounted.current = false;
        // console.log('disconnecting');
        roomState?.room?.disconnect();
      };
    }
    // set default output device
    if (!outputDevice) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        if (!mounted.current)return;
        const outputDevices = devices.filter(
          id => id.kind === 'audiooutput' && id.deviceId
        );
        let outDevice: MediaDeviceInfo | undefined;
        if (localStorage.getItem('PREFERRED_OUTPUT_DEVICE_ID')) {
          outDevice = outputDevices.find(
            d =>
              d.deviceId === localStorage.getItem('PREFERRED_OUTPUT_DEVICE_ID')
          );
        }
        if (!outDevice) {
          outDevice = outputDevices[0];
        }
        setOutputDevice(outDevice);
        return outDevice;
      });
    }
  }, []);

  return (
    <div id="video-chat" className="relative w-full h-full" ref={videoChatRef}>
      <div id="bg-theme" className="w-full h-full bg-secondary ">
        {token === 'INVALID' ? (
          <div className="absolute top-0 flex items-center justify-center w-full h-full px-16 text-xl not-selectable left-1 text-quinary">
            <span className="text-center">
              ⚠️ An error occurred generating your user token.
              <br />
              Please{' '}
              <a
                href={
                  cstmSupportUrl && cstmSupportUrl.length > 0
                    ? cstmSupportUrl
                    : SUPPORT_EMAIL
                }
                target="_blank"
                rel="noreferrer"
              >
                contact us
              </a>{' '}
              for help
            </span>
          </div>
        ) : (
          <FullScreen
            handle={fsHandle}
            className="catalyst-fullscreen w-full h-full bg-secondary"
          >
            {roomState.room && (
              <div
                id="header-wrapper"
                className="animate-fade-in-down"
                ref={headerRef}
              >
                <HeaderLogo alwaysBanner={false} />
                {/* room count */}
                <div
                  className={`${
                    chatOpen ? 'chat-open-shift' : ''
                  } absolute z-50 flex nav-ops`}
                >
                  <FontAwesomeIcon
                    icon={faUserFriends}
                    size="lg"
                    className="mr-1 text-quinary"
                  />
                  <span className="text-quinary ">{memberCount}</span>

                  {/* help */}
                  {!(cstmSupportUrl?.length == 0) && (
                    <Tippy content="Help" theme="catalyst" placement="bottom">
                      <button
                        className="ml-5 cursor-pointer focus:border-0 focus:outline-none"
                        onClick={() => contactSupport(cstmSupportUrl)}
                      >
                        <FontAwesomeIcon
                          icon={faQuestion}
                          size="lg"
                          className="text-quinary"
                        />
                      </button>
                    </Tippy>
                  )}
                  {/* refresh */}
                  {!disableRefreshBtn && (
                    <Tippy
                      content="Refresh"
                      theme="catalyst"
                      placement="bottom"
                    >
                      <button
                        className="ml-5 cursor-pointer focus:border-0 focus:outline-none"
                        onClick={() => {
                          roomState?.room?.disconnect();
                          handleComponentRefresh();
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faSync}
                          size="lg"
                          className="text-quinary"
                        />
                      </button>
                    </Tippy>
                  )}
                  {/* speaker mode toggle  */}
                  <Tippy
                    content="Toggle View"
                    theme="catalyst"
                    placement="bottom"
                  >
                    <button
                      className="ml-5 cursor-pointer focus:border-0 focus:outline-none"
                      onClick={() => setSpeakerMode(sMode => !sMode)}
                    >
                      <FontAwesomeIcon
                        icon={speakerMode ? faTh : faThLarge}
                        size="lg"
                        className="text-quinary"
                      />
                    </button>
                  </Tippy>
                  {/* full screen  */}
                  {!isMobile && (
                    <Tippy
                      content="Full Screen"
                      theme="catalyst"
                      placement="bottom"
                    >
                      <button
                        className="ml-5 cursor-pointer focus:border-0 focus:outline-none"
                        onClick={() => {
                          if (fsHandle.active) fsHandle.exit();
                          else fsHandle.enter();
                        }}
                      >
                        <FontAwesomeIcon
                          icon={fsHandle.active ? faCompressAlt : faExpandAlt}
                          size="lg"
                          className="text-quinary"
                        />
                      </button>
                    </Tippy>
                  )}
                </div>
              </div>
            )}

            <div id="call-section" className="items-end w-full h-full">
              {!roomClosed && (
                <div id="vid-chat-cont" className="absolute inset-0 flex">
                  <RoomWrapper
                    onLeave={onLeave}
                    chatOpen={chatOpen}
                    setChatOpen={setChatOpen}
                    roomState={roomState}
                    speakerMode={speakerMode}
                    disableChat={disableChat}
                    chatMessages={chatMessages}
                    setSpeakerMode={setSpeakerMode}
                    setChatMessages={setChatMessages}
                    cstmWelcomeMsg={cstmWelcomeMsg}
                    handleComponentRefresh={handleComponentRefresh}
                  />
                  {roomState.room && (
                    <div
                      ref={toolbarRef}
                      className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center mb-3"
                    >
                      <Toolbar
                        room={roomState.room}
                        onLeave={onLeave}
                        setSpeakerMode={setSpeakerMode}
                        setChatMessages={setChatMessages}
                        updateOutputDevice={updateOutputDevice}
                        outputDevice={outputDevice}
                        chatOpen={chatOpen}
                        setChatOpen={setChatOpen}
                        disableChat={disableChat}
                        cstmSupportUrl={cstmSupportUrl}
                      />
                    </div>
                  )}
                  {roomState.audioTracks.map(track => (
                    <AudWrapper
                      key={track.sid}
                      track={track}
                      isLocal={false}
                      sinkId={outputDevice?.deviceId}
                    />
                  ))}
                </div>
              )}
              {roomClosed && (
                <div className="absolute inset-0 z-40 flex items-center justify-center w-full h-full text-xl not-selectable text-quinary">
                  <span>🖐️ Call ended</span>
                </div>
              )}
            </div>
          </FullScreen>
        )}
      </div>
    </div>
  );
};
export default CatalystChatView;
