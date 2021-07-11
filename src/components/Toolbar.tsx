import {
  faDesktop,
  faMicrophone,
  faMicrophoneAltSlash,
  faMicrophoneSlash,
  faMicrophoneAlt,
  faPhoneSlash,
  faStop,
  faVideo,
  faVideoSlash,
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


 const Toolbar = ({
         room,
         enableScreenShare,
         enableAudio,
         enableVideo,
         onLeave,
       }: {
         room: Room;
         enableScreenShare?: boolean;
         enableAudio?: boolean;
         enableVideo?: boolean;
         onLeave?: (room: Room) => void;
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
   
     const [connectDisabled, setConnectDisabled] = useState(true);
     const [videoTrack, setVideoTrack] = useState<LocalVideoTrack>();
     const [audioDevice, setAudioDevice] = useState<MediaDeviceInfo>();
     const [videoDevice, setVideoDevice] = useState<MediaDeviceInfo>();

   
   const toggleVideo = () => {
     if (videoPub?.track) {
       if (videoPub)
         unpublishTrack(videoPub.track as LocalVideoTrack);
     } else {
        const options: CreateVideoTrackOptions = {};
             if (videoDevice) {
               options.deviceId = videoDevice.deviceId;
             }
       createLocalVideoTrack(options).then((track: LocalVideoTrack) => {
         
            room.localParticipant.publishTrack(track);

       }).catch((err: Error) => {
         console.log(err)
         });
        
     }
               
   }
  

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
       } else { (audioPub as LocalTrackPublication).mute() }
           };

     const selectVideoDevice = (device: MediaDeviceInfo) => {
       setVideoDevice(device);
       if (videoTrack) {
         if (
           videoTrack.mediaStreamTrack.getSettings().deviceId ===
           device.deviceId
         ) {
           return;
         }
         // stop video
         toggleVideo();
       }
       // start video with correct device
       toggleVideo();
     };
   
         let screenButton: ReactElement | undefined;
         if (enableScreenShare) {
           if (screenPub?.track) {
             screenButton = (
               <ToolbarButton
                 label="Stop sharing"
                 icon={faStop}
                 onClick={() =>
                   unpublishTrack(screenPub.track as LocalVideoTrack)
                 }
               />
             );
           } else {
             screenButton = (
               <ToolbarButton
                 label="Share screen"
                 icon={faDesktop}
                 onClick={async () => {
                   try {
                     const captureStream =
                       // @ts-ignore
                       (await navigator.mediaDevices.getDisplayMedia({
                         video: {
                           width: VideoPresets.fhd.resolution.width,
                           height: VideoPresets.fhd.resolution.height,
                         },
                       })) as MediaStream;

                     room.localParticipant.publishTrack(
                       captureStream.getTracks()[0],
                       {
                         name: 'screen',
                         videoEncoding: {
                           maxBitrate: 3000000,
                           maxFramerate: 30,
                         },
                       }
                     );
                   } catch (err) {
                     window.alert('Error sharing screen');
                   }
                 }}
               />
             );
           }
         }

         return (
           <div className={'controlsWrapper'}>
             {/* Mute Audio Button */}
             {enableAudio && (
               <AudioSelectButton
                 isMuted={!audioPub || isMuted}
                 onClick={toggleAudio}
                 onSourceSelected={setAudioDevice}
               />

               //  <ControlButton
               //    label={!audioPub || isMuted ? 'Unmute' : 'Mute'}
               //    icon={
               //      !audioPub || isMuted ? faMicrophoneAltSlash : faMicrophoneAlt
               //    }
               //    bgColor={
               //      !audioPub || isMuted
               //        ? 'bg-white hover:bg-gray-100'
               //        : undefined
               //    }
               //    iconColor={!audioPub || isMuted ? 'text-red' : undefined}
               //    onClick={
               //      !audioPub || isMuted
               //        ? async () => {
               //            if (audioPub) {
               //              (audioPub as LocalTrackPublication).unmute();
               //            } else {
               //              // track not published
               //              const audioTrack = await createLocalAudioTrack();
               //              room.localParticipant.publishTrack(audioTrack);
               //            }
               //          }
               //        : () => (audioPub as LocalTrackPublication).mute()
               //    }
               //  />
             )}
             {/* Pause Video Button */}
             {enableVideo && (
               <VideoSelectButton
                 isEnabled={videoPub?.track ? true : false}
                 onClick={toggleVideo}
                 onSourceSelected={selectVideoDevice}
               />
               //  <ControlButton
               //    label={videoPub?.track ? 'Stop video' : 'Start video'}
               //    icon={videoPub?.track ? faVideo : faVideoSlash}
               //    bgColor={
               //      videoPub?.track ? undefined : 'bg-white hover:bg-gray-100'
               //    }
               //    iconColor={videoPub?.track ? undefined : 'text-red'}
               //    onClick={
               //      videoPub?.track
               //        ? () => {
               //            if (videoPub)
               //              unpublishTrack(videoPub.track as LocalVideoTrack);
               //          }
               //        : async () => {
               //            const videoTrack = await createLocalVideoTrack();
               //            room.localParticipant.publishTrack(videoTrack);
               //          }
               //    }
               //  />
             )}
             {/* Screen Share Button */}
             {screenButton}
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