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

import { BackgroundFilter } from '@vectorly-io/ai-filters';
import { LocalTrack } from 'livekit-client';

export const initBgFilter = async (
  bgRemovalKey: string,
  vidTrack: LocalTrack,
  effectType?: string
): Promise<BackgroundFilter | null> => {
  if (
    effectType &&
    effectType.length > 0 &&
    effectType !== 'none' &&
    bgRemovalKey.length > 0
  ) {
    if (vidTrack?.mediaStreamTrack) {
      return new BackgroundFilter(vidTrack.mediaStreamTrack, {
        token: bgRemovalKey ?? 'BG_REMOVAL_TOKEN',
        background: effectType,
        blurRadius: 6,
      });
      //   console.log('bg', bgRemovedTrack);
    }
  }
  return null;
};

export const applyBgFilterToTracks = async (
  tracks: LocalTrack[],
  filter: BackgroundFilter
): Promise<LocalTrack[]> => {
  if (filter) {
    const bgRemovedTrack = await filter.getOutput();
    tracks.forEach(track => {
      if (track.kind === 'video' && !track.name.includes('screen')) {
        track.mediaStreamTrack = bgRemovedTrack.getVideoTracks()[0];
      }
    });
  }
  return tracks;
};

export const applyBgFilterToTrack = async (
  track: MediaStreamTrack,
  filter: BackgroundFilter
): Promise<void> => {
  if (filter) {
    await filter.changeInput(track);
  }
};
