import { faVideo, faVideoSlash } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useRef, useState } from "react";
import ToolbarButton, { Device } from "./ToolbarButton";

const VidDeviceBtn = ({
  isEnabled,
  onClick,
  onIpSelected,
  videoDevice,
}: {
  isEnabled: boolean;
  onClick?: () => void;
  onIpSelected?: (device: MediaDeviceInfo) => void;
  videoDevice?: MediaDeviceInfo;
}) => {
  const [sources, setSources] = useState<MediaDeviceInfo[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const vidBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const videoDevices = devices.filter(
        id => id.kind === 'videoinput' && id.deviceId
      );
      setSources(videoDevices);
      setDevices(
        videoDevices.map(id => {
          return { label: id.label };
        })
      );
    });
  }, [isEnabled]);

  const handleDevice = (id: Device) => {
    const device = sources.find(d => d.label === id.label);
    if (device && onIpSelected) {
      onIpSelected(device);
    }
  };

  return (
    <div ref={vidBtnRef} className="inline">
      <ToolbarButton
        type="Video"
        tooltip={isEnabled ? 'Disable Video' : 'Enable Video'}
        icon={isEnabled ? faVideo : faVideoSlash}
        bgColor={isEnabled ? undefined : 'bg-white hover:bg-gray-100'}
        iconColor={isEnabled ? undefined : 'text-red'}
        onIpDeviceClick={handleDevice}
        parentRef={vidBtnRef}
        onClick={onClick}
        inputDevices={devices}
        selectedIpDevice={videoDevice}
      />
    </div>
  );
};

export default VidDeviceBtn;