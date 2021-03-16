import { Socket } from "socket.io-client";

export interface VideoChatData {
	sessionKey: string;
	dataChannel: Map<any, any>;
	connected: Map<any, any>;
	localICECandidates: any;
	socket: Socket;
	remoteVideoWrapper: HTMLElement;
	localVideo: HTMLMediaElement;
	peerConnections: Map<any, any>;
	recognition: any;
	localStream: MediaStream | undefined;
	localAudio: MediaStreamTrack | undefined;
	sendingCaptions: boolean;
	receivingCaptions: boolean;
	seenWelcomeSnackbar: boolean;
	setLocalVideoText: Function;
	setCaptionsText: Function;
	customSnackbarMsg: string | HTMLElement | Element | undefined;

	requestMediaStream(e?: any): void;
	onMediaStream(e: MediaStream): void;
	onMediaStream(e: any, uuid: string): void;

	onAddStream(e: any, uuid: string): void;
	onLeave(uuid: string): void;

	createOffer(uuid: string): any;
	onOffer(offer: any, uuid: string): any;

	createAnswer(offer: RTCSessionDescription, uuid: string): void;
	onAnswer(answer: any, uuid: string): void;

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

export interface TwilioToken {
	accountSid: string;
	dateCreated: string;
	dateUpdated: string;
	iceServers: RTCIceServer[];
	password: string;
	ttl: number;
	username: string;
}
