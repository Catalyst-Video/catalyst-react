/* VIDEO CHAT DATA: track video/audio streams, peer connections, handle webrtc */
import io, { Socket } from "socket.io-client";
import { chatRoomFull } from "../utils/general_utils";

const DEFAULT_SERVER_ADDRESS = "https://catalyst-video-server.herokuapp.com/";

export default class VCDataStream {
	sessionKey: string;
	dataChannel: Map<any, any>;
	connected: Map<any, any>;
	localICECandidates: any;
	socket: Socket;
	remoteVideoWrapper: HTMLMediaElement;
	localVideo: HTMLMediaElement;
	peerConnections: Map<any, any>;
	recognition: any;
	borderColor: string;
	peerColors: Map<any, any>;
	localStream: MediaStream | undefined;
	localAudio: MediaStreamTrack | undefined;
	sendingCaptions: boolean;
	receivingCaptions: boolean;
	setLocalVideoText: Function;
	setCaptionsText: Function;

	constructor(
		key: string,
		socketServerAddress: string | undefined,
		setCapText: Function,
		setVidText: Function
	) {
		this.sessionKey = key;
		this.dataChannel = new Map();
		this.connected = new Map();
		this.localICECandidates = {};
		this.socket = io(socketServerAddress ?? DEFAULT_SERVER_ADDRESS);
		this.remoteVideoWrapper = document.getElementById(
			"wrapper"
		) as HTMLMediaElement;
		this.localVideo = document.getElementById(
			"local-video"
		) as HTMLMediaElement;
		this.peerConnections = new Map();
		this.recognition = "";
		this.borderColor = "";
		this.peerColors = new Map();
		this.localAudio = undefined;
		this.localStream = undefined;
		this.sendingCaptions = false;
		this.receivingCaptions = false;
		this.setCaptionsText = setCapText;
		this.setLocalVideoText = setVidText;
	}

	/* Call to getUserMedia (provided by adapter.js for  browser compatibility) asking for access to both the video and audio streams. If the request is accepted callback to the onMediaStream function, otherwise callback to the noMediaStream function. */
	requestMediaStream = (e?: any) => {
		console.log("requestMediaStream");
		navigator.mediaDevices
			.getUserMedia({
				video: true,
				audio: true
			})
			.then(stream => {
				this.onMediaStream(stream);
				this.setLocalVideoText("Drag Me");
			})
			.catch(error => {
				console.log(error);
				// show initial connect to peer prompt
				/* TODO: 	toast(
					() => (
						<div className="text-center justify-between">
							Please press allow to enable webcam & audio access
							<button
								className="snack-btn"
								onClick={() => {
									window.open(
										"https://help.clipchamp.com/en/articles/1505527-how-do-i-enable-my-webcam-for-recording",
										"_blank"
									);
								}}
							>
								Directions
							</button>
						</div>
					),
					{
						autoClose: false,
						toastId: "webcam/audio_error"
					}
				); */
				this.setCaptionsText(
					"Failed to activate your webcam. Check your webcam/privacy settings."
				);
				console.log(
					"Failed to get local webcam video, check webcam privacy settings"
				);
				// Keep trying to get user media
				setTimeout(this.requestMediaStream, 1000);
			});
	};

