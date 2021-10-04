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
import { Participant, RemoteVideoTrack } from 'livekit-client';
import { RefObject } from 'react';
import { debounce } from 'ts-debounce';
import { CatalystTheme } from '../typings/interfaces';
import { THEMES } from './globals';

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

export function fadeOutSettings(
  fade: number,
  mounted: boolean,
  headerRef: RefObject<HTMLDivElement>,
  toolbarRef: RefObject<HTMLDivElement>,
  videoChatRef: RefObject<HTMLDivElement>
): () => void {
  if (fade > 0) {
    const delayCheck = () => {
      if (!mounted) return;
      const hClasses = headerRef.current?.classList;
      const tClasses = toolbarRef.current?.classList;
      if (hClasses && tClasses) {
        if (timedelay === 5 && !isHidden) {
          hClasses?.remove('animate-fade-in-down');
          hClasses?.add('animate-fade-out-up');
          tClasses?.remove('animate-fade-in-up');
          tClasses?.add('animate-fade-out-down');
          setTimeout(() => {
            if (!mounted) return;
            hClasses?.remove('animate-fade-out-up');
            hClasses?.add('hidden');
            tClasses?.remove('animate-fade-out-down');
            tClasses?.add('hidden');
            isHidden = true;
          }, 170); // 190);
          timedelay = 1;
        }
        timedelay += 1;
      }
    };

    const handleMouse = () => {
      if (!mounted) return;
      const hClasses = headerRef.current?.classList;
      const tClasses = toolbarRef.current?.classList;
      if (hClasses && tClasses) {
        hClasses?.remove('hidden');
        hClasses?.add('animate-fade-in-down');
        tClasses?.remove('hidden');
        tClasses?.add('animate-fade-in-up');
        isHidden = false;
        timedelay = 1;
        clearInterval(_delay);
        _delay = setInterval(delayCheck, fade);
      }
    };
    var timedelay = 1;
    var isHidden = false;
    const debounceHandleMouse = debounce(() => {
      if (!mounted) return;
      handleMouse();
    }, 25);
    // useEventListener('mousemove', debounceHandleMouse, videoChatRef);
    videoChatRef.current?.addEventListener('mousemove', debounceHandleMouse);
    var _delay = setInterval(delayCheck, fade);

    return () => {
      clearInterval(_delay);
      videoChatRef.current?.removeEventListener(
        'mousemove',
        debounceHandleMouse
      );
    };
  }
  return () => {};
}

export function resizeWrapper(
  vidRef: RefObject<HTMLDivElement>,
  members: Participant[],
  screens: number,
  setVidDims: Function
) {
  let margin = 4;
  let width = 0;
  let height = 0;
  if (vidRef.current) {
    width = vidRef.current.offsetWidth - margin * 2;
    height = vidRef.current.offsetHeight - margin * 2;
  }
  // console.log(width, height)
  let max = 0;
  //  TODO: loop needs to be optimized
  let i = 1;
  let l =
    (members.length < 1 ? 1 : members.length) +
    screens +
    (members.length < 2 ? 1 : 0);
  // console.log(l)
  while (i < 5000) {
    let w = area(i, l, width, height, margin);
    if (w === false) {
      max = i - 1;
      break;
    }
    i++;
  }
  max = max - margin * 2;
  setVidDims({
    width: max + 'px',
    height: max * 0.5625 + 'px', // 0.5625 enforce 16:9 (vs 0.75 for 4:3)
  });
}

function area(
  increment: number,
  count: number,
  width: number,
  height: number,
  margin: number = 10
) {
  let i = 0;
  let w = 0;
  let h = increment * 0.75 + margin * 2;
  while (i < count) {
    if (w + increment > width) {
      w = 0;
      h = h + increment * 0.75 + margin * 2;
    }
    w = w + increment + margin * 2;
    i++;
  }
  if (h > height) return false;
  else return increment;
}

export function syncCurrentSharedScreens(
  setNumShared: Function,
  numSharedScreens: number,
  members: Participant[],
  setMainVideoId: Function,
  mainVideoId?: string
): RemoteVideoTrack[] {
  let sharedScreen: RemoteVideoTrack;
  let currentSharedScreens = [] as Array<RemoteVideoTrack>;
  members.forEach(m => {
    m.videoTracks.forEach(track => {
      if (track.trackName === 'screen' && track.track) {
        sharedScreen = track.track as RemoteVideoTrack;
        if (!currentSharedScreens.includes(sharedScreen)) {
          currentSharedScreens = [...currentSharedScreens, sharedScreen];
          if (
            mainVideoId !== sharedScreen.sid &&
            currentSharedScreens.length != numSharedScreens
          ) {
            setMainVideoId(sharedScreen.sid);
          }
        }
      }
    });
  });
  if (currentSharedScreens.length != numSharedScreens) {
    setNumShared(currentSharedScreens.length);
    if (
      !members.find(m => m.sid === mainVideoId) &&
      !currentSharedScreens.find(s => s.sid === mainVideoId)
    ) {
      setMainVideoId(members[0].sid);
    }
  }
  return currentSharedScreens;
}
