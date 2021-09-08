// import { Camera } from "@mediapipe/camera_utils";
import { Results, SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import { LocalVideoTrack } from "livekit-client";

export class BgFilter {

 foreground: HTMLCanvasElement
 background: HTMLCanvasElement
 backgroundCtx: CanvasRenderingContext2D | null
 outputCtx: CanvasRenderingContext2D | null;
 effect: string = 'blur'; // blur | video | image
 bgImage: HTMLImageElement | null;
 bgVideo: HTMLVideoElement | null;
  foregroundType: string = 'normal'; // normal | presenter
  presenterOffset: number = 0;
  inputVid: HTMLVideoElement;
  outputCanvas: HTMLCanvasElement;
  
  constructor() {
    this.foreground = document.createElement(
    'canvas'
    );
    this.background = document.createElement(
    'canvas'
    );
    this.backgroundCtx = this.background.getContext(
    '2d'
    );
    this.inputVid = document.createElement('video')
    this.outputCanvas = document.createElement('canvas')
    this.outputCtx = null;
    this.bgImage = null;
    this.bgVideo = null;
  }

 segmentBackground = async (
//  inputVideoElement: HTMLVideoElement,
//   outputCanvasElement: HTMLCanvasElement,
  modelSelection: 0 | 1 = 1
) =>{
  this.foreground.width = this.background.width =
    this.outputCanvas.width;
  this.foreground.height = this.background.height = this.outputCanvas.height;
   this.outputCtx = this.outputCanvas.getContext('2d');

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
   


  // const camera = new Camera(inputVideoElement, {
  //   onFrame: async () => {
  //     await selfieSegmentation.send({ image: inputVideoElement });
  //   },
  //   width: inputVideoElement.width,
  //   height: inputVideoElement.height,
  // });
  // camera.start();
  let vidEl = this.inputVid;
  this.inputVid.addEventListener('play', () => {
    async function step() {
      // console.log('step');
      await selfieSegmentation.send({ image: vidEl });
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

 mergeForegroundBackground = (
  foregroundCanvasElement: HTMLCanvasElement,
  backgroundCanvasElement: HTMLCanvasElement,
  results: Results
) => {
  // console.log('merging', results)
  this.makeCanvasLayer(results, foregroundCanvasElement, 'foreground');
  if (this.effect === 'blur')
    this.makeCanvasLayer(results, backgroundCanvasElement, 'background');
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
}

 makeCanvasLayer = (results: Results, canvasElement: HTMLCanvasElement, type: string) => {
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

 applyBlur = (blurIntensity: number = 7) => {
         this.effect = 'blur';
         this.foregroundType = 'normal';
         if (this.backgroundCtx)
           this.backgroundCtx.filter = `blur(${blurIntensity}px)`;
       }

  applyImageBackground = (image: HTMLImageElement) => {
         this.bgImage = image;
         this.foregroundType = 'normal';
         this.effect = 'image';
       }

 applyVideoBackground = (video: HTMLVideoElement) => {
         this.bgVideo = video;
         video.autoplay = true;
         video.loop = true;
         video.addEventListener('play', () => {
           video.muted = true;
         });
         this.effect = 'video';
       }

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
}

 changeForegroundType = (type: string, offset: number = 0) => {
  this.foregroundType = type;
  this.presenterOffset = offset;
}


 init = (
  inputStream: MediaStream,
  bg?: string
): MediaStreamTrack => {
    console.log(inputStream);


   this.inputVid.srcObject = inputStream;
   this.inputVid.play()
    // console.log(canvasEl)

     const width =
       window.innerHeight > window.innerWidth
         ? inputStream.getVideoTracks()[0].getSettings().height
         : inputStream.getVideoTracks()[0].getSettings().width;
     const height =
       window.innerHeight > window.innerWidth
         ? inputStream.getVideoTracks()[0].getSettings().width
         : inputStream.getVideoTracks()[0].getSettings().height;

    // document.getElementById('root')?.appendChild(this.inputVideoElement);
    // videoEl.style.zIndex = '99998';
    // videoEl.style.position = 'absolute';
    // videoEl.style.top = '0';
    // videoEl.style.left = '0';
    // console.log(height, width)
    // canvasEl.style.height = height + 'px';
    // canvasEl.style.width = width + 'px';

    // document.getElementById('root')?.appendChild(this.outputCanvas);
    // this.outputCanvas.style.zIndex = '99998';
    // this.outputCanvas.style.position = 'absolute';
    // this.outputCanvas.style.bottom = '0';
    // this.outputCanvas.style.right = '0';
    // this.outputCanvas.style.height = height + 'px';
    // this.outputCanvas.style.width = width + 'px';

    this.segmentBackground();
    // this.applyBlur(7);
    const image = new Image();
    image.src = 'https://terrigen-cdn-dev.marvel.com/content/prod/1x/333.jpg';
    this.applyImageBackground(image);
    const bgRemovedStream = this.outputCanvas.captureStream(27);

    return bgRemovedStream.getVideoTracks()[0]
    // return new MediaStream(bgRemovedStream).getVideoTracks()[0];
}

}

export function convertToLocalVideoTrack(
  mediaStreamTrack: MediaStreamTrack,
  name?: string,
  constraints?: MediaTrackConstraints
): LocalVideoTrack {
  // return new LocalVideoTrack(mediaStreamTrack);
  return new LocalVideoTrack(mediaStreamTrack, name, constraints);
}

