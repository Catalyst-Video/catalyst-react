// import { Camera } from "@mediapipe/camera_utils";
// import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";

// // class to apply background removal using mediapipe
// type BG = string | HTMLImageElement | HTMLCanvasElement | ImageBitmap | ImageData;
// export class BgFilter {
//          effectType: string; // blur | video | image
//          foregroundCanvasElement: HTMLCanvasElement;
//          backgroundCanvasElement: HTMLCanvasElement;
//          backgroundCanvasCtx?: CanvasRenderingContext2D;
//          bgRemovedTrack: MediaStreamTrack;
//          outputCanvasElement: HTMLCanvasElement;
//          outputCanvasCtx?: CanvasRenderingContext2D;
//          backgroundImage?: HTMLImageElement;
//          backgroundVideo?: HTMLVideoElement;
//          foregroundType: string;
//          presenterModeOffset: number;

//          constructor(inputTrack: MediaStreamTrack, bg?: BG) {
//            this.foregroundCanvasElement = document.createElement('canvas');
//            this.backgroundCanvasElement = document.createElement('canvas');
//            this.outputCanvasElement = document.createElement('canvas');
//            let ctx = this.backgroundCanvasElement.getContext('2d');
//            if (ctx) this.backgroundCanvasCtx = ctx;
//            this.effectType = 'blur'; // blur | video | image
//            this.foregroundType = 'normal'; // normal | presenter
//            this.presenterModeOffset = 0;
//            switch (bg) {
//              case 'blur':
//                this.bgRemovedTrack = inputTrack;
//                break;
//              default:
//                this.bgRemovedTrack = inputTrack; //this.applyBgRemoval(videoTrack);
//            }
//          }

//          segmentBackground = async (
//            inputVideoElement: HTMLVideoElement,
//            outputCanvasElement: HTMLCanvasElement,
//            modelSelection: number = 1
//          ) => {
//            this.foregroundCanvasElement.width = this.backgroundCanvasElement.width = this.outputCanvasElement.width;
//            this.foregroundCanvasElement.height = this.backgroundCanvasElement.height = this.outputCanvasElement.height;
//            if (this.outputCanvasCtx)
//              this.outputCanvasCtx = this.outputCanvasElement?.getContext('2d');

//            let selfieSegmentation = new SelfieSegmentation({
//              locateFile: file => {
//                return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
//              },
//            });
//            selfieSegmentation.setOptions({
//              modelSelection: modelSelection,
//            });
//            selfieSegmentation.onResults(results => {
//               this.mergeForegroundBackground(
//                 this.foregroundCanvasElement,
//                 this.backgroundCanvasElement,
//                 results
//               );
//            });

//            inputVideoElement.addEventListener('play', () => {
//              async function step() {
//                await selfieSegmentation.send({ image: inputVideoElement });
//                requestAnimationFrame(step);
//              }
//              requestAnimationFrame(step);
//            });
//          };

        
//        }
