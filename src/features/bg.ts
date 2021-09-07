import { segmentBackground, applyBlur, applyImageBackground } from 'virtual-bg';


export function createBgFilters(inputStream: MediaStream, bg?: string) {
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
  console.log(canvasEl);

  const width =
    window.innerHeight > window.innerWidth
      ? inputStream.getVideoTracks()[0].getSettings().height
      : inputStream.getVideoTracks()[0].getSettings().width;
  const height =
    window.innerHeight > window.innerWidth
      ? inputStream.getVideoTracks()[0].getSettings().width
      : inputStream.getVideoTracks()[0].getSettings().height;

  document.getElementById('root')?.appendChild(videoEl);
  videoEl.style.zIndex = '99998';
  videoEl.style.position = 'absolute';
  videoEl.style.top = '0';
  videoEl.style.left = '0';
  console.log(height, width);
  // canvasEl.style.height = height + 'px';
  // canvasEl.style.width = width + 'px';

  document.getElementById('root')?.appendChild(canvasEl);
  canvasEl.style.zIndex = '99998';
  canvasEl.style.position = 'absolute';
  canvasEl.style.bottom = '0';
  canvasEl.style.right = '0';
  canvasEl.style.height = height + 'px';
  canvasEl.style.width = width + 'px';

  // segments foreground & background
  segmentBackground(videoEl, canvasEl);
  applyBlur(7);
}