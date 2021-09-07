import { Camera } from "@mediapipe/camera_utils";
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";

// class to apply background removal using mediapipe
type BG = string | HTMLImageElement | HTMLCanvasElement | ImageBitmap | ImageData;
class BgFilter {
  bgRemovedTrack: MediaStreamTrack;
  bg: BG;

  constructor(inputTrack: MediaStreamTrack, bg: BG) {
    this.bg = bg;
    switch (bg) {
      case 'blur':
        this.bgRemovedTrack = inputTrack;
        break;
      default:
        this.bgRemovedTrack = inputTrack; //this.applyBgRemoval(videoTrack);
    }
  }

    applyBg = async () => {
        const canvasElement: HTMLCanvasElement = document.createElement('canvas');
        const canvasCtx = canvasElement.getContext('2d');
        const videoElement = document.createElement('video');

        function onResults(results) {
            if (canvasCtx) {
                // Save the context's blank state
                canvasCtx.save();

                // Draw the raw frame
                canvasCtx.drawImage(
                    results.image,
                    0,
                    0,
                    canvasElement.width,
                    canvasElement.height
                );

                // Make all pixels not in the segmentation mask transparent
                canvasCtx.globalCompositeOperation = 'destination-atop';
                canvasCtx.drawImage(
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
        selfieSegmentation.onResults(onResults);

        const camera = new Camera(videoElement, {
            onFrame: async () => {
            await selfieSegmentation.send({ image: videoElement });
            },
            width: 640,
            height: 480,
        });
        camera.start();

        const bgRemovedStream = canvasElement.captureStream(30);
        this.bgRemovedTrack = bgRemovedStream.getVideoTracks()[0];
    }

    getOutput = async () => {
        await this.applyBg()
        console.log(this.bgRemovedTrack)
      return this.bgRemovedTrack;
  };
    }
