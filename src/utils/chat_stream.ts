// import io from "socket.io";
import { io } from "socket.io-client";
import { fadeIn, fadeOut } from "./fade";
import SnackbarProvider from "react-simple-snackbar";
import { VideoChatDataInterface } from "./interfaces";

export var VideoChatData: VideoChatDataInterface = {
	videoEnabled: true,
	audioEnabled: true,
	connected: new Map(),
	localICECandidates: {},
	socket: io(),
	remoteVideoWrapper: document.getElementById("wrapper") as HTMLMediaElement,
	localVideo: document.getElementById("local-video") as HTMLMediaElement,
	peerConnections: new Map(),
	recognition: "",
	borderColor: "",
	peerColors: new Map(),
	localStream: "",
	localAudio: "",

	/* Call to getUserMedia (provided by adapter.js for  browser compatibility)
	asking for access to both the video and audio streams. If the request is
	 accepted callback to the onMediaStream function, otherwise callback to the
	 noMediaStream function. */
	requestMediaStream: (e?: any) => {
		console.log("requestMediaStream");
		// rePositionLocalVideo();
		navigator.mediaDevices
			.getUserMedia({
				video: true,
				audio: true
			})
			.then(stream => {
				VideoChatData.onMediaStream(stream);
				localVideoText.text("Drag Me");
				fadeOut(localVideoText, 5000);
			})
			.catch(error => {
				console.log(error);
				// setCaptionsText(
				// 	"Failed to activate your webcam. Check your webcam/privacy settings."
				// );
				console.log(
					"Failed to get local webcam video, check webcam privacy settings"
				);
				// Keep trying to get user media
				setTimeout(VideoChatData.requestMediaStream, 1000);
			});
	},

	// Called when a video stream is added to VideoChat
	onMediaStream: (stream: any) => {
		console.log("onMediaStream");
		// @ts-ignore
		VideoChatData.localStream = stream;

		// We need to store the local audio track, because
		// the screen sharing MediaStream doesn't have audio
		// by default, which is problematic for peer C who joins
		// while another peer A/B is screen sharing (C won't receive
		// A/Bs audio).<br />
		// @ts-ignore
		VideoChatData.localAudio = stream.getAudioTracks()[0];
		VideoChatData.localVideo.srcObject = stream;

		// Now we're ready to join the chat room.
		VideoChatData.socket.emit("join", roomHash, () => {
			VideoChatData.borderColor = hueToColor(
				uuidToHue(VideoChatData.socket.id)
			);
			VideoChatData.localVideo.style.border = `3px solid ${VideoChatData.borderColor}`;
		});

		// Add listeners to the websocket
		VideoChatData.socket.on("leave", VideoChatData.onLeave);
		VideoChatData.socket.on("full", chatRoomFull);
		VideoChatData.socket.on("offer", VideoChatData.onOffer);
		VideoChatData.socket.on("willInitiateCall", VideoChatData.call);

		// Set up listeners on the socket
		VideoChatData.socket.on("candidate", VideoChatData.onCandidate);
		VideoChatData.socket.on("answer", VideoChatData.onAnswer);
		VideoChatData.socket.on("requestToggleCaptions", () =>
			toggleSendCaptions()
		);
		VideoChatData.socket.on("receiveCaptions", (captions: any) =>
			receiveCaptions(captions)
		);
	},

	call: (uuid: string, room: any) => {
		console.log(`call >>> Initiating call with ${uuid}...`);
		VideoChatData.socket.on(
			"token",
			VideoChatData.establishConnection(uuid, (a: Function) => {
				VideoChatData.createOffer(a);
			})
		);
		VideoChatData.socket.emit("token", roomHash, uuid);
	},

	onLeave: (uuid: string) => {
		console.log("disconnected - UUID " + uuid);

		// @ts-ignore
		document.getElementById("leave-sound")?.play();

		// Remove video element
		VideoChatData?.remoteVideoWrapper?.removeChild(
			document.querySelectorAll(`[uuid="${uuid}"]`)[0]
		);
		// Delete connection & metadata
		VideoChatData.connected.delete(uuid);
		VideoChatData.peerConnections.get(uuid).close(); // This is necessary, because otherwise the RTC connection isn't closed
		VideoChatData.peerConnections.delete(uuid);
		dataChannel.delete(uuid);
	},

	establishConnection: (correctUuid: any, callback: Function) => {
		return (token: any, uuid: any) => {
			if (correctUuid !== uuid) {
				return;
			}
			console.log(`<<< Received token, connecting to ${uuid}`);
			// Initialize localICEcandidates for peer uuid to empty array
			VideoChatData.localICECandidates[uuid] = [];
			// Initialize connection status with peer uuid to false
			VideoChatData.connected.set(uuid, false);
			// Set up a new RTCPeerConnection using the token's iceServers.
			VideoChatData.peerConnections.set(
				uuid,
				new RTCPeerConnection({
					iceServers: token.iceServers
				})
			);
			// Add the local video stream to the peerConnection.
			// @ts-ignore
			VideoChatData.localStream.getTracks().forEach((track: any) => {
				VideoChatData.peerConnections
					.get(uuid)
					// @ts-ignore
					.addTrack(track, VideoChatData.localStream);
			});
			// Add general purpose data channel to peer connection,
			// used for text chats, captions, and toggling sending captions
			dataChannel.set(
				uuid,
				VideoChatData.peerConnections.get(uuid).createDataChannel("chat", {
					negotiated: true,
					// both peers must have same id
					id: 0
				})
			);
			// Handle different dataChannel types
			dataChannel.get(uuid).onmessage = (e: MessageEvent) => {
				const receivedData = e.data;
				// First 4 chars represent data type
				const dataType = receivedData.substring(0, 4);
				const cleanedMessage = receivedData.slice(4);
				if (dataType === "mes:") {
					handlereceiveMessage(
						cleanedMessage,
						hueToColor(VideoChatData.peerColors.get(uuid))
					);
				} else if (dataType === "cap:") {
					receiveCaptions(cleanedMessage);
				} else if (dataType === "tog:") {
					toggleSendCaptions();
				} else if (dataType === "clr:") {
					setStreamColor(uuid);
				} else {
					// Arbitrary data handling
					console.log("Received arbitrary data: ", receivedData);
					document.getElementById("arbitrary-data")?.append(receivedData);
					window.top.postMessage(receivedData, "*");
				}
			};

			// Called when dataChannel is successfully opened
			dataChannel.get(uuid).onopen = (e: any) => {
				console.log("dataChannel opened");
				setStreamColor(uuid);
			};
			// Set up callbacks for the connection generating iceCandidates or
			// receiving the remote media stream. Wrapping callback functions
			// to pass in the peer uuids.
			VideoChatData.peerConnections.get(uuid).onicecandidate = (e: any) => {
				VideoChatData.onIceCandidate(e, uuid);
			};
			VideoChatData.peerConnections.get(uuid).onAddStream = (e: any) => {
				VideoChatData.onAddStream(e, uuid);
			};
			// Called when there is a change in connection state
			VideoChatData.peerConnections.get(uuid).oniceconnectionstatechange = (
				e: any
			) => {
				switch (VideoChatData.peerConnections.get(uuid).iceConnectionState) {
					case "connected":
						console.log("connected");
						break;
					case "disconnected":
						// Disconnects are handled server-side
						console.log("disconnected - UUID " + uuid);
						break;
					case "failed":
						console.log("failed");
						// Refresh page if connection has failed
						window.location.reload();
						break;
					case "closed":
						console.log("closed");
						break;
				}
			};
			callback(uuid);
		};
	},

	// When the peerConnection generates an ice candidate, send it over the socket to the peer.
	onIceCandidate: (event: any, uuid: any) => {
		console.log("onIceCandidate");
		if (event.candidate) {
			console.log(
				`<<< Received local ICE candidate from STUN/TURN server (${event.candidate.address}) for connection with ${uuid}`
			);
			if (VideoChatData.connected.get(uuid)) {
				console.log(
					`>>> Sending local ICE candidate (${event.candidate.address})`
				);
				VideoChatData.socket.emit(
					"candidate",
					JSON.stringify(event.candidate),
					roomHash,
					uuid
				);
			} else {
				// If we are not 'connected' to the other peer, we are buffering the local ICE candidates.
				// This most likely is happening on the "caller" side.
				// The peer may not have created the RTCPeerConnection yet, so we are waiting for the 'answer'
				// to arrive. This will signal that the peer is ready to receive signaling.
				VideoChatData.localICECandidates[uuid].push(event.candidate);
			}
		}
	},

	// When receiving a candidate over the socket, turn it back into a real
	// RTCIceCandidate and add it to the peerConnection.
	onCandidate: (candidate: any, uuid: any) => {
		// Update caption text
		captionText.text("Found other user... connecting");
		var rtcCandidate = new RTCIceCandidate(JSON.parse(candidate));
		console.log(
			// @ts-ignore
			`onCandidate <<< Received remote ICE candidate (${rtcCandidate.address} - ${rtcCandidate.relatedAddress})`
		);
		VideoChatData.peerConnections.get(uuid).addIceCandidate(rtcCandidate);
	},

	// Create an offer that contains the media capabilities of the browser.
	createOffer: (uuid: any) => {
		console.log(`createOffer to ${uuid} >>> Creating offer...`);
		VideoChatData.peerConnections.get(uuid).createOffer(
			(offer: any) => {
				// If the offer is created successfully, set it as the local description
				// and send it over the socket connection to initiate the peerConnection
				// on the other side.
				VideoChatData.peerConnections.get(uuid).setLocalDescription(offer);
				VideoChatData.socket.emit(
					"offer",
					JSON.stringify(offer),
					roomHash,
					uuid
				);
			},
			(err: any) => {
				console.log("failed offer creation");
				console.log(err, true);
			}
		);
	},

	// Create an answer with the media capabilities that the client and peer browsers share.
	// This function is called with the offer from the originating browser, which
	// needs to be parsed into an RTCSessionDescription and added as the remote
	// description to the peerConnection object. Then the answer is created in the
	// same manner as the offer and sent over the socket.
	createAnswer: function (offer: any, uuid: any) {
		console.log("createAnswer");
		var rtcOffer = new RTCSessionDescription(JSON.parse(offer));
		console.log(`>>> Creating answer to ${uuid}`);
		VideoChatData.peerConnections.get(uuid).setRemoteDescription(rtcOffer);
		VideoChatData.peerConnections.get(uuid).createAnswer(
			(answer: any) => {
				VideoChatData.peerConnections.get(uuid).setLocalDescription(answer);
				VideoChatData.socket.emit(
					"answer",
					JSON.stringify(answer),
					roomHash,
					uuid
				);
			},
			function (err: any) {
				console.log("Failed answer creation.");
				console.log(err, true);
			}
		);
	},

	// When a browser receives an offer, set up a callback to be run when the
	// ephemeral token is returned from Twilio.
	onOffer: (offer: any, uuid: any) => {
		console.log("onOffer <<< Received offer");
		VideoChatData.socket.on(
			"token",
			VideoChatData.establishConnection(uuid, (a: any) => {
				VideoChatData.createAnswer(offer, a);
			})
		);
		VideoChatData.socket.emit("token", roomHash, uuid);
	},

	// When an answer is received, add it to the peerConnection as the remote description.
	onAnswer: (answer: any, uuid: any) => {
		console.log(`onAnswer <<< Received answer from ${uuid}`);
		var rtcAnswer = new RTCSessionDescription(JSON.parse(answer));
		// Set remote description of RTCSession
		VideoChatData.peerConnections.get(uuid).setRemoteDescription(rtcAnswer);
		// The caller now knows that the callee is ready to accept new ICE candidates, so sending the buffer over
		VideoChatData.localICECandidates[uuid].forEach(candidate => {
			console.log(`>>> Sending local ICE candidate (${candidate.address})`);
			// Send ice candidate over websocket
			VideoChatData.socket.emit(
				"candidate",
				JSON.stringify(candidate),
				roomHash,
				uuid
			);
		});
		// Reset the buffer of local ICE candidates. This is not really needed, but it's good practice
		// VideoChat.localICECandidates[uuid] = []; // TESTING
	},

	// Called when a stream is added to the peer connection
	onAddStream: (e: any, uuid: any) => {
		console.log(
			"onAddStream <<< Received new stream from remote. Adding it..."
		);
		// Create new remote video source in wrapper
		// Create a <video> node
		console.log("onAddStream <<< Playing join sound...");
		// @ts-ignore
		document.getElementById("join-sound")?.play();
		var node = document.createElement("video");
		node.setAttribute("autoplay", "");
		node.setAttribute("playsinline", "");
		node.setAttribute("id", "remote-video");
		node.setAttribute("uuid", uuid);
		VideoChatData?.remoteVideoWrapper?.appendChild(node);
		// Update remote video source
		if (VideoChatData.remoteVideoWrapper?.lastChild !== null) {
			// @ts-ignore
			VideoChatData.remoteVideoWrapper.lastChild.srcObject = e.stream;
		}
		// // Close the initial share url snackbar
		// Snackbar.close();
		// Remove the loading gif from video
		// @ts-ignore
		VideoChatData.remoteVideoWrapper.lastChild.style.background = "none";
		// Update connection status
		VideoChatData.connected.set(uuid, true);
		// Hide caption status text
		fadeOut(captionText, 400);
		// Reposition local video after a second, as there is often a delay
		// between adding a stream and the height of the video div changing
		// setTimeout(() => rePositionLocalVideo(), 500);
	}
};
