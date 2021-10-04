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

// ui
import React, { useEffect, useRef, useState } from 'react';
import SlowLoadingMessage from '../messages/SlowLoadingMessage';
import LoadingIndicator from '../LoadingIndicator';
import EqualVideoLayout from '../room_layouts/EqualVideoLayout';
import SpeakerLayout from '../room_layouts/SpeakerLayout';
import Chat from '../chat/Chat';
// typings
import { ChatMessage, RoomData } from '../../typings/interfaces';
import { Room } from 'livekit-client';
// hooks
import useIsMounted from '../../hooks/useIsMounted';
import useTimeout from '../../hooks/useTimeout';
// utils
import { syncCurrentSharedScreens } from '../../utils/ui';
// globals
import { DEFAULT_WELCOME_MESSAGE } from '../../utils/globals';

const RoomWrapper = ({
  roomState,
  onLeave,
  speakerMode,
  setSpeakerMode,
  chatOpen,
  setChatOpen,
  disableChat,
  disableSelfieMode,
  chatMessages,
  setChatMessages,
  cstmWelcomeMsg,
  handleComponentRefresh,
}: {
  roomState: RoomData;
  onLeave?: (room: Room) => void;
  speakerMode: boolean;
  setSpeakerMode: Function;
  chatOpen: boolean;
  disableChat?: boolean;
  disableSelfieMode?: boolean;
  setChatOpen: Function;
  chatMessages: ChatMessage[];
  setChatMessages: Function;
  cstmWelcomeMsg?: string | HTMLElement;
  handleComponentRefresh: () => void;
  }) => {
  // user data
  const { isConnecting: connecting, error, localMember: localParticipant, members, room } = roomState;
  const [sharedScreens, setNumShared] = useState<number>(0);
  // ux
  const isMounted = useIsMounted();
  const [slowLoading, setSlowLoading] = useState<boolean>(false);
  // ui
  const [mainVid, setMainVid] = useState<string>();
  const vidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (!mainVid) setMainVid(members[0]?.sid);
  }, [members, sharedScreens, speakerMode]);

  useTimeout(() => {
    if (!isMounted()) return;
    setSlowLoading(true);
  }, 8000);

  let currentSharedScreens = syncCurrentSharedScreens(setNumShared, sharedScreens, members, setMainVid, mainVid);

    if (members.length === 0 || error || !room || connecting) {
      return (
        <div id="room-wrapper-info" className="absolute not-selectable top-0 left-1 w-full h-full flex justify-center items-center text-xl text-quinary">
          <div id="info-wrapper" className="flex flex-col items-center justify-between p-2">
            <LoadingIndicator />
            <div id="info-message" className="pt-4">
              {error ? <span>⚠️ {error.message}</span> : connecting ? <span>⚡ Connecting...</span> : (!room && !connecting && !error) ? (<span>🚀 Preparing room...</span>) : members.length === 0 && room && !connecting && (<span>{cstmWelcomeMsg ?? DEFAULT_WELCOME_MESSAGE}</span>)}
            </div>
          </div>
          {slowLoading && (
            <SlowLoadingMessage
              onRefresh={() => {
                room?.disconnect();
                handleComponentRefresh();
              }}
            />
          )}
        </div>
      );
    } else {
        return (
          <>
            {!speakerMode &&
              <EqualVideoLayout
                vidRef={vidRef}
                members={members}
                setMainVideoId={setMainVid}
                chatOpen={chatOpen}
                speakerMode={speakerMode}
                setSpeakerMode={setSpeakerMode}
                currentSharedScreens={currentSharedScreens}
                cstmWelcomeMsg={cstmWelcomeMsg}
                disableSelfieMode={disableSelfieMode}
            />}
            {speakerMode && (
              <SpeakerLayout
                members={members}
                setMainVideoId={setMainVid}
                mainVideoId={mainVid}
                currentSharedScreens={currentSharedScreens}
                setSpeakerMode={setSpeakerMode}
                disableSelfieMode={disableSelfieMode}
                cstmWelcomeMsg={cstmWelcomeMsg}
              />
            )}
            {!disableChat && (
              <Chat
                chatOpen={chatOpen}
                setChatOpen={setChatOpen}
                localParticipant={localParticipant}
                chatMessages={chatMessages}
                setChatMessages={setChatMessages}
              />
            )}
          </>
        );
    }
};
export default RoomWrapper;
