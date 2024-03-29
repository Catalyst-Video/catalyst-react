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
} from "catalyst-lk-client";
import { VideoQuality } from "catalyst-lk-client";
import React, { useEffect, useRef, useState } from "react";
import VidWrapper from "../wrapper/VidWrapper";
import useMember from '../../hooks/useMember';
import useTimeout from "../../hooks/useTimeout";
import useIntersectionObserver from '../../hooks/useIntersectionObserver';

const MemberView = React.memo(
  ({
    member: m,
    width,
    height,
    classes,
    disableSelfieMode,
    displayName,
    quality,
    onClick,
  }: {
    member: Participant;
    displayName?: string;
    disableSelfieMode?: boolean;
    width: Property.Width;
    height: Property.Height;
    classes?: string;
    quality?: VideoQuality;
    onClick?: () => void;
  }) => {
    const [vidEnabled, setVidEnabled] = useState(true);
    const { isLocal, isMuted, subscribedTracks } = useMember(m);
    const [vidPub, setVideoPub] = useState<TrackPublication>();
    const ref = useRef<HTMLDivElement | null>(null);
    const entry = useIntersectionObserver(ref, {});
    const isVisible = !!entry?.isIntersecting;

    useEffect(() => {
      if (!ref) return;
      if (vidEnabled !== isVisible) {
        setVidEnabled(isVisible);
      }
    }, [ref, isVisible, m]);

    // TODO: figure out why blue bg not showing when video disabled by default

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
      if (!(vidPub instanceof RemoteTrackPublication)) return;
      if (vidEnabled) vidPub.setEnabled(true);
    }, [quality, vidEnabled, vidPub]);

    useTimeout(() => {
      if (!(vidPub instanceof RemoteTrackPublication)) return;
      vidPub?.setEnabled(vidEnabled);
      if (vidEnabled) vidPub?.setVideoQuality(quality ?? VideoQuality.HIGH);
    }, 3000);

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
          {vidPub?.track ? (
            <VidWrapper
              track={vidPub.track}
              isLocal={isLocal}
              disableSelfieMode={disableSelfieMode} />
          ) : (
            <div className="bg-placeholder w-full h-full bg-primary min-h-full" />
          )}
          <div className="absolute bottom-0 left-0 flex text-quinary justify-between p-1 lg:p-2 w-full">
            <div className="h-7 md:h-8 not-selectable flex items-center justify-center px-2 py-1 relative">
              <span
                className="absolute top-0 left-0 opacity-50 rounded-xl w-full h-full" // bg-tertiary
              ></span>
              <span className="text-n text-quinary z-30">
                {displayName ?? isLocal ? `${m.identity} (You)` : m.identity}
              </span>
            </div>
            {isMuted && (
              <div className="relative h-7 w-7 md:h-8 md:w-8 flex items-center justify-center p-1">
                <span className="absolute rounded-full top-0 left-0 opacity-50 z-30 bg-tertiary w-full h-full"></span>
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
  }
);
export default MemberView;

