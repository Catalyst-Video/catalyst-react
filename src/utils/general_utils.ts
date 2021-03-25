export function logger(data: string): void {
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    console.log(data);
  }
}

export function setThemeColor(color: string): void {
  var themeColor: string;

  switch (color) {
    case 'pink':
      themeColor = '#D53F8C';
      break;
    case 'red':
      themeColor = '#E53E3E';
      break;
    case 'orange':
      themeColor = '#DD6B20';
      break;
    case 'yellow':
      themeColor = '#FFCE26';
      break;
    case 'green':
      themeColor = '#38A169';
      break;
    case 'teal':
      themeColor = '#319795';
      break;
    case 'blue':
      themeColor = '#3f83f8';
      break;
    case 'indigo':
      themeColor = '#5A67D8';
      break;
    case 'purple':
      themeColor = '#805AD5';
      break;
    default:
      themeColor = color;
  }
  var style = document.createElement('style');
  document.head.appendChild(style);
  style.sheet?.insertRule(`:root { --themeColor: ${themeColor}}`);
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
  // No way to 'break' forEach -> we go through all anyway
  connected.forEach(
    (value: boolean, key: string, map: Map<string, boolean>) => {
      if (value) {
        isConnected = true;
      }
    }
  );
  return isConnected;
}

export function chatRoomFull(): void {
  alert(
    "Chat room is full. Check to ensure you don't have multiple tabs open, or try with a new room link."
  );
  window.location.href = '/newcall';
}

export function sendToAllDataChannels(
  message: string,
  dataChannel: Map<string, RTCDataChannel>
) {
  logger('Sending: ' + message);
  // key is UUID, value is dataChannel object
  dataChannel?.forEach(
    (value: RTCDataChannel, key: string, map: Map<string, RTCDataChannel>) => {
      value.send(message);
    }
  );
}

export function handlereceiveMessage(msg: string, color?: string): void {
  // Called when a message is received over the dataChannel, adds message to screen - auto scrolls chat down
  addMessageToScreen(msg, color ? color : 'var(--themeColor)', false);
  document
    .getElementById('chat-end')
    ?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
}

export function addMessageToScreen(
  msg: string,
  border: string,
  isOwnMessage: boolean
): void {
  if (msg.length > 0) {
    if (isOwnMessage) {
      document
        .querySelector('.chat-messages')
        ?.insertAdjacentHTML(
          'beforeend',
          `<div class="message-item customer cssanimation fadeInBottom"><div class="message-bloc" style="border: 3px solid ${border}"><div class="message">` +
            msg +
            '</div></div></div>'
        );
    } else {
      document
        .querySelector('.chat-messages')
        ?.insertAdjacentHTML(
          'beforeend',
          `<div class="message-item moderator cssanimation fadeInBottom"><div class="message-bloc" style="border: 3px solid ${border}"><div class="message">` +
            msg +
            '</div></div></div>'
        );
    }
  }
}
