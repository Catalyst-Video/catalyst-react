import { faVideo, faVideoSlash } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useRef, useState } from "react";
import ToolbarButton, { Device } from "./ToolbarButton";

const VidDeviceBtn = ({
  isEnabled,
  onClick,
  onSourceSelected,
}: {
  isEnabled: boolean;
  onClick?: () => void;
  onSourceSelected?: (device: MediaDeviceInfo) => void;
}
) => {
  const [sources, setSources] = useState<MediaDeviceInfo[]>([]);
  const [devices, setMenuItems] = useState<Device[]>([]);
  const vidBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoDevices = devices.filter(
        id => id.kind === 'videoinput' && id.deviceId
      );
      setSources(videoDevices);
      setMenuItems(
        videoDevices.map(id => {
          return { label: id.label };
        })
      );
    });
  }, [isEnabled]);

  const handleDevice = (id: Device) => {
    const device = sources.find(d => d.label === id.label);
    if (device && onSourceSelected) {
      onSourceSelected(device);
    }
  };

  return (
    <div ref={vidBtnRef} className="inline">
      <ToolbarButton
        label={isEnabled ? 'Disable Video' : 'Enable Video'}
        icon={isEnabled ? faVideo : faVideoSlash}
        bgColor={isEnabled ? undefined : 'bg-white hover:bg-gray-100'}
        iconColor={isEnabled ? undefined : 'text-red'}
        onDeviceClick={handleDevice}
        parentRef={vidBtnRef}
        onClick={onClick}
        devices={devices}
      />
    </div>
  );
};

export default VidDeviceBtn;