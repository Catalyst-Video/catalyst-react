import { Property } from "csstype";
import { Track } from "livekit-client";
import React, { CSSProperties, useEffect, useRef } from "react";


export interface VideoRendererProps {
  track: Track;
  isLocal: boolean;
  objectFit?: Property.ObjectFit;
  width?: Property.Width;
  height?: Property.Height;
}

export const VideoRenderer = ({
  track,
  isLocal,
  objectFit,
  width,
  height,
}: VideoRendererProps) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    el.muted = true;
    track.attach(el);
    return () => {
      track.detach(el);
    };
  }, [track, ref]);

  const isFrontFacing =
    track.mediaStreamTrack?.getSettings().facingMode !== "environment";
  const style: CSSProperties = {
    transform: isLocal && isFrontFacing ? "rotateY(180deg)" : "",
    width: width,
    height: height,
  };
  if (objectFit) {
    style.objectFit = objectFit;
  }

  return (
    <video ref={ref} className='object-center min-h-0 min-w-0 rounded-lg' style={style} />
  );
};
