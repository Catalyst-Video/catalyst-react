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
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import RoomClosedMessage from '../components/messages/RoomClosedMessage';
import TokenErrorMessage from '../components/messages/TokenErrorMessage';
import AudWrapper from '../components/wrapper/AudWrapper';
import RoomWrapper from '../components/RoomWrapper';
import Toolbar from '../components/toolbar/Toolbar';
import NavBar from '../components/NavBar';
// types
import { ChatMessage, RoomMetaData } from '../typings/interfaces';
import { BackgroundFilter } from '@vectorly-io/ai-filters';
// hooks
import useIsMounted from '../hooks/useIsMounted';
import useReadLocalStorage from '../hooks/useReadLocalStorage';
import useLocalStorage from '../hooks/useLocalStorage';
import useRoom from '../hooks/useRoom';
// utils
import { fadeOutSettings } from '../utils/ui';
import { initOutputDevice } from '../utils/devices';
import { sendArbitraryData } from '../utils/data';
import { initRoom } from '../utils/rooms';

const CatalystChatView = ({
  token,
  meta,
  fade,
  disableChat,
  disableSelfieMode,
  disableRefreshBtn,
  cstmWelcomeMsg,
  cstmSupportUrl,
  arbData,
  bgRemoval,
  bgRemovalKey,
  handleReceiveArbData,
  onJoinCall,
  onMemberJoin,
  onMemberLeave,
  onLeaveCall,
  handleComponentRefresh,
}: {
  token: string;
  meta: RoomMetaData;
  fade: number;
  disableSelfieMode?: boolean;
  disableChat?: boolean;
  disableRefreshBtn?: boolean;
  cstmWelcomeMsg?: string | HTMLElement;
  cstmSupportUrl?: string;
  arbData?: Uint8Array;
  bgRemoval?: 'blur' | string;
  bgRemovalKey: string;
  handleReceiveArbData?: (arbData: Uint8Array) => void;
  onJoinCall?: () => void;
  onMemberJoin?: () => void;
  onMemberLeave?: () => void;
  onLeaveCall?: () => void;
  handleComponentRefresh: () => void;
}) => {
  // room ux
  const roomState = useRoom();
  const isMounted = useIsMounted();
  const [roomClosed, setRoomClosed] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  // room ui
  const [speakerMode, setSpeakerMode] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [bgFilter, setBgFilter] = useState<BackgroundFilter>();
  // devices
  const audDId = useReadLocalStorage('PREFERRED_AUDIO_DEVICE_ID') as string;
  const vidDId = useReadLocalStorage('PREFERRED_VIDEO_DEVICE_ID') as string;
  const [outDId, setOutDId] = useLocalStorage('PREFERRED_OUTPUT_DEVICE_ID', 'default');
  const [outputDevice, setOutputDevice] = useState<MediaDeviceInfo>();
  // refs
  const fsHandle = useFullScreenHandle();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const videoChatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initRoom(
      token,
      roomState,
      meta,
      audDId,
      vidDId,
      bgRemovalKey,
      setChatMessages,
      setMemberCount,
      setBgFilter,
      bgRemoval,
      onJoinCall,
      onMemberJoin,
      onMemberLeave,
      handleReceiveArbData
    ).then(closeRoom => {
      return closeRoom;
    });
  }, [token]);

  useEffect(() => {
    if (arbData && roomState.localMember) sendArbitraryData(arbData, roomState.localMember);
  }, [arbData]);

  useEffect(() => {
    if (!outputDevice) initOutputDevice(outDId, setOutputDevice, setOutDId);
    return () => roomState.disconnectAll();
  }, [roomState.room]);

  const onLeave = () => {
    if (onLeaveCall) onLeaveCall();
    setRoomClosed(true);
  };

  const updateOutputDevice = (device: MediaDeviceInfo) => {
    setOutputDevice(device);
    setOutDId(device?.deviceId);
  };

  const refreshResetRoom = () => {
    roomState.disconnectAll();
    handleComponentRefresh()
  }

    useEffect(() => {
     fadeOutSettings(fade, isMounted(), headerRef, toolbarRef, videoChatRef);
    }, [fade]);
  
  return (
    <div id="video-chat" className="relative w-full h-full" ref={videoChatRef}>
      <div id="bg-theme" className="w-full h-full bg-secondary ">
        {token === 'INVALID' ? (
         <TokenErrorMessage cstmSupportUrl={cstmSupportUrl} />
        ) : (
          <FullScreen
            handle={fsHandle}
            className="catalyst-fullscreen w-full h-full bg-secondary overflow-hidden"
          >
            {roomState.room && (
                <NavBar fsHandle={fsHandle}
                  headerRef={headerRef}
                  chatOpen={chatOpen}
                  memberCount={memberCount}
                  cstmSupportUrl={cstmSupportUrl}
                  disableRefreshBtn={disableRefreshBtn}
                  handleComponentRefresh={refreshResetRoom}
                  speakerMode={speakerMode}
                  setSpeakerMode={setSpeakerMode}
                />
            )}
            <div id="call-section" className="items-end w-full h-full">
              {!roomClosed && (
                <div id="vid-chat-cont" className="absolute inset-0 flex">
                  <RoomWrapper
                    onLeave={onLeave}
                    chatOpen={chatOpen}
                    setChatOpen={setChatOpen}
                    roomState={roomState}
                    speakerMode={speakerMode}
                    disableChat={disableChat}
                    disableSelfieMode={disableSelfieMode}
                    chatMessages={chatMessages}
                    setSpeakerMode={setSpeakerMode}
                    setChatMessages={setChatMessages}
                    cstmWelcomeMsg={cstmWelcomeMsg}
                    handleComponentRefresh={handleComponentRefresh}
                  />
                  {roomState.room && (
                    <div
                      ref={toolbarRef}
                      className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center mb-3"
                    >
                      <Toolbar
                        room={roomState.room}
                        onLeave={onLeave}
                        setSpeakerMode={setSpeakerMode}
                        chatMessages={chatMessages}
                        setChatMessages={setChatMessages}
                        updateOutputDevice={updateOutputDevice}
                        outputDevice={outputDevice}
                        bgFilter={bgFilter}
                        setBgFilter={setBgFilter}
                        bgRemoval={bgRemoval}
                        bgRemovalKey={bgRemovalKey}
                        chatOpen={chatOpen}
                        setChatOpen={setChatOpen}
                        disableChat={disableChat}
                        cstmSupportUrl={cstmSupportUrl}
                      />
                    </div>
                  )}
                  {roomState.audioTracks.map(track => (
                    <AudWrapper
                      key={track.sid}
                      track={track}
                      isLocal={false}
                      sinkId={outputDevice?.deviceId}
                    />
                  ))}
                </div>
              )}
              {roomClosed && (
               <RoomClosedMessage/>
              )}
            </div>
          </FullScreen>
        )}
      </div>
    </div>
  );
};
export default CatalystChatView;
