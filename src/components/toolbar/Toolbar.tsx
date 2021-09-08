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
  faCommentAlt,
  faDesktop,
  faPhoneSlash,
} from '@fortawesome/free-solid-svg-icons';
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
} from 'livekit-client';
import React, { useState, useEffect, useRef } from 'react';
import useMember from '../../hooks/useMember';
import { isMobile } from 'react-device-detect';
import AudioDeviceBtn from './AudioDeviceBtn';
import ToolbarButton from './ToolbarButton';
import VidDeviceBtn from './VidDeviceBtn';
import useLocalStorage from '../../hooks/useLocalStorage';
import { ChatMessage } from '../../typings/interfaces';
import Tippy from '@tippyjs/react';
import useIsMounted from '../../hooks/useIsMounted';
import { BgFilter, convertToLocalVideoTrack } from '../../features/bg_removal';

const Toolbar = ({
  room,
  onLeave,
  setSpeakerMode,
  chatMessages,
  setChatMessages,
  updateOutputDevice,
  outputDevice,
  chatOpen,
  setChatOpen,
  disableChat,
  cstmSupportUrl,
}: {
  room: Room;
  onLeave?: (room: Room) => void;
  setSpeakerMode: Function;
  chatMessages: ChatMessage[];
  setChatMessages: Function;
  updateOutputDevice: (device: MediaDeviceInfo) => void;
  outputDevice?: MediaDeviceInfo;
  chatOpen: boolean;
  setChatOpen: Function;
  disableChat?: boolean;
  cstmSupportUrl?: string;
}) => {
  const { publications, isMuted, unpublishTrack } = useMember(
    room.localParticipant
  );
  const [audio, setAudioPub] = useState<TrackPublication>();
  const [video, setVideoPub] = useState<TrackPublication>();
  const [screen, setScreenPub] = useState<TrackPublication>();
  const [audioDevice, setAudioDevice] = useState<MediaDeviceInfo>();
  const [videoDevice, setVideoDevice] = useState<MediaDeviceInfo>();
  const [audDId, setAudDId] = useLocalStorage('PREFERRED_AUDIO_DEVICE_ID', 'default');
  const [vidDId, setVidDId] = useLocalStorage('PREFERRED_VIDEO_DEVICE_ID', 'default');
  const [showChatSent, setShowChatSent] = useState<boolean>(false);
  const chatBtnRef = useRef<HTMLDivElement>(null);
  const isMounted = useIsMounted();

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
    if (
      !disableChat && chatMessages.length > 0 &&
      chatMessages[chatMessages.length - 1].sender !== room.localParticipant &&
      !chatOpen
    ) {
      setShowChatSent(true);
      setTimeout(() => {
        if (!isMounted()) return;
        setShowChatSent(false);
      }, 2000);
    }
  }, [chatMessages]);

  useEffect(() => {
    if (!audioDevice || !videoDevice) {
      navigator.mediaDevices
        .enumerateDevices()
        .then(devices => {
          if (!audioDevice) {
            const audioDevices = devices.filter(
              id => id.kind === 'audioinput' && id.deviceId
            );
            let defaultAudDevice: MediaDeviceInfo | undefined;
            if (audDId) {
              defaultAudDevice = audioDevices.find(
                d =>
                  d.deviceId ===
                  audDId
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
            if (vidDId) {
              defaultVidDevice = videoDevices.find(
                d =>
                  d.deviceId ===
                  vidDId
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
        })
        .catch(err => {
          console.log(err);
        });
    }
  }, [audio, video]);

  useEffect(() => {
    if (
      audioDevice &&
      audioDevice.deviceId !==
        audio?.audioTrack?.mediaStreamTrack.getSettings().deviceId &&
      audioDevice.deviceId !== audDId
    ) {
      setAudDId(audioDevice.deviceId);
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
      videoDevice.deviceId !== vidDId
    ) {
      setVidDId(videoDevice.deviceId);
      createLocalVideoTrack({ deviceId: videoDevice.deviceId })
        .then((track: LocalVideoTrack) => {
          if (video) unpublishTrack(video.track as LocalVideoTrack);  
          
          // TODO: also alter here
        const filter = new BgFilter();
        const bgRemovedTrack = filter.init(
          new MediaStream([track.mediaStreamTrack]),
          'blur'
        );
        track = convertToLocalVideoTrack(bgRemovedTrack, bgRemovedTrack.label, bgRemovedTrack.getConstraints())
        console.log('altered')
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
      if (videoDevice) options.deviceId = videoDevice.deviceId;
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
        if (audioDevice) options.deviceId = audioDevice.deviceId;

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
    <div id="toolbar" className={chatOpen ? 'chat-open-shift' : ''}>
      {/* Mute Audio Button */}
      <AudioDeviceBtn
        isMuted={!audio || isMuted}
        onIpSelected={setAudioDevice}
        onOpSelected={updateOutputDevice}
        onClick={toggleAudio}
        audioDevice={audioDevice}
        outputDevice={outputDevice}
        cstmSupportUrl={cstmSupportUrl}
      />
      {/* Pause Video Button */}
      <VidDeviceBtn
        isEnabled={video?.track ? true : false}
        onIpSelected={setVideoDevice}
        onClick={toggleVideo}
        videoDevice={videoDevice}
        cstmSupportUrl={cstmSupportUrl}
      />
      {/* Screen Share Button */}
      {/* TODO: screen share on mobile  */}
      {!isMobile && (
        <ToolbarButton
          type="screenshare"
          tooltip={screen?.track ? 'Stop Sharing' : 'Share Screen'}
          icon={faDesktop}
          bgColor={
            screen?.track ? `bg-primary` : 'bg-tertiary hover:bg-quaternary'
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
      )}
      {/* Chat Button */}
      {!disableChat && (
        <Tippy
          visible={showChatSent}
          arrow={false}
          onTrigger={() => setChatOpen(true)}
          content={
            <div className="text-xs">
              <strong>
                {chatMessages[chatMessages.length - 1]?.sender?.identity}:
              </strong>
              <br />
            {chatMessages[chatMessages.length - 1]?.text.substring(0, (chatMessages[chatMessages.length - 1]?.text.length < 40 ? chatMessages[chatMessages.length - 1]?.text.length : 40)) + ((chatMessages[chatMessages.length - 1]?.text.length > 40 ? '...' : ''))}
            </div>
          }
          theme="catalyst"
          triggerTarget={chatBtnRef.current}
        >
          <div ref={chatBtnRef} className="inline-block relative">
            <ToolbarButton
              type="chat"
              tooltip="Toggle Chat"
              disabledTooltip={showChatSent}
              icon={faCommentAlt}
              bgColor={
                chatOpen ? `bg-primary` : 'bg-tertiary hover:bg-quaternary  '
              }
              onClick={() => {
                setChatOpen(chatOpen => !chatOpen);
              }}
            />
          </div>
        </Tippy>
      )}
      {/* End Call Button */}
      {onLeave && (
        <ToolbarButton
          type="endcall"
          tooltip="End Call"
          icon={faPhoneSlash}
          bgColor={'bg-red'}
          onClick={() => {
            room.disconnect();
            onLeave(room);
          }}
        />
      )}
      {/* TODO: fixed right chat button {!disableChat && !isMobile && (
        <div
          // className={`absolute ${
          //   chatOpen ? 'right-48 animate-fade-in-right' : 'right-3 ' //  animate-fade-in-left
          // } z-40 bottom-1 animate-fade-in-up`}
          className={`absolute ${
            chatOpen ? 'hidden' : ''
          } right-3 z-0 bottom-1 animate-fade-in-up`}
        >
          <ToolbarButton
            type="chat"
            tooltip="Toggle Chat"
            icon={faCommentAlt}
            bgColor={
              chatOpen ? `bg-primary` : 'bg-tertiary hover:bg-quaternary  '
            }
            onClick={() => {
              setChatOpen(chatOpen => !chatOpen);
            }}
          />
        </div>
      )} */}
    </div>
  );
};
export default Toolbar;
