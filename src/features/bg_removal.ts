// import { Camera } from "@mediapipe/camera_utils";
import { Results, SelfieSegmentation } from '@mediapipe/selfie_segmentation';
import { LocalVideoTrack } from 'livekit-client';

export class BgFilter {
         foreground: HTMLCanvasElement;
         background: HTMLCanvasElement;
         backgroundCtx: CanvasRenderingContext2D | null;
         outputCtx: CanvasRenderingContext2D | null;
         effect: string = 'blur'; // blur | video | image
         bgImage: HTMLImageElement | null;
         bgVideo: HTMLVideoElement | null;
         foregroundType: string = 'normal'; // normal | presenter
         presenterOffset: number = 0;
         inputVid: HTMLVideoElement;
         outputCanvas: HTMLCanvasElement;

         // initialize bg filters
         constructor() {
           this.foreground = document.createElement('canvas');
           this.background = document.createElement('canvas');
           this.backgroundCtx = this.background.getContext('2d');
           this.inputVid = document.createElement('video');
           this.outputCanvas = document.createElement('canvas');
           this.outputCtx = null;
           this.bgImage = null;
           this.bgVideo = null;
         }

         // segment bg into foreground and background, necessary for all types of bg removal. Accomplished using mediapipe
         segmentBackground = async (
           //  inputVideoElement: HTMLVideoElement,
           //   outputCanvasElement: HTMLCanvasElement,
           modelSelection: 0 | 1 = 1
         ) => {
           this.foreground.width = this.background.width = this.outputCanvas.width;
           this.foreground.height = this.background.height = this.outputCanvas.height;
           this.outputCtx = this.outputCanvas.getContext('2d');
           // create selfie seg model, load and init
           const selfieSegmentation = new SelfieSegmentation({
             locateFile: file => {
               return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
             },
           });
           selfieSegmentation.setOptions({
             modelSelection: modelSelection,
           });
           selfieSegmentation.onResults(results => {
             // console.log('results1', results)
             this.mergeForegroundBackground(
               this.foreground,
               this.background,
               results
             );
           });
           // IGNORE THIS - alternative method we cannot use anymore for device input reasons
           // const camera = new Camera(inputVideoElement, {
           //   onFrame: async () => {
           //     await selfieSegmentation.send({ image: inputVideoElement });
           //   },
           //   width: inputVideoElement.width,
           //   height: inputVideoElement.height,
           // });
           // camera.start();

           // once video is playing, send frames to mediapipe
           this.inputVid.addEventListener('play', () => {
             let vidEl = this.inputVid;
             //  console.log(vidEl, vidEl.width, vidEl.height);
             // for each frame, send to mediapipe
             async function step() {
               // console.log('step');
               if (vidEl && vidEl.width > 0 && vidEl.height > 0)
                 await selfieSegmentation.send({ image: vidEl });
               requestAnimationFrame(step);
             }
             requestAnimationFrame(step);
           });
         };

         // merge foreground and background into output canvas
         /*
         1. A function that will merge the foreground and background layers.
         2. We create a canvas element that will be used to hold the foreground layer.
         3. We create a canvas element that will be used to hold the background layer.
         4. We create a canvas element that will be used to hold the output layer.
         */
         mergeForegroundBackground = (
           foregroundCanvasElement: HTMLCanvasElement,
           backgroundCanvasElement: HTMLCanvasElement,
           results: Results
         ) => {
           // console.log('merging', results)
           this.makeCanvasLayer(results, foregroundCanvasElement, 'foreground');
           if (this.effect === 'blur')
             this.makeCanvasLayer(
               results,
               backgroundCanvasElement,
               'background'
             );
           else if (this.effect === 'image' && this.bgImage) {
             this.backgroundCtx?.drawImage(
               this.bgImage,
               0,
               0,
               backgroundCanvasElement.width,
               backgroundCanvasElement.height
             );
           } else if (this.effect === 'video' && this.bgVideo) {
             this.backgroundCtx?.drawImage(
               this.bgVideo,
               0,
               0,
               backgroundCanvasElement.width,
               backgroundCanvasElement.height
             );
           }
           this.outputCtx?.drawImage(backgroundCanvasElement, 0, 0);
           if (this.foregroundType === 'presenter')
             this.outputCtx?.drawImage(
               foregroundCanvasElement,
               foregroundCanvasElement.width * 0.5 - this.presenterOffset,
               foregroundCanvasElement.height * 0.5,
               foregroundCanvasElement.width * 0.5,
               foregroundCanvasElement.height * 0.5
             );
           else this.outputCtx?.drawImage(foregroundCanvasElement, 0, 0);
         };

         /*
         1. The first function, makeCanvasLayer, creates a canvas element and adds it to the DOM.
         2. The second function, drawCanvasLayer, draws the image and segmentation mask to the canvas.
         3. The third function, updateCanvasLayer, updates the canvas element with the latest image and segmentation mask.
         */
         // make individual canvas layers
         makeCanvasLayer = (
           results: Results,
           canvasElement: HTMLCanvasElement,
           type: string
         ) => {
           const canvasCtx = canvasElement.getContext('2d');

           canvasCtx?.save();

           canvasCtx?.clearRect(
             0,
             0,
             canvasElement.width,
             canvasElement.height
           );
           canvasCtx?.drawImage(
             results.segmentationMask,
             0,
             0,
             canvasElement.width,
             canvasElement.height
           );
           if (type === 'foreground' && canvasCtx?.globalCompositeOperation) {
             canvasCtx.globalCompositeOperation = 'source-in';
           }

           canvasCtx?.drawImage(
             results.image,
             0,
             0,
             canvasElement.width,
             canvasElement.height
           );

           canvasCtx?.restore();
         };

