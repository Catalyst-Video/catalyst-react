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
               // 'https://terrigen-cdn-dev.marvel.com/content/prod/1x/333.jpg', //'blur'
             });
             return filter;
             //   console.log('bg', bgRemovedTrack);
           }
  }
         return null;
       };

export const applyBgFilterEffect = async (
    effectType: string,
    filter: BackgroundFilter,
): Promise<BackgroundFilter> => {
    switch (effectType) {
      case 'none':
          await filter.changeBackground('blur');
          await filter.changeBlurRadius(0);
          // filter.disable();
          break;
      case 'blur':
          await filter.changeBlurRadius(7); 
          // filter.enable();
          break;
      default:
          await filter.changeBackground(effectType);
          await filter.changeBlurRadius(0);
          // filter.enable();
    }
    console.log('bg', filter);
    return filter;
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
  track: LocalTrack,
  filter: BackgroundFilter
): Promise<LocalTrack> => {
  if (filter) {
    await filter.changeInput(track.mediaStreamTrack);
  }
  return track;
};

export const applyBgEffectToTracks = async (
  tracks: LocalTrack[],
  effectType: string
): Promise<LocalTrack[]> => {
  if (effectType && effectType.length > 0 && effectType !== 'none') {
    const vidTrack = tracks.find(track => track.kind === 'video');
    if (vidTrack?.mediaStreamTrack) {
      const filter = new BackgroundFilter(vidTrack.mediaStreamTrack, {
        token: 'BG_REMOVAL_TOKEN',
        background: effectType,
        blurRadius: 6,
        // 'https://terrigen-cdn-dev.marvel.com/content/prod/1x/333.jpg', //'blur'
      });
      const bgRemovedTrack = await filter.getOutput();
      //   console.log('bg', bgRemovedTrack);
      tracks.forEach(track => {
        if (track.kind === 'video' && !track.name.includes('screen')) {
          track.mediaStreamTrack = bgRemovedTrack.getVideoTracks()[0];
        }
      });
    }
  }
  return tracks;
};

export const applyBgEffectToTrack = async (
         track: LocalVideoTrack,
         effectType?: string
       ): Promise<LocalVideoTrack> => {
    if (effectType && effectType.length > 0 && effectType !== 'none') {
             console.log('filtering', effectType);
           if (track) {
             const filter = new BackgroundFilter(track.mediaStreamTrack, {
               token: 'BG_REMOVAL_TOKEN',
               background: effectType,
               blurRadius: 6,
             });
             const bgRemovedTrack = await filter.getOutput();
             //   console.log('bg', bgRemovedTrack);
             if (track.kind === 'video') {
               track.mediaStreamTrack = bgRemovedTrack.getVideoTracks()[0];
             }
           }
         }
         return track;
       };