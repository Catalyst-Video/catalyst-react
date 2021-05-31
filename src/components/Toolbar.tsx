import {
  faMicrophone,
  faMicrophoneSlash,
  faVideo,
  faVideoSlash,
  faExpandArrowsAlt,
  faCompressArrowsAlt,
  faComment,
  faDesktop,
  faPhoneSlash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { HiddenSettings } from '../typings/interfaces';
import { isConnected, logger, sendToAllDataChannels } from '../utils/general';

export default function Toolbar({
  toolbarRef,
  hidden,
  audioEnabled,
  disableRedIndicators,
  themeColor,
  setAudioEnabled,
  videoEnabled,
  setVideoEnabled,
  setLocalVideoText,
  disableLocalVidDrag,
  fsHandle,
  showChat,
  setShowChat,
  unseenChats,
  setUnseenChats,
  sharing,
  setSharing,
  cstmOptionBtns,
  onEndCall,
  localAudio,
  setLocalAudio,
  setLocalStream,
  localStream,
  dataChannel,
  switchInputDevices,
  connected,
  peerConnections,
}: {
  toolbarRef: React.RefObject<HTMLDivElement>;
  hidden?: HiddenSettings;
  audioEnabled: boolean;
  disableRedIndicators?: boolean;
  themeColor: string;
  setAudioEnabled: Function;
  videoEnabled: boolean;
  setVideoEnabled: Function;
  setLocalVideoText: React.Dispatch<React.SetStateAction<string>>;
  disableLocalVidDrag?: boolean;
  fsHandle;
  showChat: boolean;
  setShowChat: React.Dispatch<React.SetStateAction<boolean>>;
  unseenChats: number;
  setUnseenChats: Function;
  sharing: boolean;
  setSharing: React.Dispatch<React.SetStateAction<boolean>>;
  cstmOptionBtns?: JSX.Element[];
  onEndCall?: Function;
  localAudio?: MediaStreamTrack;
  setLocalAudio: Function;
  setLocalStream: Function;
  localStream?: MediaStream;
  dataChannel?: Map<string, RTCDataChannel>;
  switchInputDevices: Function;
  connected: Map<string, boolean>;
  peerConnections: Map<string, RTCPeerConnection>;
}) {
  const handleMute = (
    setAudioEnabled: Function,
    setLocalAudio: Function,
    localAudio?: MediaStreamTrack,
    dataChannel?: Map<string, RTCDataChannel>
  ) => {
    // console.log(localStream?.getAudioTracks(), audioEnabled);
    setAudioEnabled(audioEnabled => !audioEnabled);
    if (localAudio && dataChannel) {
      sendToAllDataChannels(`mut:${localAudio.enabled}`, dataChannel);
      if (localAudio.enabled) {
        localAudio.enabled = false;
        localStream?.getAudioTracks().forEach((track: MediaStreamTrack) => {
          track.enabled = false;
        });
      } else {
        localAudio.enabled = true;
        localStream?.getAudioTracks().forEach((track: MediaStreamTrack) => {
          track.enabled = true;
        });
      }
      setLocalAudio(localAudio);
      setLocalStream(localStream);
    }
  };

  const handlePauseVideo = (
    videoEnabled: boolean,
    setVideoEnabled: Function,
    setLocalVideoText: Function,
    setLocalStream: Function,
    dataChannel?: Map<string, RTCDataChannel>,
    localStream?: MediaStream,
    disableLocalVidDrag?: boolean
  ) => {
    setVideoEnabled(videoEnabled => !videoEnabled);
    if (localStream && dataChannel) {
      sendToAllDataChannels(`vid:${videoEnabled}`, dataChannel);
      if (videoEnabled) {
        localStream?.getVideoTracks().forEach((track: MediaStreamTrack) => {
          track.enabled = false;
          // TODO: experiment with track.stop(); to remove recording indicator on PC
        });
        // if (localVideo.srcObject && localStream)
        //   localVideo.srcObject = localStream;
        setLocalVideoText('Video Paused');
      } else {
        localStream?.getVideoTracks().forEach((track: MediaStreamTrack) => {
          track.enabled = true;
        });
        // TODO: setLocalVideoText(disableLocalVidDrag ? '' : 'Drag Me');
        setLocalVideoText('');
      }
      setLocalStream(localStream);
    }
  };

  const handleSharing = (
    sharing: boolean,
    setSharing: Function,
    connected: Map<string, boolean>,
    peerConnections: Map<string, RTCPeerConnection>,
    switchInputDevices: Function
  ) => {
    if (!isConnected(connected)) {
      logger('You must join a call before you can screen share');
      return;
    }
    if (!sharing) {
      const gdmOptions = {
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      };
      navigator.mediaDevices
        .getDisplayMedia(gdmOptions)
        .then((stream: MediaStream) => {
          setSharing(true);
          if (stream.getAudioTracks()[0])
            stream.addTrack(stream.getAudioTracks()[0]);
          logger(stream.toString());
          // swap audio/video streams
          let videoTrack = stream.getVideoTracks()[0];
          let audioTrack = stream.getAudioTracks()[0];
          connected.forEach(
            (value: boolean, uuid: string, map: Map<string, boolean>) => {
              if (connected.get(uuid)) {
                const sender = peerConnections
                  ?.get(uuid)
                  ?.getSenders()
                  .find((s: any) => {
                    return s.track.kind === videoTrack.kind;
                  });
                if (sender) sender.replaceTrack(videoTrack);
                if (stream.getAudioTracks()[0]) {
                  logger('Audio track is' + audioTrack.toString());
                  const sender2 = peerConnections
                    ?.get(uuid)
                    ?.getSenders()
                    .find((s: any) => {
                      if (s.track.kind === audioTrack.kind) {
                        logger('Found matching track: ' + s.track.toString());
                      }
                      return s.track.kind === audioTrack.kind;
                    });
                  // add track instead of replacing
                  if (sender2) sender2.replaceTrack(audioTrack);
                }
              }
            }
          );
          setLocalStream(stream);
        })
        .catch(err => {
          logger(err);
        });
    } else if (sharing) {
      setSharing(false);
      switchInputDevices();
    }
  };

  return (
    <div
      id="toolbar"
      ref={toolbarRef}
      className="fixed min-w-screen max-w-screen bottom-0 left-0 right-0 sm:bottom-2 z-6 flex justify-center flex-row"
    >
      <div
        id="multi-btn"
        className="sm:rounded-2xl text-2xl bg-white dark:bg-gray-800 shadow-sm px-6 py-3 flex flex-row items-center content-evenly sm:mb-1 min-w-screen max-w-screen w-screen sm:w-auto" // fixed
      >
        {!hidden?.mute && (
          <div className="relative h-full w-full flex flex-col items-center m-0 z-2">
            <button
              className={`${
                audioEnabled
                  ? ''
                  : `text-${
                      disableRedIndicators ? themeColor : 'red'
                    }-500 dark:text-${
                      disableRedIndicators ? themeColor : 'red'
                    }-500`
              } text-black dark:text-white cursor-pointer px-4 py-1 focus:border-0 focus:outline-none hover:text-${
                disableRedIndicators ? themeColor : 'red'
              }-500 dark:hover:text-${
                disableRedIndicators ? themeColor : 'red'
              }-500 not-selectable tooltip`}
              onClick={() => {
                handleMute(
                  setAudioEnabled,
                  setLocalAudio,
                  localAudio,
                  dataChannel
                );
              }}
            >
              <span className="hidden pointer-events-none text-white bg-gray-500 dark:bg-gray-700 font-semibold absolute p-2 rounded-xl top-0 left-12 z-10 whitespace-nowrap text-sm">
                {audioEnabled ? 'Mute Audio' : 'Unmute Audio'}
              </span>
              <FontAwesomeIcon
                icon={audioEnabled ? faMicrophone : faMicrophoneSlash}
              />
            </button>
          </div>
        )}
        {!hidden?.pausevideo && (
          <div className="relative h-full w-full flex flex-col items-center m-0 z-2">
            <button
              className={`${
                videoEnabled
                  ? ''
                  : `text-${
                      disableRedIndicators ? themeColor : 'red'
                    }-500 dark:text-${
                      disableRedIndicators ? themeColor : 'red'
                    }-500`
              } text-black dark:text-white cursor-pointer px-4 py-1 focus:border-0 focus:outline-none hover:text-${
                disableRedIndicators ? themeColor : 'red'
              }-500 dark:hover:text-${
                disableRedIndicators ? themeColor : 'red'
              }-500 not-selectable tooltip`}
              onClick={() => {
                handlePauseVideo(
                  videoEnabled,
                  setVideoEnabled,
                  setLocalVideoText,
                  setLocalStream,
                  dataChannel,
                  localStream,
                  disableLocalVidDrag
                );
              }}
            >
              <span className="hidden pointer-events-none text-white bg-gray-500 dark:bg-gray-700 font-semibold absolute p-2 rounded-xl top-0 left-12 z-10 whitespace-nowrap text-sm">
                {videoEnabled ? 'Pause Video' : 'Unpause Video'}
              </span>
              <FontAwesomeIcon icon={videoEnabled ? faVideo : faVideoSlash} />
            </button>
          </div>
        )}
        {!hidden?.fullscreen && (
          <div className="hidden sm:flex relative h-full w-full flex-col items-center m-0 z-2">
            <button
              className={`${
                !fsHandle.active
                  ? ''
                  : `text-${themeColor}-500 dark:text-${themeColor}-500`
              } text-black dark:text-white cursor-pointer px-4 py-1 focus:border-0 focus:outline-none hover:text-${themeColor}-500 dark:hover:text-${themeColor}-500 not-selectable tooltip`}
              onClick={() => {
                if (fsHandle.active) {
                  fsHandle.exit();
                } else {
                  fsHandle.enter();
                }
              }}
            >
              <span className="hidden pointer-events-none text-white bg-gray-500 dark:bg-gray-700 font-semibold absolute p-2 rounded-xl top-0 left-12 z-10 whitespace-nowrap text-sm">
                {!fsHandle.active ? 'Enter Full Screen' : 'Exit Full Screen'}
              </span>
              <FontAwesomeIcon
                icon={
                  !fsHandle.active ? faExpandArrowsAlt : faCompressArrowsAlt
                }
              />
            </button>
          </div>
        )}
        {!hidden?.chat && (
          <div className="relative h-full w-full flex flex-col items-center m-0 z-2">
            <button
              className={`${
                !showChat
                  ? ''
                  : `text-${themeColor}-500 dark:text-${themeColor}-500`
              } text-black dark:text-white cursor-pointer px-4 py-1 focus:border-0 focus:outline-none hover:text-${themeColor}-500 dark:hover:text-${themeColor}-500 not-selectable tooltip`}
              onClick={() => {
                setShowChat(!showChat);
                setUnseenChats(0);
              }}
            >
              <span className="hidden pointer-events-none text-white bg-gray-500 dark:bg-gray-700 font-semibold absolute p-2 rounded-xl top-0 left-12 z-10 whitespace-nowrap text-sm">
                {showChat ? 'Hide Chat' : 'Show Chat'}
              </span>
              <FontAwesomeIcon icon={faComment} />
              {!showChat && unseenChats !== 0 && (
                <i
                  id="chat-indicator"
                  className={`absolute top-0 right-6 sm:right-0 z-0 not-italic text-white bg-${themeColor}-500 rounded-full text-sm px-2 opacity-90 `}
                >
                  {unseenChats.toString()}
                </i>
              )}
            </button>
          </div>
        )}

        {!hidden?.screenshare && (
          <div className="hidden sm:flex relative h-full w-full flex-col items-center m-0 z-2">
            <button
              className={`${
                !sharing
                  ? ''
                  : `text-${themeColor}-500 dark:text-${themeColor}-500`
              } text-black dark:text-white cursor-pointer px-4 py-1 focus:border-0 focus:outline-none hover:text-${themeColor}-500 dark:hover:text-${themeColor}-500 not-selectable tooltip`}
              id="share-button"
              onClick={() => {
                handleSharing(
                  sharing,
                  setSharing,
                  connected,
                  peerConnections,
                  switchInputDevices
                );
              }}
            >
              <span className="hidden pointer-events-none text-white bg-gray-500 dark:bg-gray-700 font-semibold absolute p-2 rounded-xl top-0 left-12  z-10 whitespace-nowrap text-sm">
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
          <div className="relative h-full w-full flex flex-col items-center m-0 z-2">
            <button
              className={`text-black dark:text-white cursor-pointer px-4 py-1 focus:border-0 focus:outline-none hover:text-${
                disableRedIndicators ? themeColor : 'red'
              }-500 dark:hover:text-${
                disableRedIndicators ? themeColor : 'red'
              }-500 not-selectable tooltip`}
              onClick={() =>
                onEndCall ? onEndCall() : console.log('call ended')
              }
            >
              <FontAwesomeIcon icon={faPhoneSlash} />
              <span className="hidden pointer-events-none text-white bg-gray-500 dark:bg-gray-700 font-semibold absolute p-2 rounded-xl top-0 left-12  z-10 whitespace-nowrap text-sm">
                End Call
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
