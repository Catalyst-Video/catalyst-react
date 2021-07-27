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
import React, { CSSProperties, ReactElement, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useParticipant } from "../hooks/useMember";
import VidWrapper from "./wrapper/VidWrapper";

const MemberView = ({
  participant: m,
  width,
  height,
  classes,
  displayName,
  showOverlay,
  quality,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: {
  participant: Participant;
  displayName?: string;
  width: Property.Width;
  height: Property.Height;
  classes?: string;
  showOverlay?: boolean;
  quality?: VideoQuality;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}) => {
  const { isLocal, isMuted, subscribedTracks } = useParticipant(m);
  const { ref, inView } = useInView();
  const [videoPub, setVideoPub] = useState<TrackPublication>();
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [callbackTimeout, setCallbackTimeout] = useState<
    ReturnType<typeof setTimeout>
  >();

  // when video is hidden, disable it to optimize for bandwidth
  useEffect(() => {
    if (!ref) {
      return;
    }
    let enabled = inView;
    if (videoEnabled !== enabled) {
      setVideoEnabled(enabled);
    }
  }, [ref, m, inView]);

  // effect to set videoPub
  useEffect(() => {
    let newVideoPub: TrackPublication | undefined;
    subscribedTracks.forEach(pub => {
      if (
        pub.isSubscribed &&
        pub.kind === Track.Kind.Video &&
        pub.trackName !== 'screen' &&
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

  // when aspect matches, cover instead
  let objectFit: Property.ObjectFit = 'contain';
  if (
    videoPub?.dimensions &&
    (16 - 9) * (videoPub.dimensions.width - videoPub.dimensions.height) > 0
  ) {
    objectFit = 'cover';
  }

  return (
    <div className={`m-1 ${classes}`}>
      <div
        ref={ref}
        className={`relative z-0 inline-block align-middle self-center overflow-hidden text-center bg-gray-800 rounded-xl ${
          m.isSpeaking ? `ring-4 ring-primary ring-opacity-50` : ''
        }`}
        style={{
          height: height,
          width: width,
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      >
        {videoPub?.track ? (
          <VidWrapper
            track={videoPub.track}
            isLocal={isLocal}
            objectFit={objectFit}
          />
        ) : (
          <div className={`w-full h-full bg-primary`} />
        )}{' '}
        <div className="absolute bottom-0 left-0 flex text-white justify-between p-1 w-full">
          <div className="text-white text-xs not-selectable flex items-center justify-center bg-gray-700 bg-opacity-40 px-2 py-1 rounded-xl">
            {displayName ?? isLocal ? `${m.identity} (You)` : m.identity}
          </div>
          <div>
            <FontAwesomeIcon
              icon={isMuted ? faMicrophoneSlash : faMicrophone}
              size="2x"
              className={`text-white not-selectable bg-gray-700 h-7 w-7 md:h-8 md:w-8 bg-opacity-40 p-2 rounded-full`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default MemberView;

