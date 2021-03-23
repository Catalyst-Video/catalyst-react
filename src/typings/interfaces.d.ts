export interface VideoChatData {
  sessionId: string;
  roomName: string;
  dataChannel: Map<string, RTCDataChannel>;
  connected: Map<string, boolean>;
  localICECandidates: Record<string, RTCIceCandidate[]>;
  socket: any;
  remoteVideoWrapper: HTMLDivElement;
  localVideo: HTMLMediaElement;
  peerConnections: Map<string, RTCPeerConnection>;
  localStream: MediaStream | undefined;
  localAudio: MediaStreamTrack | undefined;
  picInPic: string;
  seenWelcomeSnackbar: boolean;
  setLocalVideoText: Function;
  incrementUnseenChats: Function;
  setCaptionsText: Function;
  cstmSnackbarMsg: string | HTMLElement | Element | undefined;
  /* TODO: Captions
  sendingCaptions: boolean;
  receivingCaptions: boolean;
  recognition: SpeechRecognition | undefined;*/

  requestMediaStream(e?: Event): void;
  onMediaStream(e: MediaStream): void;
  onMediaStream(e: MediaStream, uuid: string): void;

  onAddStream(e: RTCTrackEvent, uuid: string): void;
  onLeave(uuid: string): void;

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
  // TODO: showCaptionsArea?: boolean;
}

export interface HiddenSettings {
  mute?: boolean;
  pausevideo?: boolean;
  screenshare?: boolean;
  chat?: boolean;
  // TODO: captions?: boolean;
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
