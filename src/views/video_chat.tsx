import React, { useEffect, useState } from "react";
import ChatComponent from "../components/chat_comp";
import DetectRTC from "detectrtc";
import { getBrowserName, chatRoomFull } from "../utils/main_utils";
// import { VideoChatData } from "../utils/chat_stream";
import { useSnackbar } from "react-simple-snackbar";
import ReactTooltip from "react-tooltip";
import Draggable from "react-draggable";
// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faAudioDescription,
	faClosedCaptioning,
	faComment,
	faCommentSlash,
	faDesktop,
	faExternalLinkAlt,
	faExternalLinkSquareAlt,
	faMicrophone,
	faMicrophoneSlash,
	faPause,
	faPhoneSlash,
	faPlay,
	faVideo
} from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/img/wordmark_logo.png";
// sounds
import joinSound from "../assets/sound/join.mp3";
import leaveSound from "../assets/sound/leave.mp3";

// import io from "socket.io";
import { io } from "socket.io-client";
import { VideoChatDataInterface } from "../utils/interfaces";

const VideoChat = ({
	sessionKey,
	defaultSettings,
	customModalMessage
}: {
	sessionKey: string;
	defaultSettings?: {
		hideChat?: boolean;
		muted?: boolean;
		hideCaptions?: boolean;
		hideLogo?: boolean;
	};
	customModalMessage?: string;
}) => {
	/* ON LOAD: Detect in-app browsers & redirect, set tab title, get webcam */
	useEffect(() => {
		var ua: string = navigator.userAgent || navigator.vendor;
		if (
			DetectRTC.isMobileDevice &&
			(ua.indexOf("FBAN") > -1 ||
				ua.indexOf("FBAV") > -1 ||
				ua.indexOf("Instagram") > -1)
		) {
			if (DetectRTC.osName === "iOS") {
				window.location.href = "/browser-not-supported";
			} else {
				window.location.href = "/browser-not-supported";
			}
		}
		if (DetectRTC.isMobileDevice) {
			if (DetectRTC.osName === "iOS" && !DetectRTC.browser.isSafari) {
				window.location.href = "/browser-not-supported";
			}
		}
		const isWebRTCSupported =
			navigator.getUserMedia || window.RTCPeerConnection;
		const browserName: string = getBrowserName();
		if (!isWebRTCSupported || browserName === "MSIE") {
			window.location.href = "/browser-not-supported";
		}
		document.title =
			"Catalyst - " +
			window.location.href.substring(window.location.href.lastIndexOf("/") + 1);
		VideoChatData.requestMediaStream();
		navigator.mediaDevices.ondevicechange = () => window.location.reload();
	});

	/* STATE: track toggleable UI/UX */
	const [muted, setMuted] = useState(
		defaultSettings?.muted ? defaultSettings.muted : false
	);
	const [vidPaused, setVidPaused] = useState(false);
	const [sharing, setSharing] = useState(false);
	const [picInPic, setPicInPic] = useState(false);
	const [hideChat, setHideChat] = useState(
		defaultSettings?.hideChat ? defaultSettings.hideChat : false
	);
	const [hideCaptions, setHideCaptions] = useState(
		defaultSettings?.hideCaptions ? defaultSettings.hideCaptions : true
	);
	const [captionsText, setCaptionsText] = useState(
		"Room ready. Waiting for others to join..."
	);
	const [localVideoText, setLocalVideoText] = useState("No webcam input");
	const [openSnackbar, closeSnackbar] = useSnackbar({ position: "top-center" });

	// Track dataChannel connecting w/ each peer
	var dataChannel = new Map();

	/* VIDEO CHAT DATA: track video/audio streams, peer connections, handle webrtc */
	var VideoChatData: VideoChatDataInterface = {
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
		localAudio: "",
		localStream: "",

		/* Call to getUserMedia (provided by adapter.js for  browser compatibility) asking for access to both the video and audio streams. If the request is accepted callback to the onMediaStream function, otherwise callback to the noMediaStream function. */
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
					setLocalVideoText("Drag Me");
				})
				.catch(error => {
					console.log(error);
					setCaptionsText(
						"Failed to activate your webcam. Check your webcam/privacy settings."
					);
					console.log(
						"Failed to get local webcam video, check webcam privacy settings"
					);
					// Keep trying to get user media
					setTimeout(VideoChatData.requestMediaStream, 1000);
				});
		},

		onMediaStream: (stream: MediaStream) => {
			console.log("onMediaStream");
			VideoChatData.localStream = stream;
			/* When a video stream is added to VideoChat, we need to store the local audio track, because the screen sharing MediaStream doesn't have audio by default, which is problematic for peer C who joins while another peer A/B is screen sharing (C won't receive A/Bs audio). */
			VideoChatData.localAudio = stream.getAudioTracks()[0];
			if (!VideoChatData.localVideo) {
				VideoChatData.localVideo = document.getElementById(
					"local-video"
				) as HTMLMediaElement;
			}
			VideoChatData.localVideo.srcObject = stream;
			// Join the chat room.
			VideoChatData.socket.emit("join", sessionKey, () => {
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
			VideoChatData.socket.emit("token", sessionKey, uuid);
		},

		onLeave: (uuid: string) => {
			console.log("disconnected - UUID " + uuid);
			(document.getElementById("leave-sound") as HTMLVideoElement)?.play();
			// Remove video element
			VideoChatData?.remoteVideoWrapper?.removeChild(
				document.querySelectorAll(`[uuid="${uuid}"]`)[0]
			);
			// Delete connection & metadata
			VideoChatData.connected.delete(uuid);
			VideoChatData.peerConnections.get(uuid).close(); // This is necessary, because otherwise the RTC connection isn't closed
			VideoChatData.peerConnections.delete(uuid);
			dataChannel.delete(uuid);
			if (VideoChatData.peerConnections.size === 0) {
				setCaptionsText("Room ready. Waiting for others to join...");
			}
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
				VideoChatData.localStream.getTracks().forEach((track: any) => {
					VideoChatData.peerConnections
						.get(uuid)
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
						// TODO: determine whether to add arbitrary data to DOM
						// document.getElementById("arbitrary-data")?.append(receivedData);
						window.top.postMessage(receivedData, "*");
					}
				};
				/* 	Called when dataChannel is successfully opened - Set up callbacks for the connection generating iceCandidates or receiving the remote media stream. Wrapping callback functions to pass in the peer uuids. */
				dataChannel.get(uuid).onopen = (e: any) => {
					console.log("dataChannel opened");
					setStreamColor(uuid);
				};

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
						sessionKey,
						uuid
					);
				} else {
					/* If we are not 'connected' to the other peer, we are buffering the local ICE candidates. This most likely is happening on the "caller" side. The peer may not have created the RTCPeerConnection yet, so we are waiting for the 'answer' to arrive. This will signal that the peer is ready to receive signaling. */
					VideoChatData.localICECandidates[uuid].push(event.candidate);
				}
			}
		},

		// When receiving a candidate over the socket, turn it back into a real RTCIceCandidate and add it to the peerConnection.
		onCandidate: (candidate: any, uuid: any) => {
			// Update caption text
			captionText.text("Found other user... connecting");
			var rtcCandidate: RTCIceCandidate = new RTCIceCandidate(
				JSON.parse(candidate)
			);

			console.log(
				`onCandidate <<< Received remote ICE candidate (${rtcCandidate.port} - ${rtcCandidate.relatedAddress})`
			);
			VideoChatData.peerConnections.get(uuid).addIceCandidate(rtcCandidate);
		},

		// Create an offer that contains the media capabilities of the browser.
		createOffer: (uuid: any) => {
			console.log(`createOffer to ${uuid} >>> Creating offer...`);
			VideoChatData.peerConnections.get(uuid).createOffer(
				(offer: any) => {
					/* If the offer is created successfully, set it as the local description and send it over the socket connection to initiate the peerConnection on the other side. */
					VideoChatData.peerConnections.get(uuid).setLocalDescription(offer);
					VideoChatData.socket.emit(
						"offer",
						JSON.stringify(offer),
						sessionKey,
						uuid
					);
				},
				(err: any) => {
					console.log("failed offer creation");
					console.log(err, true);
				}
			);
		},

		/* Create an answer with the media capabilities that the client and peer browsers share. This function is called with the offer from the originating browser, which needs to be parsed into an RTCSessionDescription and added as the remote description to the peerConnection object. Then the answer is created in the same manner as the offer and sent over the socket. */
		createAnswer: (offer: any, uuid: any) => {
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
						sessionKey,
						uuid
					);
				},
				(err: any) => {
					console.log("Failed answer creation.");
					console.log(err, true);
				}
			);
		},

		// When a browser receives an offer, set up a callback to be run when the ephemeral token is returned from Twilio.
		onOffer: (offer: any, uuid: any) => {
			console.log("onOffer <<< Received offer");
			VideoChatData.socket.on(
				"token",
				VideoChatData.establishConnection(uuid, (a: any) => {
					VideoChatData.createAnswer(offer, a);
				})
			);
			VideoChatData.socket.emit("token", sessionKey, uuid);
		},

		// When an answer is received, add it to the peerConnection as the remote description.
		onAnswer: (answer: any, uuid: any) => {
			console.log(`onAnswer <<< Received answer from ${uuid}`);
			var rtcAnswer = new RTCSessionDescription(JSON.parse(answer));
			// Set remote description of RTCSession
			VideoChatData.peerConnections.get(uuid).setRemoteDescription(rtcAnswer);
			// The caller now knows that the callee is ready to accept new ICE candidates, so sending the buffer over
			VideoChatData.localICECandidates[uuid].forEach((candidate: any) => {
				console.log(`>>> Sending local ICE candidate (${candidate.address})`);
				// Send ice candidate over websocket
				VideoChatData.socket.emit(
					"candidate",
					JSON.stringify(candidate),
					sessionKey,
					uuid
				);
			});
			// TODO: determine if we're attempting this
			// Reset the buffer of local ICE candidates. This is not really needed, but it's good practice
			// VideoChat.localICECandidates[uuid] = []; // TESTING
		},

		// Called when a stream is added to the peer connection: Create new remote video source in wrapper and create a <video> node
		onAddStream: (e: any, uuid: any) => {
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
			VideoChatData?.remoteVideoWrapper?.appendChild(node);
			// Update remote video source
			if (VideoChatData.remoteVideoWrapper?.lastChild !== null) {
				// @ts-ignore
				VideoChatData.remoteVideoWrapper.lastChild.srcObject = e.stream;
			}
			// // Close the initial share url snackbar
			// Snackbar.close();
			// Remove the loading gif from video
			if (VideoChatData.remoteVideoWrapper.lastChild) {
				VideoChatData.remoteVideoWrapper.style.background = "none";
			}
			// Update connection status
			VideoChatData.connected.set(uuid, true);
			// Hide caption status text
			// Reposition local video after a second, as there is often a delay
			// between adding a stream and the height of the video div changing
			// setTimeout(() => rePositionLocalVideo(), 500);
		}
	};

	/* POST MESSAGING - forward post messaging from one parent to the other */
	window.onmessage = (e: MessageEvent) => {
		try {
			if (JSON.parse(e.data).type === "arbitraryData") {
				sendToAllDataChannels(e.data);
			}
		} catch (e) {}
	};

	return (
		<>
			<div id="arbitrary-data" style={{ display: "none" }}></div>
			<div id="header">
				<button
					onClick={() =>
						openSnackbar(
							<div>
								Please press allow to enable webcam and audio access{" "}
								<button
									onClick={() => {
										window.open(
											"https://help.clipchamp.com/en/articles/1505527-how-do-i-enable-my-webcam-for-recording",
											"_blank"
										);
									}}
								>
									Help!
								</button>
							</div>,
							[10000]
						)
					}
				>
					<img src={logo} alt="Catalyst Logo" height="48" />
					{sessionKey}
				</button>
			</div>

			<div id="call-section">
				<Draggable>
					<div id="remote-video-text">{captionsText}</div>
				</Draggable>
				<div id="wrapper"></div>
				<Draggable defaultPosition={{ x: 30, y: 150 }}>
					<div id="moveable">
						<p id="local-video-text">{localVideoText}</p>
						<video id="local-video" autoPlay muted playsInline></video>
					</div>
				</Draggable>

				<div className="multi-button">
					<div className="buttonContainer">
						<ReactTooltip
							id="mute-tooltip"
							place="top"
							type="dark"
							effect="float"
						>
							<div className="HoverState" id="mic-text">
								{!muted ? <span>Mute Audio</span> : <span>Unmute Audio</span>}
							</div>
						</ReactTooltip>
						<button
							data-tip="mute-tooltip"
							data-for="mute-tooltip"
							className="hoverButton"
							onClick={() => {
								setMuted(!muted);
							}}
						>
							<FontAwesomeIcon
								icon={!muted ? faMicrophone : faMicrophoneSlash}
							/>
						</button>
					</div>

					<div className="buttonContainer">
						<ReactTooltip
							id="pause-tooltip"
							place="top"
							type="dark"
							effect="float"
						>
							<div className="HoverState" id="video-text">
								{!vidPaused ? (
									<span>Pause Video</span>
								) : (
									<span>Unpause Video</span>
								)}
							</div>
						</ReactTooltip>
						<button
							data-tip="pause-tooltip"
							data-for="pause-tooltip"
							className="hoverButton"
							onClick={() => {
								setVidPaused(!vidPaused);
							}}
						>
							<FontAwesomeIcon icon={!vidPaused ? faPause : faPlay} />
						</button>
					</div>

					<div className="buttonContainer">
						<ReactTooltip
							id="share-tooltip"
							place="top"
							type="dark"
							effect="float"
						>
							<div className="HoverState" id="swap-text">
								Share Screen
							</div>
						</ReactTooltip>
						<button
							data-tip="share-tooltip"
							data-for="share-tooltip"
							className="hoverButton"
							id="share-button"
							onClick={() => {
								setSharing(!sharing);
							}}
						>
							<FontAwesomeIcon icon={!sharing ? faDesktop : faVideo} />
						</button>
					</div>

					<div className="buttonContainer">
						<ReactTooltip
							id="chat-tooltip"
							place="top"
							type="dark"
							effect="float"
						>
							<div className="HoverState" id="chat-text">
								{!hideChat ? <span>Hide Chat</span> : <span>Show Chat</span>}
							</div>
						</ReactTooltip>
						<button
							data-tip="chat-tooltip"
							data-for="chat-tooltip"
							className="hoverButton"
							onClick={() => {
								setHideChat(!hideChat);
							}}
						>
							<FontAwesomeIcon icon={!hideChat ? faComment : faCommentSlash} />
						</button>
					</div>

					<div className="buttonContainer">
						<ReactTooltip
							id="pic-tooltip"
							place="top"
							type="dark"
							effect="float"
						>
							<div className="HoverState" id="pip-text">
								{!picInPic ? (
									<span>Picture in Picture</span>
								) : (
									<span>Normal View</span>
								)}
							</div>
						</ReactTooltip>
						<button
							data-tip="pic-tooltip"
							data-for="pic-tooltip"
							className="hoverButton"
							id="pip-button"
							onClick={() => {
								setPicInPic(!picInPic);
							}}
						>
							<FontAwesomeIcon
								icon={!picInPic ? faExternalLinkAlt : faExternalLinkSquareAlt}
							/>
						</button>
					</div>

					<div className="buttonContainer">
						<ReactTooltip
							id="caption-tooltip"
							place="top"
							type="dark"
							effect="float"
						>
							<div className="HoverState" id="caption-button-text">
								{!picInPic ? (
									<span>Closed Captions</span>
								) : (
									<span>Hide Closed Captions</span>
								)}
							</div>
						</ReactTooltip>
						<button
							data-tip="caption-tooltip"
							data-for="caption-tooltip"
							className="hoverButton"
							onClick={() => {
								// setHideCaptions(!hideCaptions);
							}}
						>
							<FontAwesomeIcon
								icon={hideCaptions ? faClosedCaptioning : faAudioDescription}
							/>
						</button>
					</div>

					<div className="buttonContainer">
						<ReactTooltip
							id="end-call-tooltip"
							place="top"
							type="dark"
							effect="float"
						>
							<div className="HoverState">End Call</div>
						</ReactTooltip>
						<button
							data-tip="end-call-tooltip"
							data-for="end-call-tooltip"
							className="hoverButton"
							onClick={() => {
								window.location.href = "/newcall";
							}}
						>
							<FontAwesomeIcon icon={faPhoneSlash} />
						</button>
						<audio id="join-sound" src={joinSound}></audio>
						<audio id="leave-sound" src={leaveSound}></audio>
					</div>
				</div>
			</div>

			<ChatComponent hideChat={hideChat} />
		</>
	);
};

export default VideoChat;
