import { useEffect, useState } from 'react';
import { LocalTrack } from 'livekit-client';
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';
import { Camera } from '@mediapipe/camera_utils';
import { LocalAudioTrack, LocalVideoTrack } from 'livekit-client';

function createLocalTrack(
  mediaStreamTrack: MediaStreamTrack,
  name: string,
  constraints: MediaTrackConstraints
) {
  switch (mediaStreamTrack.kind) {
    case 'audio':
      return new LocalAudioTrack(mediaStreamTrack, name, constraints);
    case 'video':
      return new LocalVideoTrack(mediaStreamTrack, name, constraints);
    default:
      throw new console.log(`unsupported track type: ${mediaStreamTrack.kind}`);
  }
}

function createLocalVideoTrack(
  mediaStreamTrack: MediaStreamTrack,
  name?: string,
  constraints?: MediaTrackConstraints
) {
    return new LocalVideoTrack(mediaStreamTrack, name, constraints)
  }

export async function createBgRemovedVideoTrack(
         videoTrack?: LocalTrack,
         options?: {
           audio:
             | boolean
             | {
                 deviceId: string;
               };
           video:
             | boolean
             | {
                 deviceId: string;
               };
         },
         bg?: string
       ): Promise<LocalTrack> {
         const canvasElement: HTMLCanvasElement = document.createElement(
           'canvas'
         );
         const canvasCtx = canvasElement.getContext('2d');
  const videoElement = document.createElement('video');
  if (videoTrack) videoTrack.attach(videoElement);

         //  videoElement.muted = true;
         //  const vidTrack = tracks.find(track => track.kind === 'video');
         // vidTrack?.attach(videoElement);

         document.getElementById('root')?.appendChild(videoElement);
         videoElement.style.zIndex = '99998';
         videoElement.style.position = 'absolute';
         videoElement.style.bottom = '0';
         videoElement.style.right = '0';
         videoElement.style.width = '640px';
         videoElement.style.height = '480px';
         // test
        //   document.getElementById("root")?.appendChild(canvasElement);
        //   canvasElement.style.zIndex = '99999';
        //   canvasElement.style.position = 'absolute';
        //   canvasElement.style.top = '0';
        //  canvasElement.style.left = '0';
        //  canvasElement.style.width = '640px';
        //  canvasElement.style.height = '480px';

         const onBgEffectResults = results => {
           // console.log('trigger results', results);

           if (canvasCtx) {
             // Save the context's blank state
             canvasCtx?.save();

             // Draw the raw frame
             canvasCtx?.drawImage(
               results.image,
               0,
               0,
               canvasElement.width,
               canvasElement.height
             );

             // Make all pixels not in the segmentation mask transparent
             canvasCtx.globalCompositeOperation = 'destination-atop';
             canvasCtx?.drawImage(
               results.segmentationMask,
               0,
               0,
               canvasElement.width,
               canvasElement.height
             );

             // Blur the context for all subsequent draws then set the raw image as the background
             canvasCtx.filter = 'blur(16px)';
             canvasCtx.globalCompositeOperation = 'destination-over';
             canvasCtx.drawImage(
               results.image,
               0,
               0,
               canvasElement.width,
               canvasElement.height
             );

             // Restore the context's blank state
             canvasCtx.restore();
           }
         };

         const selfieSegmentation = new SelfieSegmentation({
           locateFile: file => {
             return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
           },
         });
         selfieSegmentation.setOptions({
           modelSelection: 1,
         });
         selfieSegmentation.onResults(onBgEffectResults);

         if (videoElement) {
           console.log('def', videoElement);
           const camera = new Camera(videoElement, {
             onFrame: async () => {
               await selfieSegmentation.send({ image: videoElement });
             },
             width: 640,
             height: 480,
           });
           camera.start();
         }

         const bgRemovedStream = canvasElement.captureStream(30);
  var bgRemovedTrack = bgRemovedStream.getVideoTracks()[0];
  return createLocalVideoTrack(bgRemovedTrack, bgRemovedTrack.label, bgRemovedTrack.getConstraints());
        //  bgRemovedStream.getVideoTracks().map(track => {
        //    console.log('bg-removed', track);
        //    bgRemovedTracks.push(
        //      createLocalVideoTrack(track, track.label, track.getConstraints())
        //    );
        //  });
        //  return bgRemovedTracks;
         // return tracks;
       }

export default createBgRemovedVideoTrack;
