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
  TrackPublication,
  VideoPresets,
} from "livekit-client";
import React, { useState, useEffect } from 'react';
import { useCookies } from "react-cookie";
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
   setChatMessages,
   updateOutputDevice,
   outputDevice,
 }: {
   room: Room;
   enableScreenShare?: boolean;
   enableAudio?: boolean;
   enableVideo?: boolean;
   onLeave?: (room: Room) => void;
   setSpeakerMode: Function;
   setChatMessages: Function;
   updateOutputDevice: (device: MediaDeviceInfo) => void;
   outputDevice?: MediaDeviceInfo;
 }) => {
   const { publications, isMuted, unpublishTrack } = useParticipant(
     room.localParticipant
   );
   const [audio, setAudioPub] = useState<TrackPublication>();
   const [video, setVideoPub] = useState<TrackPublication>();
   const [screen, setScreenPub] = useState<TrackPublication>();
   const [audioDevice, setAudioDevice] = useState<MediaDeviceInfo>();
   const [videoDevice, setVideoDevice] = useState<MediaDeviceInfo>();
  //  const [cookies, setCookies] = useCookies([
  //   'PREFERRED_AUDIO_DEVICE_ID',
  //   'PREFERRED_VIDEO_DEVICE_ID',
  // ]);

   useEffect(() => {
     setAudioPub(publications.find(p => p.kind === Track.Kind.Audio));
     setVideoPub(
       publications.find(
         p => p.kind === Track.Kind.Video && p.trackName !== 'screen'
       )
     );
     setScreenPub(
       publications.find(
         p => p.kind === Track.Kind.Video && p.trackName === 'screen'
       )
     );
   }, [publications]);

   useEffect(() => {
     if (!audioDevice || !videoDevice) {
       navigator.mediaDevices.enumerateDevices().then(devices => {
         if (!audioDevice) {
           const audioDevices = devices.filter(
             id => id.kind === 'audioinput' && id.deviceId
           );
           if (localStorage.get('PREFERRED_AUDIO_DEVICE_ID')) {
             setAudioDevice(
               audioDevices.find(
                 d =>
                   d.deviceId === localStorage.get('PREFERRED_AUDIO_DEVICE_ID')
               )
             );
           } else {
             let defaultAudDevice =
               audioDevices.find(
                 d =>
                   d.deviceId ===
                   audio?.audioTrack?.mediaStreamTrack.getSettings().deviceId
               ) ?? audioDevices[0];
             setAudioDevice(defaultAudDevice);
           }
         }
         if (!videoDevice) {
           const videoDevices = devices.filter(
             id => id.kind === 'videoinput' && id.deviceId
           );
           if (localStorage.get('PREFERRED_VIDEO_DEVICE_ID')) {
             setVideoDevice(
               videoDevices.find(
                 d =>
                   d.deviceId === localStorage.get('PREFERRED_VIDEO_DEVICE_ID')
               )
             );
           } else {
             let defaultVidDevice =
               videoDevices.find(
                 d =>
                   d.deviceId ===
                   video?.videoTrack?.mediaStreamTrack.getSettings().deviceId
               ) ?? videoDevices[0];
             setVideoDevice(defaultVidDevice);
           }
         }
       });
     }
   }, [audio, video]);

   useEffect(() => {
     if (
       audioDevice &&
       audioDevice.deviceId !==
         audio?.audioTrack?.mediaStreamTrack.getSettings().deviceId &&
       audioDevice.deviceId !== localStorage.get('PREFERRED_AUDIO_DEVICE_ID')
     ) {
       localStorage.setItem('PREFERRED_AUDIO_DEVICE_ID', audioDevice.deviceId);
      //  setCookies('PREFERRED_AUDIO_DEVICE_ID', audioDevice.deviceId, {
      //    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      //  });
       createLocalAudioTrack({ deviceId: audioDevice.deviceId })
         .then(track => {
           if (audio) unpublishTrack(audio.track as LocalAudioTrack);
           room.localParticipant.publishTrack(track);
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
         video?.videoTrack?.mediaStreamTrack.getSettings() &&
       videoDevice &&
       videoDevice.deviceId !== localStorage.get('PREFERRED_VIDEO_DEVICE_ID')
     ) {
       localStorage.setItem('PREFERRED_VIDEO_DEVICE_ID', videoDevice.deviceId);
       //  setCookies('PREFERRED_VIDEO_DEVICE_ID', videoDevice.deviceId, {
       //    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
       //  });
       createLocalVideoTrack({ deviceId: videoDevice.deviceId })
         .then((track: LocalVideoTrack) => {
           if (video) unpublishTrack(video.track as LocalVideoTrack);
           room.localParticipant.publishTrack(track);
         })
         .catch((err: Error) => {
           console.log(err);
         });
     }
   }, [videoDevice]);

   const toggleVideo = () => {
     if (video?.track) {
       if (video) unpublishTrack(video.track as LocalVideoTrack);
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
     if (!audio || isMuted) {
       if (audio) {
         (audio as LocalTrackPublication).unmute();
       } else {
         const options: CreateVideoTrackOptions = {};
         if (audioDevice) {
           options.deviceId = audioDevice.deviceId;
         }
         createLocalAudioTrack(options)
           .then(track => {
             room.localParticipant.publishTrack(track);
           })
           .catch((err: Error) => {
             console.log(err);
           });
       }
     } else {
       (audio as LocalTrackPublication).mute();
     }
   };

   //  const sendMsg = (msg: string) => {
   //    const encoder = new TextEncoder();
   //    if (room.localParticipant) {
   //      let chat = {
   //        type: 'ctw-chat',
   //        text: msg,
   //        sender: room.localParticipant.sid,
   //      };
   //      const data = encoder.encode(JSON.stringify(chat));
   //      room.localParticipant.publishData(data, DataPacket_Kind.RELIABLE);
   //      setChatMessages(chatMessages => [
   //        ...chatMessages,
   //        {
   //          text: msg,
   //          sender: room.localParticipant,
   //        },
   //      ]);
   //    }
   //  };

   return (
     <div id="toolbar" className="">
       {/* Mute Audio Button */}
       <AudioDeviceBtn
         isMuted={!audio || isMuted}
         onIpSelected={setAudioDevice}
         onOpSelected={updateOutputDevice}
         onClick={toggleAudio}
         audioDevice={audioDevice}
         outputDevice={outputDevice}
       />
       {/* Pause Video Button */}
       <VidDeviceBtn
         isEnabled={video?.track ? true : false}
         onIpSelected={setVideoDevice}
         onClick={toggleVideo}
         videoDevice={videoDevice}
       />
       {/* Screen Share Button */}
       <ToolbarButton
         tooltip={screen?.track ? 'Stop sharing' : 'Share screen'}
         icon={screen?.track ? faStop : faDesktop}
         bgColor={
           screen?.track
             ? `bg-primary`
             : 'bg-tertiary hover:bg-quaternary dark:bg-secondary dark:hover:bg-tertiary'
         }
         onClick={
           screen?.track
             ? () => {
                 unpublishTrack(screen.track as LocalVideoTrack);
                 //  sendMsg('I finished screen sharing!');
               }
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
                         //  sendMsg('I started screen sharing!');
                       });
                   })
                   .catch(err => {
                     console.log('Error sharing screen: ' + err);
                   });
               }
         }
       />
       {/* End Call Button */}
       {onLeave && (
         <ToolbarButton
           tooltip="End"
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