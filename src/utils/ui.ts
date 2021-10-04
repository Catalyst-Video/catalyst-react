import { CSSGlobalVariables } from 'css-global-variables';
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
           videoChatRef.current?.addEventListener(
             'mousemove',
             debounceHandleMouse
           );
           var _delay = setInterval(delayCheck, fade);

           return () => {
             clearInterval(_delay);
             videoChatRef.current?.removeEventListener(
               'mousemove',
               debounceHandleMouse
             );
           };
    }
    return () => {}
}