import { Property } from "csstype";
import { Track } from "livekit-client";
import React from "react";
import VideoWrapper from "./VideoWrapper";

interface ScreenShareProps {
  track: Track;
  width?: Property.Width;
  height?: Property.Height;
}

export const ScreenShareView = ({ track, width, height }: ScreenShareProps) => {
  return (
    // <div className={'screenShare'}>
    <div
      className="relative z-0 inline-block align-middle self-center overflow-hidden text-center bg-gray-800 rounded-lg m-1"
      style={{
        height: height,
        width: width,
      }}
    >
      <VideoWrapper track={track} isLocal={false} />
    </div>
  );
};
