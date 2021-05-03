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
  disableGradient,
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
  disableGradient?: boolean;
}) => {
  const permsRef = useRef<HTMLDivElement>(null);
  const testVideoRef = useRef<HTMLVideoElement>(null);

  const [testStream, setStream] = useState<MediaStream>();
  const [gradient] = useState(`linear-gradient(217deg, hsla(${~~(
    360 * Math.random()
  )},70%,70%,0.8),hsla(${~~(360 * Math.random())},70%,70%,0.8) 70.71%), 
              linear-gradient(127deg, hsla(${~~(
                360 * Math.random()
              )},70%,70%,0.8),hsla(${~~(
    360 * Math.random()
  )},70%,70%,0.8) 70.71%),
            linear-gradient(336deg, hsla(${~~(
              360 * Math.random()
            )},70%,70%,0.8),hsla(${~~(
    360 * Math.random()
  )},70%,70%,0.8) 70.71%)`);

  useEffect(() => {
    if (videoEnabled || audioEnabled) reqStream();
    if (
      permsRef &&
      permsRef.current?.parentNode?.parentNode?.nodeName === 'BODY'
    )
      permsRef.current.style.position = 'fixed';
  }, []);

  useEffect(() => {
    if (videoEnabled || audioEnabled) reqStream();
  }, [videoEnabled, audioEnabled]);

  useEffect(() => {
    if (videoEnabled || audioEnabled) reqStream();
  }, [vidInput, audioInput]);

  const reqStream = () => {
    let audioProp: boolean | { deviceId: string | undefined } = false;
    let videoProp: boolean | { deviceId: string | undefined } = false;
    if (audioEnabled) audioProp = { deviceId: audioInput?.deviceId };
    if (videoEnabled) videoProp = { deviceId: vidInput?.deviceId };
    navigator.mediaDevices
      .getUserMedia({
        audio: audioProp,
        video: videoProp,
      })
      .then(stream => {
        setPermissions(true);
        if (testVideoRef.current) testVideoRef.current.srcObject = stream;
        testStream?.getVideoTracks().forEach((track: MediaStreamTrack) => {
          track.enabled = false;
          track.stop();
        });
        testStream?.getAudioTracks().forEach((track: MediaStreamTrack) => {
          track.enabled = false;
          track.stop();
        });
        setStream(stream);
      })
      .catch(err => {
        logger(err);
      });
  };

  const joinCall = () => {
    setUserReady(true);
  };

  return (
    <div
      id="perms"
      className="h-full w-full flex justify-between items-center flex-col flex-1"
      style={
        disableGradient
          ? {
              background: '#f3f5fd', // TODO: dark/light theme
            }
          : {
              background: gradient,
            }
      }
      ref={permsRef}
    >
      <span id="cat-header" className="mx-2 mt-5">
        <HeaderImg themeColor={disableGradient ? themeColor : undefined} />
      </span>
      {/* TODO: determine if room name is desired
      {hasPerms && (
        <span id="welcome-msg" className="block text-lg my-3">
          Welcome to{' '}
          <span className={`font-semibold text-${themeColor}-500`}>
            {sessionKey}
          </span>
        </span>
      )} */}
      <div
        id="perms-cont"
        className="flex-col flex-1 text-center mx-3 my-3 rounded-md flex justify-center"
      >
        {hasPerms && (
          <div
            id="perms-comp"
            className="bg-white rounded-xl my-2 mx-1 shadow-md"
          >
            <div className="md:w-96 md:h-72 bg-gray-900 rounded-t-xl z-1">
              <video
                id="samp-video"
                className="w-auto rounded-t-xl max-h-72 z-3"
                ref={testVideoRef}
                autoPlay
                muted
                playsInline
              />
            </div>
            {/* <AudioAnalyser audio={testStream} /> */}

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
          <div className="h-full w-full flex flex-col content-evenly">
            <span
              id="perms-msg"
              className={`block m-auto text-xl  ${`text-${
                disableGradient ? `black` : `white`
              }`}`}
            >
              <span
                className={`text-${
                  disableGradient ? themeColor + `-500` : `white`
                } font-semibold text-2xl`}
              >
                Click “allow” above
              </span>
              <br />
              to give Catalyst camera and microphone access
              <br />
            </span>
            <a
              href="https://docs.catalyst.chat/docs-permissions"
              target="_blank"
              className={`text-base underline mb-4 mt-10 ${`text-${
                disableGradient ? `black` : `white`
              }`}`}
            >
              I need help!
            </a>
          </div>
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
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices)
      return;
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
      <button className="outline-none focus:outline-none px-3 bg-white rounded-sm flex items-center min-w-32">
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

const AudioAnalyser = ({ audio }: { audio?: MediaStream }) => {
  const [audioData, setAudioData] = useState(new Uint8Array(0));
  const [analyser, setAnalyzer] = useState<AnalyserNode>();
  const [dataArray, setDataArray] = useState<Uint8Array>();
  const [rafId, setRaf] = useState<number>();
  const [source, setSource] = useState<MediaStreamAudioSourceNode>();

  useEffect(() => {
    // cancelAudioVisual();
    if (audio && audio?.getAudioTracks()?.length > 0) {
      let audioContext = new window.AudioContext();
      let anal = audioContext.createAnalyser();
      setAnalyzer(anal);
      let data = new Uint8Array(anal.frequencyBinCount);
      setDataArray(data);
      let so: MediaStreamAudioSourceNode;
      so = audioContext.createMediaStreamSource(audio);
      setSource(so);
      so.connect(anal);
      tick();

      return () => {
        cancelAnimationFrame(rafId ?? 0);
        anal?.disconnect();
        so?.disconnect();
      };
    }
    return () => {};
  }, [audio]);

  const cancelAudioVisual = () => {
    cancelAnimationFrame(rafId ?? 0);
    analyser?.disconnect();
    source?.disconnect();
  };

  const tick = () => {
    if (analyser && dataArray) {
      analyser.getByteTimeDomainData(dataArray);
      setAudioData(dataArray);
      setRaf(requestAnimationFrame(tick));
    }
  };

  return <AudioVisualizer audioData={audioData} />;
};

const AudioVisualizer = ({ audioData }: { audioData: Uint8Array }) => {
  const audioCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    draw();
  }, [audioData]);

  const draw = () => {
    const canvas = audioCanvasRef.current;
    const context = canvas?.getContext('2d');
    if (canvas && context) {
      const height = canvas.height;
      const width = canvas.width;
      let x = 0;
      const sliceWidth = (width * 1.0) / audioData.length;
      context.lineWidth = 2;
      context.strokeStyle = '#000';
      context.clearRect(0, 0, width, height);
      context.beginPath();
      context.moveTo(0, height / 2);
      for (const item of audioData) {
        const y = (item / 255.0) * height;
        context.lineTo(x, y);
        x += sliceWidth;
      }
      context.lineTo(x, height / 2);
      context.stroke();
    }
  };

  return <canvas className="w-full h-20 z-5" ref={audioCanvasRef} />;
};
