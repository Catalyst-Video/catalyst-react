import { Socket } from "socket.io-client";

export interface VideoChatData {
	sessionKey: string;
	sessionName: string;
	dataChannel: Map<string, RTCDataChannel>;
	connected: Map<string, boolean>;
	localICECandidates: Record<string, RTCIceCandidate[]>;
	socket: Socket;
	remoteVideoWrapper: HTMLDivElement;
	localVideo: HTMLMediaElement;
	peerConnections: Map<string, RTCPeerConnection>;
	localStream: MediaStream | undefined;
	localAudio: MediaStreamTrack | undefined;
	sendingCaptions: boolean;
	receivingCaptions: boolean;
	seenWelcomeSnackbar: boolean;
	setLocalVideoText: Function;
	setCaptionsText: Function;
	customSnackbarMsg: string | HTMLElement | Element | undefined;
	// recognition: SpeechRecognition;

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
	hideChatArea?: boolean;
	hideCaptionsArea?: boolean;
}

export interface DisabledSettings {
	mute?: boolean;
	pausevideo?: boolean;
	screenshare?: boolean;
	chat?: boolean;
	picinpic?: boolean;
	captions?: boolean;
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
