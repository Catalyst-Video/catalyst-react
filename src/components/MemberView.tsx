/*  Catalyst Scientific Video Chat Component File
Copyright (C) 2021 Catalyst Scientific LLC, Seth Goldin & Joseph Semrai

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version. 

While this code is open-source, you may not use your own version of this
program commerically for free (whether as a business or attempting to sell a variation
of Catalyst for a profit). If you are interested in using Catalyst in an 
enterprise setting, please either visit our website at https://catalyst.chat 
or contact us for more information.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

You can contact us for more details at support@catalyst.chat. */

import {
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
import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useMember } from "../hooks/useMember";
import VidWrapper from "./wrapper/VidWrapper";

const MemberView = React.memo(({
  member: m,
  width,
  height,
  classes,
  displayName,
  showOverlay,
  quality,
  onClick,
}: {
  member: Participant;
  displayName?: string;
  width: Property.Width;
  height: Property.Height;
  classes?: string;
  showOverlay?: boolean;
  quality?: VideoQuality;
  onClick?: () => void;
  }) => {
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [callbackTimeout, setCallbackTimeout] = useState<
    ReturnType<typeof setTimeout>
  >();
  const { isLocal, isMuted, subscribedTracks } = useMember(m);
  const { ref, inView } = useInView();
  const [videoPub, setVideoPub] = useState<TrackPublication>();

  useEffect(() => {
    if (!ref) {
      return;
    }
    let enabled = inView;
    if (videoEnabled !== enabled) {
      setVideoEnabled(enabled);
    }
  }, [ref, m, inView]);

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

  useEffect(() => {
    if (callbackTimeout) {
      clearTimeout(callbackTimeout);
      setCallbackTimeout(undefined);
    }
    if (!(videoPub instanceof RemoteTrackPublication)) {
      return;
    }
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

  return (
    <div className={`m-1 ${classes} cursor-pointer`}>
      <div
        ref={ref}
        className={`relative z-0 align-middle self-center overflow-hidden text-center bg-gray-800 flex justify-center rounded-xl ${
          m.isSpeaking ? `ring-2 ring-primary ring-opacity-50 ` : ''
        }`}
        style={{
          height: height,
          width: width,
        }}
        onClick={onClick}
      >
        <svg
          className="animate-spin rounded-full h-16 w-16 z-50 border-t-2 border-b-2 border-quinary"
          viewBox="0 0 24 24"
        ></svg>
        {videoPub?.track ? (
          <VidWrapper
            track={videoPub.track}
            isLocal={isLocal}
            // objectFit={
            //   videoPub?.dimensions &&
            //   (16 - 9) *
            //     (videoPub.dimensions.width - videoPub.dimensions.height) >
            //     0 ? 'cover' : 'contain'
            // }
          />
        ) : (
          <div
            className={`bg-placeholder w-full h-full bg-primary min-h-full`}
          />
        )}{' '}
        <div className="absolute bottom-0 left-0 flex text-quinary justify-between p-1 lg:p-2 w-full">
          <div className="h-7 md:h-8 not-selectable flex items-center justify-center px-2 py-1 relative">
            <span className="absolute top-0 left-0 opacity-50 bg-tertiary rounded-xl w-full h-full"></span>
            <span className="text-n text-quinary  z-30">
              {displayName ?? isLocal ? `${m.identity} (You)` : m.identity}
            </span>
          </div>
          {isMuted && (
            <div className="relative h-7 w-7 md:h-8 md:w-8 flex items-center justify-center p-1">
              <span className="absolute rounded-full top-0 left-0 opacity-50 bg-tertiary w-full h-full"></span>
              <FontAwesomeIcon
                icon={faMicrophoneSlash}
                size="2x"
                className={`text-quinary  not-selectable p-2 z-30`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
export default MemberView;