         // apply blur effect
         applyBlur = (intensity: number = 7) => {
           this.effect = 'blur';
           this.foregroundType = 'normal';
           if (this.backgroundCtx)
             this.backgroundCtx.filter = `blur(${intensity}px)`;
         };

         // add img bg
         applyImageBackground = (image: HTMLImageElement) => {
           this.bgImage = image;
           this.foregroundType = 'normal';
           this.effect = 'image';
         };

         // add video bg
         applyVideoBackground = (video: HTMLVideoElement) => {
           this.bgVideo = video;
           video.autoplay = true;
           video.loop = true;
           video.addEventListener('play', () => {
             video.muted = true;
           });
           this.effect = 'video';
         };

         // add presentation bg
         /*
         1. The applyScreenBackground function takes a MediaStream object as a parameter.
         2. It creates a video element and sets its srcObject property to the MediaStream object.
         */
         applyScreenBackground = (stream: MediaStream) => {
           const videoElement = document.createElement('video');
           videoElement.srcObject = stream;
           if (this.bgVideo) this.bgVideo = videoElement;

           videoElement.autoplay = true;
           videoElement.loop = true;
           videoElement.addEventListener('play', () => {
             videoElement.muted = true;
           });
           this.effect = 'video';
         };

         // change mode
         changeForegroundType = (type: string, offset: number = 0) => {
           this.foregroundType = type;
           this.presenterOffset = offset;
         };

         // initialize filters by creating an input video element based on mediastream, then apply filters and capture stream from output canvas to return a mediastream track with the filter applied
         init = (inputStream: MediaStream, bg?: string): void => {
          //  console.log(inputStream);

           const width =
             (window.innerHeight > window.innerWidth
               ? inputStream.getVideoTracks()[0].getSettings().height
               : inputStream.getVideoTracks()[0].getSettings().width) ?? 0;
           const height =
             (window.innerHeight > window.innerWidth
               ? inputStream.getVideoTracks()[0].getSettings().width
               : inputStream.getVideoTracks()[0].getSettings().height) ?? 0;

           this.inputVid.srcObject = inputStream;
           this.inputVid.height = height;
           this.inputVid.width = width;
           this.foreground.width = width;
           this.foreground.height = height;
           this.background.width = width;
           this.background.height = height;
           this.outputCanvas.height = height;
           this.outputCanvas.width = width;
           this.inputVid.play();
           // console.log(canvasEl)

           // document.getElementById('root')?.appendChild(this.inputVideoElement);
           // videoEl.style.zIndex = '99998';
           // videoEl.style.position = 'absolute';
           // videoEl.style.top = '0';
           // videoEl.style.left = '0';
           // console.log(height, width)
           // canvasEl.style.height = height + 'px';
           // canvasEl.style.width = width + 'px';

           //TODO: uncomment to test
          //  document.getElementById('root')?.appendChild(this.outputCanvas);
          //  this.outputCanvas.style.zIndex = '99998';
          //  this.outputCanvas.style.position = 'absolute';
          //  this.outputCanvas.style.bottom = '0';
          //  this.outputCanvas.style.right = '0';
          //  this.outputCanvas.style.height = height + 'px';
          //  this.outputCanvas.style.width = width + 'px';

           this.segmentBackground();

           if (bg === 'blur') {
            this.applyBlur(15);
           } else {
             const image = new Image();
             image.src =
               bg ??
               'https://terrigen-cdn-dev.marvel.com/content/prod/1x/333.jpg';
             this.applyImageBackground(image);
           }
           showFramesPerSecond();
          //  const image = new Image();
          //  image.src =
          //    'https://terrigen-cdn-dev.marvel.com/content/prod/1x/333.jpg';
          //  this.applyImageBackground(image);
           // const bgRemovedStream = this.outputCanvas.captureStream(27);
          //  const bgRemovedStream = this.outputCanvas.captureStream(27);
           // return bgRemovedStream.getVideoTracks()[0];
           // return new MediaStream(bgRemovedStream).getVideoTracks()[0];
         };

         getBgRemovedTrack = (): MediaStreamTrack => {
           const bgRemovedStream = this.outputCanvas.captureStream(25);
           return bgRemovedStream.getVideoTracks()[0];
         };
       }

// convert mediastreamtrack to LiveKit local track
export function convertToLocalVideoTrack(
  mediaStreamTrack: MediaStreamTrack,
  // name?: string,
  constraints?: MediaTrackConstraints
): LocalVideoTrack {
  return new LocalVideoTrack(mediaStreamTrack, mediaStreamTrack.label, constraints ?? mediaStreamTrack.getConstraints());
  // return new LocalVideoTrack(mediaStreamTrack, name, constraints);
}


function showFramesPerSecond() {
  const fpsEl: HTMLElement = document.createElement('span');
  document.getElementById('root')?.appendChild(fpsEl);
  fpsEl.style.zIndex = '99998';
  fpsEl.style.position = 'absolute';
  fpsEl.style.bottom = '0';
  fpsEl.style.right = '0';
  fpsEl.style.color = 'white';
  const numDecimals = 2;
  const updateDelaySeconds = 1;

  const decimalPlaces = Math.pow(10, numDecimals);
  let time: DOMHighResTimeStamp[] = [];

  let fps = 0;
  const tick = () => {
    time.push(performance.now());

    const msPassed =
      time[time.length - 1] - time[0];

    if (msPassed >= updateDelaySeconds * 1000) {
      fps =
        Math.round(
          (time.length / msPassed) * 1000 * decimalPlaces
        ) / decimalPlaces;
      time = [];
    }

    fpsEl.innerText = `FPS: ${fps}`;

    requestAnimationFrame(() => {
      tick();
    });
  };
  tick();
}