import {
  faMicrophone,
  faMicrophoneSlash,
} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import  ToolbarButton, { Device } from "./ToolbarButton";

export interface AudioSelectButtonProps {
  isMuted: boolean;
  onClick?: () => void;
  onSourceSelected?: (device: MediaDeviceInfo) => void;
}

export const AudioSelectButton = ({
  isMuted,
  onClick,
  onSourceSelected,
}: AudioSelectButtonProps) => {
  const [sources, setSources] = useState<MediaDeviceInfo[]>([]);
  const [devices, setMenuItems] = useState<Device[]>([]);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const audioDevices = devices.filter(
        id => id.kind === 'audioinput' && id.deviceId
      );
      setSources(audioDevices);
      setMenuItems(
        audioDevices.map(id => {
          return { label: id.label };
        })
      );
    });
  }, [isMuted]);

  const handleDeviceClick = (id: Device) => {
    const device = sources.find(d => d.label === id.label);
    if (device && onSourceSelected) {
      onSourceSelected(device);
    }
  };

  return (
    <ToolbarButton
      label={isMuted ? 'Unmute' : 'Mute'}
      icon={isMuted ? faMicrophoneSlash : faMicrophone}
      // icon={isMuted ? faMicrophoneAltSlash : faMicrophoneAlt}
      bgColor={isMuted ? 'bg-white hover:bg-gray-100' : undefined}
      iconColor={isMuted ? 'text-red' : undefined}
      onClick={onClick}
      devices={devices}
      onDeviceClick={handleDeviceClick}
    />
  );
};
