import { toast } from 'react-toastify';
import React from 'react';
import { VideoChatData } from '../typings/interfaces';

export function displayWelcomeMessage(
  cstmSnackbarMsg: string | HTMLElement | Element | undefined,
  sessionKey: string
): void {
  toast(
    () => (
      <div className="text-center justify-between">
        {cstmSnackbarMsg ? (
          cstmSnackbarMsg
        ) : (
          <>
            <span>Share your session key </span>
            <strong>{sessionKey}</strong>
            <span> with whoever wants to join</span>
          </>
        )}
      </div>
    ),
    {
      toastId: 'peer_prompt',
    }
  );
}

export function displayVideoErrorMessage(): void {
  toast(
    () => (
      <div className="text-center justify-between">
        Please press allow to enable webcam & audio access
        <button
          className="snack-btn"
          onClick={() => {
            window.open(
              'https://docs.catalyst.chat/docs-permissions',
              '_blank'
            );
          }}
        >
          Help & Directions
        </button>
      </div>
    ),
    {
      autoClose: false,
      toastId: 'webcam/audio_error',
    }
  );
}

export function closeAllMessages(): void {
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
  // console.log(RemoteVideos);
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

export function uuidToHue(uuid: string, VCData: VideoChatData): number {
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
  VCData.peerColors.forEach(
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
  VCData.peerColors.set(uuid, hue);
  return hue;
}

export function hueToColor(hue: string): string {
  // return `hsl(${hue},100%,70%)`;
  return `hsl(${hue},70%,70%)`;
}

export function setStreamColor(uuid: string, VCData: VideoChatData): void {
  const hue = uuidToHue(uuid, VCData);
  (document.querySelectorAll(
    `[uuid="${uuid}"]`
  )[0] as HTMLVideoElement).style.border = `3px solid ${hueToColor(
    hue.toString()
  )}`;
  // const hue = uuidToHue(uuid, VCData);
  // (document.querySelectorAll(
  //   `[indicatoruuid="${uuid}"]`
  // )[0] as HTMLDivElement).style.background = hueToColor(hue.toString());
}
