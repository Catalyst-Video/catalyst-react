/*  Catalyst Scientific Video Chat Component File
Copyright (C) 2021 Catalyst Scientific LLC, Seth Goldin & Joseph Semrai

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version. 

While this code is open-source, you may not use your own version of this
program commerically for free (whether as a business or attempting to sell a variation
of Catalyst for a profit). If you are interested in using Catalyst in an 
enterprise setting, please either visit our website at https://catalyst.chat 
or contact us for more information.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

You can contact us for more details at support@catalyst.chat. */

import {
  createLocalAudioTrack,
  createLocalVideoTrack,
  CreateVideoTrackOptions,
  LocalVideoTrack,
} from 'livekit-client';
import React, { useRef, useEffect, useState } from 'react';
import { RoomMetaData } from '../typings/interfaces';
import VidWrapper from '../components/wrapper/VidWrapper';
import AudioDeviceBtn from '../components/toolbar/AudioDeviceBtn';
import VidDeviceBtn from '../components/toolbar/VidDeviceBtn';
import HeaderImg from '../components/header/HeaderImg';

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
  const [outputDevice, setOutputDevice] = useState<MediaDeviceInfo>();
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

  useEffect(() => {
    if ((!outputDevice || !audioDevice || !videoDevice) && localStorage) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        if (!outputDevice) {
          const outputDevices = devices.filter(
            id => id.kind === 'audiooutput' && id.deviceId
          );
          if (localStorage.getItem('PREFERRED_OUTPUT_DEVICE_ID')) {
            let outDevice = outputDevices.find(
              d =>
                d.deviceId ===
                localStorage.getItem('PREFERRED_OUTPUT_DEVICE_ID')
            );
            setOutputDevice(outDevice);
          } else {
            setOutputDevice(outputDevices[0]);
            localStorage.set(
              'PREFERRED_OUTPUT_DEVICE_ID',
              outputDevices[0].deviceId
            );
          }
        }

        if (!audioDevice) {
          const audioDevices = devices.filter(
            id => id.kind === 'audioinput' && id.deviceId
          );
          if (localStorage.getItem('PREFERRED_AUDIO_DEVICE_ID')) {
            let audDevice = audioDevices.find(
              d =>
                d.deviceId === localStorage.getItem('PREFERRED_AUDIO_DEVICE_ID')
            );
            setAudioDevice(audDevice);
          } else {
            setAudioDevice(audioDevices[0]);
            localStorage.setItem(
              'PREFERRED_AUDIO_DEVICE_ID',
              audioDevices[0].deviceId
            );
          }
        }
        if (!videoDevice) {
          const videoDevices = devices.filter(
            id => id.kind === 'videoinput' && id.deviceId
          );
          if (localStorage.getItem('PREFERRED_VIDEO_DEVICE_ID')) {
            let vidDevice = videoDevices.find(
              d =>
                d.deviceId === localStorage.getItem('PREFERRED_VIDEO_DEVICE_ID')
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
              if (!localStorage.getItem('PREFERRED_VIDEO_DEVICE_ID')) {
                localStorage.setItem(
                  'PREFERRED_VIDEO_DEVICE_ID',
                  defaultVidDevice.deviceId
                );
              }
            }
          }
        }
      });
    }
    if (videoOn) {
      createLocalVideoTrack().then(track => {
        setVideoTrack(track);
      });
    }
  }, []);

  useEffect(() => {
    if (audioDevice) {
      createLocalAudioTrack({ deviceId: audioDevice.deviceId })
        .then(track => {
          localStorage.setItem(
            'PREFERRED_AUDIO_DEVICE_ID',
            audioDevice.deviceId
          );
        })
        .catch((err: Error) => {
          console.log(err);
        });
    }
  }, [audioDevice]);

  useEffect(() => {
    if (videoDevice) {
      createLocalVideoTrack({ deviceId: videoDevice.deviceId })
        .then((track: LocalVideoTrack) => {
          setVideoTrack(track);
        })
        .catch((err: Error) => {
          console.log(err);
        });
    }
  }, [videoDevice]);

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
        localStorage.setItem('PREFERRED_VIDEO_DEVICE_ID', device.deviceId);
      }
    }
  };

  const toggleVideo = () => {
    if (videoTrack) {
      videoTrack.stop();
      setVideoTrack(undefined);
    } else {
      const options: CreateVideoTrackOptions = {};
      if (videoDevice) {
        options.deviceId = videoDevice.deviceId;
      }
      createLocalVideoTrack(options).then(track => {
        setVideoTrack(track);
      });
    }
  };

  const updateOutputDevice = (device: MediaDeviceInfo) => {
    setOutputDevice(device);
    localStorage.setItem('PREFERRED_OUTPUT_DEVICE_ID', device.deviceId);
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
        <HeaderImg color="text-white dark:text-black" />
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
                  className="outline-none border-0 bg-gray-300 dark:bg-secondary rounded-2xl px-4 py-1 -mt-8 z-10 text-black dark:text-black text-center"
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
                onIpSelected={setAudioDevice}
                onOpSelected={updateOutputDevice}
                audioDevice={audioDevice}
                outputDevice={outputDevice}
              />
              <VidDeviceBtn
                isEnabled={videoTrack !== undefined}
                onClick={toggleVideo}
                videoDevice={videoDevice}
                onIpSelected={selectVideoDevice}
              />
            </div>
            <button
              id="setuproom-but"
              className={`rounded-b-xl cursor-pointer block outline-none border-0 font-bold text-md h-14 text-white dark:text-black w-full focus:outline-none focus:border-0 bg-primary`}
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
export default SetupView;
