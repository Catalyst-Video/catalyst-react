import {
  connect,
  RoomEvent,
  RemoteParticipant,
  RemoteTrackPublication,
  RemoteTrack,
  Participant,
  Track,
} from 'livekit-client';
import React, { useEffect, useState } from 'react';
import { FullScreen, useFullScreenHandle } from "react-full-screen";

const VideoChat = ({ token }: { token: string }) => {
    const [tracks, setTracks] = useState<Track[]>([]);
    const fsHandle = useFullScreenHandle();

    connect("ws://localhost:7800", token, {
			audio: true,
			video: true
		}).then(room => {
			console.log("connected to room", room.name);
			console.log("participants in room:", room.participants.size);

			room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed)
				.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed)
				.on(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakerChange)
				.on(RoomEvent.Disconnected, handleDisconnect);
		});

    const handleTrackSubscribed = (
        track: RemoteTrack,
        publication: RemoteTrackPublication,
        participant: RemoteParticipant
    ) => {
        if (track.kind === Track.Kind.Video || track.kind === Track.Kind.Audio) {
        	setTracks([...tracks, track])
        }
    }

    const handleTrackUnsubscribed = (
        track: RemoteTrack,
        publication: RemoteTrackPublication,
        participant: RemoteParticipant
    ) => {
        // remove tracks from all attached elements
        track.detach();
    }

    const handleActiveSpeakerChange = (speakers: Participant[]) => {
        // show UI indicators when participant is speaking
    }

    const handleDisconnect = () => {
        console.log('disconnected from room');
    }

    return (
			<div
				id="video-chat"
				className="h-full w-full relative" // opacity-0
			>
				<div
					id="bg-theme"
					className="h-full w-full bg-gray-200 dark:bg-gray-900"
				>
					<FullScreen
						handle={fsHandle}
						className="h-full w-full bg-gray-200 dark:bg-gray-900"
					>
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
								{/* <RemoteVideos
									fourThreeAspectRatioEnabled={fourThreeAspectRatioEnabled}
									disableRedIndicators={disableRedIndicators}
									showChat={showChat}
									cstmWelcomeMsg={cstmWelcomeMsg}
									sessionKey={sessionKey}
									themeColor={themeColor}
									picInPic={picInPic}
									audioEnabled={audioEnabled}
									videoEnabled={videoEnabled}
									localName={localName}
								/>
					
								<Toolbar
									toolbarRef={toolbarRef}
									hiddenTools={hiddenTools}
									localName={localName}
									audioEnabled={audioEnabled}
									disableRedIndicators={disableRedIndicators}
									themeColor={themeColor}
									setAudioEnabled={setAudioEnabled}
									videoEnabled={videoEnabled}
									setVideoEnabled={setVideoEnabled}
									setLocalVideoText={setLocalVideoText}
									disableLocalVidDrag={disableLocalVidDrag}
									fsHandle={fsHandle}
									showChat={showChat}
									setShowChat={setShowChat}
									unseenChats={unseenChats}
									setUnseenChats={setUnseenChats}
									sharing={sharing}
									setSharing={setSharing}
									cstmOptionBtns={cstmOptionBtns}
									onEndCall={onEndCall}
								/> */}
							</div>

              
						</div>
					</FullScreen>
				</div>
			</div>
		);
};

export default VideoChat;