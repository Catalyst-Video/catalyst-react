import { LocalTrack } from "livekit-client";
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';
import { Camera } from '@mediapipe/camera_utils';

const canvasElement: HTMLCanvasElement = document.createElement('canvas');
const canvasCtx = canvasElement.getContext('2d');
const videoElement = document.createElement('video');

const onBgEffectResults = results => {
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

export const applyBgEffect = async (tracks: LocalTrack[]) => {
  // const videoElement = document.getElementsByClassName('input_video')[0];

  const selfieSegmentation = new SelfieSegmentation({
    locateFile: file => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
    },
  });
  selfieSegmentation.setOptions({
    modelSelection: 1,
  });
  selfieSegmentation.onResults(onBgEffectResults);

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await selfieSegmentation.send({ image: videoElement });
    },
    width: 640,
    height: 480,
  });
    camera.start();
    
    return canvasElement;
};
