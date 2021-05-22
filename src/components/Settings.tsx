import {
  faCogs,
  faMicrophone,
  faMicrophoneSlash,
  faMoon,
  faSun,
  faVideo,
  faVideoSlash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { VideoChatData } from '../typings/interfaces';
import { handleMute, handlePauseVideo } from '../utils/stream';
import DeviceSelector from './DeviceSelector';

// TODO: changing input sources actually changes output

const Settings = ({
  themeColor,
  vidInput,
  audioInput,
  audioEnabled,
  videoEnabled,
  setAudio,
  setVideo,
  setAudioInput,
  setVidInput,
  setSettings,
  dark,
  setDark,
  VC,
  setLocalVideoText,
  disableLocalVidDrag,
}: {
  themeColor: string;
  vidInput?: MediaDeviceInfo;
  audioInput?: MediaDeviceInfo;
  setAudioInput: Function;
  setVidInput: Function;
  setSettings: Function;
  audioEnabled: boolean;
  videoEnabled: boolean;
  setAudio: Function;
  setVideo: Function;
  dark?: boolean;
  setDark?: Function;
  VC?: VideoChatData;
  setLocalVideoText: Function;
  disableLocalVidDrag?: boolean;
}) => {
  return (
    <div className="fixed z-30 inset-0 overflow-y-auto" role="dialog">
      <div className="flex items-center sm:items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div
                className={`mx-auto flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-${themeColor}-100 sm:mx-0 sm:h-10 sm:w-10`}
              >
                <FontAwesomeIcon icon={faCogs} size="lg"></FontAwesomeIcon>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3
                  className="text-lg leading-6 font-medium text-gray-900 dark:text-white"
                  id="modal-title"
                >
                  Catalyst Settings
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-100">
                    Customize Catalyst to your liking, enable Dark Mode, or
                    switch your media input devices.
                  </p>
                </div>
              </div>
            </div>
            <br />
            <div
              id="opts"
              className="flex justify-center items-center m-1 bg-white dark:bg-gray-800"
            >
              <div id="opt-mic" className="text-center text-base my-2 mr-5">
                <button
                  onClick={() => {
                    if (VC) handleMute(audioEnabled, setAudio, VC);
                  }}
                  className={`mx-auto h-16 w-16 relative flex justify-center items-center rounded-full border-2 border-gray cursor-pointer focus:outline-none focus:border-0 ${
                    !audioEnabled
                      ? 'bg-red-50 text-red-500'
                      : 'dark:text-gray-100 bg-gray-500'
                  }`}
                >
                  <FontAwesomeIcon
                    icon={audioEnabled ? faMicrophone : faMicrophoneSlash}
                    className="opt-icon "
                    size="lg"
                  />
                </button>
                <DeviceSelector
                  device={audioInput}
                  setDevice={setAudioInput}
                  type="audioinput"
                  defaultText="Microphone"
                />
                <span
                  className={`block text-xs uppercase font-bold text-${themeColor}-500`}
                >
                  {audioEnabled ? 'ON' : 'OFF'}
                </span>
              </div>
              <div id="opt-cam" className="text-center text-base my-2 ml-5">
                <button
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
                  className={`mx-auto h-16 w-16 relative flex justify-center items-center rounded-full border-2 border-gray cursor-pointer focus:outline-none focus:border-0 ${
                    !videoEnabled
                      ? 'bg-red-50 text-red-500'
                      : 'dark:text-gray-100 bg-gray-500'
                  }`}
                >
                  <FontAwesomeIcon
                    icon={videoEnabled ? faVideo : faVideoSlash}
                    className="opt-icon"
                    size="lg"
                  />
                </button>
                <DeviceSelector
                  device={vidInput}
                  setDevice={setVidInput}
                  type="videoinput"
                  defaultText="Camera"
                />
                <span
                  className={`block text-xs uppercase font-bold text-${themeColor}-500`}
                >
                  {videoEnabled ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          </div>
          <div className="w-full text-center mb-4 px-4 sm:px-0 bg-white dark:bg-gray-800">
            <button
              onClick={() => {
                if (setDark) setDark(!dark);
              }}
              type="button"
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-${themeColor}-600 text-base font-medium text-white hover:bg-${themeColor}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-400 focus:ring-${themeColor}-500 sm:ml-3 sm:w-auto sm:text-sm`}
            >
              <FontAwesomeIcon
                icon={dark ? faMoon : faSun}
                size="lg"
                className="mr-5 inline"
              />
              Dark Mode
            </button>
          </div>

          <div className="bg-gray-50 dark:bg-gray-600 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {/* <button
              onClick={() => setSettings(false)}
              type="button"
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-${themeColor}-600 text-base font-medium text-white hover:bg-${themeColor}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${themeColor}-500 sm:ml-3 sm:w-auto sm:text-sm`}
            >
              Close Settings
            </button> */}
            <button
              onClick={() => setSettings(false)}
              type="button"
              className={`mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white dark:bg-gray-300 text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${themeColor}-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm`}
            >
              Close Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Settings;
