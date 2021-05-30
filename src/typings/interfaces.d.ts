export interface DefaultSettings {
  audioOn?: boolean;
  videoOn?: boolean;
  showChatArea?: boolean;
}

export interface HiddenSettings {
  mute?: boolean;
  pausevideo?: boolean;
  fullscreen?: boolean;
  screenshare?: boolean;
  chat?: boolean;
  darkmode?: boolean;
  endcall?: boolean;
}

export interface TwilioToken {
  accountSid: string;
  dateCreated: string;
  dateUpdated: string;
  iceServers: RTCIceServer[];
  password: string;
  ttl: number;
  username: string;
}

declare global {
  interface String {
    autolink(): string;
  }
}

/* 

export interface WebRTCPermissions {
  hasWebcam: boolean;
  hasMicrophone: boolean;
  hasSpeakers: boolean;
  isScreenCapturingSupported: boolean;
  isSctpDataChannelsSupported: boolean;
  isRtpDataChannelsSupported: boolean;
  isAudioContextSupported: boolean;
  isWebRTCSupported: boolean;
  isDesktopCapturingSupported: boolean;
  isMobileDevice: boolean;

  isWebSocketsSupported: boolean;
  isWebSocketsBlocked: boolean;

  isWebsiteHasWebcamPermissions: boolean;
  isWebsiteHasMicrophonePermissions: boolean;

  audInputDevices; // microphones
  audioOutputDevices; // speakers
  videoInputDevices; // cameras

  osName: string;
  osVersion: string;

  browser: {
    name: string;
    version: string | number;
    isChrome?: boolean | undefined;
    isFirefox?: boolean | undefined;
    isOpera?: boolean | undefined;
    isIE?: boolean | undefined;
    isSafari?: boolean | undefined;
    isEdge?: boolean | undefined;
    isPrivateBrowsing: boolean;
  };

  isCanvasSupportsStreamCapturing: boolean;
  isVideoSupportsStreamCapturing: boolean;
}







export enum HeaderType {
  Logo,
  Banner,
  Responsive,
}

export interface VideoChatData {
  sessionId: string;
  dataChannel: Map<string, RTCDataChannel>;
  connected: Map<string, boolean>;
  localICECandidates: Record<string, RTCIceCandidate[]>;
  socket: any;
  setLocalStream: Function;
  setRemoteStreams: Function;
  setPeerConnections: Function;
  peerConnections: Map<string, RTCPeerConnection>;
  localStream: MediaStream | undefined;
  localAudio: MediaStreamTrack | undefined;
  peerColors: Map<string, number>;
  localColor: string;
  incrementUnseenChats: Function;
  onAddPeer: Function | undefined;
  onRemovePeer: Function | undefined;
  handleArbitraryData: Function | undefined;
  startedCall: boolean;
  audInput: MediaDeviceInfo | undefined;
  vidInput: MediaDeviceInfo | undefined;

  requestMediaStream(e?: Event): void;
  onMediaStream(e: MediaStream): void;
  onMediaStream(e: MediaStream, uuid: string): void;

  onAddStream(e: RTCTrackEvent, uuid: string): void;
  onPeerLeave(uuid: string): void;

  createOffer(uuid: string): void;
  onOffer(offer: RTCSessionDescription, uuid: string): void;

  createAnswer(offer: RTCSessionDescription, uuid: string): void;
  onAnswer(answer: RTCSessionDescription, uuid: string): void;

  call(uuid: string, room: string): void;
  establishConnection(
    uuid: string,
    func: Function
  ): (token: TwilioToken, uuid: string) => void;

  onCandidate(candidate: RTCIceCandidate, uuid: string): void;
  onIceCandidate(e: RTCPeerConnectionIceEvent, uuid: string): void;
} */
