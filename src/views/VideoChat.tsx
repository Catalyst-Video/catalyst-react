import { faArrowsAlt, faCompressAlt, faExpand, faExpandAlt, faExpandArrowsAlt, faUserFriends } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { LiveKitRoom } from 'catalyst-react';
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
} from 'livekit-client';
import React, { useEffect, useRef, useState } from 'react';
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { RoomMetaData } from '../typings/interfaces';
import RoomWrapper  from '../components/RoomWrapper';
import { useRoom } from '../hooks/useRoom';
import Header from '../components/Header';


const VideoChat = ({
  token,
  theme,
  meta,
  fade,
}: {
  token: string;
  theme: string;
  meta: RoomMetaData;
  fade: number
}) => {
  const fsHandle = useFullScreenHandle();
  const [numParticipants, setNumParticipants] = useState(0);
  const roomState = useRoom();

  const toolbarRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null);


  const onConnected = room => {
    // onConnected(room, meta);
    room.on(RoomEvent.ParticipantConnected, () => updateParticipantSize(room));
    room.on(RoomEvent.ParticipantDisconnected, () =>
      updateParticipantSize(room)
    );
    updateParticipantSize(room);
    console.log(room);
  };

  useEffect(() => {
    roomState.connect('wss://demo.livekit.io', token, meta).then(room => {
      if (!room) {
        return;
      }
      if (onConnected) {
        onConnected(room);
      }
      return () => {
        room.disconnect();
      };
    });
  }, []);

  const updateParticipantSize = (room: Room) => {
    setNumParticipants(room.participants.size + 1);
  };

  const onLeave = () => {};

  // animate toolbar & header fadeIn/Out
  useEffect(() => {
      const delayCheck = () => {
          const hClasses = headerRef.current?.classList;
          const tClasses = toolbarRef.current?.classList;
        if (timedelay === 5) {
          hClasses?.remove('animate-fade-in-down');
          hClasses?.add('animate-fade-out-up');
          tClasses?.remove('animate-fade-in-up');
          tClasses?.add('animate-fade-out-down');
          setTimeout(() => {
            hClasses?.remove('animate-fade-out-up');
            hClasses?.add('hidden');
            tClasses?.remove('animate-fade-out-down');
            tClasses?.add('hidden');
          }, 450);
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
        timedelay = 1;
        clearInterval(_delay);
        _delay = setInterval(delayCheck, fade);
      };

      if (fade > 0) {
        var timedelay = 1;
        document.addEventListener('mousemove', handleMouse);
        var _delay = setInterval(delayCheck, fade);
      }

      () => {
        document.removeEventListener('mousemove', handleMouse);
      };
    
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
            <Header alwaysBanner={false} theme={theme} />
            <div className="absolute right-3 sm:right-5 top-10 sm:top-5 flex z-30">
              <FontAwesomeIcon
                icon={faUserFriends}
                size="lg"
                className="text-white mr-1"
              />
              <span className="text-white">{numParticipants}</span>
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
            <div
              id="vid-chat-cont"
              className="absolute top-0 left-0 right-0 bottom-0 flex"
            >
              <RoomWrapper
                roomState={roomState}
                onLeave={onLeave}
                theme={theme}
                toolbarRef={toolbarRef}
              />
            </div>
          </div>
        </FullScreen>
      </div>
    </div>
  );
};
export default VideoChat;
