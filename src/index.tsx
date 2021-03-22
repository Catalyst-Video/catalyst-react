import React, { useEffect, useState } from 'react';
// components
import {
  HeaderComponent,
  ChatComponent,
  IncompatibleComponent,
} from './components/index';
// utils
import VCDataStream from './stream_class';
import { ResizeWrapper } from './utils/ui_utils';
import { getBrowserName, setThemeColor } from './utils/general_utils';
import {
  handleMute,
  handlePauseVideo,
  handleSharing,
} from './utils/stream_utils';
// typings
import {
  DefaultSettings,
  HiddenSettings,
  VideoChatData,
} from './typings/interfaces';
// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  // faClosedCaptioning,
  faComment,
  faCompress,
  faDesktop,
  faExpand,
  faMicrophone,
  faMicrophoneSlash,
  faPause,
  faPhoneSlash,
  faPlay,
} from '@fortawesome/free-solid-svg-icons';
// assets
const joinSound = require('./assets/sound/join.mp3');
const leaveSound = require('./assets/sound/leave.mp3');

import './styles/catalyst.css';
import 'react-toastify/dist/ReactToastify.css';
import './styles/video_grid.css';
// packages
import { ToastContainer } from 'react-toastify';
import Draggable from 'react-draggable';
import DetectRTC from 'detectrtc';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';

