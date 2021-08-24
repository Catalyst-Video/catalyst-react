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
import React, { useEffect, useRef, useState } from 'react';
import { debounce } from 'ts-debounce';


const VidWrapper = React.memo(
  ({
    track,
    isLocal,
  }: {
    track: Track;
    isLocal: boolean;
  }) => {
          const ref = useRef<HTMLVideoElement>(null);
          const [isLoading, setIsLoading] = useState(false);

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

          const facesMember =
            track.mediaStreamTrack?.getSettings().facingMode !== 'environment';

          const debouncedLoad = debounce(() => setIsLoading(true), 400, {
            isImmediate: false,
          });

          return (
            <>
              {isLoading && (
                <div className="catalyst-ld-1 h-16 w-16 absolute self-center">
                  <div className="catalyst-ld-inner"></div>
                </div>
              )}
              <video
                ref={ref}
                onLoadStart={debouncedLoad}
                onWaiting={debouncedLoad} // debounce(() => setIsLoading(true), 50)}
                onPlaying={() => {
                  debouncedLoad.cancel();
                  setIsLoading(false);
                }}
                className={`min-h-0 min-w-0 rounded-lg z-10 h-auto w-full ${
                  isLocal && facesMember ? 'rm-uncanny-valley' : ''
                } contain max-vid-height`} // TODO: switch to adaptive contain vs cover
              />
            </>
          );
        }
);
export default VidWrapper;
