import React, { useEffect, useState } from 'react';

// import joinSound from './assets/sound/join.mp3';
// import leaveSound from './assets/sound/leave.mp3';
// const joinSound = require('./assets/sound/join.mp3');
// const leaveSound = require('./assets/sound/leave.mp3');

// Styles
import './styles/catalyst.css';
import './styles/toast.css';
import './styles/video_grid.css';

// Component Imports
import Header from './components/Header';
import Chat from './components/Chat';
import IncompatibleAlert from './components/IncompatibleAlert';

// Utils
import VCDataStream from './vc_datastream';
import { ResizeWrapper, setThemeColor } from './utils/ui';
import { displayWelcomeMessage } from './utils/messages';
import { initialBrowserCheck, sendToAllDataChannels } from './utils/general';
import { handleMute, handlePauseVideo, handleSharing } from './utils/stream';

// Other packages
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faComment,
  faCompress,
  faDesktop,
  faExpand,
  faMicrophone,
  faMicrophoneSlash,
  faMoon,
  faPhoneSlash,
  faSun,
  faVideo,
  faVideoSlash,
} from '@fortawesome/free-solid-svg-icons';
import { ToastContainer } from 'react-toastify';
import Draggable from 'react-draggable';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';

// Types
import {
  DefaultSettings,
  HiddenSettings,
  VideoChatData,
} from './typings/interfaces';

