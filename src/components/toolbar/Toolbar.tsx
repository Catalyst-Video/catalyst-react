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
import {
  initBgFilter,
  applyBgFilterToTrack,
} from '../../utils/bg_removal';
import { BackgroundFilter } from '@vectorly-io/ai-filters';
import { initAudioVideoDevices, reInitAudioDevice, reInitVideoDevice, startScreenShare } from '../../utils/devices';

const Toolbar = ({
  room,
  onLeave,
  setSpeakerMode,
  chatMessages,
  setChatMessages,
  updateOutputDevice,
  outputDevice,
  chatOpen,
  bgRemoval,
  bgRemovalKey,
  bgFilter,
  setBgFilter,
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
  bgRemoval?: 'blur' | string;
  bgRemovalKey: string;
  bgFilter?: BackgroundFilter;
  setBgFilter: Function;
  setChatOpen: Function;
  disableChat?: boolean;
  cstmSupportUrl?: string;
  }) => {
  // user data
  const isMounted = useIsMounted();
  const { publications, isMuted, unpublishTrack } = useMember(room.localParticipant);
  const [audio, setAudioPub] = useState<TrackPublication>();
  const [video, setVideoPub] = useState<TrackPublication>();
  const [screen, setScreenPub] = useState<TrackPublication>();
  // devices
  const [audioDevice, setAudioDevice] = useState<MediaDeviceInfo>();
  const [videoDevice, setVideoDevice] = useState<MediaDeviceInfo>();
  const [audDId, setAudDId] = useLocalStorage('PREFERRED_AUDIO_DEVICE_ID','default');
  const [vidDId, setVidDId] = useLocalStorage('PREFERRED_VIDEO_DEVICE_ID', 'default');
  // chat
  const [showChatSent, setShowChatSent] = useState<boolean>(false);
  const chatBtnRef = useRef<HTMLDivElement>(null);
  // bg removal
  const [filterEnabled, setFilterEnabled] = useState<boolean>(bgRemoval && bgRemoval !== 'none' ? true : false);
  const [bgRemovalEffect, setBgRemovalEffect] = useState(bgRemoval ?? 'none');

  useEffect(() => {
    setAudioPub(publications.find(p => p.kind === Track.Kind.Audio));
    setVideoPub(publications.find(p => p.kind === Track.Kind.Video && p.trackName !== 'screen'));
    setScreenPub(publications.find(p => p.kind === Track.Kind.Video && p.trackName === 'screen'));
  }, [publications]);

  useEffect(() => {
    initAudioVideoDevices(setAudioDevice, setVideoDevice, audio, video, audioDevice, videoDevice, audDId, vidDId);
  }, [audio, video]);

  useEffect(() => {
    reInitAudioDevice(room, setAudDId, audio, audioDevice, audDId);
  }, [audioDevice]);

  useEffect(() => {
    reInitVideoDevice(room, setVidDId, video, videoDevice, vidDId, bgRemovalEffect, bgFilter);
  }, [videoDevice]);

  useEffect(() => {
    handleBgEffect();
  }, [bgRemovalEffect]);

  useEffect(() => {
    if (
      !disableChat &&
      !chatOpen &&
      chatMessages.length > 0 &&
      getLastChat().sender !== room.localParticipant
    ) {
      setShowChatSent(true);
      setTimeout(() => {
        if (!isMounted()) return;
        setShowChatSent(false);
      }, 2000);
    }
  }, [chatMessages]);


    const toggleAudio = async () => {
      if (!audio || isMuted) {
        if (audio) {
          (audio as LocalTrackPublication).unmute();
        } else {
          const track = await createLocalAudioTrack({
            deviceId: audioDevice?.deviceId,
          });
          if (track) room.localParticipant.publishTrack(track);
        }
      } else {
        (audio as LocalTrackPublication).mute();
      }
    };

  const toggleVideo = async () => {
    if (video?.track) {
      if (video) unpublishTrack(video.track as LocalVideoTrack);
    } else {
      let newTrack: LocalVideoTrack | MediaStreamTrack;
      newTrack = await createLocalVideoTrack({ deviceId: videoDevice?.deviceId })
      if (bgRemovalEffect && bgFilter && !isMobile) {
        await applyBgFilterToTrack(newTrack.mediaStreamTrack, bgFilter);
        newTrack = await bgFilter.getOutputTrack();
      }
      if (newTrack) room.localParticipant.publishTrack(newTrack);
    }
  };

    const handleBgEffect = async () => {
      let filter: BackgroundFilter | undefined | null = bgFilter;
      let track: LocalVideoTrack | MediaStreamTrack | undefined;
      if (!filter && video && bgRemovalKey.length > 0 && !isMobile) {
        track = await createLocalVideoTrack({
          deviceId: videoDevice?.deviceId,
        });
        if (video) unpublishTrack(video.track as LocalVideoTrack);
        filter = await initBgFilter(
          bgRemovalKey,
          video.track as LocalVideoTrack,
          bgRemovalEffect
        );
        setBgFilter(filter);
        setFilterEnabled(true);
        if (filter) track = await filter.getOutputTrack();
        room.localParticipant.publishTrack(track);
      } else if (filter) {
        if (bgRemovalEffect === 'none') {
          const filterDisabledStream = await filter.disable();
          if (filterDisabledStream) {
            track = filterDisabledStream.getVideoTracks()[0];
            if (track) {
              if (video) unpublishTrack(video.track as LocalVideoTrack);
              room.localParticipant.publishTrack(track);
              setFilterEnabled(false);
            }
          }
        } else {
          if (!filterEnabled) {
            const filterEnabledStream = await filter.enable();
            if (filterEnabledStream) {
              track = await filter.getOutputTrack();
              if (track) {
                if (video) unpublishTrack(video.track as LocalVideoTrack);
                room.localParticipant.publishTrack(track);
                setFilterEnabled(true);
              }
            }
          }
          if (bgRemovalEffect === 'blur' && filter.background !== 'blur') {
            await filter.changeBackground('blur');
          } else if (filter.background !== bgRemovalEffect) {
            await filter.changeBackground(bgRemovalEffect);
          }
        }
      }
    };

  const getLastChat = () => {
    return chatMessages[chatMessages.length - 1];
  }

  return (
    <div id="toolbar" className={chatOpen ? 'chat-open-shift' : ''}>
      {/* Toggle Audio */}
      <AudioDeviceBtn
        isMuted={!audio || isMuted}
        onIpSelected={setAudioDevice}
        onOpSelected={updateOutputDevice}
        onClick={toggleAudio}
        audioDevice={audioDevice}
        outputDevice={outputDevice}
        cstmSupportUrl={cstmSupportUrl}
      />
      {/* Toggle Video */}
      <VidDeviceBtn
        isEnabled={video?.track ? true : false}
        onIpSelected={setVideoDevice}
        onClick={toggleVideo}
        videoDevice={videoDevice}
        bgRemovalEnabled={bgRemovalKey.length > 0 && !isMobile}
        cstmSupportUrl={cstmSupportUrl}
        bgRemovalEffect={bgRemovalEffect}
        setBgRemovalEffect={setBgRemovalEffect}
      />
      {/* Screen Share */}
      {!isMobile && (
        <ToolbarButton
          type="screenshare"
          icon={faDesktop}
          tooltip={screen?.track ? 'Stop Sharing' : 'Share Screen'}
          bgColor={
            screen?.track ? `bg-primary` : 'bg-tertiary hover:bg-quaternary'
          }
          onClick={
            screen?.track
              ? () => unpublishTrack(screen.track as LocalVideoTrack)
              : () => startScreenShare(room, startScreenShare)
          }
        />
      )}
      {/* Chat */}
      {!disableChat && (
        <Tippy
          visible={showChatSent}
          arrow={false}
          onTrigger={() => setChatOpen(true)}
          content={
            <div className="text-xs">
              <strong>{getLastChat()?.sender?.identity}:</strong>
              <br />
              {getLastChat()?.text.substring(
                0,
                getLastChat()?.text.length < 40
                  ? getLastChat()?.text.length
                  : 40
              ) + (getLastChat()?.text.length > 40 ? '...' : '')}
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
                chatOpen ? `bg-primary` : 'bg-tertiary hover:bg-quaternary'
              }
              onClick={() => setChatOpen(chatOpen => !chatOpen)}
            />
          </div>
        </Tippy>
      )}
      {/* End Call */}
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
    </div>
  );
};
export default Toolbar;
