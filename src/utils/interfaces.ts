export interface VideoChatDataInterface {
	videoEnabled: boolean;
	audioEnabled: boolean;
	connected: Map<any, any>;
	localICECandidates: any;
	socket: any;
	remoteVideoWrapper: HTMLMediaElement;
	localVideo: HTMLMediaElement;
	peerConnections: Map<any, any>;
	recognition: string;
	borderColor: string;
	peerColors: Map<any, any>;
	localStream: any;
	localAudio: any;

	requestMediaStream(e?: any): any;
	onMediaStream(e: any): any;
	onMediaStream(e: any, uuid: any): any;

	onAddStream(e: any, uuid: any): any;
	onLeave(e: any): any;

	createOffer(a: any): any;
	onOffer(offer: any, uuid: any): any;

	createAnswer(offer: any, a: any): any;
	onAnswer(answer: any, uuid: any): any;

	call(uuid: string, room: any): any;
	establishConnection(uuid: any, func: Function): any;

	onCandidate(candidate: any, uuid: any): any;
	onIceCandidate(e: any, uuid: any): any;
}
