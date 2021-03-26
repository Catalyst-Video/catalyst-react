import React, { useEffect, useState } from 'react';
import {
  HeaderComponent,
  ChatComponent,
  IncompatibleComponent,
} from './components/index';
import VCDataStream from './stream_class';
import { displayWelcomeMessage, ResizeWrapper } from './utils/ui_utils';
import {
  initialBrowserCheck,
  sendToAllDataChannels,
  setThemeColor,
} from './utils/general_utils';
import {
  handleMute,
  handlePauseVideo,
  handleSharing,
} from './utils/stream_utils';
import {
  DefaultSettings,
  HiddenSettings,
  VideoChatData,
} from './typings/interfaces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faComment,
  faCompress,
  faExpand,
  faMicrophone,
  faMicrophoneSlash,
  faPhoneSlash,
  faShareSquare,
  faVideo,
  faVideoSlash,
} from '@fortawesome/free-solid-svg-icons';
// import joinSound from './assets/sound/join.mp3';
// import leaveSound from './assets/sound/leave.mp3';
// const joinSound = require('./assets/sound/join.mp3');
// const leaveSound = require('./assets/sound/leave.mp3');
import { ToastContainer } from 'react-toastify';
import Draggable from 'react-draggable';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import './styles/catalyst.css';
import './styles/toast.css';
import './styles/video_grid.css';

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
  const [seenWelcomeMessage, setSeenWelcomeMessage] = useState(false);
  const [captionsText, setCaptionsText] = useState('HIDDEN CAPTIONS');
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
  }, [VC?.peerConnections.size]);

  useEffect(() => {
    const VCData = new VCDataStream(
      sessionKey,
      uniqueAppId,
      setCaptionsText,
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
    if (!seenWelcomeMessage) {
      displayWelcomeMessage(cstmSnackbarMsg, sessionKey, VCData.connected);
      setSeenWelcomeMessage(true);
      if (VCData.peerConnections.size === 0)
        setCaptionsText('Room ready. Waiting for others to join...');
    }
  }, [sessionKey, uniqueAppId, cstmServerAddress, cstmSnackbarMsg, picInPic]);

  const incrementUnseenChats = () => {
    setUnseenChats(unseenChats => unseenChats + 1);
  };

  if (browserSupported)
    return (
      <div id="catalyst" className="ct-body">
        <FullScreen handle={fsHandle}>
          <HeaderComponent VC={VC} sessionKey={sessionKey} />
          <ChatComponent showChat={showChat} setShowChat={setShowChat} />
          <div id="ct-call-section">
            <div
              id="ct-captions-text"
              className={`${captionsText === 'HIDDEN CAPTIONS' ? 'none' : ''} ${
                showChat ? 'chat-offset' : ''
              }`}
            >
              {captionsText}
            </div>
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

                  <FontAwesomeIcon icon={faShareSquare} />
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
            hideProgressBar={false}
            className={showChat ? 'chat-offset' : ''}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            limit={2}
          />
        </FullScreen>
      </div>
    );
  else return <IncompatibleComponent />;
};

export default VideoChat;
