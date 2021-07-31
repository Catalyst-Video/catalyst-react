import { faChevronLeft, faChevronRight, faCommentAlt, faCompressAlt, faExpandAlt, faTh, faThLarge, faUserFriends } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  RoomEvent,
  Participant,
	Room,
  createLocalTracks,
  DataPacket_Kind,
} from 'livekit-client';
import React, { useEffect, useRef, useState } from 'react';
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import AudWrapper from '../components/wrapper/AudWrapper';
import { ChatMessage, RoomMetaData } from '../typings/interfaces';
import RoomWrapper  from '../components/RoomWrapper';
import HeaderLogo from '../components/header/Header';
import Toolbar from '../components/toolbar/Toolbar';
import { useRoom } from '../hooks/useRoom';
import { debounce } from 'ts-debounce';
// import { useCookies } from 'react-cookie';

const VideoChat = ({
  token,
  meta,
  fade,
  disableChat,
  arbData,
  handleReceiveArbData,
  onJoinCall,
  onMemberJoin,
  onMemberLeave,
  onLeaveCall
}: {
  token: string;
  meta: RoomMetaData;
  fade: number;
  disableChat?: boolean;
  arbData?: Uint8Array;
  handleReceiveArbData: (arbData: Uint8Array) => void;
  onJoinCall: () => void;
  onMemberJoin: () => void;
  onMemberLeave: () => void;
  onLeaveCall: () => void;
}) => {
  const fsHandle = useFullScreenHandle();
  const [memberCount, setMemberCount] = useState(0);
  const [speakerMode, setSpeakerMode] = useState(false);
  const [roomClosed, setRoomClosed] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  // const [cookies, setCookies] = useCookies([
  //    'PREFERRED_AUDIO_DEVICE_ID',
  //    'PREFERRED_VIDEO_DEVICE_ID',
  //    'PREFERRED_OUTPUT_DEVICE_ID',
  // ]);
  const [outputDevice, setOutputDevice] = useState<MediaDeviceInfo>();
  const roomState = useRoom();

  const toolbarRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const chatBtnRef = useRef<HTMLDivElement>(null);
  const decoder = new TextDecoder();

  const onConnected = async room => {
    if(onJoinCall) onJoinCall()
    room.on(RoomEvent.ParticipantConnected, () => {
      bumpMemberSize(room);
      if (onMemberJoin) onMemberJoin();
    });
    room.on(RoomEvent.ParticipantDisconnected, () =>{
      bumpMemberSize(room);
      if(onMemberLeave) onMemberLeave();
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
          handleReceiveArbData(data);
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
    tracks.forEach(track => {
      room.localParticipant.publishTrack(track,
        meta.simulcast ? {
          simulcast: true,
        } : {}
      );
    });
  };

  useEffect(() => {
    if (arbData)
      roomState.localParticipant?.publishData(
        arbData,
        DataPacket_Kind.RELIABLE
      );
  }, [arbData]);

  useEffect(() => {
    if (token && token.length > 0) {
      roomState
        .connect('wss://infra.catalyst.chat', token, meta)
        .then(room => {
          if (!room) {
            return;
          }
          if (onConnected) {
            onConnected(room);
          }
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
    if(onLeaveCall) onLeaveCall();
    setRoomClosed(true);
  };

  const updateOutputDevice = (device: MediaDeviceInfo) => {
    setOutputDevice(device);
    localStorage.setItem('PREFERRED_OUTPUT_DEVICE_ID', device.deviceId);
    // setCookies('PREFERRED_OUTPUT_DEVICE_ID', device.deviceId, {
    //   expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    // });
  }

  // animate toolbar & header fade in/out
  useEffect(() => {
    if (fade > 0) {
      const delayCheck = () => {
        const hClasses = headerRef.current?.classList;
        const tClasses = toolbarRef.current?.classList;
        const cClasses = chatBtnRef.current?.classList;
        if (timedelay === 5 && !isHidden) {
          hClasses?.remove('animate-fade-in-down');
          hClasses?.add('animate-fade-out-up');
          tClasses?.remove('animate-fade-in-up');
          tClasses?.add('animate-fade-out-down');
          cClasses?.remove('animate-fade-in-up');
          cClasses?.add('animate-fade-out-down');
          setTimeout(() => {
            hClasses?.remove('animate-fade-out-up');
            hClasses?.add('hidden');
            tClasses?.remove('animate-fade-out-down');
            tClasses?.add('hidden');
            cClasses?.remove('animate-fade-out-down');
            cClasses?.add('hidden');
            isHidden = true;
          }, 190);
          timedelay = 1;
        }
        timedelay += 1;
      };

      const handleMouse = () => {
        const hClasses = headerRef.current?.classList;
        const tClasses = toolbarRef.current?.classList;
        const cClasses = chatBtnRef.current?.classList;
        hClasses?.remove('hidden');
        hClasses?.add('animate-fade-in-down');
        tClasses?.remove('hidden');
        tClasses?.add('animate-fade-in-up');
        cClasses?.remove('hidden');
        cClasses?.add('animate-fade-in-up');
        isHidden = false;
        timedelay = 1;
        clearInterval(_delay);
        _delay = setInterval(delayCheck, fade);
      };

      var timedelay = 1;
      var isHidden = false;
      const debounceHandleMouse = debounce(handleMouse, 25);
      document.addEventListener('mousemove', debounceHandleMouse);
      var _delay = setInterval(delayCheck, fade);

      () => {
        document.removeEventListener('mousemove', debounceHandleMouse);
      };
    }
    // set default output device
   if (!outputDevice) {
     navigator.mediaDevices.enumerateDevices().then(devices => {
       const outputDevices = devices.filter(
         id => id.kind === 'audiooutput' && id.deviceId
       );
       if (localStorage.getItem('PREFERRED_OUTPUT_DEVICE_ID')) {
         let outDevice = outputDevices.find(
           d => d.deviceId === localStorage.getItem('PREFERRED_OUTPUT_DEVICE_ID')
         );
         setOutputDevice(outDevice);
       } else {
         setOutputDevice(outputDevices[0]);
       }
     });
   }
  }, []);

  return (
    <div id="video-chat" className="h-full w-full relative">
      <div
        id="bg-theme"
        className="h-full w-full bg-secondary dark:bg-gray-900"
      >
        <FullScreen
          handle={fsHandle}
          className="h-full w-full bg-secondary dark:bg-gray-900"
        >
          <div
            id="header-wrapper"
            className="animate-fade-in-down"
            ref={headerRef}
          >
            <HeaderLogo alwaysBanner={false} />
            <div className="absolute right-3 sm:right-5 top-10 sm:top-5 flex z-50">
              <FontAwesomeIcon
                icon={faUserFriends}
                size="lg"
                className="text-white mr-1"
              />
              <span className="text-white">{memberCount}</span>
              <button
                className="cursor-pointer focus:border-0 focus:outline-none"
                onClick={() => setSpeakerMode(sMode => !sMode)}
              >
                <FontAwesomeIcon
                  icon={speakerMode ? faTh : faThLarge}
                  size="lg"
                  className="text-white ml-5"
                />
              </button>
              <button
                className="cursor-pointer focus:border-0 focus:outline-none"
                onClick={() => {
                  if (fsHandle.active) fsHandle.exit();
                  else fsHandle.enter();
                }}
              >
                <FontAwesomeIcon
                  icon={fsHandle.active ? faCompressAlt : faExpandAlt}
                  size="lg"
                  className="text-white ml-5"
                />
              </button>
            </div>
          </div>

          <div id="call-section" className="w-full h-full items-end">
            {!roomClosed && (
              <div id="vid-chat-cont" className="absolute inset-0 flex">
                <RoomWrapper
                  onLeave={onLeave}
                  chatOpen={chatOpen}
                  roomState={roomState}
                  speakerMode={speakerMode}
                  disableChat={disableChat}
                  chatMessages={chatMessages}
                  setSpeakerMode={setSpeakerMode}
                  setChatMessages={setChatMessages}
                />
                {roomState.room && (
                  <div
                    ref={toolbarRef}
                    className="absolute bottom-0 left-0 right-0 flex items-center justify-center mb-3 z-20"
                  >
                    <Toolbar
                      room={roomState.room}
                      onLeave={onLeave}
                      setSpeakerMode={setSpeakerMode}
                      setChatMessages={setChatMessages}
                      updateOutputDevice={updateOutputDevice}
                      outputDevice={outputDevice}
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
                {!disableChat && (
                  <div
                    ref={chatBtnRef}
                    className={`absolute ${
                      chatOpen
                        ? 'left-3 sm:left-auto sm:right-48 animate-fade-in-right'
                        : 'right-2' //  animate-fade-in-left
                    } z-40 top-10 sm:top-auto sm:bottom-4 right-3 animate-fade-in-up`}
                  >
                    <button
                      className="z-40 focus:outline-none focus:border-0 flex bg-tertiary dark:bg-secondary hover:bg-quaternary dark:hover:bg-tertiary rounded-full w-16 h-16 items-center justify-center"
                      onClick={() => setChatOpen(chatOpen => !chatOpen)}
                    >
                      {!chatOpen && (
                        <FontAwesomeIcon
                          id="chat-open-left"
                          icon={faChevronLeft}
                          className={`text-white mr-1`}
                          size="lg"
                        />
                      )}
                      <FontAwesomeIcon
                        id="chat-open"
                        icon={faCommentAlt}
                        className={`text-white `}
                        size="lg"
                      />
                      {chatOpen && (
                        <FontAwesomeIcon
                          id="chat-open-right"
                          icon={faChevronRight}
                          className={`text-white ml-1`}
                          size="lg"
                        />
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
            {roomClosed && (
              <div className="absolute not-selectable inset-0 w-full h-full flex justify-center items-center text-xl text-white z-40">
                <span>🖐️ Call ended</span>
              </div>
            )}
          </div>
        </FullScreen>
      </div>
    </div>
  );
};
export default VideoChat;


