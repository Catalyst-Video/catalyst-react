import {
  faMicrophone,
  faMicrophoneSlash,
  faVideo,
  faVideoSlash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useRef, useState } from 'react';
import { logger } from '../utils/general';
import DeviceSelector from './DeviceSelector';
import HeaderImg from './HeaderImg';

const SetupRoom = ({
  sessionKey,
  setUserReady,
  audioEnabled,
  videoEnabled,
  setAudioEnabled,
  setVideoEnabled,
  themeColor,
  audInput,
  vidInput,
  setAudInput,
  setVidInput,
  cstmBackground,
  setLocalName,
}: {
  sessionKey: string;
  setUserReady: Function;
  audioEnabled: boolean;
  videoEnabled: boolean;
  setAudioEnabled: Function;
  setVideoEnabled: Function;
  themeColor: string;
  audInput?: MediaDeviceInfo;
  vidInput?: MediaDeviceInfo;
  setAudInput: Function;
  setVidInput: Function;
  cstmBackground?: string;
  setLocalName: Function;
}) => {
  const setupRoomRef = useRef<HTMLDivElement>(null);
  const testVideoRef = useRef<HTMLVideoElement>(null);

  const [nameBox, setNameBox] = useState('');
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
    if (
      setupRoomRef &&
      setupRoomRef.current?.parentNode?.parentNode?.nodeName === 'BODY'
    )
      setupRoomRef.current.style.position = 'fixed';
  }, []);

  useEffect(() => {
    reqStream();
  }, [vidInput, audInput, videoEnabled, audioEnabled]);

  const reqStream = () => {
    testStream?.getVideoTracks().forEach((track: MediaStreamTrack) => {
      track.enabled = false;
      track.stop();
    });
    testStream?.getAudioTracks().forEach((track: MediaStreamTrack) => {
      track.enabled = false;
      track.stop();
    });
    if (videoEnabled || audioEnabled) {
      let audioProp: boolean | { deviceId: string | undefined } = false;
      let videoProp: boolean | { deviceId: string | undefined } = false;
      if (audioEnabled) audioProp = { deviceId: audInput?.deviceId };
      if (videoEnabled) videoProp = { deviceId: vidInput?.deviceId };
      navigator.mediaDevices
        .getUserMedia({
          audio: audioProp,
          video: videoProp,
        })
        .then(stream => {
          if (testVideoRef.current) testVideoRef.current.srcObject = stream;
          setStream(stream);
        })
        .catch(err => {
          logger(err);
        });
    }
  };

  const joinCall = () => {
    setLocalName(nameBox);
    setUserReady(true);
  };

  return (
    <div
      id="setuproom"
      className="h-full w-full flex justify-between items-center flex-col flex-1"
      style={
        cstmBackground
          ? cstmBackground.length > 0
            ? { background: cstmBackground }
            : {
                background: '#f3f5fd', // TODO: dark/light theme
              }
          : {
              background: gradient,
            }
      }
      ref={setupRoomRef}
    >
      <span id="setuproom-header" className="mx-2 mt-5">
        <HeaderImg
          themeColor={
            cstmBackground
              ? cstmBackground.length > 0
                ? 'white'
                : themeColor
              : 'white'
          }
        />
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
        id="setuproom-cont"
        className="flex-col flex-1 text-center mx-3 my-3 rounded-md flex justify-center"
      >
        <div
          id="setuproom-comp"
          className="bg-white rounded-2xl my-2 mx-1 shadow-md"
        >
          <div className="md:w-96 md:h-72 bg-gray-900 rounded-t-xl z-1">
            <video
              id="setuproom-samp-video"
              className="w-auto rounded-t-xl max-h-72 z-3"
              ref={testVideoRef}
              autoPlay
              muted
              playsInline
            />
          </div>
          {/* <AudioAnalyser audio={testStream} /> */}
          <div className="pt-4 w-full flex justify-center">
            <input
              className="outline-none border-0 bg-gray-50 rounded-2xl px-4 py-1 -mt-8 z-10 text-black dark:text-white text-center"
              placeholder="Enter display name"
              value={nameBox}
              onChange={e => setNameBox(e.target.value)}
            ></input>
          </div>
          <div id="opts" className="flex justify-center items-center m-1">
            <div id="opt-mic" className="text-center text-base mb-2 mr-5">
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
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
                device={audInput}
                setDevice={setAudInput}
                type="audInput"
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
                  // if (!videoEnabled) reqStream();
                  setVideoEnabled(!videoEnabled);
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
            id="setuproom-but"
            className={`rounded-b-xl cursor-pointer block outline-none border-0 font-bold text-md h-14 text-white w-full focus:outline-none focus:border-0 bg-${themeColor}-500`}
            onClick={() => joinCall()}
          >
            Join Call
          </button>
        </div>
      </div>
    </div>
  );
};
export default SetupRoom;

const AudioAnalyser = ({ audio }: { audio?: MediaStream }) => {
  const [audioData, setAudioEnabledData] = useState(new Uint8Array(0));
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
      setAudioEnabledData(dataArray);
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
