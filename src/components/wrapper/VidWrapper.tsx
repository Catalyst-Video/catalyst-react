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
import { BackgroundConfig, SegmentationConfig } from '../../features/bg_remove/interfaces';
import useDebounce from '../../hooks/useDebounce';
import useRenderingPipeline from '../../hooks/useRenderingPipeline';
import useTFLite from '../../hooks/useTFLite';


const VidWrapper = React.memo(
  ({
    track,
    isLocal,
  }: {
    track: Track;
    isLocal: boolean;
  }) => {
    const vidRef = useRef<HTMLVideoElement>(null);
    var cvRef = useRef<HTMLCanvasElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const debouncedIsLoading = useDebounce<boolean>(isLoading, 250);
    
    const backgroundConfig: BackgroundConfig = {
      type: 'image',
      url:
        'https://images.squarespace-cdn.com/content/v1/51f2c709e4b01b79caf00ebf/1585856237577-UHTQOWVOAO1HBVXHKXDG/Zoom-Virtual-Backgrounds-0001.jpg',
    };

    const segmentationConfig: SegmentationConfig = {
      model: 'meet',
      backend: 'wasm',
      inputResolution: '160x96',
      pipeline: 'webgl2',
    };

    const { tflite, isSIMDSupported } = useTFLite(segmentationConfig);
    if (vidRef.current && tflite) {
      const sourceEl = {
      htmlElement: vidRef.current,
      width: vidRef.current.width,
      height: vidRef.current.height,
      }
      const {
        pipeline,
        backgroundImageRef,
        canvasRef,
        fps,
        durations: [resizingDuration, inferenceDuration, postProcessingDuration],
      } = useRenderingPipeline(
        sourceEl,
        backgroundConfig,
        segmentationConfig,
        tflite
        );
      cvRef = canvasRef;
    }

        useEffect(() => {
          const vidEl = vidRef.current;
          if (!vidEl) {
            return;
          }
          vidEl.muted = true;
          track.attach(vidEl);
          return () => {
            track.detach(vidEl);
          };
        }, [track, vidRef]);

        const facesMember = track.mediaStreamTrack?.getSettings().facingMode !== 'environment';
    
          return (
            <>
              {debouncedIsLoading && (
                <div className="catalyst-ld-1 h-16 w-16 absolute self-center">
                  <div className="catalyst-ld-inner"></div>
                </div>
              )}
              <canvas
                key={segmentationConfig.pipeline}
                ref={cvRef}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                width={vidRef.current?.width}
                height={vidRef.current?.height}
              />
              <video
                ref={vidRef}
                onLoadStart={() => setIsLoading(true)}
                onWaiting={() => setIsLoading(true)}
                onPlaying={() => setIsLoading(false)}
                className={`min-h-0 min-w-0 rounded-lg z-10 h-auto w-full ${
                  isLocal && facesMember ? 'rm-uncanny-valley' : ''
                } contain max-vid-height`} // TODO: switch to adaptive contain vs cover
              />
            </>
          );
        }
);
export default VidWrapper;
