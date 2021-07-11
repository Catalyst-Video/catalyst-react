import {
  faMicrophone,
  faMicrophoneSlash,
} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import { ControlButton, MenuItem } from "./ControlButton";

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
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const audioDevices = devices.filter(
        (item) => item.kind === "audioinput" && item.deviceId
      );
      setSources(audioDevices);
      setMenuItems(
        audioDevices.map((item) => {
          return { label: item.label };
        })
      );
    });
  }, [isMuted]);

  const handleMenuItem = (item: MenuItem) => {
    const device = sources.find((d) => d.label === item.label);
    if (device && onSourceSelected) {
      onSourceSelected(device);
    }
  };

  return (
    <ControlButton
      label={isMuted ? 'Unmute' : 'Mute'}
      icon={isMuted ? faMicrophoneSlash : faMicrophone}
      // icon={isMuted ? faMicrophoneAltSlash : faMicrophoneAlt}
      bgColor={isMuted ? 'bg-white hover:bg-gray-100' : undefined}
      iconColor={isMuted ? 'text-red' : undefined}
      onClick={onClick}
      menuItems={menuItems}
      onMenuItemClick={handleMenuItem}
    />
  );
};
