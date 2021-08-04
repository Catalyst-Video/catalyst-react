/*  Catalyst Scientific Video Chat Component File
Copyright (C) 2021 Catalyst Scientific LLC, Seth Goldin & Joseph Semrai

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version. 

While this code is open-source, you may not use your own version of this
program commerically for free (whether as a business or attempting to sell a variation
of Catalyst for a profit). If you are interested in using Catalyst in an 
enterprise setting, please either visit our website at https://catalyst.chat 
or contact us for more information.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

You can contact us for more details at support@catalyst.chat. */

import { Track } from 'livekit-client';
import React from 'react';
import { useEffect, useRef } from 'react';

const AudWrapper = ({
  track,
  isLocal,
  sinkId,
}: {
  track: Track;
  isLocal: boolean;
  sinkId?: string;
}) => {
  const audioEl = useRef<HTMLAudioElement>();

  useEffect(() => {
    console.log('Track:', track);
    console.log('Sink Set:', sinkId);
    if (isLocal) {
      // don't play own audio
      return;
    }
    audioEl.current = track.attach();
    if (track.sid) {
      audioEl.current.setAttribute('data-audio-track-id', track.sid);
    }

    console.log('wrapper audio');

    // TODO: Audio output device
    if (sinkId) {
      // @ts-ignore
      (audioEl.current as HTMLAudioElement)?.setSinkId(sinkId);
    }
    // if (sinkId) {
    //    (audioEl.current as HTMLMediaElement)?.setSinkId(audioOutputDevice.deviceId).then(() => {
    //     document.body.appendChild(audioElement);
    //   });
    // }
    return () => track.detach().forEach(el => el.remove());
  }, [track, isLocal, sinkId]);

  return null;
};
export default AudWrapper;
