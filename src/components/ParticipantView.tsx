import {
  faMicrophone,
  faMicrophoneSlash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Property } from "csstype";
import {
  Participant,
  RemoteTrackPublication,
  Track,
  TrackPublication,
} from "livekit-client";
import { VideoQuality } from "livekit-client/dist/proto/livekit_rtc";
import React, { CSSProperties, ReactElement, useEffect, useState } from "react";
import AspectRatio from "react-aspect-ratio";
import { useInView } from "react-intersection-observer";
import { useParticipant } from "../hooks/useParticipant";
import "./styles.module.css";
import { VideoRenderer } from "./VideoRenderer";

export interface ParticipantProps {
  participant: Participant;
  displayName?: string;
  // width in CSS
  width?: Property.Width;
  // height in CSS
  height?: Property.Height;
  className?: string;
  // aspect ratio width, if set, maintains aspect ratio
  aspectWidth?: number;
  // aspect ratio height
  aspectHeight?: number;
  showOverlay?: boolean;
  quality?: VideoQuality;
  // when set, video will be disabled when not in view
  adaptiveVideo?: Boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}

export const ParticipantView = ({
  participant,
  width,
  height,
  className,
  aspectWidth,
  aspectHeight,
  displayName,
  showOverlay,
  quality,
  adaptiveVideo,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: ParticipantProps) => {
  const { isLocal, isMuted, subscribedTracks } = useParticipant(participant);
  const { ref, inView } = useInView();
  const [videoPub, setVideoPub] = useState<TrackPublication>();
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [callbackTimeout, setCallbackTimeout] =
    useState<ReturnType<typeof setTimeout>>();

  // when video is hidden, disable it to optimize for bandwidth
  useEffect(() => {
    if (!ref) {
      return;
    }
    let enabled = inView;
    if (!adaptiveVideo) {
      enabled = true;
    }
    if (videoEnabled !== enabled) {
      setVideoEnabled(enabled);
    }
  }, [ref, participant, inView, adaptiveVideo]);

  // effect to set videoPub
  useEffect(() => {
    let newVideoPub: TrackPublication | undefined;
    subscribedTracks.forEach((pub) => {
      if (
        pub.isSubscribed &&
        pub.kind === Track.Kind.Video &&
        pub.trackName !== "screen" &&
        !newVideoPub
      ) {
        newVideoPub = pub;
      }
    });
    setVideoPub(newVideoPub);
  }, [subscribedTracks]);

  // debounce adaptive settings, to ensure less twitchy responses
  useEffect(() => {
    if (callbackTimeout) {
      clearTimeout(callbackTimeout);
      setCallbackTimeout(undefined);
    }
    if (!(videoPub instanceof RemoteTrackPublication)) {
      return;
    }

    // always enable right away, while disable quality changes are delayed
    if (videoEnabled) {
      videoPub.setEnabled(true);
    }

    setCallbackTimeout(
      setTimeout(() => {
        videoPub.setEnabled(videoEnabled);
        if (videoEnabled) {
          videoPub.setVideoQuality(quality ?? VideoQuality.HIGH);
        }
      }, 3000)
    );
    return () => {
      if (callbackTimeout) {
        clearTimeout(callbackTimeout);
        setCallbackTimeout(undefined);
      }
    };
  }, [quality, videoEnabled, videoPub]);

  const containerStyles: CSSProperties = {
    width: width,
    height: height,
  };

  // when aspect matches, cover instead
  let objectFit: Property.ObjectFit = "contain";
  if (
    aspectWidth &&
    aspectHeight &&
    videoPub?.dimensions &&
    (aspectWidth - aspectHeight) *
      (videoPub.dimensions.width - videoPub.dimensions.height) >
      0
  ) {
    objectFit = "cover";
  }

  if (!displayName) {
    displayName = participant.identity;
    if (isLocal) {
      displayName += " (You)";
    }
  }
  return (
    <div
      ref={ref}
      className="relative z-0 inline-block align-middle self-center overflow-hidden text-center bg-gray-800 rounded-lg"
      // className='relative rounded-lg overflow-hidden w-full h-full'
      style={containerStyles}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {aspectWidth && aspectHeight ? (
        <AspectRatio ratio={aspectWidth / aspectHeight}>
          {videoPub?.track ? (
            <VideoRenderer
              track={videoPub.track}
              isLocal={isLocal}
              objectFit={objectFit}
            />
          ) : (
            <div className="w-full h-full bg-blue rounded-lg" />
          )}
        </AspectRatio>
      ) : videoPub?.track ? (
        <VideoRenderer
          track={videoPub.track}
          isLocal={isLocal}
          objectFit={objectFit}
        />
      ) : (
        <div className="w-full h-full bg-blue rounded-lg" />
      )}

      <div className="absolute bottom-0 left-0 flex text-white justify-between p-2 w-full">
        <div className="text-white text-sm not-selectable flex items-center justify-center bg-gray-700 bg-opacity-40 px-2 py-1 rounded-xl">
          {displayName}
        </div>
        <div>
          <FontAwesomeIcon
            icon={isMuted ? faMicrophoneSlash : faMicrophone}
            size="2x"
            className={`text-white not-selectable bg-gray-700 h-10 w-10 bg-opacity-40 p-2 rounded-full`}
          />
        </div>
      </div>
    </div>
  );
};
