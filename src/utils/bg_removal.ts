import { BackgroundFilter } from "@vectorly-io/ai-filters";
import { LocalTrack, LocalVideoTrack } from "livekit-client";

export const initBgFilter = async (
         vidTrack: LocalTrack ,
         effectType?: string
       ): Promise<BackgroundFilter | null> => {
         if (effectType && effectType.length > 0 && effectType !== 'none') {
           if (vidTrack?.mediaStreamTrack) {
             const filter = new BackgroundFilter(vidTrack.mediaStreamTrack, {
               token: 'BG_REMOVAL_TOKEN',
               background: effectType,
               blurRadius: 6
             });
             return filter;
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
