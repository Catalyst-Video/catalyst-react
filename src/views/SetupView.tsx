import { createLocalVideoTrack, CreateVideoTrackOptions, LocalVideoTrack } from "livekit-client"
import React, { useRef, useEffect, useState, ReactElement } from "react"
import { faArrowAltCircleLeft, faArrowAltCircleRight } from "@fortawesome/free-solid-svg-icons";
import { RoomMetaData } from "../typings/interfaces";
import VidWrapper from "../components/wrapper/VidWrapper";
import AudioDeviceBtn from "../components/toolbar/AudioDeviceBtn";
import ToolbarButton from "../components/toolbar/ToolbarButton";
import VidDeviceBtn from "../components/toolbar/VidDeviceBtn";
import HeaderImg from "../components/header/HeaderImg";


const SetupView = ({
  meta,
  token,
  audioOn,
  videoOn,
  setAudioOn,
  setVideoOn,
  setReady,
  userName,
  setUserName,
}: {
  meta: RoomMetaData;
  token: string;
  audioOn: boolean;
  videoOn: boolean;
  setAudioOn: Function;
  setVideoOn: Function;
  setReady: Function;
  userName: string
  setUserName: Function;
}) => {
  const [videoTrack, setVideoTrack] = useState<LocalVideoTrack>();
  const [audioDevice, setAudioDevice] = useState<MediaDeviceInfo>();
  const [videoDevice, setVideoDevice] = useState<MediaDeviceInfo>();
  const videoRef = useRef<HTMLVideoElement>(null);

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
    if (!videoRef.current || !videoTrack) {
      return;
    }
    const videoEl = videoRef.current;
    videoTrack.attach(videoEl);
    return () => {
      videoTrack.detach(videoEl);
      videoTrack.stop();
    };
  }, [videoTrack, videoRef]);


  const toggleVideo = () => {
    if (videoTrack) {
      videoTrack.stop();
      setVideoOn(false);
      setVideoTrack(undefined);
    } else {
      const options: CreateVideoTrackOptions = {};
      if (videoDevice) {
        options.deviceId = videoDevice.deviceId;
      }
      createLocalVideoTrack(options).then(track => {
        setVideoOn(true);
        setVideoTrack(track);
      });
    }
  };

  useEffect(() => {
    // enable video by default
    createLocalVideoTrack().then(track => {
      setVideoOn(true);
      setVideoTrack(track);
    });
  }, []);

  const toggleAudio = () => {
    if (audioOn) {
      setAudioOn(false);
    } else {
      setAudioOn(true);
    }
  };

  const selectVideoDevice = (device: MediaDeviceInfo) => {
    setVideoDevice(device);
    if (videoTrack) {
      if (
        videoTrack.mediaStreamTrack.getSettings().deviceId === device.deviceId
      ) {
        return;
      }
      // stop video
      toggleVideo();
    }

    // start video with correct device
    toggleVideo();
  };

  const params: { [key: string]: string } = {
    token,
      videoEnabled: videoOn ? '1' : '0',
      audioEnabled: audioOn ? '1' : '0',
      simulcast: meta.simulcast ? '1' : '0',
  };
  if (audioDevice) {
    params.audioDeviceId = audioDevice.deviceId;
  }
  if (videoDevice) {
    params.videoDeviceId = videoDevice.deviceId;
  }

  let cstmBackground, showSetNameBox = true;

  return (
    <div
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
      //   ref={setupRoomRef}
    >
      <span id="setuproom-header" className="mx-2 mt-5">
        <HeaderImg />
      </span>

      <div
        id="setuproom-cont"
        className="flex-col flex-1 text-center mx-3 my-3 rounded-md flex justify-center"
      >
        <div
          id="setuproom-comp"
          className="dark:bg-gray-800 rounded-2xl my-2 mx-1 shadow-md bg-gray-700 z-10"
        >
          <div className="md:w-96 md:h-72 lg:h-full rounded-t-xl rounded-b-none z-1">
            {videoTrack ? (
              <VidWrapper track={videoTrack} isLocal={true} />
            ) : (
              <div className="min-h-0 min-w-0 rounded-lg h-auto w-full bg-gray-700"></div>
            )}
            {/* <video
              id="setuproom-samp-video"
              className="w-auto rounded-t-xl max-h-72 z-3"
              ref={testVideoRef}
              autoPlay
              muted
              playsInline
            />
          </div> */}
            {/* <AudioAnalyser audio={testStream} /> */}
            {showSetNameBox && (
              <div className="pt-4 w-full flex justify-center">
                <input
                  className="outline-none border-0 bg-gray-50 dark:bg-gray-700 rounded-2xl px-4 py-1 -mt-8 z-10 text-black dark:text-white text-center"
                  placeholder="Enter display name"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                ></input>
              </div>
            )}
            <div
              id="opts"
              className="flex flex-row justify-around items-center my-6"
            >
              <AudioDeviceBtn
                isMuted={!audioOn}
                onClick={toggleAudio}
                onSourceSelected={setAudioDevice}
              />
              <VidDeviceBtn
                isEnabled={videoTrack !== undefined}
                onClick={toggleVideo}
                onSourceSelected={selectVideoDevice}
              />
            </div>
            <button
              id="setuproom-but"
              className={`rounded-b-xl cursor-pointer block outline-none border-0 font-bold text-md h-14 text-white w-full focus:outline-none focus:border-0 bg-primary`}
              onClick={() => setReady(true)}
            >
              Join Call
            </button>
          </div>
        </div>
      </div>
    </div>
    // <div id="setupscreen" className="">
    //   <h2>LiveKit Video</h2>

    //   <div className="videoSection">
    //     {videoTrack && <VidWrapper track={videoTrack} isLocal={true} />}
    //   </div>

    //   <div className="controlSection">
    //     <div>
    //       <AudioDeviceBtn
    //         isMuted={!audioOn}
    //         onClick={toggleAudio}
    //         onSourceSelected={setAudioDevice}
    //       />
    //       <VidDeviceBtn
    //         isEnabled={videoTrack !== undefined}
    //         onClick={toggleVideo}
    //         onSourceSelected={selectVideoDevice}
    //       />
    //     </div>
    //     <div className="right">
    //       <ToolbarButton
    //         label="Connect"
    //         disabled={connectDisabled}
    //         icon={faArrowAltCircleRight}
    //         onClick={() => setReady(true)}
    //       />
    //     </div>
    //   </div>
    // </div>
  );
};
  export default SetupView