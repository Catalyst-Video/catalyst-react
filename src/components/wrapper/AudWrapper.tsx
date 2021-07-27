import { Track } from "livekit-client";
import React from "react";
import { useEffect, useRef} from "react";

const AudWrapper = React.memo(({ track, isLocal }: {
  track: Track;
  isLocal: boolean;
}
) => {
  const audioEl = useRef<HTMLAudioElement>();

  useEffect(() => {
    if (isLocal) {
      // don't play own audio
      return;
    }
    audioEl.current = track.attach();
    if (track.sid) {
      audioEl.current.setAttribute("data-audio-track-id", track.sid);
    }
    return () => track.detach().forEach((el) => el.remove());
  }, [track, isLocal]);

  // TODO: allow set sink id
  return null;
});
export default AudWrapper;