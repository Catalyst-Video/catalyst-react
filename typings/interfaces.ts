import { Socket } from "socket.io-client";

export interface VideoChatData {
	sessionKey: string;
	sessionName: string;
	dataChannel: Map<any, any>;
	connected: Map<any, any>;
	localICECandidates: Record<string, RTCIceCandidate[]>;
	socket: Socket;
	// recognition: SpeechRecognition;
	remoteVideoWrapper: HTMLElement;
	localVideo: HTMLMediaElement;
	peerConnections: Map<any, any>;
	localStream: MediaStream | undefined;
	localAudio: MediaStreamTrack | undefined;
	sendingCaptions: boolean;
	receivingCaptions: boolean;
	seenWelcomeSnackbar: boolean;
	setLocalVideoText: Function;
	setCaptionsText: Function;
	customSnackbarMsg: string | HTMLElement | Element | undefined;

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
	hideChat?: boolean;
	audioOn?: boolean;
	videoOn?: boolean;
	hideCaptions?: boolean;
	hideLogo?: boolean;
}

export interface DisabledSettings {
	disableMute?: boolean;
	disablePauseVideo?: boolean;
	disableScreenShare?: boolean;
	disableChat?: boolean;
	disablePicInPic?: boolean;
	disableCaptions?: boolean;
	disableEndCall?: boolean;
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
