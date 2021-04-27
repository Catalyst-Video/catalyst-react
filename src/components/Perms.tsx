import {
  faMicrophone,
  faMicrophoneSlash,
  faVideo,
  faVideoSlash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useRef, useState } from 'react';
import { logger } from '../utils/general';
import HeaderImg from './HeaderImg';

const PermsComponent = ({
  sessionKey,
  hasPerms,
  setPermissions,
  setUserReady,
  audioEnabled,
  videoEnabled,
  setAudio,
  setVideo,
  themeColor,
  audioInput,
  vidInput,
  setAudioInput,
  setVidInput,
}: {
  sessionKey: string;
  hasPerms: boolean;
  setPermissions: Function;
  setUserReady: Function;
  audioEnabled: boolean;
  videoEnabled: boolean;
  setAudio: Function;
  setVideo: Function;
  themeColor: string;
  audioInput?: MediaDeviceInfo;
  vidInput?: MediaDeviceInfo;
  setAudioInput: Function;
  setVidInput: Function;
}) => {
  const permsRef = useRef<HTMLDivElement>(null);
  const testVideoRef = useRef<HTMLVideoElement>(null);
  const [testStream, setStream] = useState<MediaStream>();

  useEffect(() => {
    if (videoEnabled) reqStream();
    if (
      permsRef &&
      permsRef.current?.parentNode?.parentNode?.nodeName === 'BODY'
    )
      permsRef.current.style.position = 'fixed';
  }, []);

  useEffect(() => {
    if (!videoEnabled) endStream();
  }, [videoEnabled]);

  useEffect(() => {
    endStream();
    if (videoEnabled) reqStream();
  }, [vidInput, audioInput]);

  const reqStream = () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: { deviceId: audioInput?.deviceId },
        video: { deviceId: vidInput?.deviceId },
      })
      .then(stream => {
        setPermissions(true);
        if (testVideoRef.current) testVideoRef.current.srcObject = stream;
        setStream(stream);
      })
      .catch(err => {
        logger(err);
      });
  };

  const endStream = () => {
    if (testVideoRef.current && testVideoRef.current.srcObject)
      testStream?.getVideoTracks().forEach((track: MediaStreamTrack) => {
        track.enabled = false;
        track.stop();
      });
  };

  const joinCall = () => {
    setUserReady(true);
  };

  return (
    <div
      id="perms"
      className="h-full w-full flex justify-center items-center flex-col flex-1"
      style={{
        background: '#f3f5fd', // TODO: dark/light theme
      }}
      ref={permsRef}
    >
      <span id="cat-header" className="mx-2">
        <HeaderImg themeColor={themeColor} />
      </span>
      {hasPerms && (
        <span id="welcome-msg" className="block text-lg mt-10 mb-4">
          Welcome to{' '}
          <span className={`font-semibold text-${themeColor}-500`}>
            {sessionKey}
          </span>
        </span>
      )}
      <div
        id="perms-cont"
        className="flex-col text-center mx-3 my-3 rounded-md flex justify-center"
      >
        {hasPerms && (
          <div id="perms-comp" className="bg-white rounded-xl my-2 mx-1">
            <div className="md:w-96 md:h-72 bg-gray-900 rounded-t-xl">
              <video
                id="samp-video"
                className="w-auto rounded-t-xl max-h-72"
                ref={testVideoRef}
                autoPlay
                muted
                playsInline
              />
            </div>

            <div id="opts" className="flex justify-center items-center m-1">
              <div id="opt-mic" className="text-center text-base my-2 mr-5">
                <button
                  onClick={() => setAudio(!audioEnabled)}
                  className={`mx-auto h-16 w-16 relative flex justify-center items-center rounded-full border-2 border-gray cursor-pointer focus:outline-none focus:border-0 ${
                    !audioEnabled ? 'bg-red-50 text-red-500' : ''
                  }`}
                >
                  <FontAwesomeIcon
                    icon={audioEnabled ? faMicrophone : faMicrophoneSlash}
                    className="opt-icon"
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
                    if (!videoEnabled) reqStream();
                    setVideo(!videoEnabled);
                  }}
                  className={`mx-auto h-16 w-16 relative flex justify-center items-center rounded-full border-2 border-gray cursor-pointer focus:outline-none focus:border-0 ${
                    !videoEnabled ? 'bg-red-50 text-red-500' : ''
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
            <button
              id="perms-but"
              className={`rounded-b-xl cursor-pointer block outline-none border-0 font-bold text-md h-14 text-white w-full focus:outline-none focus:border-0 bg-${themeColor}-500`}
              onClick={() => joinCall()}
            >
              Join Call
            </button>
          </div>
        )}

        {!hasPerms && (
          <>
            <span id="perms-msg" className="block m-auto text-xl m-auto">
              <span className={`text-${themeColor}-500 font-semibold text-2xl`}>
                Click “allow” above
              </span>
              <br />
              to give Catalyst camera and microphone access
              <br />
            </span>
            <a
              href="https://docs.catalyst.chat/docs-permissions"
              target="_blank"
              className="text-base underline mt-10"
            >
              I need help!
            </a>
          </>
        )}
      </div>
    </div>
  );
};
export default PermsComponent;

const DeviceSelector = ({
  device,
  setDevice,
  type,
  defaultText,
}: {
  device?: MediaDeviceInfo;
  setDevice: Function;
  type: string;
  defaultText: string;
}) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>();

  useEffect(() => {
    setMediaDevices();
  }, []);

  const setMediaDevices = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.log('enumerateDevices() not supported.');
      return;
    }
    navigator.mediaDevices
      .enumerateDevices()
      .then(devs => {
        let typedDevs: MediaDeviceInfo[] = [];
        devs.forEach(device => {
          if (device.kind.toString() === type) typedDevs.push(device);
        });
        setDevices(typedDevs);
      })
      .catch(err => {
        logger(err.name + ': ' + err.message);
      });
  };

  return (
    <div id="opt" className="group inline-block my-1">
      <button className="outline-none focus:outline-none border px-3 py-1 bg-white rounded-sm flex items-center min-w-32">
        <span
          className="pr-1 text-base flex-1 truncate"
          style={{ maxWidth: '7rem' }}
        >
          {device?.label.substring(0, device.label.indexOf(' (')) ??
            defaultText}
        </span>
        <span>
          <svg
            className="fill-current h-4 w-4 transform group-hover:-rotate-180
        transition duration-150 ease-in-out"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </span>
      </button>

      <ul
        className="bg-white border rounded-sm transform scale-0 group-hover:scale-100 absolute 
  transition duration-150 ease-in-out origin-top min-w-32 cursor-pointer"
      >
        {devices?.map(dev => {
          return (
            <li
              onClick={() => setDevice(dev)}
              className="rounded-sm px-3 py-1 hover:bg-gray-100 cursor-pointer"
            >
              {dev.label.substring(0, dev.label.indexOf(' ('))}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
