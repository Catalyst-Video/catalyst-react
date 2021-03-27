import { toast } from 'react-toastify';
import React from 'react';
import { VideoChatData } from '../typings/interfaces';

export function setThemeColor(color: string): void {
  var themeColor: string;
  switch (color) {
    case 'pink':
      themeColor = '#D53F8C';
      break;
    case 'red':
      themeColor = '#E53E3E';
      break;
    case 'orange':
      themeColor = '#DD6B20';
      break;
    case 'yellow':
      themeColor = '#FFCE26';
      break;
    case 'green':
      themeColor = '#38A169';
      break;
    case 'teal':
      themeColor = '#319795';
      break;
    case 'blue':
      themeColor = '#3f83f8';
      break;
    case 'indigo':
      themeColor = '#5A67D8';
      break;
    case 'purple':
      themeColor = '#805AD5';
      break;
    default:
      themeColor = color;
  }
  var style = document.createElement('style');
  document.head.appendChild(style);
  style.sheet?.insertRule(`:root { --themeColor: ${themeColor}}`);
}

export function closeAllToasts(): void {
  toast.dismiss();
}

export function Area(
  Increment: number,
  Count: number,
  Width: number,
  Height: number,
  Margin = 10
) {
  let i = 0;
  let w = 0;
  let h = Increment * 0.75 + Margin * 2;
  while (i < Count) {
    if (w + Increment > Width) {
      w = 0;
      h = h + Increment * 0.75 + Margin * 2;
    }
    w = w + Increment + Margin * 2;
    i++;
  }
  if (h > Height) return false;
  else return Increment;
}

export function ResizeWrapper(): void {
  let Margin = 2;
  let Wrapper = document.getElementById('remote-vid-wrapper');
  let Width = 0;
  let Height = 0;
  if (Wrapper) {
    Width = Wrapper.offsetWidth - Margin * 2;
    Height = Wrapper.offsetHeight - Margin * 2;
  }
  let RemoteVideos = document.querySelectorAll('#remote-div');
  let max = 0;

  // loop TODO: needs to be optimized
  let i = 1;
  while (i < 5000) {
    let w = Area(i, RemoteVideos.length, Width, Height, Margin);
    if (w === false) {
      max = i - 1;
      break;
    }
    i++;
  }

  max = max - Margin * 2;
  setWidth(max, Margin);
}

export function setWidth(width: number, margin: number): void {
  let RemoteVideos = document.querySelectorAll('#remote-div') as NodeListOf<
    HTMLVideoElement
  >;
  for (var s = 0; s < RemoteVideos.length; s++) {
    RemoteVideos[s].style.width = width + 'px';
    RemoteVideos[s].style.margin = margin + 'px';
    RemoteVideos[s].style.height = width * 0.75 + 'px';
  }
}

