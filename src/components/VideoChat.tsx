import React, { useEffect, useRef, useState } from 'react';

// Other packages
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog,
  faComment,
  faCompressArrowsAlt,
  faDesktop,
  faEllipsisV,
  faExpandArrowsAlt,
  faMicrophone,
  faMicrophoneSlash,
  faMoon,
  faPhoneSlash,
  faSun,
  faVideo,
  faVideoSlash,
} from '@fortawesome/free-solid-svg-icons';
import Draggable from 'react-draggable';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import {
  DefaultSettings,
  HiddenSettings,
  VideoChatData,
} from '../typings/interfaces';
import { ResizeWrapper } from '../utils/ui';
import VCDataStream from '../vc_datastream';
import { sendToAllDataChannels } from '../utils/general';
import { handleMute, handlePauseVideo, handleSharing } from '../utils/stream';
import Header from './Header';
import Chat from './Chat';
import Settings from './Settings';
import WelcomeMessage from './WelcomeMessage';
import Toolbar from './Toolbar';

const VideoChat = ({
  sessionKey,
  uniqueAppId,
  cstmServerAddress,
  defaults,
  hidden,
  picInPic,
  onStartCall,
  onAddPeer,
  onRemovePeer,
  onEndCall,
  arbitraryData,
  onReceiveArbitraryData,
  cstmWelcomeMsg,
  cstmOptionBtns,
  showDotColors,
  showBorderColors,
  autoFade,
  alwaysBanner,
  dark,
  setDark,
  disableLocalVidDrag,
  audioEnabled,
  videoEnabled,
  setAudio,
  setVideo,
  audioInput,
  vidInput,
  setAudioInput,
  setVidInput,
  themeColor,
  redIndicators,
}: {
  sessionKey: string;
  uniqueAppId: string;
  autoFade: number;
  cstmServerAddress: string;
  defaults?: DefaultSettings;
  hidden?: HiddenSettings;
  picInPic?: string;
  onStartCall?: Function;
  onAddPeer?: Function;
  onRemovePeer?: Function;
  onEndCall?: Function;
  arbitraryData?: string;
  onReceiveArbitraryData?: Function;
  cstmWelcomeMsg?: JSX.Element | string;
  cstmOptionBtns?: JSX.Element[];
  showDotColors?: boolean;
  showBorderColors?: boolean;
  alwaysBanner?: boolean;
  dark?: boolean;
  setDark?: Function;
  disableLocalVidDrag?: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  setAudio: Function;
  setVideo: Function;
  audioInput?: MediaDeviceInfo;
  vidInput?: MediaDeviceInfo;
  setAudioInput: Function;
  setVidInput: Function;
  themeColor: string;
  redIndicators?: boolean;
}) => {
  const fsHandle = useFullScreenHandle();

  const [VC, setVCData] = useState<VideoChatData>();
  const [sharing, setSharing] = useState(false);
  const [unseenChats, setUnseenChats] = useState(0);
  const [localVideoText, setLocalVideoText] = useState('No webcam input');
  const [numPeers, setNumPeers] = useState(0);
  const [showChat, setShowChat] = useState<boolean>(
    defaults?.showChatArea ?? false
  );
  const [showSettings, setSettings] = useState(false);

  const catalystRef = useRef<HTMLDivElement>(null);
  const localVidRef = useRef<HTMLVideoElement>(null);
  const remoteVidRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      catalystRef &&
      catalystRef.current?.parentNode?.parentNode?.nodeName === 'BODY'
    )
      catalystRef.current.style.position = 'fixed';

    // Load and resize Event
    window.addEventListener(
      'load',
      (e: Event) => {
        ResizeWrapper();
        window.onresize = ResizeWrapper;
      },
      false
    );

    const VCData = new VCDataStream(
      sessionKey,
      uniqueAppId,
      localVidRef,
      remoteVidRef,
      incrementUnseenChats,
      setNumPeers,
      cstmServerAddress,
      picInPic,
      onAddPeer,
      onRemovePeer,
      audioInput,
      vidInput,
      showBorderColors,
      showDotColors,
      onReceiveArbitraryData
    );
    setVCData(VCData);
    VCData?.requestMediaStream();
    VCData.localVidRef.current?.addEventListener('playing', () => {
      setLocalVideoText(disableLocalVidDrag ? '' : 'Drag Me');
      if (!videoEnabled && !VCData.startedCall)
        handlePauseVideo(
          !videoEnabled,
          setVideo,
          VCData,
          setLocalVideoText,
          disableLocalVidDrag
        );
    });

    return () => {
      VCData.socket.emit('disconnecting');
      VCData.socket.disconnect();
      VCData.localStream?.getTracks().forEach(track => track.stop());
      VCData.peerConnections.forEach(peer => peer.close());
      setVCData(undefined);
    };
  }, []);

  useEffect(() => {
    ResizeWrapper();
    setUnseenChats(0);
  }, [showChat]);

  useEffect(() => {
    if (VC && VC?.startedCall) {
      if (onStartCall) onStartCall();
      if (!audioEnabled && VC.localAudio) VC.localAudio.enabled = false;
      if (!videoEnabled && VC.localStream)
        VC.localStream?.getVideoTracks().forEach((track: MediaStreamTrack) => {
          track.enabled = false;
        });
    }
  }, [VC?.startedCall]);

  useEffect(() => {
    if (arbitraryData && VC)
      sendToAllDataChannels(arbitraryData, VC.dataChannel);
  }, [arbitraryData]);

  useEffect(() => {
    setTimeout(() => {
      if (VC && VC?.dataChannel) {
        if (!audioEnabled) sendToAllDataChannels(`mut:true`, VC.dataChannel);
        if (!videoEnabled) sendToAllDataChannels(`vid:true`, VC.dataChannel);
      }
    }, 2000);
    if (VC) {
      if (!audioEnabled && VC.localAudio) VC.localAudio.enabled = false;
      if (!videoEnabled && VC.localStream)
        VC.localStream?.getVideoTracks().forEach((track: MediaStreamTrack) => {
          track.enabled = false;
        });
    }
  }, [numPeers]);

  const incrementUnseenChats = () => {
    setUnseenChats(unseenChats => unseenChats + 1);
  };

  const SettingsButton = () => (
    <button
      onClick={() => {
        setSettings(!showSettings);
      }}
      className="absolute top-10 sm:top-4 right-4 text-black dark:text-white cursor-pointer z-10 focus:border-0 focus:outline-none"
    >
      <FontAwesomeIcon icon={faEllipsisV} size="lg" className="" />
    </button>
  );
  return (
    <div
      id="catalyst"
      ref={catalystRef}
      className={`${
        dark ? 'dark' : ''
      } box-border h-full w-full m-0 p-0 opacity-0 overflow-hidden max-h-screen max-w-screen relative`}
    >
      <div id="bg-theme" className="h-full w-full bg-gray-200 dark:bg-gray-900">
        <FullScreen
          handle={fsHandle}
          className="h-full w-full bg-gray-200 dark:bg-gray-900"
        >
          <Header
            autoFade={autoFade}
            toolbarRef={toolbarRef}
            sessionKey={sessionKey}
            alwaysBanner={alwaysBanner}
            uniqueAppId={uniqueAppId}
            themeColor={themeColor}
          />
          {VC && (
            <Chat
              showChat={showChat}
              setShowChat={setShowChat}
              dataChannel={VC.dataChannel}
              localColor={VC.localColor}
              themeColor={themeColor}
            />
          )}
          <div id="call-section" className="w-full h-full items-end">
            <Draggable
              defaultPosition={{ x: 30, y: 150 }}
              bounds="parent"
              disabled={disableLocalVidDrag ?? false}
            >
              <div
                id="local-vid-wrapper"
                className="cursor-move z-20 relative flex justify-center w-full h-auto"
              >
                <p
                  id="local-text"
                  className="absolute flex items-center text-white opacity-40 whitespace-nowrap h-full font-bold z-5 text-xs sm:text-sm not-selectable"
                >
                  {localVideoText}
                </p>
                <video
                  id="local-video"
                  ref={localVidRef}
                  className={`w-full h-full rounded-2xl bg-black border-2 border-${themeColor}-500`} //TODO: border?
                  autoPlay
                  muted
                  playsInline
                ></video>
                {showDotColors && <div id="local-indicator"></div>}
              </div>
            </Draggable>
            <div
              id="remote-vid-wrapper"
              ref={remoteVidRef}
              className={`flex justify-center content-center items-center absolute flex-wrap align-middle z-2 top-0 left-0 w-full h-full max-h-screen max-w-screen ${
                showChat ? 'ct-chat' : ''
              }`}
            >
              {numPeers === 0 && (
                <WelcomeMessage
                  cstmWelcomeMsg={cstmWelcomeMsg}
                  sessionKey={sessionKey}
                />
              )}
              {/* <div className="relative h-full w-full rounded-2xl mx-40 my-40 z-0 inline-block align-middle self-center text-center bg-yellow-500"></div> */}
            </div>
            {!showChat && (
              <>
                <SettingsButton />
                {showSettings && (
                  <Settings
                    themeColor={themeColor}
                    vidInput={vidInput}
                    audioInput={audioInput}
                    setAudioInput={setAudioInput}
                    setVidInput={setVidInput}
                    setSettings={setSettings}
                    audioEnabled={audioEnabled}
                    setAudio={setAudio}
                    videoEnabled={videoEnabled}
                    setVideo={setVideo}
                    dark={dark}
                    setDark={setDark}
                    VC={VC}
                    setLocalVideoText={setLocalVideoText}
                    disableLocalVidDrag={disableLocalVidDrag}
                  />
                )}
              </>
            )}

            <Toolbar
              toolbarRef={toolbarRef}
              hidden={hidden}
              audioEnabled={audioEnabled}
              redIndicators={redIndicators}
              themeColor={themeColor}
              VC={VC}
              setAudio={setAudio}
              videoEnabled={videoEnabled}
              setVideo={setVideo}
              setLocalVideoText={setLocalVideoText}
              disableLocalVidDrag={disableLocalVidDrag}
              fsHandle={fsHandle}
              showChat={showChat}
              setShowChat={setShowChat}
              unseenChats={unseenChats}
              sharing={sharing}
              setSharing={setSharing}
              cstmOptionBtns={cstmOptionBtns}
              onEndCall={onEndCall}
            />
          </div>
        </FullScreen>
      </div>
    </div>
  );
};
export default VideoChat;
