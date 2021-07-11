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
import { ControlsProps } from '../components/Toolbar';
import { ParticipantProps } from '../components/ParticipantView';
import { StageProps } from '../typings/StageProps';
import { StageView } from '../components/StageView';
import { useRoom } from '../hooks/useRoom';


const VideoChat = ({ token }: { token: string }) => {
    const [tracks, setTracks] = useState<Track[]>([]);
	const fsHandle = useFullScreenHandle();
	const [numParticipants, setNumParticipants] = useState(0);
	const [meta, setMeta] = useState<RoomMetaData>({
		audioEnabled: true,
		videoEnabled: true,
		simulcast: true,
	});

	const roomState = useRoom();

	const onConnected = room => {
		// onConnected(room, meta);
		room.on(RoomEvent.ParticipantConnected, () =>
		updateParticipantSize(room)
		);
		room.on(RoomEvent.ParticipantDisconnected, () =>
		updateParticipantSize(room)
		);
    updateParticipantSize(room);
    console.log(room)
	}

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

	const onLeave = () => {
	}

    return (
      <div
        id="video-chat"
        className="h-full w-full relative" // opacity-0
      >
        <div
          id="bg-theme"
          className="h-full w-full bg-gray-700 dark:bg-gray-900"
        >
          <FullScreen
            handle={fsHandle}
            className="h-full w-full bg-gray-700 dark:bg-gray-900"
          >
            <div className="roomContainer">
              <div className="grid auto-cols-auto  justify-between items-center">
                <h2>LiveKit Video</h2>
                <div className="participantCount">
                  <FontAwesomeIcon icon={faUserFriends} />
                  <span>{numParticipants}</span>
                </div>
              </div>
            </div>
            {/* <Header
							autoFade={autoFade}
							toolbarRef={toolbarRef}
							sessionKey={sessionKey}
							alwaysBanner={alwaysBanner}
							uniqueAppId={uniqueAppId}
							themeColor={themeColor}
			/> */}

            <div id="call-section" className="w-full h-full items-end">
              <div
                id="vid-chat-cont"
                className="absolute top-0 left-0 right-0 bottom-0 flex"
              >
                <StageView
                  roomState={roomState}
                  participantRenderer={undefined}
                  controlRenderer={undefined}
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

async function onConnected(room: Room, meta: RoomMetaData) {
  // make it easier to debug
  (window as any).currentRoom = room;

  if (meta.audioEnabled) {
    const options: CreateAudioTrackOptions = {};
    const audioDeviceId = meta.audioDeviceId
    if (audioDeviceId) {
      options.deviceId = audioDeviceId;
    }
    const audioTrack = await createLocalAudioTrack(options);
    await room.localParticipant.publishTrack(audioTrack);
  }
  if (meta.videoEnabled) {
    const videoDeviceId = meta.videoDeviceId
    const captureOptions: CreateVideoTrackOptions = {};
    if (videoDeviceId) {
      captureOptions.deviceId = videoDeviceId;
    }
    const videoTrack = await createLocalVideoTrack(captureOptions);
    const publishOptions: TrackPublishOptions = {
      name: 'camera',
    };
    if (meta.simulcast) {
      publishOptions.simulcast = true;
    }
    await room.localParticipant.publishTrack(videoTrack, publishOptions);
  }
}