	onMediaStream = (stream: MediaStream) => {
		console.log("onMediaStream");
		this.localStream = stream;
		/* TODO: if (!seenWelcomeSnackbar) {
			toast(
				() => (
					<div className="text-center justify-between">
						{customSnackbarMsg ? (
							customSnackbarMsg
						) : (
							<>
								<span>Share your session key </span>
								<strong>{sessionKey}</strong>
								<span> with whoever wants to join</span>
							</>
						)}
					</div>
				),
				{
					toastId: "peer_prompt"
				}
			);
			setSeenWelcomeSnackbar(true);
		} */

		/* When a video stream is added to VideoChat, we need to store the local audio track, because the screen sharing MediaStream doesn't have audio by default, which is problematic for peer C who joins while another peer A/B is screen sharing (C won't receive A/Bs audio). */
		this.localAudio = stream.getAudioTracks()[0];
		if (!this.localVideo) {
			this.localVideo = document.getElementById(
				"local-video"
			) as HTMLMediaElement;
		}
		if (
			this.localVideo.srcObject === null ||
			this.localVideo.srcObject === undefined
		) {
			this.localVideo.srcObject = stream;
		}
		// Join the chat room
		this.socket.emit("join", this.sessionKey, () => {
			console.log("joined");
			//TODO: this.borderColor = hueToColor(uuidToHue(this.socket.id, this));
			//TODO: VCData.localVideo.style.border = `3px solid ${VCData.borderColor}`;
		});
		// Add listeners to the websocket
		this.socket.on("leave", this.onLeave);
		this.socket.on("full", chatRoomFull);
		this.socket.on("offer", this.onOffer);
		this.socket.on("willInitiateCall", this.call);
		// Set up listeners on the socket
		this.socket.on("candidate", this.onCandidate);
		this.socket.on("answer", this.onAnswer);
		this.socket.on("requestToggleCaptions", () => {});
		// TODO: handleToggleCaptions(this);
		this.socket.on("receiveCaptions", (captions: any) => {
			// TODO: handleReceiveCaptions(
			// 	captions,
			// 	receivingCaptions,
			// 	setReceivingCaptions,
			// 	setHideCaptions,
			// 	setCaptionsText
			// );
			console.log(captions);
		});
	};

	call = (uuid: string, room: any) => {
		console.log(`call >>> Initiating call with ${uuid}...`);
		this.socket.on(
			"token",
			this.establishConnection(uuid, (a: string) => {
				this.createOffer(a);
			})
		);
		this.socket.emit("token", this.sessionKey, uuid);
	};

	onLeave = (uuid: string) => {
		// Remove video element
		try {
			console.log("disconnected - UUID " + uuid);
			(document.getElementById("leave-sound") as HTMLVideoElement)?.play();
			this?.remoteVideoWrapper?.removeChild(
				document.querySelectorAll(`[uuid="${uuid}"]`)[0]
			);
		} catch (e) {
			console.log(e);
		}

		// Delete connection & metadata
		this.connected.delete(uuid);
		this.peerConnections.get(uuid).close(); // This is necessary, because otherwise the RTC connection isn't closed
		this.peerConnections.delete(uuid);
		this.dataChannel.delete(uuid);
		if (this.peerConnections.size === 0) {
			this.setCaptionsText("Room ready. Waiting for others to join...");
		}
	};

