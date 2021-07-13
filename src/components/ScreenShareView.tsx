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
    <div className={'screenShare'}>
      <VideoWrapper
        track={track}
        isLocal={false}
      />
    </div>
  );
};
