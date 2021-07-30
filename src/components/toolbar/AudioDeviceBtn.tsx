import {
  faMicrophone,
  faMicrophoneSlash,
} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useRef, useState } from "react";
import  ToolbarButton, { Device } from "./ToolbarButton";

const AudioDeviceBtn = ({
  isMuted,
  onClick,
  onIpSourceSelected,
  onOpSourceSelected,
  audioDevice,
  outputDevice,
}: {
  isMuted: boolean;
  onClick?: () => void;
    onIpSourceSelected?: (device: MediaDeviceInfo) => void;
  onOpSourceSelected?: (device: MediaDeviceInfo) => void;
  audioDevice?: MediaDeviceInfo;
  outputDevice?: MediaDeviceInfo;
}) => {
  const [ipSources, setIpSources] = useState<MediaDeviceInfo[]>([]);
  const [opSources, setOpSources] = useState<MediaDeviceInfo[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [outputDevices, setOutputDevices] = useState<Device[]>([]);
  const audBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devices => {
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
    });
  }, [isMuted]);

  const handleIpDeviceClick = (id: Device) => {
    const device = ipSources.find(d => d.label === id.label);
    if (device && onIpSourceSelected) {
      onIpSourceSelected(device);
    }
  };

  const handleOpDeviceClick = (id: Device) => {
    const device = opSources.find(d => d.label === id.label);
    if (device && onOpSourceSelected) {
      onOpSourceSelected(device);
    }
  };

  return (
    <div ref={audBtnRef} className="inline">
      <ToolbarButton
        type="Audio"
        tooltip={isMuted ? 'Unmute' : 'Mute'}
        icon={isMuted ? faMicrophoneSlash : faMicrophone}
        bgColor={isMuted ? 'bg-white hover:bg-gray-100' : undefined}
        iconColor={isMuted ? 'text-red' : undefined}
        onClick={onClick}
        inputDevices={devices}
        outputDevices={outputDevices}
        onIpDeviceClick={handleIpDeviceClick}
        onOpDeviceClick={handleOpDeviceClick}
        selectedIpDevice={audioDevice}
        selectedOpDevice={outputDevice}
        parentRef={audBtnRef}
      />
    </div>
  );
};
export default AudioDeviceBtn;