import {
  faMicrophone,
  faMicrophoneSlash,
} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useRef, useState } from "react";
import  ToolbarButton, { Device } from "./ToolbarButton";

const AudioDeviceBtn = ({
  isMuted,
  onClick,
  onSourceSelected,
  audioDevice,
}: {
  isMuted: boolean;
  onClick?: () => void;
  onSourceSelected?: (device: MediaDeviceInfo) => void;
  audioDevice?: MediaDeviceInfo;
}) => {
  const [sources, setSources] = useState<MediaDeviceInfo[]>([]);
  const [devices, setMenuItems] = useState<Device[]>([]);
  const audBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devices => {
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
    <div ref={audBtnRef} className="inline">
      <ToolbarButton
        label={isMuted ? 'Unmute' : 'Mute'}
        icon={isMuted ? faMicrophoneSlash : faMicrophone}
        bgColor={isMuted ? 'bg-white hover:bg-gray-100' : undefined}
        iconColor={isMuted ? 'text-red' : undefined}
        onClick={onClick}
        devices={devices}
        onDeviceClick={handleDeviceClick}
        selectedDevice={audioDevice}
        parentRef={audBtnRef}
      />
    </div>
  );
};
export default AudioDeviceBtn;