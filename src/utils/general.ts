import { CSSGlobalVariables } from 'css-global-variables';

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

export function setThemeColor(theme: {
         primary: string;
         primaryDark: string;
       }): void {
  let cssVar = new CSSGlobalVariables();
  // light
  // TODO: set dark modes to a lighter color by default
         switch (theme.primary) {
           case 'red':
             cssVar.ctwPrimary = '#EF4444';
             break;
           case 'orange':
             cssVar.ctwPrimary = '#F97316';
             break;
           case 'amber':
             cssVar.ctwPrimary = '#F59E0B';
             break;
           case 'yellow':
             cssVar.ctwPrimary = '#EAB308';
             break;
           case 'lime':
             cssVar.ctwPrimary = '#84CC16';
             break;
           case 'green':
             cssVar.ctwPrimary = '#22C55E';
             break;
           case 'emerald':
             cssVar.ctwPrimary = '#10B981';
             break;
           case 'teal':
             cssVar.ctwPrimary = '#14B8A6';
             break;
           case 'cyan':
             cssVar.ctwPrimary = '#06B6D4';
             break;
           case 'lightBlue':
             cssVar.ctwPrimary = '#0EA5E9';
             break;
           case 'blue':
             cssVar.ctwPrimary = '#3B82F6';
             break;
           case 'violet':
             cssVar.ctwPrimary = '#8B5CF6';
             break;
           case 'indigo':
             cssVar.ctwPrimary = '#6366F1';
             break;
           case 'purple':
             cssVar.ctwPrimary = '#A855F7';
             break;
           case 'fuchsia':
             cssVar.ctwPrimary = '#D946EF';
             break;
           case 'rose':
             cssVar.ctwPrimary = '#F43F5E';
             break;
           case 'pink':
             cssVar.ctwPrimary = '#EC4899';
             break;
           default:
             cssVar.ctwPrimary = theme.primary;
  }
  // dark
   switch (theme.primaryDark) {
     case 'red':
       cssVar.ctwPrimaryDark = '#EF4444';
       break;
     case 'orange':
       cssVar.ctwPrimaryDark = '#F97316';
       break;
     case 'amber':
       cssVar.ctwPrimaryDark = '#F59E0B';
       break;
     case 'yellow':
       cssVar.ctwPrimaryDark = '#EAB308';
       break;
     case 'lime':
       cssVar.ctwPrimaryDark = '#84CC16';
       break;
     case 'green':
       cssVar.ctwPrimaryDark = '#22C55E';
       break;
     case 'emerald':
       cssVar.ctwPrimaryDark = '#10B981';
       break;
     case 'teal':
       cssVar.ctwPrimaryDark = '#14B8A6';
       break;
     case 'cyan':
       cssVar.ctwPrimaryDark = '#06B6D4';
       break;
     case 'lightBlue':
       cssVar.ctwPrimaryDark = '#0EA5E9';
       break;
     case 'blue':
       cssVar.ctwPrimaryDark = '#3B82F6';
       break;
     case 'violet':
       cssVar.ctwPrimaryDark = '#8B5CF6';
       break;
     case 'indigo':
       cssVar.ctwPrimaryDark = '#6366F1';
       break;
     case 'purple':
       cssVar.ctwPrimaryDark = '#A855F7';
       break;
     case 'fuchsia':
       cssVar.ctwPrimaryDark = '#D946EF';
       break;
     case 'rose':
       cssVar.ctwPrimaryDark = '#F43F5E';
       break;
     case 'pink':
       cssVar.ctwPrimaryDark = '#EC4899';
       break;
     default:
       cssVar.ctwPrimaryDark = theme.primaryDark;
   }

      var style = document.createElement('style');
      document.head.appendChild(style);
      style.sheet?.insertRule(
        `:root { -- cssVar.ctwPrimary: ${cssVar.ctwPrimary}}`
);
    style.sheet?.insertRule(
      `:root { -- cssVar.ctwPrimaryDark: ${cssVar.ctwPrimaryDark}}`
    );
  
       }
