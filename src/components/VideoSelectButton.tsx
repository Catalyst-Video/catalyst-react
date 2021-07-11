import { faVideo, faVideoSlash } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import ToolbarButton, { Device } from "./ToolbarButton";

export interface VideoSelectButtonProps {
  isEnabled: boolean;
  onClick?: () => void;
  onSourceSelected?: (device: MediaDeviceInfo) => void;
}

export const VideoSelectButton = ({
  isEnabled,
  onClick,
  onSourceSelected,
}: VideoSelectButtonProps) => {
  const [sources, setSources] = useState<MediaDeviceInfo[]>([]);
  const [devices, setMenuItems] = useState<Device[]>([]);

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
    <ToolbarButton
      label={isEnabled ? 'Disable Video' : 'Enable Video'}
      icon={isEnabled ? faVideo : faVideoSlash}
      onClick={onClick}
      devices={devices}
      onDeviceClick={handleDevice}
      bgColor={isEnabled ? undefined : 'bg-white hover:bg-gray-100'}
      iconColor={isEnabled ? undefined : 'text-red'}
    />
  );
};
