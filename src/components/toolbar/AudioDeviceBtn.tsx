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
  faMicrophone,
  faMicrophoneSlash,
} from '@fortawesome/free-solid-svg-icons';
import React, { useEffect, useRef, useState } from 'react';
import { CatalystDev } from '../../typings/interfaces';
import ToolbarButton from './ToolbarButton';

const AudioDeviceBtn = ({
  isMuted,
  onClick,
  onIpSelected,
  onOpSelected,
  audioDevice,
  outputDevice,
  cstmSupportUrl,
}: {
  isMuted: boolean;
  onClick?: () => void;
  onIpSelected?: (device: MediaDeviceInfo) => void;
  onOpSelected?: (device: MediaDeviceInfo) => void;
  audioDevice?: MediaDeviceInfo;
  outputDevice?: MediaDeviceInfo;
  cstmSupportUrl?: string;
}) => {
  const [ipSources, setIpSources] = useState<MediaDeviceInfo[]>([]);
  const [opSources, setOpSources] = useState<MediaDeviceInfo[]>([]);
  const [devices, setDevices] = useState<CatalystDev[]>([]);
  const [outputDevices, setOutputDevices] = useState<CatalystDev[]>([]);
  const mounted = useRef(true);
  // const audBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      if (!mounted.current) return;
      const audioDevices = devices.filter(
        id => id.kind === 'audioinput' && id.deviceId
      );
      setIpSources(audioDevices);
      setDevices(
        audioDevices.map(id => {
          return { label: id.label };
        })
      );
      const opDevices = devices.filter(
        id => id.kind === 'audiooutput' && id.deviceId
      );
      setOpSources(opDevices);
      setOutputDevices(
        opDevices.map(id => {
          return { label: id.label };
        })
      );
      return devices;
    });
    return () => {
      mounted.current = false;
    };
  }, [isMuted]);

  const handleIpDeviceClick = (id: CatalystDev) => {
    const device = ipSources.find(d => d.label === id.label);
    if (device && onIpSelected) {
      onIpSelected(device);
    }
  };

  const handleOpDeviceClick = (id: CatalystDev) => {
    const device = opSources.find(d => d.label === id.label);
    if (device && onOpSelected) {
      onOpSelected(device);
    }
  };

  return (
    // <div ref={audBtnRef} className="inline relative">
    <ToolbarButton
      type="Audio"
      tooltip={isMuted ? 'Unmute' : 'Mute'}
      icon={isMuted ? faMicrophoneSlash : faMicrophone}
      bgColor={isMuted ? 'bg-quinary  hover:bg-gray-100' : undefined}
      iconColor={isMuted ? 'text-red' : undefined}
      onClick={onClick}
      inputDevices={devices}
      outputDevices={outputDevices}
      onIpDeviceClick={handleIpDeviceClick}
      onOpDeviceClick={handleOpDeviceClick}
      selectedIpDevice={audioDevice}
      selectedOpDevice={outputDevice}
      cstmSupportUrl={cstmSupportUrl}
      //    parentRef={audBtnRef}
    />
    //   </div>
  );
};
export default AudioDeviceBtn;
