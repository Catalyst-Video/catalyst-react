import DetectRTC from 'detectrtc';
import { WebRTCPermissions } from '../typings/interfaces';
import { ResizeWrapper } from './ui';

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

export function detectRTC(): typeof DetectRTC {
  DetectRTC.load(() => {
    DetectRTC.hasWebcam; // (has webcam device!)
    DetectRTC.hasMicrophone; // (has microphone device!)
    DetectRTC.hasSpeakers; // (has speakers!)
    DetectRTC.isScreenCapturingSupported; // Chrome, Firefox, Opera, Edge and Android
    DetectRTC.isSctpDataChannelsSupported;
    DetectRTC.isRtpDataChannelsSupported;
    DetectRTC.isAudioContextSupported;
    DetectRTC.isWebRTCSupported;
    DetectRTC.isDesktopCapturingSupported;
    DetectRTC.isMobileDevice;

    DetectRTC.isWebSocketsSupported;
    DetectRTC.isWebSocketsBlocked;

    DetectRTC.isWebsiteHasWebcamPermissions; // getUserMedia allowed for HTTPs domain in Chrome?
    DetectRTC.isWebsiteHasMicrophonePermissions; // getUserMedia allowed for HTTPs domain in Chrome?

    DetectRTC.audioInputDevices; // microphones
    DetectRTC.audioOutputDevices; // speakers
    DetectRTC.videoInputDevices; // cameras

    DetectRTC.osName;
    DetectRTC.osVersion;

    DetectRTC.browser.name === 'Edge' || 'Chrome' || 'Firefox';
    DetectRTC.browser.version;
    DetectRTC.browser.isChrome;
    DetectRTC.browser.isFirefox;
    DetectRTC.browser.isOpera;
    DetectRTC.browser.isIE;
    DetectRTC.browser.isSafari;
    DetectRTC.browser.isEdge;

    DetectRTC.browser.isPrivateBrowsing; // incognito or private modes

    DetectRTC.isCanvasSupportsStreamCapturing;
    DetectRTC.isVideoSupportsStreamCapturing;
  });
  return DetectRTC;
}

export function initChat(autoFade: number): void {
  navigator.mediaDevices.ondevicechange = () => window.location.reload();

  let catalystNode = document.getElementById('catalyst');
  if (catalystNode && catalystNode.parentNode?.parentNode?.nodeName === 'BODY')
    catalystNode.style.position = 'fixed';

  // Load and resize Event
  window.addEventListener(
    'load',
    (e: Event) => {
      ResizeWrapper();
      window.onresize = ResizeWrapper;
    },
    false
  );

  // fade or show UI on mouse move
  if (autoFade > 0) {
    var timedelay = 1;
    var header = document.getElementById('ct-header');
    var toolbar = document.getElementById('ct-toolbar');
    const delayCheck = () => {
      if (timedelay === 5) {
        header?.classList.add('hide');
        header?.classList.remove('show');
        toolbar?.classList.add('hide');
        toolbar?.classList.remove('show');
        timedelay = 1;
      }
      timedelay += 1;
    };
    document.addEventListener('mousemove', () => {
      header?.classList.add('show');
      header?.classList.remove('hide');
      toolbar?.classList.add('show');
      toolbar?.classList.remove('hide');
      timedelay = 1;
      clearInterval(_delay);
      _delay = setInterval(delayCheck, autoFade);
    });
    var _delay = setInterval(delayCheck, autoFade);
  }
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
