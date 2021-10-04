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


import { Participant, RemoteVideoTrack, VideoQuality } from "livekit-client";
import React, { RefObject, useEffect, useState } from "react";
import { useFullScreenHandle } from "react-full-screen";
import useEventListener from "../../hooks/useEventListener";
import useIsMounted from "../../hooks/useIsMounted";
import { DEFAULT_WELCOME_MESSAGE } from "../../utils/globals";
import { resizeWrapper } from "../../utils/ui";
import ScreenShareWrapper from "../wrapper/ScreenShareView";
import MemberView from "./MemberView";

const EqualVideoLayout = ({
  vidRef,
  members,
  setMainVideoId,
  speakerMode,
  chatOpen,
  setSpeakerMode,
  currentSharedScreens,
  cstmWelcomeMsg,
  disableSelfieMode,
}: {
  vidRef: RefObject<HTMLDivElement>;
  members: Participant[];
  setMainVideoId: Function;
  chatOpen: boolean;
  speakerMode: boolean;
  setSpeakerMode: Function;
  currentSharedScreens: RemoteVideoTrack[];
  cstmWelcomeMsg?: string | HTMLElement;
  disableSelfieMode?: boolean;
}) => {
  const isMounted = useIsMounted();
  const fsHandle = useFullScreenHandle();
  const [vidDims, setVidDims] = useState({ width: '0px', height: '0px' });

  useEventListener('load', () => {
    if (!isMounted()) return;
    resizeWrapper(vidRef, members, currentSharedScreens.length, setVidDims);
  });
  useEventListener('resize', () => {
    if (!isMounted()) return;
    resizeWrapper(vidRef, members, currentSharedScreens.length, setVidDims);
  });

  useEffect(() => {
    if (isMounted()) {
      resizeWrapper(vidRef, members, currentSharedScreens.length, setVidDims);
    }
  }, [
    members,
    currentSharedScreens.length,
    chatOpen,
    fsHandle.active,
    speakerMode,
  ]);

  return (
    <div
      id="room-wrapper"
      ref={vidRef}
      className={`flex justify-center content-center items-center flex-wrap align-middle z-2 w-full h-full max-h-screen max-w-screen box-border animate-fade-in-left`}
    >
      {currentSharedScreens &&
        currentSharedScreens.map((s, i) => {
          return (
            <ScreenShareWrapper
              track={s}
              height={vidDims.height}
              width={vidDims.width}
              key={`${i}-screen`}
              onClick={() => {
                setMainVideoId(s.sid);
                setSpeakerMode(sm => !sm);
              }}
            />
          );
        })}
      {members.map((m, i) => {
        return (
          <MemberView
            key={m.identity}
            member={m}
            height={vidDims.height}
            width={vidDims.width}
            disableSelfieMode={disableSelfieMode}
            quality={i > 4 ? VideoQuality.LOW : VideoQuality.HIGH}
            onClick={() => {
              setMainVideoId(m.sid);
              setSpeakerMode(sm => !sm);
            }}
          />
        );
      })}
      {members.length === 1 && (
        <div
          className={`relative z-0 inline-block align-middle self-center overflow-hidden text-center m-1 bg-gray-800 rounded-xl`}
          style={{
            height: vidDims.height,
            width: vidDims.width,
          }}
          onClick={() => setSpeakerMode(sm => !sm)}
        >
          <div className="absolute not-selectable top-0 left-1 w-full h-full flex justify-center items-center z-0 text-c text-quinary ">
            <span>{cstmWelcomeMsg ?? DEFAULT_WELCOME_MESSAGE}</span>
          </div>
        </div>
      )}
    </div>
  );
};
export default EqualVideoLayout;

function isMounted() {
    throw new Error("Function not implemented.");
}