const VideoChat = ({
  sessionKey,
  uniqueAppId,
  cstmServerAddress,
  defaults,
  hidden,
  picInPic,
  onEndCall,
  cstmSnackbarMsg,
  cstmOptionBtns,
  themeColor,
}: {
  sessionKey: string;
  uniqueAppId: string;
  cstmServerAddress?: string;
  defaults?: DefaultSettings;
  hidden?: HiddenSettings;
  picInPic?: string;
  onEndCall?: Function;
  cstmSnackbarMsg?: HTMLElement | Element | string;
  cstmOptionBtns?: Element[];
  themeColor?: string;
}) => {
  const fsHandle = useFullScreenHandle();

  const [browserSupported, setBrowserSupported] = useState(true);
  const [audioEnabled, setAudio] = useState<boolean>(
    defaults?.audioOn ? defaults.audioOn : true
  );
  const [videoEnabled, setVideo] = useState<boolean>(
    defaults?.videoOn ? defaults.videoOn : true
  );
  const [sharing, setSharing] = useState(false);
  const [showChat, setShowChat] = useState<boolean>(
    defaults?.showChatArea ? defaults.showChatArea : false
  );
  const [captionsText, setCaptionsText] = useState(
    'HIDDEN CAPTIONS'
    // TODO: Captions defaults?.showCaptionsArea ? '' : 'HIDDEN CAPTIONS'
  );
  const [localVideoText, setLocalVideoText] = useState('No webcam input');
  const [VCData, setVCData] = useState<VideoChatData>();

  useEffect(() => {
    var ua: string = navigator.userAgent || navigator.vendor;
    if (
      DetectRTC.isMobileDevice &&
      (ua.indexOf('FBAN') > -1 ||
        ua.indexOf('FBAV') > -1 ||
        ua.indexOf('Instagram') > -1)
    ) {
      if (DetectRTC.osName === 'iOS') {
        setBrowserSupported(false);
      }
    }
    if (DetectRTC.isMobileDevice) {
      if (DetectRTC.osName === 'iOS' && !DetectRTC.browser.isSafari) {
        setBrowserSupported(false);
      }
    }
    const isWebRTCSupported =
      navigator.getUserMedia || window.RTCPeerConnection;
    const browserName: string = getBrowserName();
    if (!isWebRTCSupported || browserName === 'MSIE') {
      setBrowserSupported(false);
    }
    navigator.mediaDevices.ondevicechange = () => window.location.reload();

    // Load and Resize Event
    window.addEventListener(
      'load',
      (e: Event) => {
        ResizeWrapper();
        window.onresize = ResizeWrapper;
      },
      false
    );
  }, []);

  useEffect(() => {
    setThemeColor(themeColor ? themeColor : 'blue');
  }, [themeColor]);

  useEffect(() => {
    const VCD = new VCDataStream(
      sessionKey,
      uniqueAppId,
      setCaptionsText,
      setLocalVideoText,
      cstmServerAddress,
      cstmSnackbarMsg,
      picInPic
    );
    setVCData(VCD);
    VCD?.requestMediaStream();
  }, [sessionKey, uniqueAppId, cstmServerAddress, cstmSnackbarMsg, picInPic]);

  if (browserSupported) {
    return (
      <div className="catalyst-body">
        <FullScreen handle={fsHandle}>
          <div id="arbitrary-data" className="none"></div>
          <HeaderComponent VCData={VCData} />
          <div id="call-section">
            <div
              id="remote-video-text"
              className={`${captionsText === 'HIDDEN CAPTIONS' ? 'none' : ''}`}
            >
              {captionsText}
            </div>
            <div id="wrapper"></div>
            <Draggable defaultPosition={{ x: 30, y: 150 }}>
              <div id="moveable" className="video-1">
                <p id="local-video-text">{localVideoText}</p>
                <video id="local-video" autoPlay muted playsInline></video>
              </div>
            </Draggable>

            <div className="multi-button">
              <div className={`buttonContainer ${hidden?.mute ? 'none' : ''}`}>
                <button
                  className={`${
                    audioEnabled ? '' : 'btn-on'
                  } hoverButton tooltip notSelectable`}
                  onClick={() => {
                    if (VCData) handleMute(audioEnabled, setAudio, VCData);
                  }}
                >
                  <span>{audioEnabled ? 'Mute Audio' : 'Unmute Audio'}</span>

                  <FontAwesomeIcon
                    icon={audioEnabled ? faMicrophone : faMicrophoneSlash}
                  />
                </button>
              </div>

              <div
                className={`buttonContainer ${
                  hidden?.pausevideo ? 'none' : ''
                }`}
              >
                <button
                  className={`${
                    videoEnabled ? '' : 'btn-on'
                  } hoverButton tooltip notSelectable`}
                  onClick={() => {
                    if (VCData)
                      handlePauseVideo(
                        videoEnabled,
                        setVideo,
                        VCData,
                        setLocalVideoText
                      );
                  }}
                >
                  <span>{videoEnabled ? 'Pause Video' : 'Unpause Video'}</span>
                  <FontAwesomeIcon icon={videoEnabled ? faPause : faPlay} />
                </button>
              </div>

              <div
                className={`buttonContainer ${
                  hidden?.pausevideo ? 'none' : ''
                }`}
              >
                <button
                  className={`${
                    !fsHandle.active ? '' : 'btn-on'
                  } hoverButton tooltip notSelectable`}
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

              <div
                className={`buttonContainer ${
                  hidden?.screenshare ? 'none' : ''
                }`}
              >
                <button
                  className={`${
                    !sharing ? '' : 'btn-on'
                  } hoverButton tooltip notSelectable`}
                  id="share-button"
                  onClick={() => {
                    if (VCData)
                      handleSharing(
                        VCData,
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

              <div className={`buttonContainer ${hidden?.chat ? 'none' : ''}`}>
                <button
                  className={`${
                    !showChat ? '' : 'btn-on'
                  } hoverButton tooltip notSelectable`}
                  onClick={() => {
                    setShowChat(!showChat);
                  }}
                >
                  <span>{showChat ? 'Hide Chat' : 'Show Chat'}</span>
                  <FontAwesomeIcon icon={faComment} />
                </button>
              </div>

              {/* TODO: Captions
              
              <div
                className={`buttonContainer ${hidden?.captions ? 'none' : ''}`}
              >
                <button
                  className={`${
                    captionsText === 'HIDDEN CAPTIONS' ? '' : 'btn-on'
                  } hoverButton tooltip notSelectable`}
                  onClick={() => {
                    if (VCData)
                      handleRequestToggleCaptions(VCData, setCaptionsText);
                  }}
                >
                  <FontAwesomeIcon icon={faClosedCaptioning} />
                  <span>
                    {captionsText === 'HIDDEN CAPTIONS'
                      ? 'HIDDEN CAPTIONS'
                      : 'Hide HIDDEN CAPTIONS'}
                  </span>
                </button>
              </div> */}

              {cstmOptionBtns?.map((component, idx) => (
                <React.Fragment key={idx}>{component}</React.Fragment>
              ))}

              <div
                className={`buttonContainer ${hidden?.endcall ? 'none' : ''}`}
              >
                <button
                  className="hoverButton tooltip notSelectable"
                  onClick={() =>
                    onEndCall ? onEndCall : console.log('call ended')
                  }
                >
                  <FontAwesomeIcon icon={faPhoneSlash} />
                  <span>End Call</span>
                </button>
                <audio id="join-sound" src={joinSound}></audio>
                <audio id="leave-sound" src={leaveSound}></audio>
              </div>
            </div>
          </div>
          <ChatComponent showChat={showChat} />
          <ToastContainer
            position="top-center"
            autoClose={50000}
            hideProgressBar={false}
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
  } else {
    return <IncompatibleComponent />;
  }
};

export default VideoChat;
