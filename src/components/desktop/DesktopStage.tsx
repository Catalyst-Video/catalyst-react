import {
  LocalParticipant,
  Participant,
  RemoteVideoTrack,
} from "livekit-client";
import { VideoQuality } from "livekit-client/dist/proto/livekit_rtc";
import React, { ReactElement, useState } from "react";
import Toolbar from "../Toolbar";
import { ParticipantView } from "../ParticipantView";
import { ScreenShareView } from "../ScreenShareView";
import { StageProps } from "../../typings/StageProps";
import "./styles.module.css";

export const DesktopStage = ({
  roomState,
  onLeave,
  adaptiveVideo,
}: StageProps) => {
  const { isConnecting, error, participants, room } = roomState;
  const [showOverlay, setShowOverlay] = useState(false);

  if (error) {
    return <div>error {error.message}</div>;
  }

  if (isConnecting) {
    return <div>connecting</div>;
  }
  if (!room) {
    return <div>room closed</div>;
  }

  if (participants.length === 0) {
    return <div>no one is in the room</div>;
  }


  // find first participant with screen shared
  let screenTrack: RemoteVideoTrack | undefined;
  participants.forEach((p) => {
    if (p instanceof LocalParticipant) {
      return;
    }
    p.videoTracks.forEach((track) => {
      if (track.trackName === "screen" && track.track) {
        screenTrack = track.track as RemoteVideoTrack;
      }
    });
  });

  let otherParticipants: Participant[];
  let mainView: ReactElement;
  if (screenTrack) {
    otherParticipants = participants;
    mainView = (
      <ScreenShareView track={screenTrack} height="100%" width="100%" />
    );
  } else {
    otherParticipants = participants.slice(1);
    mainView = (
      <ParticipantView
        key={participants[0].identity}
        participant={participants[0]}
        showOverlay={showOverlay}
        quality={VideoQuality.HIGH}
        onMouseEnter={() => setShowOverlay(true)}
        onMouseLeave={() => setShowOverlay(false)}
      />
    );
  }

  return (
    <div className='w-full h-full grid min-h-0 grid-container'>
      <div className={'stage'}>
        <div className={'stageCenter'}>{mainView}</div>
        <div className={'sidebar'}>
          {otherParticipants.map((participant, i) => {
            let quality = VideoQuality.HIGH;
            if (adaptiveVideo && i > 4) {
              quality = VideoQuality.LOW;
            }
            return (
              <ParticipantView
                key={participant.identity}
                participant={participant}
                width="100%"
                aspectWidth={16}
                aspectHeight={9}
                showOverlay={showOverlay}
                quality={quality}
                onMouseEnter={() => setShowOverlay(true)}
                onMouseLeave={() => setShowOverlay(false)}
                adaptiveVideo={adaptiveVideo}
              />
            );
          })}
        </div>
      </div>
      <div className={'controlsArea'}>
        <Toolbar room={room} onLeave={onLeave} />
      </div>
    </div>
  );
};