const CatalystChat = ({
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
  themeColor,
  showDotColors,
  showBorderColors,
  autoFade,
  alwaysBanner,
  darkMode,
  disableLocalVidDrag,
}: {
  sessionKey: string;
  uniqueAppId: string;
  cstmServerAddress?: string;
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
  themeColor?: string;
  showDotColors?: boolean;
  showBorderColors?: boolean;
  autoFade?: number;
  alwaysBanner?: boolean;
  darkMode?: boolean;
  disableLocalVidDrag?: boolean;
}) => {
  const fsHandle = useFullScreenHandle();

  const [VC, setVCData] = useState<VideoChatData>();
  const [browserSupported, setBrowserSupported] = useState(true);
  const [audioEnabled, setAudio] = useState<boolean>(defaults?.audioOn ?? true);
  const [videoEnabled, setVideo] = useState<boolean>(defaults?.videoOn ?? true);
  const [sharing, setSharing] = useState(false);
  const [unseenChats, setUnseenChats] = useState(0);
  const [localVideoText, setLocalVideoText] = useState('No webcam input');
  const [numPeers, setNumPeers] = useState(0);
  const [dark, setDark] = useState(darkMode ?? false);
  const [showChat, setShowChat] = useState<boolean>(
    defaults?.showChatArea ?? false
  );

  useEffect(() => {
    initialBrowserCheck(setBrowserSupported, autoFade ? autoFade : 600);
  }, []);

  useEffect(() => {
    setThemeColor(themeColor ?? 'blue');
  }, [themeColor]);

  useEffect(() => {
    ResizeWrapper();
    setUnseenChats(0);
  }, [showChat]);

  useEffect(() => {
    if (VC && VC?.startedCall) {
      if (onStartCall) onStartCall();
      if (!audioEnabled && VC.localAudio) VC.localAudio.enabled = false;
      if (!videoEnabled && VC.localVideo)
        VC.localStream?.getVideoTracks().forEach((track: MediaStreamTrack) => {
          track.enabled = false;
        });
    }
  }, [VC?.startedCall]);

  useEffect(() => {
    setLocalVideoText(disableLocalVidDrag ? '' : 'Drag Me');
  }, [VC?.localStream]);

  useEffect(() => {
    if (arbitraryData && VC)
      sendToAllDataChannels(arbitraryData, VC.dataChannel);
  }, [arbitraryData]);

  useEffect(() => {
    const VCData = new VCDataStream(
      sessionKey,
      uniqueAppId,
      incrementUnseenChats,
      setNumPeers,
      cstmServerAddress,
      picInPic,
      onAddPeer,
      onRemovePeer,
      showBorderColors,
      showDotColors,
      onReceiveArbitraryData
    );
    setVCData(VCData);
    VCData?.requestMediaStream();
    displayWelcomeMessage(sessionKey, VCData.connected, cstmWelcomeMsg);

    return () => {
      VCData.socket.emit('disconnecting');
      VCData.socket.disconnect();
      VCData.localStream?.getTracks().forEach(track => track.stop());
      VCData.peerConnections.forEach(peer => peer.close());
      setVCData(undefined);
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (VC && VC?.dataChannel) {
        if (!audioEnabled) sendToAllDataChannels(`mut:true`, VC.dataChannel);
        if (!videoEnabled) sendToAllDataChannels(`vid:true`, VC.dataChannel);
      }
    }, 2000);
    if (VC) {
      if (numPeers === 0)
        displayWelcomeMessage(sessionKey, VC.connected, cstmWelcomeMsg);
      if (!audioEnabled && VC.localAudio) VC.localAudio.enabled = false;
      if (!videoEnabled && VC.localVideo)
        VC.localStream?.getVideoTracks().forEach((track: MediaStreamTrack) => {
          track.enabled = false;
        });
    }
  }, [numPeers]);

  const incrementUnseenChats = () => {
    setUnseenChats(unseenChats => unseenChats + 1);
  };

  if (browserSupported)
    return (
      <div id="catalyst" className={`ct-body ${dark ? 'dark' : ''}`}>
        <FullScreen handle={fsHandle} className={dark ? 'dark' : ''}>
          <Header VC={VC} sessionKey={sessionKey} alwaysBanner={alwaysBanner} />
          <Chat showChat={showChat} setShowChat={setShowChat} />
          <div id="ct-call-section">
            <Draggable
              defaultPosition={{ x: 30, y: 150 }}
              bounds="parent"
              disabled={disableLocalVidDrag ?? false}
            >
              <div id="local-vid-wrapper" className="video-1">
                <p id="ct-local-text">{localVideoText}</p>
                <video id="local-video" autoPlay muted playsInline></video>
                {showDotColors && <div id="local-indicator"></div>}
              </div>
            </Draggable>
            <div
              id="remote-vid-wrapper"
              className={showChat ? 'ct-chat' : ''}
            ></div>

            <div id="ct-toolbar">
              <div className="ct-multi-btn">
                {!hidden?.mute && (
                  <div className="ct-btn-container">
                    <button
                      className={`${
                        audioEnabled ? '' : 'ct-btn-on'
                      } ct-hover-btn ct-tooltip ct-not-selectable`}
                      onClick={() => {
                        if (VC) handleMute(audioEnabled, setAudio, VC);
                      }}
                    >
                      <span>
                        {audioEnabled ? 'Mute Audio' : 'Unmute Audio'}
                      </span>
                      <FontAwesomeIcon
                        icon={audioEnabled ? faMicrophone : faMicrophoneSlash}
                      />
                    </button>
                  </div>
                )}
                {!hidden?.pausevideo && (
                  <div className="ct-btn-container">
                    <button
                      className={`${
                        videoEnabled ? '' : 'ct-btn-on'
                      } ct-hover-btn ct-tooltip ct-not-selectable`}
                      onClick={() => {
                        if (VC)
                          handlePauseVideo(
                            videoEnabled,
                            setVideo,
                            VC,
                            setLocalVideoText,
                            disableLocalVidDrag
                          );
                      }}
                    >
                      <span>
                        {videoEnabled ? 'Pause Video' : 'Unpause Video'}
                      </span>
                      <FontAwesomeIcon
                        icon={videoEnabled ? faVideo : faVideoSlash}
                      />
                    </button>
                  </div>
                )}
                {!hidden?.fullscreen && (
                  <div className="ct-btn-container mobile-none">
                    <button
                      className={`${
                        !fsHandle.active ? '' : 'ct-btn-on'
                      } ct-hover-btn ct-tooltip ct-not-selectable`}
                      onClick={() => {
                        if (fsHandle.active) {
                          fsHandle.exit();
                        } else {
                          fsHandle.enter();
                        }
                      }}
                    >
                      <span>
                        {!fsHandle.active
                          ? 'Enter Full Screen'
                          : 'Exit Full Screen'}
                      </span>
                      <FontAwesomeIcon
                        icon={!fsHandle.active ? faExpand : faCompress}
                      />
                    </button>
                  </div>
                )}
                {!hidden?.chat && (
                  <div className="ct-btn-container">
                    <button
                      className={`${
                        !showChat ? '' : 'ct-btn-on'
                      } ct-hover-btn ct-tooltip ct-not-selectable`}
                      onClick={() => {
                        setShowChat(!showChat);
                      }}
                    >
                      <span>{showChat ? 'Hide Chat' : 'Show Chat'}</span>
                      <FontAwesomeIcon icon={faComment} />
                      {!showChat && unseenChats !== 0 && (
                        <i
                          className="chat-indicator"
                          aria-valuetext={unseenChats.toString()}
                        ></i>
                      )}
                    </button>
                  </div>
                )}

                {!hidden?.darkmode && (
                  <div className="ct-btn-container">
                    <button
                      className={`${
                        !showChat ? '' : 'ct-btn-on'
                      } ct-hover-btn ct-tooltip ct-not-selectable`}
                      onClick={() => {
                        setDark(!dark);
                      }}
                    >
                      <span>{!dark ? 'Dark Mode' : 'Light Mode'}</span>
                      <FontAwesomeIcon icon={dark ? faMoon : faSun} />
                    </button>
                  </div>
                )}

                {!hidden?.screenshare && (
                  <div className="ct-btn-container mobile-none">
                    <button
                      className={`${
                        !sharing ? '' : 'ct-btn-on'
                      } ct-hover-btn ct-tooltip ct-not-selectable`}
                      id="share-button"
                      onClick={() => {
                        if (VC)
                          handleSharing(
                            VC,
                            sharing,
                            setSharing,
                            videoEnabled,
                            setVideo,
                            setLocalVideoText,
                            disableLocalVidDrag
                          );
                      }}
                    >
                      <span>
                        {!sharing ? 'Share Screen' : 'Stop Sharing Screen'}
                      </span>

                      <FontAwesomeIcon icon={faDesktop} />
                    </button>
                  </div>
                )}

                {cstmOptionBtns?.map((component, idx) => (
                  <React.Fragment key={idx}>{component}</React.Fragment>
                ))}

                {!hidden?.endcall && (
                  <div className="ct-btn-container">
                    <button
                      className="ct-hover-btn ct-tooltip ct-not-selectable"
                      onClick={() =>
                        onEndCall ? onEndCall() : console.log('call ended')
                      }
                    >
                      <FontAwesomeIcon icon={faPhoneSlash} />
                      <span>End Call</span>
                    </button>
                  </div>
                )}
                {/* <audio
                  id="join-sound"
                  preload="auto"
                  crossOrigin="anonymous"
                  src={joinSound}
                ></audio>
                <audio
                  id="leave-sound"
                  preload="auto"
                  crossOrigin="anonymous"
                  src={leaveSound}
                ></audio> */}
              </div>
            </div>
            {(defaults?.showToastArea ?? true) && (
              <ToastContainer
                position="top-center"
                autoClose={50000}
                hideProgressBar={true}
                className={showChat ? 'chat-offset' : ''}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                toastClassName={dark ? 'dark' : ''}
                pauseOnHover
                limit={2}
              />
            )}
          </div>
        </FullScreen>
      </div>
    );
  else return <IncompatibleAlert />;
};

export default CatalystChat;
