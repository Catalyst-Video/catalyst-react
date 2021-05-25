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

export function setMutedIndicator(uuid: string, display: string): void {
  var mutedDisplay = document.querySelectorAll(
    `[muted-uuid="${uuid}"]`
  )[0] as HTMLElement;
  if (mutedDisplay)
    if (display === 'true') mutedDisplay.style.display = 'block';
    else mutedDisplay.style.display = 'none';
}

export function setPausedIndicator(uuid: string, display: string): void {
  var pausedDisplay = document.querySelectorAll(
    `[paused-uuid="${uuid}"]`
  )[0] as HTMLElement;
  if (pausedDisplay)
    if (display === 'true') pausedDisplay.style.display = 'block';
    else pausedDisplay.style.display = 'none';
}
