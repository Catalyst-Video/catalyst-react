/*  Catalyst Scientific Video Chat Component File
Copyright (C) 2021 Catalyst Scientific LLC, Seth Goldin & Joseph Semrai

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version. 

While this code is open-source, you may not use your own version of this
program commerically for free (whether as a business or attempting to sell a variation
of Catalyst for a profit). If you are interested in using Catalyst in an 
enterprise setting, please either visit our website at https://catalyst.chat 
or contact us for more information.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

You can contact us for more details at support@catalyst.chat. */

import { CSSGlobalVariables } from 'css-global-variables';
import { CatalystTheme } from '../typings/interfaces';
import { SUPPORT_URL, THEMES } from './globals';

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
  let newTheme = THEMES.default;
  if (typeof theme === 'string' && theme in THEMES) {
     cssVar.ctwPrimary = THEMES[theme].primary;
     cssVar.ctwSecondary = THEMES[theme].secondary;
     cssVar.ctwTertiary = THEMES[theme].tertiary;
    cssVar.ctwQuaternary = THEMES[theme].quaternary;
     cssVar.ctwQuinary = THEMES[theme].quinary;
  } else if (typeof theme === 'object') {
    cssVar.ctwPrimary = theme.primary ?? newTheme.primary!;
    cssVar.ctwSecondary = theme.secondary ?? newTheme.secondary!;
    cssVar.ctwTertiary = theme.tertiary ?? newTheme.tertiary!;
    cssVar.ctwQuaternary = theme.quaternary ?? newTheme.quaternary!;
    cssVar.ctwQuinary = theme.quinary ?? newTheme.quinary!;
  }
  var style = document.createElement('style');
  document.head.appendChild(style);
  style.sheet?.insertRule(
    `:root { -- cssVar.ctwPrimary: ${cssVar.ctwPrimary},
              -- cssVar.ctwSecondary: ${cssVar.ctwSecondary},
              -- cssVar.ctwTertiary: ${cssVar.ctwTertiary},
                -- cssVar.ctwQuaternary: ${cssVar.ctwQuaternary},
                  -- cssVar.ctwQuinary: ${cssVar.ctwQuinary},
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


export function contactSupport(cstmSupportUrl?: string) {
  window.open(cstmSupportUrl ?? SUPPORT_URL, '_blank');
}