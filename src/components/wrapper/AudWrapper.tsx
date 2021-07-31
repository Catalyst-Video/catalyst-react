import { Track } from "livekit-client";
import React from "react";
import { useEffect, useRef} from "react";
import { useCookies } from "react-cookie";

const AudWrapper = React.memo(({ track, isLocal, sinkId }: {
  track: Track;
  isLocal: boolean;
  sinkId?: string;
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

    useEffect(() => {
    // TODO: Audio output device 
    if (sinkId) {
      // @ts-ignore
      (audioEl.current as HTMLAudioElement)?.setSinkId(sinkId);
    }
    }, [])
    // if (sinkId) {
    //    (audioEl.current as HTMLMediaElement)?.setSinkId(audioOutputDevice.deviceId).then(() => {
    //     document.body.appendChild(audioElement);
    //   });
    // }
    return () => track.detach().forEach((el) => el.remove());
  }, [track, isLocal]);

  return null;
});
export default AudWrapper;