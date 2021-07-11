import {
  faDesktop,
  faMicrophone,
  faMicrophoneAltSlash,
  faMicrophoneSlash,
  faMicrophoneAlt,
  faPhoneSlash,
  faStop,
  faVideo,
  faVideoSlash,
} from "@fortawesome/free-solid-svg-icons";
import {
  createLocalAudioTrack,
  createLocalVideoTrack,
  LocalTrackPublication,
  LocalVideoTrack,
  Room,
  Track,
  VideoPresets,
} from "livekit-client";
import React, { ReactElement } from "react";
import { useParticipant } from "../hooks/useParticipant";
import { ControlButton } from "./ControlButton";
import "./styles.module.css";

export interface ControlsProps {
  room: Room;
  enableScreenShare?: boolean;
  enableAudio?: boolean;
  enableVideo?: boolean;
  onLeave?: (room: Room) => void;
}

export const ControlsView = ({
  room,
  enableScreenShare,
  enableAudio,
  enableVideo,
  onLeave,
}: ControlsProps) => {
  const { publications, isMuted, unpublishTrack } = useParticipant(
    room.localParticipant
  );

  const audioPub = publications.find((val) => val.kind === Track.Kind.Audio);
  const videoPub = publications.find((val) => {
    return val.kind === Track.Kind.Video && val.trackName !== "screen";
  });
  const screenPub = publications.find((val) => {
    return val.kind === Track.Kind.Video && val.trackName === "screen";
  });
  if (enableScreenShare === undefined) {
    enableScreenShare = true;
  }
  if (enableVideo === undefined) {
    enableVideo = true;
  }
  if (enableAudio === undefined) {
    enableAudio = true;
  }

  // let muteButton: ReactElement | undefined;
  // if (enableAudio) {
  //   if (!audioPub || isMuted) {
  //     muteButton = (
  //       <ControlButton
  //         label="Unmute"
  //         icon={faMicrophoneAltSlash}
  //         bgColor={'bg-white hover:bg-gray-100'}
  //         iconColor={'text-red'}
  //         onClick={async () => {
  //           if (audioPub) {
  //             (audioPub as LocalTrackPublication).unmute();
  //           } else {
  //             // track not published
  //             const audioTrack = await createLocalAudioTrack();
  //             room.localParticipant.publishTrack(audioTrack);
  //           }
  //         }}
  //       />
  //     );
  //   } else {
  //     muteButton = (
  //       <ControlButton
  //         label="Mute"
  //         icon={faMicrophoneAlt}
  //         onClick={() => (audioPub as LocalTrackPublication).mute()}
  //       />
  //     );
  //   }
  // }

  // let videoButton: ReactElement | undefined;
  // if (enableVideo) {
  //   if (videoPub?.track) {
  //     videoButton = (
  //       <ControlButton
  //         label="Stop video"
  //         icon={faVideo}
  //         onClick={() => unpublishTrack(videoPub.track as LocalVideoTrack)}
  //       />
  //     );
  //   } else {
  //     videoButton = (
  //       <ControlButton
  //         label="Start video"
  //         icon={faVideoSlash}
  //         bgColor={'bg-white hover:bg-gray-100'}
  //         iconColor={'text-red'}
  //         onClick={async () => {
  //           const videoTrack = await createLocalVideoTrack();
  //           room.localParticipant.publishTrack(videoTrack);
  //         }}
  //       />
  //     );
  //   }
  // }

  let screenButton: ReactElement | undefined;
  if (enableScreenShare) {
    if (screenPub?.track) {
      screenButton = (
        <ControlButton
          label="Stop sharing"
          icon={faStop}
          onClick={() => unpublishTrack(screenPub.track as LocalVideoTrack)}
        />
      );
    } else {
      screenButton = (
        <ControlButton
          label="Share screen"
          icon={faDesktop}
          onClick={async () => {
            try {
              const captureStream =
                // @ts-ignore
                (await navigator.mediaDevices.getDisplayMedia({
                  video: {
                    width: VideoPresets.fhd.resolution.width,
                    height: VideoPresets.fhd.resolution.height,
                  },
                })) as MediaStream;

              room.localParticipant.publishTrack(captureStream.getTracks()[0], {
                name: "screen",
                videoEncoding: {
                  maxBitrate: 3000000,
                  maxFramerate: 30,
                },
              });
            } catch (err) {
              window.alert("Error sharing screen");
            }
          }}
        />
      );
    }
  }

  return (
    <div className={'controlsWrapper'}>
      {/* Mute Audio Button */}
      {enableAudio && (
        <ControlButton
          label={!audioPub || isMuted ? 'Unmute' : 'Mute'}
          icon={!audioPub || isMuted ? faMicrophoneAltSlash : faMicrophoneAlt}
          bgColor={
            !audioPub || isMuted ? 'bg-white hover:bg-gray-100' : undefined
          }
          iconColor={!audioPub || isMuted ? 'text-red' : undefined}
          onClick={
            !audioPub || isMuted
              ? async () => {
                  if (audioPub) {
                    (audioPub as LocalTrackPublication).unmute();
                  } else {
                    // track not published
                    const audioTrack = await createLocalAudioTrack();
                    room.localParticipant.publishTrack(audioTrack);
                  }
                }
              : () => (audioPub as LocalTrackPublication).mute()
          }
        />
      )}
      {/* Pause Video Button */}
      {enableVideo && (
        <ControlButton
          label={videoPub?.track ? 'Stop video' : 'Start video'}
          icon={videoPub?.track ? faVideo : faVideoSlash}
          bgColor={videoPub?.track ? undefined : 'bg-white hover:bg-gray-100'}
          iconColor={videoPub?.track ? undefined : 'text-red'}
          onClick={
            videoPub?.track
              ? () => {
                  if (videoPub)
                    unpublishTrack(videoPub.track as LocalVideoTrack);
                }
              : async () => {
                  const videoTrack = await createLocalVideoTrack();
                  room.localParticipant.publishTrack(videoTrack);
                }
          }
        />
      )}
      {/* Screen Share Button */}
      {screenButton}
      {/* End Call Button */}
      {onLeave && (
        <ControlButton
          label="End"
          icon={faPhoneSlash}
          bgColor={'bg-red'}
          onClick={() => {
            room.disconnect();
            onLeave(room);
          }}
        />
      )}
    </div>
  );
};
