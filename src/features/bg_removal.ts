import { Camera } from "@mediapipe/camera_utils";
import { Results, SelfieSegmentation } from "@mediapipe/selfie_segmentation";

const script = document.createElement('script');
script.type = 'text/javascript';
script.src =
  'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/selfie_segmentation.js';
script.crossOrigin = 'anonymous';

document.getElementsByTagName('head')[0].appendChild(script);

const foregroundCanvasElement: HTMLCanvasElement = document.createElement(
  'canvas'
);
const backgroundCanvasElement: HTMLCanvasElement = document.createElement(
  'canvas'
);
const backgroundCanvasCtx: CanvasRenderingContext2D | null = backgroundCanvasElement.getContext(
  '2d'
);

let outputCanvasCtx: CanvasRenderingContext2D | null;
let effectType: string = 'blur'; // blur | video | image
let backgroundImage: HTMLImageElement;
let backgroundVideo: HTMLVideoElement
let foregroundType: string = 'normal'; // normal | presenter
let presenterModeOffset: number = 0;

export async function segmentBackground(
 inputVideoElement: HTMLVideoElement,
  outputCanvasElement: HTMLCanvasElement,
  modelSelection: 0 | 1 = 1
) {
  foregroundCanvasElement.width = backgroundCanvasElement.width =
    outputCanvasElement.width;
  foregroundCanvasElement.height = backgroundCanvasElement.height =
    outputCanvasElement.height;
   outputCanvasCtx = outputCanvasElement.getContext('2d');

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
    mergeForegroundBackground(
      foregroundCanvasElement,
      backgroundCanvasElement,
      results
    );
  });

  const camera = new Camera(inputVideoElement, {
    onFrame: async () => {
      await selfieSegmentation.send({ image: inputVideoElement });
    },
    width: inputVideoElement.width,
    height: inputVideoElement.height,
  });
  camera.start();

  // inputVideoElement.addEventListener('play', () => {
  //   async function step() {
  //     await selfieSegmentation.send({ image: inputVideoElement });
  //     requestAnimationFrame(step);
  //   }
  //   requestAnimationFrame(step);
  // });
}

function mergeForegroundBackground(
  foregroundCanvasElement: HTMLCanvasElement,
  backgroundCanvasElement: HTMLCanvasElement,
  results: Results
) {
  // console.log('merging', results)
  makeCanvasLayer(results, foregroundCanvasElement, 'foreground');
  if (effectType === 'blur')
    makeCanvasLayer(results, backgroundCanvasElement, 'background');
  else if (effectType === 'image') {
    backgroundCanvasCtx?.drawImage(
      backgroundImage,
      0,
      0,
      backgroundCanvasElement.width,
      backgroundCanvasElement.height
    );
  } else if (effectType === 'video') {
    backgroundCanvasCtx?.drawImage(
      backgroundVideo,
      0,
      0,
      backgroundCanvasElement.width,
      backgroundCanvasElement.height
    );
  }
  outputCanvasCtx?.drawImage(backgroundCanvasElement, 0, 0);
  if (foregroundType === 'presenter')
    outputCanvasCtx?.drawImage(
      foregroundCanvasElement,
      foregroundCanvasElement.width * 0.5 - presenterModeOffset,
      foregroundCanvasElement.height * 0.5,
      foregroundCanvasElement.width * 0.5,
      foregroundCanvasElement.height * 0.5
    );
  else outputCanvasCtx?.drawImage(foregroundCanvasElement, 0, 0);
}

function makeCanvasLayer(results: Results, canvasElement: HTMLCanvasElement, type: string) {
  const canvasCtx = canvasElement.getContext('2d');

  canvasCtx?.save();

  canvasCtx?.clearRect(0, 0, canvasElement.width, canvasElement.height);
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
}

export function applyBlur(blurIntensity: number = 7) {
         effectType = 'blur';
         foregroundType = 'normal';
         if (backgroundCanvasCtx)
           backgroundCanvasCtx.filter = `blur(${blurIntensity}px)`;
       }

export function applyImageBackground(image: HTMLImageElement) {
         backgroundImage = image;
         foregroundType = 'normal';
         effectType = 'image';
       }

export function applyVideoBackground(video: HTMLVideoElement) {
         backgroundVideo = video;
         video.autoplay = true;
         video.loop = true;
         video.addEventListener('play', () => {
           video.muted = true;
         });
         effectType = 'video';
       }

export function applyScreenBackground(stream: MediaStream) {
  const videoElement = document.createElement('video');
  videoElement.srcObject = stream;
  if (backgroundVideo) backgroundVideo = videoElement;

  videoElement.autoplay = true;
  videoElement.loop = true;
  videoElement.addEventListener('play', () => {
    videoElement.muted = true;
  });
  effectType = 'video';
}

export function changeForegroundType(type, offset = 0) {
  foregroundType = type;
  presenterModeOffset = offset;
}


export function createBgFilters(
  inputStream: MediaStream,
  bg?: string
) {
  console.log(inputStream);
  const videoEl: HTMLVideoElement = document.createElement('video');
  const canvasEl: HTMLCanvasElement = document.createElement('canvas');

  // let myStream = await navigator.mediaDevices.getUserMedia({
  //   video: {
  //     width: { ideal: 1920 },
  //     height: { ideal: 1080 },
  //   }
  // });

  videoEl.srcObject = inputStream;
  console.log(canvasEl)

   const width =
     window.innerHeight > window.innerWidth
       ? inputStream.getVideoTracks()[0].getSettings().height
       : inputStream.getVideoTracks()[0].getSettings().width;
   const height =
     window.innerHeight > window.innerWidth
       ? inputStream.getVideoTracks()[0].getSettings().width
       : inputStream.getVideoTracks()[0].getSettings().height;

  // document.getElementById('root')?.appendChild(videoEl);
  // videoEl.style.zIndex = '99998';
  // videoEl.style.position = 'absolute';
  // videoEl.style.top = '0';
  // videoEl.style.left = '0';
  // console.log(height, width)
  // canvasEl.style.height = height + 'px';
  // canvasEl.style.width = width + 'px';


  // document.getElementById('root')?.appendChild(canvasEl);
  // canvasEl.style.zIndex = '99998';
  // canvasEl.style.position = 'absolute';
  // canvasEl.style.bottom = '0';
  // canvasEl.style.right = '0';
  // canvasEl.style.height = height + 'px';
  // canvasEl.style.width = width + 'px';


  // segments foreground & background
  segmentBackground(videoEl, canvasEl);
  applyBlur(5);
  
  const bgRemovedStream = canvasEl.captureStream(27)
  return bgRemovedStream.getVideoTracks()[0]
}