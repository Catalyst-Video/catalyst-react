import { faUserFriends } from '@fortawesome/free-solid-svg-icons';
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
import React, { useEffect, useState } from 'react';
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { RoomMetaData } from '../typings/interfaces';
import { ParticipantProps } from '../components/ParticipantView';
import VideoView  from '../components/StageView';
import { useRoom } from '../hooks/useRoom';
import Header from '../components/Header';


const VideoChat = ({
  token,
  theme,
  meta,
}: {
  token: string;
  theme: string;
  meta: RoomMetaData;
}) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const fsHandle = useFullScreenHandle();
  const [numParticipants, setNumParticipants] = useState(0);

  const roomState = useRoom();

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

  return (
    <div id="video-chat" className="h-full w-full relative">
      <div id="bg-theme" className="h-full w-full bg-gray-700 dark:bg-gray-900">
        <FullScreen
          handle={fsHandle}
          className="h-full w-full bg-gray-700 dark:bg-gray-900"
        >
          <div className="">
            <Header alwaysBanner={false} theme={theme} />
            <div className="absolute right-10 top-4 flex">
              <FontAwesomeIcon
                icon={faUserFriends}
                size="lg"
                className="text-white mr-1"
              />
              <span className="text-white">{numParticipants}</span>
            </div>
          </div>

          <div id="call-section" className="w-full h-full items-end">
            <div
              id="vid-chat-cont"
              className="absolute top-0 left-0 right-0 bottom-0 flex"
            >
              <VideoView
                roomState={roomState}
                onLeave={onLeave}
                adaptiveVideo={true}
              />
            </div>
          </div>
        </FullScreen>
      </div>
    </div>
  );
};
export default VideoChat;
