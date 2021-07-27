import { createLocalVideoTrack, CreateVideoTrackOptions, LocalVideoTrack } from "livekit-client"
import React, { useRef, useEffect, useState } from "react"
import { RoomMetaData } from "../typings/interfaces";
import VidWrapper from "../components/wrapper/VidWrapper";
import AudioDeviceBtn from "../components/toolbar/AudioDeviceBtn";
import VidDeviceBtn from "../components/toolbar/VidDeviceBtn";
import HeaderImg from "../components/header/HeaderImg";


const SetupView = ({
  meta,
  audioOn,
  videoOn,
  setAudioOn,
  setVideoOn,
  setReady,
  userName,
  setUserName,
  cstmSetupBg,
  disableNameField,
}: {
  meta: RoomMetaData;
  audioOn: boolean;
  videoOn: boolean;
  setAudioOn: Function;
  setVideoOn: Function;
  setReady: Function;
  userName: string;
  setUserName: Function;
  cstmSetupBg?: string;
  disableNameField?: boolean;
}) => {
  const [videoTrack, setVideoTrack] = useState<LocalVideoTrack>();
  const [audioDevice, setAudioDevice] = useState<MediaDeviceInfo>();
  const [videoDevice, setVideoDevice] = useState<MediaDeviceInfo>();
  const videoRef = useRef<HTMLVideoElement>(null);

  //  TODO: determine bg gradient style
  //    const [gradient] = useState(`linear-gradient(217deg, hsla(${~~(
  //     360 * Math.random()
  //   )},70%,70%,0.8),hsla(${~~(360 * Math.random())},70%,70%,0.8) 70.71%),
  //               linear-gradient(127deg, hsla(${~~(
  //                 360 * Math.random()
  //               )},70%,70%,0.8),hsla(${~~(
  //     360 * Math.random()
  //   )},70%,70%,0.8) 70.71%),
  //             linear-gradient(336deg, hsla(${~~(
  //               360 * Math.random()
  //             )},70%,70%,0.8),hsla(${~~(
  //     360 * Math.random()
  //       )},70%,70%,0.8) 70.71%)`);

  const [gradient] = useState(
    `linear-gradient(217deg, hsla(356, 90%, 64%, 0.8), hsla(280, 78%, 69%, 0.8), hsla(191, 86%, 49%, 0.8))`
  );

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

  return (
    <div
      className="h-full w-full flex justify-between items-center flex-col flex-1"
      style={
        cstmSetupBg
          ? cstmSetupBg.length > 0
            ? { background: cstmSetupBg }
            : {
                background: '#f3f5fd', // TODO: dark/light theme
              }
          : {
              background: gradient,
            }
      }
    >
      <span id="setuproom-header" className="mx-2 mt-5">
        <HeaderImg color="text-white" />
      </span>

      <div
        id="setuproom-cont"
        className="flex-col flex-1 text-center mx-3 my-3 rounded-md flex justify-center"
      >
        <div
          id="setuproom-comp"
          className="dark:bg-gray-800 rounded-2xl my-2 mx-1 shadow-md z-10 overflow-hidden"
        >
          <div className="w-80 sm:w-96 lg:h-full rounded-t-xl bg-gray-700 rounded-b-none z-1">
            {videoTrack && videoOn ? (
              <VidWrapper track={videoTrack} isLocal={true} />
            ) : (
              <div
                className="min-h-0 min-w-0 rounded-lg h-52 w-full bg-black"
              ></div>
            )}
            {!disableNameField && (
              <div className="pt-4 w-full flex justify-center">
                <input
                  className="outline-none border-0 bg-gray-300 dark:bg-gray-700 rounded-2xl px-4 py-1 -mt-8 z-10 text-black dark:text-white text-center"
                  placeholder={'Display name'}
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                ></input>
              </div>
            )}
            <div
              id="opts"
              className="flex flex-row justify-around bg-gray-700 items-center my-6"
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
  );
};
  export default SetupView