import { BackgroundFilter } from "@vectorly-io/ai-filters";
import { createLocalAudioTrack, createLocalVideoTrack, LocalAudioTrack, LocalVideoTrack, Room, TrackPublication, VideoPresets } from "livekit-client";
import { isMobile } from "react-device-detect";
import { applyBgFilterToTrack } from "./bg_removal";

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
               defaultAudDevice = audioDevices.find(
                 d => d.deviceId === audioDeviceId
               );
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
               defaultVidDevice = videoDevices.find(
                 d => d.deviceId === videoDeviceId
               );
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
                  if (bgRemovalEffect && bgFilter && !isMobile) {
                    await applyBgFilterToTrack(
                      newTrack.mediaStreamTrack,
                      bgFilter
                    );
                    newTrack = await bgFilter.getOutputTrack();
                  }
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
             audio: true, // TODO: get working properly
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
  throw new Error("Function not implemented.");
}
