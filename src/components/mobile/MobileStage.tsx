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

export const MobileStage = ({
  roomState,
  participantRenderer,
  controlRenderer,
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

  const ParticipantRenderer = participantRenderer ?? ParticipantView;
  const ControlRenderer = controlRenderer ?? Toolbar;

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
      <ParticipantRenderer
        key={participants[0].identity}
        participant={participants[0]}
        showOverlay={showOverlay}
        width="100%"
        height="100%"
        quality={VideoQuality.MEDIUM}
        onMouseEnter={() => setShowOverlay(true)}
        onMouseLeave={() => setShowOverlay(false)}
        adaptiveVideo={adaptiveVideo}
      />
    );
  }

  return (
    // global container
    <div className={"container"}>
      <div className={'stage'}>{mainView}</div>
      <div className={'participantsArea'}>
        {otherParticipants.map((participant, i) => {
          let quality = VideoQuality.MEDIUM;
          if (adaptiveVideo && i > 4) {
            quality = VideoQuality.LOW;
          }
          return (
            <ParticipantRenderer
              key={participant.identity}
              participant={participant}
              className={'participant'}
              aspectWidth={4}
              aspectHeight={3}
              showOverlay={showOverlay}
              quality={quality}
              onMouseEnter={() => setShowOverlay(true)}
              onMouseLeave={() => setShowOverlay(false)}
              adaptiveVideo={adaptiveVideo}
            />
          );
        })}
      </div>
      <div className={'controlsArea'}>
        <ControlRenderer
          room={room}
          enableScreenShare={false}
          onLeave={onLeave}
        />
      </div>
    </div>
  );
};
