import {
  faDesktop,
  faPhoneSlash,
  faStop,
} from "@fortawesome/free-solid-svg-icons";
import {
  createLocalAudioTrack,
  createLocalVideoTrack,
  CreateVideoTrackOptions,
  LocalTrackPublication,
  LocalVideoTrack,
  Room,
  Track,
  VideoPresets,
} from "livekit-client";
import React, { ReactElement, useState } from "react";
import { useParticipant } from "../hooks/useParticipant";
import { AudioSelectButton } from "./AudioSelectButton";
import ToolbarButton from "./ToolbarButton";
import "./styles.module.css";
import { VideoSelectButton } from "./VideoSelectButton";
import { useEffect } from "react";


 const Toolbar = ({
   room,
   enableScreenShare,
   enableAudio,
   enableVideo,
   onLeave,
   theme,
   setSpeakerMode,
 }: {
   room: Room;
   enableScreenShare?: boolean;
   enableAudio?: boolean;
   enableVideo?: boolean;
   onLeave?: (room: Room) => void;
   theme: string;
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
     if (audioDevice) {
       createLocalAudioTrack({ deviceId: audioDevice.deviceId })
         .then(track => {
           room.localParticipant.publishTrack(track);
           //  (audioPub as LocalTrackPublication).unmute();
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
         <AudioSelectButton
           isMuted={!audioPub || isMuted}
           onClick={toggleAudio}
           onSourceSelected={setAudioDevice}
         />
       )}
       {/* Pause Video Button */}
       {enableVideo && (
         <VideoSelectButton
           isEnabled={videoPub?.track ? true : false}
           onClick={toggleVideo}
           onSourceSelected={selectVideoDevice}
         />
       )}
       {/* Screen Share Button */}
       {enableScreenShare && (
         <ToolbarButton
           label={screenPub?.track ? 'Stop sharing' : 'Share screen'}
           icon={screenPub?.track ? faStop : faDesktop}
           bgColor={
             screenPub?.track ? `bg-${theme}` : 'bg-gray-600 hover:bg-gray-500'
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
                   })
                   .then((captureStream: MediaStream) => {
                     room.localParticipant.publishTrack(
                       captureStream.getTracks()[0],
                       {
                         name: 'screen',
                         videoEncoding: {
                           maxBitrate: 3000000,
                           maxFramerate: 30,
                         },
                       }
                     ).then((track) => {
                       setSpeakerMode(true);
                     })
                   })
                     .catch(err => {
                       window.alert('Error sharing screen' + err);
                     });

                   //  try {
                   //    const captureStream =
                   //      // @ts-ignore
                   //      (await navigator.mediaDevices.getDisplayMedia({
                   //        video: {
                   //          width: VideoPresets.fhd.resolution.width,
                   //          height: VideoPresets.fhd.resolution.height,
                   //        },
                   //      })) as MediaStream;

                   //    room.localParticipant.publishTrack(
                   //      captureStream.getTracks()[0],
                   //      {
                   //        name: 'screen',
                   //        videoEncoding: {
                   //          maxBitrate: 3000000,
                   //          maxFramerate: 30,
                   //        },
                   //      }
                   //    );
                   //  } catch (err) {
                   //    window.alert('Error sharing screen');
                   //  }
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