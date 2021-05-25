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
import { sendToAllDataChannels } from '../utils/general';

export default function Toolbar({
  toolbarRef,
  hidden,
  audioEnabled,
  redIndicators,
  themeColor,
  setAudio,
  videoEnabled,
  setVideo,
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
}: {
  toolbarRef: React.RefObject<HTMLDivElement>;
  hidden?: HiddenSettings;
  audioEnabled: boolean;
  redIndicators?: boolean;
  themeColor: string;
  setAudio: Function;
  videoEnabled: boolean;
  setVideo: Function;
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
}) {
  const handleMute = (
    setAudio: Function,
    setLocalAudio: Function,
    localAudio?: MediaStreamTrack,
    dataChannel?: Map<string, RTCDataChannel>
  ) => {
    // console.log(localStream?.getAudioTracks(), audioEnabled);
    setAudio(audioEnabled => !audioEnabled);
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
    setVideo: Function,
    setLocalVideoText: Function,
    setLocalStream: Function,
    dataChannel?: Map<string, RTCDataChannel>,
    localStream?: MediaStream,
    disableLocalVidDrag?: boolean
  ) => {
    setVideo(videoEnabled => !videoEnabled);
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
        setLocalVideoText(disableLocalVidDrag ? '' : 'Drag Me');
      }
      setLocalStream(localStream);
    }
  };

  /* TODO: screen share

const handleSharing = (
       sharing: boolean,
       setSharing: Function,
       videoEnabled: boolean,
       setVideo: Function,
       setLocalVideoText: Function,
       disableLocalVidDrag: boolean | undefined
     ) => {
       // Handle swap video before video call is connected by checking that there's at least one peer connected
       if (!isConnected(connected)) {
         logger('You must join a call before you can screen share');
         return;
       }
       if (!sharing) {
         navigator.mediaDevices
           .getDisplayMedia({
             video: true,
             audio: true,
           })
           .then((stream: MediaStream) => {
             setSharing(true);
             if (stream.getAudioTracks()[0])
               stream.addTrack(stream.getAudioTracks()[0]);
             logger(stream.toString());
             handleSwitchStreamHelper(
               stream,
               videoEnabled,
               setVideo,
               VC,
               setLocalVideoText,
               disableLocalVidDrag
             );
             setLocalVideoText('Sharing Screen');
           })
           .catch((e: Event) => {
             // Request screen share, note: we can request to capture audio for screen sharing video content.
             logger('Error sharing screen' + e);
           });
       } else {
         // Stop the screen share video track. (We don't want to stop the audio track obviously.)
         (localVidRef.current?.srcObject as MediaStream)
           ?.getVideoTracks()
           .forEach((track: MediaStreamTrack) => track.stop());
         // Get webcam input
         navigator.mediaDevices
           .getUserMedia({
             video: true,
             audio: true,
           })
           .then(stream => {
             setSharing(false);
             handleSwitchStreamHelper(
               stream,
               videoEnabled,
               setVideo,
               VC,
               setLocalVideoText,
               disableLocalVidDrag
             );
             setLocalVideoText(disableLocalVidDrag ? '' : 'Drag Me');
           });
       }
     };

     // Swap current video track with passed in stream by getting current track, swapping video for each peer connection
     export function handleSwitchStreamHelper(
       stream: MediaStream,
       videoEnabled: boolean,
       setVideo: Function,
       setLocalVideoText: Function,
       disableLocalVidDrag: boolean | undefined
     ): void {
       let videoTrack = stream.getVideoTracks()[0];
       let audioTrack = stream.getAudioTracks()[0];

       connected.forEach(
         (value: boolean, key: string, map: Map<string, boolean>) => {
           if (connected.get(key)) {
             const sender = peerConnections
               ?.get(key)
               ?.getSenders()
               .find((s: any) => {
                 return s.track.kind === videoTrack.kind;
               });
             if (sender) sender.replaceTrack(videoTrack);
             if (stream.getAudioTracks()[0]) {
               logger('Audio track is' + audioTrack.toString());
               const sender2 = peerConnections
                 ?.get(key)
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
       // Update local video stream, local video object, unpause video on swap
       localStream = stream;
       localVidRef.current.srcObject = stream;
       if (!videoEnabled)
         handlePauseVideo(
           videoEnabled,
           setVideo,
           VC,
           setLocalVideoText,
           disableLocalVidDrag
         );
     } */

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
                  : `text-${redIndicators ? 'red' : themeColor}-500 dark:text-${
                      redIndicators ? 'red' : themeColor
                    }-500`
              } text-black dark:text-white cursor-pointer px-4 py-1 focus:border-0 focus:outline-none hover:text-${
                redIndicators ? 'red' : themeColor
              }-500 dark:hover:text-${
                redIndicators ? 'red' : themeColor
              }-500 not-selectable tooltip`}
              onClick={() => {
                handleMute(setAudio, setLocalAudio, localAudio, dataChannel);
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
                  : `text-${redIndicators ? 'red' : themeColor}-500 dark:text-${
                      redIndicators ? 'red' : themeColor
                    }-500`
              } text-black dark:text-white cursor-pointer px-4 py-1 focus:border-0 focus:outline-none hover:text-${
                redIndicators ? 'red' : themeColor
              }-500 dark:hover:text-${
                redIndicators ? 'red' : themeColor
              }-500 not-selectable tooltip`}
              onClick={() => {
                handlePauseVideo(
                  videoEnabled,
                  setVideo,
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
                // TODO: handleSharing(
                //   sharing,
                //   setSharing,
                //   videoEnabled,
                //   setVideo,
                //   setLocalVideoText,
                //   disableLocalVidDrag
                // );
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
                redIndicators ? 'red' : themeColor
              }-500 dark:hover:text-${
                redIndicators ? 'red' : themeColor
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
