import { createLocalAudioTrack, createLocalVideoTrack, CreateVideoTrackOptions, LocalVideoTrack } from "livekit-client"
import React, { useRef, useEffect, useState } from "react"
import { RoomMetaData } from "../typings/interfaces";
import VidWrapper from "../components/wrapper/VidWrapper";
import AudioDeviceBtn from "../components/toolbar/AudioDeviceBtn";
import VidDeviceBtn from "../components/toolbar/VidDeviceBtn";
import HeaderImg from "../components/header/HeaderImg";
import { useCookies } from "react-cookie";


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
  const [cookies, setCookies] = useCookies([
    'PREFERRED_AUDIO_DEVICE_ID',
    'PREFERRED_VIDEO_DEVICE_ID',
    'PREFERRED_OUTPUT_DEVICE_ID',
  ]);
  const [audioDevice, setAudioDevice] = useState<MediaDeviceInfo>();
  const [videoDevice, setVideoDevice] = useState<MediaDeviceInfo>();
  const [outputDevice, setOutputDevice] = useState<MediaDeviceInfo>()
  const videoRef = useRef<HTMLVideoElement>(null);

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
      // setVideoOn(false);
      setVideoTrack(undefined);
    } else {
      const options: CreateVideoTrackOptions = {};
      if (videoDevice) {
        options.deviceId = videoDevice.deviceId;
      }
      createLocalVideoTrack(options).then(track => {
        // setVideoOn(true);
        setVideoTrack(track);
      });
    }
  };

  useEffect(() => {
      if (!outputDevice) {
        navigator.mediaDevices.enumerateDevices().then(devices => {
          const outputDevices = devices.filter(
            id => id.kind === 'audiooutput' && id.deviceId
          );
          if (cookies.PREFERRED_OUTPUT_DEVICE_ID) {
              let outDevice = outputDevices.find(
                d => d.deviceId === cookies.PREFERRED_OUTPUT_DEVICE_ID
              );
            setOutputDevice(outDevice);
          } else {
            setOutputDevice(outputDevices[0]);
          }
        });
      }
        // if (cookies.PREFERRED_VIDEO_DEVICE_ID) {
        //     navigator.mediaDevices.map((d) => d.kind === cookies.PREFERRED_VIDEO_DEVICE_ID)
        // }
        // TODO: if media device changed in setup screen change it in real call 
      if(videoOn)
          createLocalVideoTrack().then(track => {
            // setVideoOn(true);
            setVideoTrack(track);
          });
  }, []);

  const toggleAudio = () => {
    setAudioOn(aud => !aud);
  };

   const selectVideoDevice = (device: MediaDeviceInfo) => {
     if (videoTrack) {
         if (
             videoTrack.mediaStreamTrack.getSettings().deviceId === device.deviceId
         ) {
             return;
         } else {
           setVideoDevice(device);
            setCookies('PREFERRED_VIDEO_DEVICE_ID', device.deviceId, {
              expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
            });
         }
     }
   };

useEffect(() => {
    if (audioDevice) {
    createLocalAudioTrack({ deviceId: audioDevice.deviceId })
        .then(track => {
          // setAudioOn(true);
          setCookies('PREFERRED_AUDIO_DEVICE_ID', audioDevice.deviceId, {
              expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
          });
        }).catch((err: Error) => {
        console.log(err);
        });
    }
}, [audioDevice]);

useEffect(() => {
    if (videoDevice) {
        createLocalVideoTrack({ deviceId: videoDevice.deviceId })
            .then((track: LocalVideoTrack) => {
                // setVideoOn(true);
                setVideoTrack(track);
            })
        .catch((err: Error) => {
        console.log(err);
        });
    }
}, [videoDevice]);

 useEffect(() => {
   if (!audioDevice || !videoDevice) {

     navigator.mediaDevices.enumerateDevices().then(devices => {
       // TODO: allow testing of audio devices
       if (!audioDevice) {
         const audioDevices = devices.filter(
           id => id.kind === 'audioinput' && id.deviceId
         );
         if (cookies.PREFERRED_AUDIO_DEVICE_ID) {
           let audDevice = audioDevices.find(
             d => d.deviceId === cookies.PREFERRED_AUDIO_DEVICE_ID
           );
           setAudioDevice(audDevice);
         } else {
           setAudioDevice(audioDevices[0]);
           setCookies(
             'PREFERRED_AUDIO_DEVICE_ID',
             audioDevices[0].deviceId,
             {
               expires: new Date(Date.now() + 1 * 60 * 60 * 24 * 365),
             }
           );
        
           //  let defaultAudDevice = audioDevices.find(
           //    d =>
           //      d.deviceId ===
           //    audioTrack?.mediaStreamTrack.getSettings().deviceId
           //  );
          //      setCookies(
          //        'PREFERRED_AUDIO_DEVICE_ID',
          //        defaultVidDevice.deviceId,
          //        {
          //          expires: new Date(Date.now() + 1 * 60 * 60 * 24 * 365),
          //        }
          //      );
          //    }
          //  setAudioDevice(defaultAudDevice);
         }
       }
       if (!videoDevice) {
          const videoDevices = devices.filter(
            id => id.kind === 'videoinput' && id.deviceId
          );
         if (cookies.PREFERRED_VIDEO_DEVICE_ID) {
            let vidDevice = videoDevices.find(
              d => d.deviceId === cookies.PREFERRED_VIDEO_DEVICE_ID
           );
            setVideoDevice(vidDevice);
         } else {
        
           let defaultVidDevice = videoDevices.find(
             d =>
               d.deviceId ===
               videoTrack?.mediaStreamTrack.getSettings().deviceId
           );
           if (defaultVidDevice) {
             setVideoDevice(defaultVidDevice);
             if (!cookies.PREFERRED_VIDEO_DEVICE_ID) {
               setCookies(
                 'PREFERRED_VIDEO_DEVICE_ID',
                 defaultVidDevice.deviceId,
                 {
                   expires: new Date(Date.now() + 1 * 60 * 60 * 24 * 365),
                 }
               );
             }
           }
         }
    
           
       }
     });
   }
 }, [videoTrack]);

  const updateOutputDevice = (device: MediaDeviceInfo) => {
    setOutputDevice(device);
    setCookies('PREFERRED_OUTPUT_DEVICE_ID', device.deviceId, {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    });
  };

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
          className="dark:bg-gray-800 rounded-2xl my-2 mx-1z-10 overflow-hidden" // shadow-md
        >
          <div className="w-80 sm:w-96 lg:h-full rounded-t-xl bg-secondary rounded-b-none z-1">
            {videoTrack && videoOn ? (
              <VidWrapper track={videoTrack} isLocal={true} />
            ) : (
              <div className="min-h-0 min-w-0 rounded-lg h-52 w-full bg-black"></div>
            )}
            {!disableNameField && (
              <div className="pt-4 w-full flex justify-center">
                <input
                  className="outline-none border-0 bg-gray-300 dark:bg-secondary rounded-2xl px-4 py-1 -mt-8 z-10 text-black dark:text-white text-center"
                  placeholder={'Display name'}
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                ></input>
              </div>
            )}
            <div
              id="opts"
              className="flex flex-row justify-around bg-secondary items-center my-6"
            >
              <AudioDeviceBtn
                isMuted={!audioOn}
                onClick={toggleAudio}
                onIpSourceSelected={setAudioDevice}
                onOpSourceSelected={updateOutputDevice}
                audioDevice={audioDevice}
                outputDevice={outputDevice}
              />
              <VidDeviceBtn
                isEnabled={videoTrack !== undefined}
                onClick={toggleVideo}
                videoDevice={videoDevice}
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