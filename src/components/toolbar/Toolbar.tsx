import {
  faDesktop,
  faPhoneSlash,
  faStop,
} from "@fortawesome/free-solid-svg-icons";
import {
  createLocalAudioTrack,
  createLocalVideoTrack,
  CreateVideoTrackOptions,
  LocalAudioTrack,
  LocalTrackPublication,
  LocalVideoTrack,
  Room,
  Track,
  VideoPresets,
} from "livekit-client";
import React, { ReactElement, useRef, useState, useEffect } from 'react';
import { useParticipant } from "../../hooks/useMember";
import AudioDeviceBtn from "./AudioDeviceBtn";
import ToolbarButton from "./ToolbarButton";
import VidDeviceBtn from './VidDeviceBtn';


 const Toolbar = ({
   room,
   enableScreenShare,
   enableAudio,
   enableVideo,
   onLeave,
   setSpeakerMode,
 }: {
   room: Room;
   enableScreenShare?: boolean;
   enableAudio?: boolean;
   enableVideo?: boolean;
   onLeave?: (room: Room) => void;
   setSpeakerMode: Function
 }) => {
   const { publications, isMuted, unpublishTrack } = useParticipant(
     room.localParticipant
   );

   const audioPub = publications.find(val => val.kind === Track.Kind.Audio);
   const videoPub = publications.find(val => {
     return val.kind === Track.Kind.Video && val.trackName !== 'screen';
   });
   const screenPub = publications.find(val => {
     return val.kind === Track.Kind.Video && val.trackName === 'screen';
   });
   if (enableScreenShare === undefined) {
     enableScreenShare = true;
   }
   if (enableVideo === undefined) {
     enableVideo = true;
   }
   if (enableAudio === undefined) {
     enableAudio = true;
   }

   const [videoTrack, setVideoTrack] = useState<LocalVideoTrack>();
   const [audioDevice, setAudioDevice] = useState<MediaDeviceInfo>();
   const [videoDevice, setVideoDevice] = useState<MediaDeviceInfo>();


   useEffect(() => {
   if (!audioDevice || !videoDevice) {
     navigator.mediaDevices.enumerateDevices().then(devices => {
       if (!audioDevice) {
         const audioDevices = devices.filter(
           id => id.kind === 'audioinput' && id.deviceId
         );
         let defaultAudDevice = audioDevices.find(
           d =>
             d.deviceId ===
             audioPub?.audioTrack?.mediaStreamTrack.getSettings().deviceId
         );
         setAudioDevice(defaultAudDevice);
       }
       if (!videoDevice) {
         const videoDevices = devices.filter(
           id => id.kind === 'videoinput' && id.deviceId
         );
         let defaultVidDevice = videoDevices.find(
           d =>
             d.deviceId ===
             videoPub?.videoTrack?.mediaStreamTrack.getSettings().deviceId
         );
         setVideoDevice(defaultVidDevice);
       }
     });
   }
   }, [publications]);

 

   const toggleVideo = () => {
     if (videoPub?.track) {
       if (videoPub) unpublishTrack(videoPub.track as LocalVideoTrack);
     } else {
       const options: CreateVideoTrackOptions = {};
       if (videoDevice) {
         options.deviceId = videoDevice.deviceId;
       }
       createLocalVideoTrack(options)
         .then((track: LocalVideoTrack) => {
           room.localParticipant.publishTrack(track);
         })
         .catch((err: Error) => {
           console.log(err);
         });
     }
   };

   const toggleAudio = () => {
     if (!audioPub || isMuted) {
       if (audioPub) {
         (audioPub as LocalTrackPublication).unmute();
       } else {
         const options: CreateVideoTrackOptions = {};
         if (audioDevice) {
           options.deviceId = audioDevice.deviceId;
         }
         // track not published
         createLocalAudioTrack(options)
           .then(track => {
             room.localParticipant.publishTrack(track);
           })
           .catch((err: Error) => {
             console.log(err);
           });
       }
     } else {
       (audioPub as LocalTrackPublication).mute();
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
     }
   };

   useEffect(() => {
     if (
       audioDevice &&
       audioDevice.deviceId !==
         audioPub?.audioTrack?.mediaStreamTrack.getSettings().deviceId
     ) {
       createLocalAudioTrack({ deviceId: audioDevice.deviceId })
         .then(track => {
           if (audioPub) unpublishTrack(audioPub.track as LocalAudioTrack);
           room.localParticipant.publishTrack(track);
           //  (audioPub as LocalTrackPublication).unmute();
         })
         .catch((err: Error) => {
           console.log(err);
         });
     }
   }, [audioDevice]);

   useEffect(() => {
     if (
       videoDevice &&
       videoDevice.deviceId !==
         videoPub?.videoTrack?.mediaStreamTrack.getSettings().deviceId
     ) {
       createLocalVideoTrack({ deviceId: videoDevice.deviceId })
         .then((track: LocalVideoTrack) => {
           if (videoPub) unpublishTrack(videoPub.track as LocalVideoTrack);
           room.localParticipant.publishTrack(track);
         })
         .catch((err: Error) => {
           console.log(err);
         });
     }
   }, [videoDevice]);

   return (
     <div className={'controlsWrapper'}>
       {/* Mute Audio Button */}
       {enableAudio && (
         <AudioDeviceBtn
           isMuted={!audioPub || isMuted}
           onSourceSelected={setAudioDevice}
           onClick={toggleAudio}
           audioDevice={audioDevice}
         />
       )}
       {/* Pause Video Button */}
       {enableVideo && (
         <VidDeviceBtn
           isEnabled={videoPub?.track ? true : false}
           onSourceSelected={selectVideoDevice}
           onClick={toggleVideo}
           videoDevice={videoDevice}
         />
       )}
       {/* Screen Share Button */}
       {enableScreenShare && (
         <ToolbarButton
           label={screenPub?.track ? 'Stop sharing' : 'Share screen'}
           icon={screenPub?.track ? faStop : faDesktop}
           bgColor={
             screenPub?.track
               ? `bg-accent`
               : 'bg-button hover:bg-gray-500 dark:bg-background dark:hover:bg-button'
           }
           onClick={
             screenPub?.track
               ? () => unpublishTrack(screenPub.track as LocalVideoTrack)
               : () => {
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
           }
         />
       )}
       {/* End Call Button */}
       {onLeave && (
         <ToolbarButton
           label="End"
           icon={faPhoneSlash}
           bgColor={'bg-red'}
           onClick={() => {
             room.disconnect();
             onLeave(room);
           }}
         />
       )}
     </div>
   );
 };
export default Toolbar