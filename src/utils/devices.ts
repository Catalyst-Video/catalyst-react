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
  LocalAudioTrack,
  LocalVideoTrack,
  Room,
  TrackPublication,
  VideoPresets,
} from 'catalyst-lk-client';
// import { isMobile } from 'react-device-detect';
import { BackgroundFilter } from '../typings/interfaces';

export async function initOutputDevice(
  outDeviceId: string,
  setOutputDevice: (device: MediaDeviceInfo) => void,
  setOutDId: (deviceId: string) => void
): Promise<void> {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const outputDevices = devices.filter(
    id => id.kind === 'audiooutput' && id?.deviceId
  );
  let outDevice: MediaDeviceInfo | undefined;
  if (outDeviceId) {
    outDevice = outputDevices.find(d => d?.deviceId === outDeviceId);
  }
  if (!outDevice) {
    outDevice = outputDevices[0];
  }
  setOutputDevice(outDevice);
  if (outDeviceId !== outDevice?.deviceId && outDevice?.deviceId) {
    setOutDId(outDevice?.deviceId);
  }
}

export async function initAudioVideoDevices(
  setAudioDevice: Function,
  setVideoDevice: Function,
  audio?: TrackPublication,
  video?: TrackPublication,
  audioDevice?: MediaDeviceInfo,
  videoDevice?: MediaDeviceInfo,
  audioDeviceId?: string,
  videoDeviceId?: string
): Promise<void> {
  if (!audioDevice || !videoDevice) {
    const devices = await navigator.mediaDevices.enumerateDevices();
    if (!audioDevice) {
      const audioDevices = devices.filter(
        id => id.kind === 'audioinput' && id.deviceId
      );
      let defaultAudDevice: MediaDeviceInfo | undefined;
      if (audioDeviceId) {
        defaultAudDevice = audioDevices.find(d => d.deviceId === audioDeviceId);
      }
      if (!defaultAudDevice) {
        defaultAudDevice =
          audioDevices.find(
            d =>
              d.deviceId ===
              audio?.audioTrack?.mediaStreamTrack.getSettings().deviceId
          ) ?? audioDevices[0];
      }
      setAudioDevice(defaultAudDevice);
    }
    if (!videoDevice) {
      const videoDevices = devices.filter(
        id => id.kind === 'videoinput' && id.deviceId
      );
      let defaultVidDevice: MediaDeviceInfo | undefined;
      if (videoDeviceId) {
        defaultVidDevice = videoDevices.find(d => d.deviceId === videoDeviceId);
      }
      if (!defaultVidDevice) {
        defaultVidDevice =
          videoDevices.find(
            d =>
              d.deviceId ===
              video?.videoTrack?.mediaStreamTrack.getSettings().deviceId
          ) ?? videoDevices[0];
      }
      setVideoDevice(defaultVidDevice);
    }
  }
}

export async function reInitAudioDevice(
  room: Room,
  setAudioDeviceId: (deviceId: string) => void,
  audio?: TrackPublication,
  audioDevice?: MediaDeviceInfo,
  audioDeviceId?: string
) {
  if (
    audioDevice &&
    audioDevice?.deviceId !==
      audio?.audioTrack?.mediaStreamTrack.getSettings().deviceId &&
    audioDevice?.deviceId !== audioDeviceId
  ) {
    setAudioDeviceId(audioDevice?.deviceId);
    const track = await createLocalAudioTrack({
      deviceId: audioDevice?.deviceId,
    });
    if (audio) unpublishTrack(audio.track as LocalAudioTrack);
    room.localParticipant.publishTrack(track);
  }
}

export async function reInitVideoDevice(
  room: Room,
  setVideoDeviceId: (deviceId: string) => void,
  video?: TrackPublication,
  videoDevice?: MediaDeviceInfo,
  videoDeviceId?: string,
  bgRemovalEffect?: string,
  bgFilter?: BackgroundFilter
) {
  if (
    videoDevice &&
    videoDevice?.deviceId !==
      video?.videoTrack?.mediaStreamTrack.getSettings() &&
    videoDevice?.deviceId !== videoDeviceId
  ) {
    setVideoDeviceId(videoDevice?.deviceId);
    let newTrack: LocalVideoTrack | MediaStreamTrack;
    newTrack = await createLocalVideoTrack({
      deviceId: videoDevice?.deviceId,
    });
    if (video) unpublishTrack(video.track as LocalVideoTrack);
    room.localParticipant.publishTrack(newTrack);
  }
}

export async function startScreenShare(room: Room, setSpeakerMode: Function) {
  navigator.mediaDevices
    // @ts-ignore
    .getDisplayMedia({
      video: {
        width: VideoPresets.fhd.resolution.width,
        height: VideoPresets.fhd.resolution.height,
      },
      audio: true, // TODO: get screen-share w/ audio working properly
    })
    .then((captureStream: MediaStream) => {
      room.localParticipant
        .publishTrack(captureStream.getTracks()[0], {
          name: 'screen',
          videoEncoding: {
            maxBitrate: 3000000,
            maxFramerate: 30,
          },
        })
        .then(track => {
          setSpeakerMode(true);
        });
    })
    .catch(err => {
      console.log('Error sharing screen: ' + err);
    });
}

function unpublishTrack(arg0: LocalAudioTrack) {
  throw new Error('Function not implemented.');
}
