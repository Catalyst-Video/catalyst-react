import React, { useEffect, useRef, useState } from 'react';

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
import {
  DefaultSettings,
  HiddenSettings,
  VideoChatData,
} from '../typings/interfaces';
import { ResizeWrapper } from '../utils/ui';
import VCDataStream from '../vc_datastream';
import { sendToAllDataChannels } from '../utils/general';
import { handleMute, handlePauseVideo, handleSharing } from '../utils/stream';
import { displayWelcomeMessage } from '../utils/messages';
import Header from './Header';
import Chat from './Chat';

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
}) => {
  const fsHandle = useFullScreenHandle();

  const [VC, setVCData] = useState<VideoChatData>();
  const [audioEnabled, setAudio] = useState<boolean>(defaults?.audioOn ?? true);
  const [videoEnabled, setVideo] = useState<boolean>(defaults?.videoOn ?? true);
  const [sharing, setSharing] = useState(false);
  const [unseenChats, setUnseenChats] = useState(0);
  const [localVideoText, setLocalVideoText] = useState('No webcam input');
  const [numPeers, setNumPeers] = useState(0);
  const [showChat, setShowChat] = useState<boolean>(
    defaults?.showChatArea ?? false
  );

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
      showBorderColors,
      showDotColors,
      onReceiveArbitraryData
    );
    setVCData(VCData);
    VCData?.requestMediaStream();
    displayWelcomeMessage(sessionKey, VCData.connected, cstmWelcomeMsg);
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
      if (numPeers === 0)
        displayWelcomeMessage(sessionKey, VC.connected, cstmWelcomeMsg);
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

  return (
    <div
      id="catalyst"
      ref={catalystRef}
      className={`ct-body ${dark ? 'dark' : ''}`}
    >
      <FullScreen handle={fsHandle} className={dark ? 'dark' : ''}>
        <Header
          autoFade={autoFade}
          toolbarRef={toolbarRef}
          sessionKey={sessionKey}
          alwaysBanner={alwaysBanner}
          uniqueAppId={uniqueAppId}
        />
        {VC && (
          <Chat
            showChat={showChat}
            setShowChat={setShowChat}
            dataChannel={VC.dataChannel}
            localColor={VC.localColor}
          />
        )}
        <div id="ct-call-section">
          <Draggable
            defaultPosition={{ x: 30, y: 150 }}
            bounds="parent"
            disabled={disableLocalVidDrag ?? false}
          >
            <div id="local-vid-wrapper" className="video-1">
              <p id="ct-local-text">{localVideoText}</p>
              <video
                id="local-video"
                ref={localVidRef}
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
            className={showChat ? 'ct-chat' : ''}
          ></div>

          <div id="ct-toolbar" ref={toolbarRef}>
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
                    <span>{audioEnabled ? 'Mute Audio' : 'Unmute Audio'}</span>
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
                      if (setDark) setDark(!dark);
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
};
export default VideoChat;