	establishConnection = (correctUuid: string, callback: Function) => {
		return (token: any, uuid: string) => {
			if (correctUuid !== uuid) {
				return;
			}
			console.log(`<<< Received token, connecting to ${uuid}`);
			// Initialize localICEcandidates for peer uuid to empty array
			this.localICECandidates[uuid] = [];
			// Initialize connection status with peer uuid to false
			this.connected.set(uuid, false);
			// Set up a new RTCPeerConnection using the token's iceServers.
			this.peerConnections.set(
				uuid,
				new RTCPeerConnection({
					iceServers: token.iceServers
				})
			);
			// Add the local video stream to the peerConnection.
			this.localStream?.getTracks().forEach((track: any) => {
				this.peerConnections.get(uuid).addTrack(track, this.localStream);
			});
			// Add general purpose data channel to peer connection, used for text chats, captions, and toggling sending captions
			this.dataChannel.set(
				uuid,
				this.peerConnections.get(uuid).createDataChannel("chat", {
					negotiated: true,
					// both peers must have same id
					id: 0
				})
			);
			// Handle different dataChannel types
			this.dataChannel.get(uuid).onmessage = (e: MessageEvent) => {
				const receivedData = e.data;
				// First 4 chars represent data type
				const dataType = receivedData.substring(0, 4);
				const cleanedMessage = receivedData.slice(4);
				if (dataType === "mes:") {
					//TODO:  handlereceiveMessage(
					// 	cleanedMessage,
					// 	hueToColor(VCData.peerColors.get(uuid)),
					// 	hideChat,
					// 	setHideChat
					// );
				} else if (dataType === "cap:") {
					// TODO: handleReceiveCaptions(
					// 	cleanedMessage,
					// 	receivingCaptions,
					// 	setReceivingCaptions,
					// 	setHideCaptions,
					// 	setCaptionsText
					// );
				} else if (dataType === "tog:") {
					this.sendingCaptions = !this.sendingCaptions;
					// setSendingCaptions(!sendingCaptions);
				} else if (dataType === "clr:") {
					// TODO: setStreamColor(uuid, VCData);
				} else {
					// Arbitrary data handling
					console.log("Received arbitrary data: ", receivedData);
					// TODO: determine whether to add arbitrary data to DOM
					// document.getElementById("arbitrary-data")?.append(receivedData);
					window.top.postMessage(receivedData, "*");
				}
			};
			/* 	Called when dataChannel is successfully opened - Set up callbacks for the connection generating iceCandidates or receiving the remote media stream. Wrapping callback functions to pass in the peer uuids. */
			this.dataChannel.get(uuid).onopen = (e: any) => {
				console.log("dataChannel opened");
				// TODO: setStreamColor(uuid, VCData);
			};

			this.peerConnections.get(uuid).onicecandidate = (e: any) => {
				this.onIceCandidate(e, uuid);
			};
			this.peerConnections.get(uuid).onAddStream = (e: any) => {
				this.onAddStream(e, uuid);
			};
			// Called when there is a change in connection state
			this.peerConnections.get(uuid).oniceconnectionstatechange = (e: any) => {
				switch (this.peerConnections.get(uuid).iceConnectionState) {
					case "connected":
						console.log("connected");
						break;
					case "disconnected":
						// Disconnects are handled server-side
						console.log("disconnected - UUID " + uuid);
						break;
					case "failed":
						console.log(">>> would trigger refresh: failed ICE connection");
						// TODO: refresh
						// window.location.reload();
						break;
					case "closed":
						console.log("closed");
						break;
				}
			};
			callback(uuid);
		};
	};

	// When the peerConnection generates an ice candidate, send it over the socket to the peer.
	onIceCandidate = (e: any, uuid: string) => {
		console.log("onIceCandidate");
		if (e.candidate) {
			console.log(
				`<<< Received local ICE candidate from STUN/TURN server (${e.candidate.address}) for connection with ${uuid}`
			);
			if (this.connected.get(uuid)) {
				console.log(`>>> Sending local ICE candidate (${e.candidate.address})`);
				this.socket.emit(
					"candidate",
					JSON.stringify(e.candidate),
					this.sessionKey,
					uuid
				);
			} else {
				/* If we are not 'connected' to the other peer, we are buffering the local ICE candidates. This most likely is happening on the "caller" side. The peer may not have created the RTCPeerConnection yet, so we are waiting for the 'answer' to arrive. This will signal that the peer is ready to receive signaling. */
				this.localICECandidates[uuid].push(e.candidate);
			}
		}
	};
	// When receiving a candidate over the socket, turn it back into a real RTCIceCandidate and add it to the peerConnection.
	onCandidate = (candidate: any, uuid: string) => {
		this.setCaptionsText("Found other user... connecting");
		var rtcCandidate: RTCIceCandidate = new RTCIceCandidate(
			JSON.parse(candidate)
		);
		console.log(
			`onCandidate <<< Received remote ICE candidate (${rtcCandidate.port} - ${rtcCandidate.relatedAddress})`
		);
		this.peerConnections.get(uuid).addIceCandidate(rtcCandidate);
	};
	// Create an offer that contains the media capabilities of the browser.
	createOffer = (uuid: string): void => {
		console.log(`createOffer to ${uuid} >>> Creating offer...`);
		this.peerConnections.get(uuid).createOffer(
			(offer: any) => {
				/* If the offer is created successfully, set it as the local description and send it over the socket connection to initiate the peerConnection on the other side. */
				this.peerConnections.get(uuid).setLocalDescription(offer);
				this.socket.emit("offer", JSON.stringify(offer), this.sessionKey, uuid);
			},
			(e: any) => {
				console.log("failed offer creation");
				console.log(e, true);
			}
		);
	};

