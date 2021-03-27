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

// Utilities and JS
import VCDataStream from './vc_datastream';
import {
  displayWelcomeMessage,
  ResizeWrapper,
  setThemeColor,
} from './utils/ui';
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
  faPhoneSlash,
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
  handleArbitraryData,
  cstmSnackbarMsg,
  cstmOptionBtns,
  themeColor,
  showDotColors,
  showBorderColors,
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
  handleArbitraryData?: Function;
  cstmSnackbarMsg?: HTMLElement | Element | string;
  cstmOptionBtns?: Element[];
  themeColor?: string;
  showDotColors?: boolean;
  showBorderColors?: boolean;
}) => {
  const fsHandle = useFullScreenHandle();

  const [VC, setVCData] = useState<VideoChatData>();
  const [browserSupported, setBrowserSupported] = useState(true);
  const [audioEnabled, setAudio] = useState<boolean>(defaults?.audioOn ?? true);
  const [videoEnabled, setVideo] = useState<boolean>(defaults?.videoOn ?? true);
  const [sharing, setSharing] = useState(false);
  const [unseenChats, setUnseenChats] = useState(0);
  const [localVideoText, setLocalVideoText] = useState('No webcam input');
  const [showChat, setShowChat] = useState<boolean>(
    defaults?.showChatArea ?? false
  );

  useEffect(() => {
    initialBrowserCheck(setBrowserSupported);
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
    setTimeout(() => {
      if (VC && VC?.dataChannel) {
        if (!audioEnabled) sendToAllDataChannels(`mut:true`, VC.dataChannel);
        if (!videoEnabled) sendToAllDataChannels(`vid:true`, VC.dataChannel);
      }
    }, 3200);
    // TODO: get this working
    if (VC) displayWelcomeMessage(sessionKey, VC.connected, cstmSnackbarMsg);
  }, [VC]);

  useEffect(() => {
    const VCData = new VCDataStream(
      sessionKey,
      uniqueAppId,
      setLocalVideoText,
      incrementUnseenChats,
      cstmServerAddress,
      picInPic,
      onAddPeer,
      onRemovePeer,
      showBorderColors,
      showDotColors,
      handleArbitraryData
    );
    setVCData(VCData);
    VCData?.requestMediaStream();
    displayWelcomeMessage(sessionKey, VCData.connected, cstmSnackbarMsg);
  }, [sessionKey, uniqueAppId, cstmServerAddress, cstmSnackbarMsg, picInPic]);

  const incrementUnseenChats = () => {
    setUnseenChats((unseenChats) => unseenChats + 1);
  };

  if (browserSupported)
    return (
      <div id="catalyst" className="ct-body">
        <FullScreen handle={fsHandle}>
          <Header VC={VC} sessionKey={sessionKey} />
          <Chat showChat={showChat} setShowChat={setShowChat} />
          <div id="ct-call-section">
            <div
              id="remote-vid-wrapper"
              className={showChat ? 'ct-chat' : ''}
            ></div>
            <Draggable defaultPosition={{ x: 30, y: 150 }}>
              <div id="local-vid-wrapper" className="video-1">
                <p id="ct-local-text">{localVideoText}</p>
                <video id="local-video" autoPlay muted playsInline></video>
                {showDotColors && <div id="local-indicator"></div>}
              </div>
            </Draggable>

            <div className={`${showChat ? 'chat-offset' : ''} ct-multi-btn`}>
              <div className={`ct-btn-container ${hidden?.mute ? 'none' : ''}`}>
                <button
                  className={`${
                    audioEnabled ? '' : 'ct-btn-on'
                  } ct-hover-btn ct-tooltip ct-not-selectable`}
                  onClick={() => {
                    if (VC) handleMute(audioEnabled, setAudio, VC);
                  }}
                >
                  <span>{audioEnabled ? 'Mute Audio' : 'Unmute Audio'}</span>
                  <FontAwesomeIcon
                    icon={audioEnabled ? faMicrophone : faMicrophoneSlash}
                  />
                </button>
              </div>

              <div
                className={`ct-btn-container ${
                  hidden?.pausevideo ? 'none' : ''
                }`}
              >
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
                        setLocalVideoText
                      );
                  }}
                >
                  <span>{videoEnabled ? 'Pause Video' : 'Unpause Video'}</span>
                  <FontAwesomeIcon
                    icon={videoEnabled ? faVideo : faVideoSlash}
                  />
                </button>
              </div>

              <div
                className={`ct-btn-container ${
                  hidden?.pausevideo ? 'none' : ''
                }`}
              >
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

              <div className={`ct-btn-container ${hidden?.chat ? 'none' : ''}`}>
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

              <div
                className={`ct-btn-container ${
                  hidden?.screenshare ? 'none' : ''
                }`}
              >
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
                        setLocalVideoText
                      );
                  }}
                >
                  <span>
                    {!sharing ? 'Share Screen' : 'Stop Sharing Screen'}
                  </span>

                  <FontAwesomeIcon icon={faDesktop} />
                </button>
              </div>

              {cstmOptionBtns?.map((component, idx) => (
                <React.Fragment key={idx}>{component}</React.Fragment>
              ))}

              <div
                className={`ct-btn-container ${hidden?.endcall ? 'none' : ''}`}
              >
                <button
                  className="ct-hover-btn ct-tooltip ct-not-selectable"
                  onClick={() =>
                    onEndCall ? onEndCall() : console.log('call ended')
                  }
                >
                  <FontAwesomeIcon icon={faPhoneSlash} />
                  <span>End Call</span>
                </button>
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
          </div>
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
            pauseOnHover
            limit={2}
            // transition={Zoom}
          />
        </FullScreen>
      </div>
    );
  else return <IncompatibleAlert />;
};

export default VideoChat;
