export interface VideoChatData {
  sessionId: string;
  dataChannel: Map<string, RTCDataChannel>;
  connected: Map<string, boolean>;
  localICECandidates: Record<string, RTCIceCandidate[]>;
  socket: any;
  localVidRef: RefObject<HTMLVideoElement>;
  remoteVidRef: RefObject<HTMLDivElement>;
  peerConnections: Map<string, RTCPeerConnection>;
  localStream: MediaStream | undefined;
  localAudio: MediaStreamTrack | undefined;
  picInPic: string;
  setNumPeers: Function;
  showDotColors: boolean;
  showBorderColors: boolean;
  peerColors: Map<string, number>;
  localColor: string;
  incrementUnseenChats: Function;
  onAddPeer: Function | undefined;
  onRemovePeer: Function | undefined;
  handleArbitraryData: Function | undefined;
  startedCall: boolean;

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
}

export interface DefaultSettings {
  audioOn?: boolean;
  videoOn?: boolean;
  showChatArea?: boolean;
  showToastArea?: boolean;
  // darkMode?: boolean
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

export enum HeaderType {
  Logo,
  Banner,
  Responsive,
}

declare global {
  interface String {
    autolink(): string;
  }
}

// String.prototype.autolink = function(length: number) {
//   let d = String(this);
//   while (d.length < length) {
//     d = '0' + d;
//   }
//   return d;
// };