export function uuidToHue(uuid: string, VC: VideoChatData): number {
  // Using uuid to generate random, unique pastel color
  var hash = 0;
  for (var i = 0; i < uuid.length; i++) {
    hash = uuid.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  var hue = Math.abs(hash % 360);
  // Ensure color is not similar to other colors
  var availColors: number[] = Array.from(
    { length: 6 },
    (x: number, i: number) => i * 60
  );
  VC.peerColors.forEach(
    (value: number, key: string, map: Map<string, number>) => {
      availColors[Math.floor(value / 60)] = -1;
    }
  );
  if (availColors[Math.floor(hue / 60)] == -1) {
    for (var i = 0; i < availColors.length; i++) {
      if (availColors[i] != -1) {
        hue = (hue % 60) + availColors[i];
        availColors[i] = -1;
        break;
      }
    }
  }
  VC.peerColors.set(uuid, hue);
  return hue;
}

export function hueToColor(hue: string): string {
  // NEON: return `hsl(${hue},100%,70%)`;
  // PASTEL: return `hsl(${hue},70%,80%)`;
  return `hsl(${hue},70%,70%)`;
}

export function setStreamColor(
  uuid: string,
  VC: VideoChatData,
  showDotColors: boolean,
  showBorderColors: boolean
): void {
  if (showBorderColors) {
    const hue = uuidToHue(uuid, VC);
    (document.querySelectorAll(
      `[vid-uuid="${uuid}"]`
    )[0] as HTMLVideoElement).style.border = `3px solid ${hueToColor(
      hue.toString()
    )}`;
  }
  if (showDotColors) {
    const hue = uuidToHue(uuid, VC);
    (document.querySelectorAll(
      `[indicator-uuid="${uuid}"]`
    )[0] as HTMLDivElement).style.background = hueToColor(hue.toString());
  }
}

export function createMuteNode(
  uuid: string
  // audio: MediaStreamTrack
): HTMLElement {
  var muteNode = document.createElement('i');
  muteNode.innerHTML = `<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="microphone-slash" class="svg-inline--fa fa-microphone-slash fa-w-20 " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M633.82 458.1l-157.8-121.96C488.61 312.13 496 285.01 496 256v-48c0-8.84-7.16-16-16-16h-16c-8.84 0-16 7.16-16 16v48c0 17.92-3.96 34.8-10.72 50.2l-26.55-20.52c3.1-9.4 5.28-19.22 5.28-29.67V96c0-53.02-42.98-96-96-96s-96 42.98-96 96v45.36L45.47 3.37C38.49-2.05 28.43-.8 23.01 6.18L3.37 31.45C-2.05 38.42-.8 48.47 6.18 53.9l588.36 454.73c6.98 5.43 17.03 4.17 22.46-2.81l19.64-25.27c5.41-6.97 4.16-17.02-2.82-22.45zM400 464h-56v-33.77c11.66-1.6 22.85-4.54 33.67-8.31l-50.11-38.73c-6.71.4-13.41.87-20.35.2-55.85-5.45-98.74-48.63-111.18-101.85L144 241.31v6.85c0 89.64 63.97 169.55 152 181.69V464h-56c-8.84 0-16 7.16-16 16v16c0 8.84 7.16 16 16 16h160c8.84 0 16-7.16 16-16v-16c0-8.84-7.16-16-16-16z"></path></svg>`;
  muteNode.setAttribute('id', 'remote-muted');
  muteNode.setAttribute('muted-uuid', uuid);

  // audio.onmute = () => {
  //   muteNode.style.display = 'block';
  //   console.log('mute');
  // };

  // audio.onunmute = () => {
  //   muteNode.style.display = 'none';
  //   console.log('unmute');
  // };

  return muteNode;
}

export function createPauseNode(uuid: string): HTMLElement {
  var pauseNode = document.createElement('i');
  pauseNode.innerHTML = `<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="video-slash" class="svg-inline--fa fa-video-slash fa-w-20 " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M633.8 458.1l-55-42.5c15.4-1.4 29.2-13.7 29.2-31.1v-257c0-25.5-29.1-40.4-50.4-25.8L448 177.3v137.2l-32-24.7v-178c0-26.4-21.4-47.8-47.8-47.8H123.9L45.5 3.4C38.5-2 28.5-.8 23 6.2L3.4 31.4c-5.4 7-4.2 17 2.8 22.4L42.7 82 416 370.6l178.5 138c7 5.4 17 4.2 22.5-2.8l19.6-25.3c5.5-6.9 4.2-17-2.8-22.4zM32 400.2c0 26.4 21.4 47.8 47.8 47.8h288.4c11.2 0 21.4-4 29.6-10.5L32 154.7v245.5z"></path></svg>`;
  pauseNode.setAttribute('id', 'remote-paused');
  pauseNode.setAttribute('paused-uuid', uuid);
  return pauseNode;
}

export function setMutedIndicator(uuid: string, display: string): void {
  var mutedDisplay = document.querySelectorAll(
    `[muted-uuid="${uuid}"]`
  )[0] as HTMLElement;
  if (display === 'true') {
    mutedDisplay.style.display = 'block';
  } else {
    mutedDisplay.style.display = 'none';
  }
}

export function setPausedIndicator(uuid: string, display: string): void {
  var pausedDisplay = document.querySelectorAll(
    `[paused-uuid="${uuid}"]`
  )[0] as HTMLElement;
  if (display === 'true') {
    pausedDisplay.style.display = 'block';
  } else {
    pausedDisplay.style.display = 'none';
  }
}
