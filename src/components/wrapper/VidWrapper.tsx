import { Track } from "livekit-client";
import React, { useEffect, useRef, useMemo } from "react";
import { Property } from 'csstype';

const VidWrapper = React.memo(({
  track,
  isLocal,
  objectFit,
}: {
  track: Track;
  isLocal: boolean;
  objectFit?: Property.ObjectFit;
}) => {
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
    track.mediaStreamTrack?.getSettings().facingMode !== 'environment';

  return (
    <video
      ref={ref}
      className={`min-h-0 min-w-0 rounded-lg h-auto w-full ${
        isLocal && isFrontFacing ? '' : ''
        // object-center
      } ${objectFit ?? ''}`}
      // style={{
      //   transform: isLocal && isFrontFacing ? 'rotateY(180deg)' : '',
      //   objectFit: objectFit ?? '',
      // }}
    />
  );
});
export default VidWrapper;