export interface VideoChatData {
	// videoEnabled: boolean;
	// audioEnabled: boolean;
	connected: Map<any, any>;
	localICECandidates: any;
	socket: any;
	remoteVideoWrapper: HTMLMediaElement;
	localVideo: HTMLMediaElement;
	peerConnections: Map<any, any>;
	recognition: any;
	borderColor: string;
	peerColors: Map<any, any>;
	localStream: any;
	localAudio: any;

	requestMediaStream(e?: any): any;
	onMediaStream(e: MediaStream): any;
	onMediaStream(e: any, uuid: string): any;

	onAddStream(e: any, uuid: string): any;
	onLeave(e: any): any;

	createOffer(a: any): any;
	onOffer(offer: any, uuid: string): any;

	createAnswer(offer: any, a: any): any;
	onAnswer(answer: any, uuid: string): any;

	call(uuid: string, room: any): any;
	establishConnection(uuid: string, func: Function): any;

	onCandidate(candidate: any, uuid: string): any;
	onIceCandidate(e: any, uuid: string): any;
}

export interface DefaultSettings {
	hideChat?: boolean;
	audioOn?: boolean;
	videoOn?: boolean;
	hideCaptions?: boolean;
	hideLogo?: boolean;
}
