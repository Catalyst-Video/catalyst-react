import { BackgroundFilter } from "@vectorly-io/ai-filters";
import { LocalTrack } from "livekit-client";

export const initBgFilter = async (
        bgRemovalKey: string,
         vidTrack: LocalTrack ,
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
  filter: BackgroundFilter,
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
}

export const applyBgFilterToTrack = async (
         track: MediaStreamTrack,
         filter: BackgroundFilter
       ): Promise<void> => {
         if (filter) {
           await filter.changeInput(track);
         }
       };
