import { faArrowsAlt, faCompressAlt, faExpand, faExpandAlt, faExpandArrowsAlt, faTh, faThLarge, faUserFriends } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  connect,
  RoomEvent,
  RemoteParticipant,
  RemoteTrackPublication,
  RemoteTrack,
  Participant,
  Track,
  CreateAudioTrackOptions,
  createLocalAudioTrack,
  createLocalVideoTrack,
  CreateVideoTrackOptions,
	Room,
  ConnectOptions,
  TrackPublishOptions,
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
import { protobufPackage } from 'livekit-client/dist/proto/livekit_models';


const VideoChat = ({
  token,
  meta,
  fade,
  disableChat,
  arbData,
  handleReceiveArbData,
  onEndCall,
}: {
  token: string;
  meta: RoomMetaData;
  fade: number;
  disableChat?: boolean;
  arbData?: Uint8Array;
  handleReceiveArbData: (arbData: Uint8Array) => void;
  onEndCall: () => void;
}) => {
  const fsHandle = useFullScreenHandle();
  const [numParticipants, setNumParticipants] = useState(0);
  const [speakerMode, setSpeakerMode] = useState(false);
  const [roomClosed, setRoomClosed] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const roomState = useRoom();

  const toolbarRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const decoder = new TextDecoder();

  const onConnected = async room => {
    room.on(RoomEvent.ParticipantConnected, () => updateParticipantSize(room));
    room.on(RoomEvent.ParticipantDisconnected, () =>
      updateParticipantSize(room)
    );
    room.on(RoomEvent.DataReceived, (data: Uint8Array, participant: Participant, kind: DataPacket_Kind) => {
      const strData = decoder.decode(data)
      console.log(strData)
      const parsedData = JSON.parse(strData)
      if (JSON.parse(strData)?.type === 'ctw-chat') {
        console.log('received chat ', JSON.parse(strData).text);
        setChatMessages(chatMessages => [
          ...chatMessages,
          {
            text: parsedData.text,
            sender: room.participants?.get(parsedData.sender) ?? ''
          },
        ]);
        
      } else {
        handleReceiveArbData(data);
      }
    });
    updateParticipantSize(room);
    console.log(room);

    const tracks = await createLocalTracks({
      audio: meta.audioEnabled,
      video: meta.videoEnabled,
    });
    tracks.forEach(track => {
      room.localParticipant.publishTrack(track);
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
      // 'wss://demo.livekit.io'
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

  const updateParticipantSize = (room: Room) => {
    setNumParticipants(room.participants.size + 1);
  };

  const onLeave = () => {
    onEndCall();
    setRoomClosed(true);
  };

  // animate toolbar & header fadeIn/Out
  useEffect(() => {
    if (fade > 0) {
      const delayCheck = () => {
        const hClasses = headerRef.current?.classList;
        const tClasses = toolbarRef.current?.classList;
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
          }, 190);
          timedelay = 1;
        }
        timedelay += 1;
      };

      const handleMouse = () => {
        const hClasses = headerRef.current?.classList;
        const tClasses = toolbarRef.current?.classList;
        hClasses?.remove('hidden');
        hClasses?.add('animate-fade-in-down');
        tClasses?.remove('hidden');
        tClasses?.add('animate-fade-in-up');
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
  }, []);

  return (
    <div id="video-chat" className="h-full w-full relative">
      <div id="bg-theme" className="h-full w-full bg-gray-700 dark:bg-gray-900">
        <FullScreen
          handle={fsHandle}
          className="h-full w-full bg-gray-700 dark:bg-gray-900"
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
              <span className="text-white">{numParticipants}</span>
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
                  roomState={roomState}
                  onLeave={onLeave}
                  speakerMode={speakerMode}
                  setSpeakerMode={setSpeakerMode}
                  disableChat={disableChat}
                  chatMessages={chatMessages}
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
                    />
                  </div>
                )}
                {roomState.audioTracks.map(track => (
                  <AudWrapper key={track.sid} track={track} isLocal={false} />
                ))}
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