	/* Create an answer with the media capabilities that the client and peer browsers share. This function is called with the offer from the originating browser, which needs to be parsed into an RTCSessionDescription and added as the remote description to the peerConnection object. Then the answer is created in the same manner as the offer and sent over the socket. */
	createAnswer = (offer: any, uuid: string): void => {
		console.log("createAnswer");
		var rtcOffer = new RTCSessionDescription(JSON.parse(offer));
		console.log(`>>> Creating answer to ${uuid}`);
		this.peerConnections.get(uuid).setRemoteDescription(rtcOffer);
		this.peerConnections.get(uuid).createAnswer(
			(answer: any) => {
				this.peerConnections.get(uuid).setLocalDescription(answer);
				this.socket.emit(
					"answer",
					JSON.stringify(answer),
					this.sessionKey,
					uuid
				);
			},
			(err: any) => {
				console.log("Failed answer creation.");
				console.log(err, true);
			}
		);
	};

	// When a browser receives an offer, set up a callback to be run when the ephemeral token is returned from Twilio.
	onOffer = (offer: any, uuid: string): void => {
		console.log("onOffer <<< Received offer");
		this.socket.on(
			"token",
			this.establishConnection(uuid, (a: string) => {
				this.createAnswer(offer, a);
			})
		);
		this.socket.emit("token", this.sessionKey, uuid);
	};

	// When an answer is received, add it to the peerConnection as the remote description.
	onAnswer = (answer: any, uuid: string) => {
		console.log(`onAnswer <<< Received answer from ${uuid}`);
		var rtcAnswer = new RTCSessionDescription(JSON.parse(answer));
		// Set remote description of RTCSession
		this.peerConnections.get(uuid).setRemoteDescription(rtcAnswer);
		// The caller now knows that the callee is ready to accept new ICE candidates, so sending the buffer over
		this.localICECandidates[uuid].forEach((candidate: any) => {
			console.log(`>>> Sending local ICE candidate (${candidate.address})`);
			// Send ice candidate over websocket
			this.socket.emit(
				"candidate",
				JSON.stringify(candidate),
				this.sessionKey,
				uuid
			);
		});
		// TODO: determine if we're attempting this
		// Reset the buffer of local ICE candidates. This is not really needed, but it's good practice
		// VideoChat.localICECandidates[uuid] = []; // TESTING
	};

	// Called when a stream is added to the peer connection: Create new <video> node and append remote video source to wrapper div
	onAddStream = (e: any, uuid: string) => {
		console.log(
			"onAddStream <<< Received new stream from remote. Adding it..."
		);
		console.log("onAddStream <<< Playing join sound...");
		(document.getElementById("join-sound") as HTMLVideoElement)?.play();
		var node = document.createElement("video");
		node.setAttribute("autoplay", "");
		node.setAttribute("playsinline", "");
		node.setAttribute("id", "remote-video");
		node.setAttribute("uuid", uuid);
		if (!this.remoteVideoWrapper) {
			this.remoteVideoWrapper = document.getElementById(
				"wrapper"
			) as HTMLMediaElement;
		}

		this.setCaptionsText("Session connected successfully");

		this.remoteVideoWrapper.appendChild(node);
		// Update remote video source
		this.remoteVideoWrapper.srcObject = e.stream;
		// if (VideoChatData.remoteVideoWrapper?.lastChild !== null) {
		// 	// @ts-ignore
		// 	VideoChatData.remoteVideoWrapper.lastChild.srcObject = e.stream;
		// }
		// TODO: toast.dismiss();
		// Remove the loading gif from video
		// TODO: if (VCData.remoteVideoWrapper.lastChild) {
		// 	VCData.remoteVideoWrapper.style.background = "none";
		// }
		// Update connection status
		this.connected.set(uuid, true);
		// TODO: setHideCaptions(true);
	};
}
