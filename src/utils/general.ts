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

export function setThemeColor(color: string): void {
  var themeColor: string;
  switch (color) {
    case 'red':
      themeColor = '#EF4444';
      break;
    case 'orange':
      themeColor = '#F97316';
      break;
    case 'amber':
      themeColor = '#F59E0B';
      break;
    case 'yellow':
      themeColor = '#EAB308';
      break;
    case 'lime':
      themeColor = '#84CC16';
      break;
    case 'green':
      themeColor = '#22C55E';
      break;
    case 'emerald':
      themeColor = '#10B981';
      break;
    case 'teal':
      themeColor = '#14B8A6';
      break;
    case 'cyan':
      themeColor = '#06B6D4';
      break;
    case 'lightBlue':
      themeColor = '#0EA5E9';
      break;
    case 'blue':
      themeColor = '#3B82F6';
      break;
    case 'violet':
      themeColor = '#8B5CF6';
      break;
    case 'indigo':
      themeColor = '#6366F1';
      break;
    case 'purple':
      themeColor = '#A855F7';
      break;
    case 'fuchsia':
      themeColor = '#D946EF';
      break;
    case 'rose':
      themeColor = '#F43F5E';
      break;
    case 'pink':
      themeColor = '#EC4899';
      break;
    default:
      themeColor = color;
  }
  var style = document.createElement('style');
  document.head.appendChild(style);
  style.sheet?.insertRule(`:root { --themeColor: ${themeColor}}`);
}
