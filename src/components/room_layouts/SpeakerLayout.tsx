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
import React from "react";
import { DEFAULT_WELCOME_MESSAGE } from "../../utils/globals";
import ScreenShareWrapper from "../wrapper/ScreenShareView";
import MemberView from "./MemberView";

const SpeakerLayout = ({
  members,
  mainVideoId,
  setMainVideoId,
  setSpeakerMode,
  currentSharedScreens,
  cstmWelcomeMsg,
  disableSelfieMode,
}: {
  members: Participant[];
  mainVideoId?: string;
  setMainVideoId: Function;
  setSpeakerMode: Function;
  currentSharedScreens: RemoteVideoTrack[];
  cstmWelcomeMsg?: string | HTMLElement;
  disableSelfieMode?: boolean;
}) => {
  return (
    <div
      id="room-wrapper-speaker"
      className={`speaker-layout flex z-20 w-full justify-center sm:justify-around animate-fade-in-right`}
    >
      <div className="speaker-vid flex flex-col p-1 justify-center content-center">
        {members.map((m, i) => {
          if (m.sid === mainVideoId) {
            return (
              <MemberView
                key={m.identity ?? 'first-vid'}
                member={m ?? members[0]}
                height={'100%'}
                width={'100%'}
                disableSelfieMode={disableSelfieMode}
                classes={'aspect-w-16 aspect-h-9'}
                quality={VideoQuality.HIGH}
                onClick={() => setSpeakerMode(sm => !sm)}
              />
            );
          } else return;
        })}
        {currentSharedScreens.map(s => {
          if (s.sid === mainVideoId) {
            return (
              <ScreenShareWrapper
                track={s}
                height={'100%'}
                width={'100%'}
                classes={'aspect-w-16 aspect-h-9'}
                key={`main-screen`}
                onClick={() => setSpeakerMode(sm => !sm)}
              />
            );
          } else return;
        })}
      </div>
      <div
        className={
          'other-vids flex p-1 justify-center content-center no-scrollbar overflow-x-auto top-0 left-0'
        }
        onClick={() => setSpeakerMode(sm => !sm)}
      >
        {members.length === 1 && (
          <>
            <div
              className={`box ml-1 mr-1 w-full sm:mt-1 sm:mb-1 sm:ml-0 sm:mr-0 aspect-w-16 aspect-h-9 bg-gray-800 rounded-xl`}
            >
              <div className="absolute not-selectable top-0 left-1 w-full h-full flex justify-center items-center z-0 text-c text-quinary  text-center px-1 sm:px-2 md:px-3 ">
                <span>{cstmWelcomeMsg ?? DEFAULT_WELCOME_MESSAGE}</span>
              </div>
            </div>
          </>
        )}
              {
                  //sharedScreens &&
          currentSharedScreens.map((s, i) => {
            if (s.sid !== mainVideoId)
              return (
                <ScreenShareWrapper
                  track={s}
                  height={'100%'}
                  //height={'fit-content'}
                  width={'100%'}
                  classes={'box w-full vid-p h-auto aspect-w-16 aspect-h-9'}
                  key={`sidebar-screen-${i}`}
                  onClick={() => {
                    setMainVideoId(s.sid);
                    setSpeakerMode(sm => !sm);
                  }}
                />
              );
            else return;
          })}
        {members.map((m, i) => {
          if (m.sid !== mainVideoId)
            return (
              <MemberView
                key={m.identity}
                member={m}
                height={'100%'}
                //height={'fit-content'}
                width={'100%'}
                disableSelfieMode={disableSelfieMode}
                classes={'box vid-p w-full h-auto aspect-w-16 aspect-h-9'}
                quality={i > 4 ? VideoQuality.LOW : VideoQuality.HIGH}
                onClick={() => {
                  setMainVideoId(m.sid);
                  setSpeakerMode(sm => !sm);
                }}
              />
            );
          else return;
        })}
      </div>
    </div>
  );
};
export default SpeakerLayout;