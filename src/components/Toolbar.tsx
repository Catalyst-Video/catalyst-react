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
import { HiddenSettings, VideoChatData } from '../typings/interfaces';
import { handleMute, handlePauseVideo, handleSharing } from '../utils/stream';

export default function Toolbar({
  toolbarRef,
  hidden,
  audioEnabled,
  redIndicators,
  themeColor,
  VC,
  setAudio,
  videoEnabled,
  setVideo,
  setLocalVideoText,
  disableLocalVidDrag,
  fsHandle,
  showChat,
  setShowChat,
  unseenChats,
  sharing,
  setSharing,
  cstmOptionBtns,
  onEndCall,
}: {
  toolbarRef: React.RefObject<HTMLDivElement>;
  hidden: HiddenSettings | undefined;
  audioEnabled: boolean;
  redIndicators: boolean | undefined;
  themeColor: string;
  VC: VideoChatData | undefined;
  setAudio: Function;
  videoEnabled: boolean;
  setVideo: Function;
  setLocalVideoText: React.Dispatch<React.SetStateAction<string>>;
  disableLocalVidDrag: boolean | undefined;
  fsHandle;
  showChat: boolean;
  setShowChat: React.Dispatch<React.SetStateAction<boolean>>;
  unseenChats: number;
  sharing: boolean;
  setSharing: React.Dispatch<React.SetStateAction<boolean>>;
  cstmOptionBtns: JSX.Element[] | undefined;
  onEndCall: Function | undefined;
}) {
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
                if (VC) handleMute(audioEnabled, setAudio, VC);
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
              }}
            >
              <span className="hidden pointer-events-none text-white bg-gray-500 dark:bg-gray-700 font-semibold absolute p-2 rounded-xl top-0 left-12 z-10 whitespace-nowrap text-sm">
                {showChat ? 'Hide Chat' : 'Show Chat'}
              </span>
              <FontAwesomeIcon icon={faComment} />
              {!showChat && unseenChats !== 0 && (
                <i
                  id="chat-indicator"
                  className={`absolute top-0 right-0 z-0 not-italic text-white bg-${themeColor}-500 rounded-full text-sm px-2 opacity-90 `}
                  aria-valuetext={unseenChats.toString()}
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
