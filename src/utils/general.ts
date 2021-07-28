import { CSSGlobalVariables } from 'css-global-variables';
import { CatalystTheme } from '../typings/interfaces';
import { DEFAULT_THEME } from './globals';

export function logger(data: string): void {
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    console.log(data);
  }
}

export function getBrowserName(): string {
  var name = 'Unknown';
  if (window.navigator.userAgent.indexOf('MSIE') !== -1) {
  } else if (window.navigator.userAgent.indexOf('Firefox') !== -1) {
    name = 'Firefox';
  } else if (window.navigator.userAgent.indexOf('Opera') !== -1) {
    name = 'Opera';
  } else if (window.navigator.userAgent.indexOf('Chrome') !== -1) {
    name = 'Chrome';
  } else if (window.navigator.userAgent.indexOf('Safari') !== -1) {
    name = 'Safari';
  }
  return name;
}

export function isConnected(connected: Map<string, boolean>): boolean {
  var isConnected = false;
  // TODO: No way to 'break' forEach -> go through all for now
  connected.forEach(
    (value: boolean, key: string, map: Map<string, boolean>) => {
      if (value) isConnected = true;
    }
  );
  return isConnected;
}

export function sendToAllDataChannels(
  msg: string,
  dataChannel: Map<string, RTCDataChannel>
) {
  logger('Sending: ' + msg);
  dataChannel?.forEach(
    (
      channel: RTCDataChannel,
      uuid: string,
      map: Map<string, RTCDataChannel>
    ) => {
      channel.send(msg);
    }
  );
}

export function millisecondsToTime(duration: number): string {
  var seconds = ((duration / 1000) % 60).toFixed(0);
  var minutes = ((duration / (1000 * 60)) % 60).toFixed(0);
  var hours = ((duration / (1000 * 60 * 60)) % 24).toFixed(0);
  var hourString =
    parseInt(hours) === 0 ? '00' : parseInt(hours) < 10 ? '0' + hours : hours;
  var minuteString = parseInt(minutes) < 10 ? '0' + minutes : minutes;
  var secondString = parseInt(seconds) < 10 ? '0' + seconds : seconds;
  return hourString + ':' + minuteString + ':' + secondString;
}

export function setThemeColor(theme: CatalystTheme | string): void {
  let cssVar = new CSSGlobalVariables();
  let newTheme = DEFAULT_THEME;
  if (typeof theme === 'string') {
    // TODO: inbuilt custom themes (light, gray, dark, night)
    // cssVar.setTheme(theme);
  } else {
    cssVar.ctwPrimary = theme.primary ?? DEFAULT_THEME.primary!;
    cssVar.ctwSecondary = theme.secondary ?? DEFAULT_THEME.secondary!;
    cssVar.ctwTertiary = theme.tertiary ?? DEFAULT_THEME.tertiary!;
    cssVar.ctwQuaternary = theme.quaternary ?? DEFAULT_THEME.quaternary!;
  }

    var style = document.createElement('style');
    document.head.appendChild(style);
    style.sheet?.insertRule(
      `:root { -- cssVar.ctwPrimary: ${cssVar.ctwPrimary},
              -- cssVar.ctwSecondary: ${cssVar.ctwSecondary},
              -- cssVar.ctwTertiary: ${cssVar.ctwTertiary},
                -- cssVar.ctwQuaternary: ${cssVar.ctwQuaternary},
      }`
    );
      }


       
function merge(a1, a2) {
  const merged = Array(a1.length + a2.length);
  let index = 0,
    i1 = 0,
    i2 = 0;
  while (i1 < a1.length || i2 < a2.length) {
    if (a1[i1] && a2[i2]) {
      const item1 = a1[i1];
      const item2 = a2[i2].charCodeAt(0) - 96;
      merged[index++] = item1 < item2 ? a1[i1++] : a2[i2++];
    } else if (a1[i1]) merged[index++] = a1[i1++];
    else if (a2[i2]) merged[index++] = a2[i2++];
  }
  return merged;
}


export function generateUUID() {
  var dt = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(
    c
  ) {
    var r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}