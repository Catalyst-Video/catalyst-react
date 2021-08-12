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

import { faVideo, faVideoSlash } from '@fortawesome/free-solid-svg-icons';
import React, { useEffect, useRef, useState } from 'react';
import { CatalystDev } from '../../typings/interfaces';
import ToolbarButton from './ToolbarButton';

const VidDeviceBtn = ({
  isEnabled,
  onClick,
  onIpSelected,
  videoDevice,
  cstmSupportUrl
}: {
  isEnabled: boolean;
  onClick?: () => void;
  onIpSelected?: (device: MediaDeviceInfo) => void;
  videoDevice?: MediaDeviceInfo;
  cstmSupportUrl?: string;
}) => {
  const [sources, setSources] = useState<MediaDeviceInfo[]>([]);
  const [devices, setDevices] = useState<CatalystDev[]>([]);
  const mounted = useRef(true);
  // const vidBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      if (!mounted.current) return null;
      const videoDevices = devices.filter(
        id => id.kind === 'videoinput' && id.deviceId
      );
      setSources(videoDevices);
      setDevices(
        videoDevices.map(id => {
          return { label: id.label };
        })
      );
      return devices;
    });
    return () => {
      mounted.current = false;
    };
  }, [isEnabled]);

  const handleDevice = (id: CatalystDev) => {
    const device = sources.find(d => d.label === id.label);
    if (device && onIpSelected) {
      onIpSelected(device);
    }
  };

  return (
    // <div ref={vidBtnRef} className="inline">
    <ToolbarButton
      type="Video"
      tooltip={isEnabled ? 'Disable Video' : 'Enable Video'}
      icon={isEnabled ? faVideo : faVideoSlash}
      bgColor={isEnabled ? undefined : 'bg-quinary  hover:bg-gray-100'}
      iconColor={isEnabled ? undefined : 'text-red'}
      onIpDeviceClick={handleDevice}
      //  parentRef={vidBtnRef}
      onClick={onClick}
      inputDevices={devices}
      selectedIpDevice={videoDevice}
      cstmSupportUrl={cstmSupportUrl}
    />
    // </div>
  );
};

export default VidDeviceBtn;
