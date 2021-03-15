import React, { useEffect, useState } from "react";
// components
import {
	HeaderComponent,
	ChatComponent,
	IncompatibleComponent
} from "../components/index";
// utils
import {
	getBrowserName,
	chatRoomFull,
	sendToAllDataChannels,
	setStreamColor,
	hueToColor,
	handlereceiveMessage,
	uuidToHue,
	addMessageToScreen,
	setThemeColor
} from "../utils/general_utils";
import {
	handleMute,
	handlePauseVideo,
	handleToggleCaptions,
	handleRequestToggleCaptions,
	handleSharing,
	handleReceiveCaptions
} from "../utils/stream_utils";
// typings
import { DefaultSettings, VideoChatData } from "../../typings/interfaces";
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
// assets
import joinSound from "../assets/sound/join.mp3";
import leaveSound from "../assets/sound/leave.mp3";
// styles
import "../styles/catalyst.css";
import "react-toastify/dist/ReactToastify.css";
// packages
import { ToastContainer, toast } from "react-toastify";
import Draggable from "react-draggable";
import io from "socket.io-client";
// import * as io from "socket.io";
import DetectRTC from "detectrtc";

const DEFAULT_SERVER_ADDRESS = "https://catalyst-video-server.herokuapp.com/";

const VideoChat = ({
	sessionKey,
	defaultSettings,
	customSnackbarMsg,
	socketServerAddress,
	styles,
	themeColor
}: {
	sessionKey: string;
	socketServerAddress?: string;
	defaultSettings?: DefaultSettings;
	customSnackbarMsg?: HTMLElement | Element | string;
	styles?: Object;
	themeColor?: string;
}) => {
	/* ON LOAD: detect in-app browsers & redirect, set tab title, get webcam */
	useEffect(() => {
		VCData.requestMediaStream();

		// Listen for enter press on chat input
		const TextInput = document.querySelector(
			"textarea.compose"
		) as HTMLTextAreaElement;
		TextInput?.addEventListener("keypress", (e: any) => {
			if (e.keyCode === 13) {
				e.preventDefault();
				var msg = TextInput.value;
				console.log("textarea " + msg);
				// Send message over data channel, Add message to screen, auto scroll chat down
				if (msg && msg.length > 0) {
					// Prevent cross site scripting
					msg = msg.replace(/</g, "&lt;").replace(/>/g, "&gt;");
					sendToAllDataChannels("mes:" + msg, dataChannel);
					addMessageToScreen(msg, themeColor, true);
					document.getElementById("chat-end")?.scrollIntoView({
						behavior: "smooth",
						block: "nearest",
						inline: "start"
					});
					TextInput.value = "";
				}
			}
		});
	});

	useEffect(() => {
		setThemeColor(themeColor ? themeColor : "blue");
	}, [ themeColor]);

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
			"Catalyst Video Chat" +
			window.location.href.substring(window.location.href.lastIndexOf("/") + 1);
		// TODO: address this
		navigator.mediaDevices.ondevicechange = () =>
			console.log(">>> navigator MediaDevices changed: would trigger refresh"); // window.location.reload
	}, [])



	/* STATE: track toggleable UI/UX */
	const [audioEnabled, setAudio] = useState<boolean>(
		defaultSettings?.audioOn ? defaultSettings.audioOn : true
	);
	const [videoEnabled, setVideo] = useState<boolean>(
		defaultSettings?.videoOn ? defaultSettings.videoOn : true
	);
	const [sharing, setSharing] = useState(false);
	const [picInPic, setPicInPic] = useState(false);
	const [hideChat, setHideChat] = useState<boolean>(
		defaultSettings?.hideChat ? defaultSettings.hideChat : true
	);
	const [sendingCaptions, setSendingCaptions] = useState(false);
	const [receivingCaptions, setReceivingCaptions] = useState(false);
	const [hideCaptions, setHideCaptions] = useState<boolean>(
		defaultSettings?.hideCaptions ? defaultSettings.hideCaptions : true
	);
	const [captionsText, setCaptionsText] = useState(
		"Room ready. Waiting for others to join..."
	);
	const [localVideoText, setLocalVideoText] = useState("No webcam input");
	const [seenWelcomeSnackbar, setSeenWelcomeSnackbar] = useState(false);

	// Track dataChannel connecting w/ each peer
	var dataChannel = new Map();

	/* VIDEO CHAT DATA: track video/audio streams, peer connections, handle webrtc */
	var VCData: VideoChatData = {
		connected: new Map(),
		localICECandidates: {},
		socket: io(socketServerAddress ?? DEFAULT_SERVER_ADDRESS),
		remoteVideoWrapper: document.getElementById("wrapper") as HTMLMediaElement,
		localVideo: document.getElementById("local-video") as HTMLMediaElement,
		peerConnections: new Map(),
		recognition: "",
		borderColor: "",
		peerColors: new Map(),
		localAudio: undefined,
		localStream: undefined,

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
					VCData.onMediaStream(stream);
					setLocalVideoText("Drag Me");
				})
				.catch(error => {
					console.log(error);
					// show initial connect to peer prompt
					toast(
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
					);
					setCaptionsText(
						"Failed to activate your webcam. Check your webcam/privacy settings."
					);
					console.log(
						"Failed to get local webcam video, check webcam privacy settings"
					);
					// Keep trying to get user media
					setTimeout(VCData.requestMediaStream, 1000);
				});
		},

		onMediaStream: (stream: MediaStream) => {
			console.log("onMediaStream");
			VCData.localStream = stream;
			if (!seenWelcomeSnackbar) {
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
			}

			/* When a video stream is added to VideoChat, we need to store the local audio track, because the screen sharing MediaStream doesn't have audio by default, which is problematic for peer C who joins while another peer A/B is screen sharing (C won't receive A/Bs audio). */
			VCData.localAudio = stream.getAudioTracks()[0];
			if (!VCData.localVideo) {
				VCData.localVideo = document.getElementById(
					"local-video"
				) as HTMLMediaElement;
			}
			if (
				VCData.localVideo.srcObject === null ||
				VCData.localVideo.srcObject === undefined
			) {
				VCData.localVideo.srcObject = stream;
			}
			// Join the chat room
			VCData.socket.emit("join", sessionKey, () => {
				console.log("joined");
				VCData.borderColor = hueToColor(uuidToHue(VCData.socket.id, VCData));
				//TODO: VCData.localVideo.style.border = `3px solid ${VCData.borderColor}`;
			});
			// Add listeners to the websocket
			VCData.socket.on("leave", VCData.onLeave);
			VCData.socket.on("full", chatRoomFull);
			VCData.socket.on("offer", VCData.onOffer);
			VCData.socket.on("willInitiateCall", VCData.call);
			// Set up listeners on the socket
			VCData.socket.on("candidate", VCData.onCandidate);
			VCData.socket.on("answer", VCData.onAnswer);
			VCData.socket.on("requestToggleCaptions", () =>
				handleToggleCaptions(sendingCaptions, setSendingCaptions, VCData)
			);
			VCData.socket.on("receiveCaptions", (captions: any) => {
				handleReceiveCaptions(
					captions,
					receivingCaptions,
					setReceivingCaptions,
					setHideCaptions,
					setCaptionsText
				);
			});
		},

		call: (uuid: string, room: any) => {
			console.log(`call >>> Initiating call with ${uuid}...`);
			VCData.socket.on(
				"token",
				VCData.establishConnection(uuid, (a: string) => {
					VCData.createOffer(a);
				})
			);
			VCData.socket.emit("token", sessionKey, uuid);
		},

		onLeave: (uuid: string) => {
			
			// Remove video element
			try {
				console.log("disconnected - UUID " + uuid);
				(document.getElementById("leave-sound") as HTMLVideoElement)?.play();
				VCData?.remoteVideoWrapper?.removeChild(document.querySelectorAll(`[uuid="${uuid}"]`)[0]);
			} catch (e){
				console.log(e)
			}
			
			// Delete connection & metadata
			VCData.connected.delete(uuid);
			VCData.peerConnections.get(uuid).close(); // This is necessary, because otherwise the RTC connection isn't closed
			VCData.peerConnections.delete(uuid);
			dataChannel.delete(uuid);
			if (VCData.peerConnections.size === 0) {
				setCaptionsText("Room ready. Waiting for others to join...");
			}
		},

		establishConnection: (correctUuid: string, callback: Function) => {
			return (token: any, uuid: string) => {
				if (correctUuid !== uuid) {
					return;
				}
				console.log(`<<< Received token, connecting to ${uuid}`);
				// Initialize localICEcandidates for peer uuid to empty array
				VCData.localICECandidates[uuid] = [];
				// Initialize connection status with peer uuid to false
				VCData.connected.set(uuid, false);
				// Set up a new RTCPeerConnection using the token's iceServers.
				VCData.peerConnections.set(
					uuid,
					new RTCPeerConnection({
						iceServers: token.iceServers
					})
				);
				// Add the local video stream to the peerConnection.
				VCData.localStream?.getTracks().forEach((track: any) => {
					VCData.peerConnections.get(uuid).addTrack(track, VCData.localStream);
				});
				// Add general purpose data channel to peer connection, used for text chats, captions, and toggling sending captions
				dataChannel.set(
					uuid,
					VCData.peerConnections.get(uuid).createDataChannel("chat", {
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
							hueToColor(VCData.peerColors.get(uuid)),
							hideChat,
							setHideChat
						);
					} else if (dataType === "cap:") {
						handleReceiveCaptions(
							cleanedMessage,
							receivingCaptions,
							setReceivingCaptions,
							setHideCaptions,
							setCaptionsText
						);
					} else if (dataType === "tog:") {
						setSendingCaptions(!sendingCaptions);
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
				dataChannel.get(uuid).onopen = (e: any) => {
					console.log("dataChannel opened");
					// TODO: setStreamColor(uuid, VCData);
				};

				VCData.peerConnections.get(uuid).onicecandidate = (e: any) => {
					VCData.onIceCandidate(e, uuid);
				};
				VCData.peerConnections.get(uuid).onAddStream = (e: any) => {
					VCData.onAddStream(e, uuid);
				};
				// Called when there is a change in connection state
				VCData.peerConnections.get(uuid).oniceconnectionstatechange = (
					e: any
				) => {
					switch (VCData.peerConnections.get(uuid).iceConnectionState) {
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
		},

		// When the peerConnection generates an ice candidate, send it over the socket to the peer.
		onIceCandidate: (e: any, uuid: string) => {
			console.log("onIceCandidate");
			if (e.candidate) {
				console.log(
					`<<< Received local ICE candidate from STUN/TURN server (${e.candidate.address}) for connection with ${uuid}`
				);
				if (VCData.connected.get(uuid)) {
					console.log(
						`>>> Sending local ICE candidate (${e.candidate.address})`
					);
					VCData.socket.emit(
						"candidate",
						JSON.stringify(e.candidate),
						sessionKey,
						uuid
					);
				} else {
					/* If we are not 'connected' to the other peer, we are buffering the local ICE candidates. This most likely is happening on the "caller" side. The peer may not have created the RTCPeerConnection yet, so we are waiting for the 'answer' to arrive. This will signal that the peer is ready to receive signaling. */
					VCData.localICECandidates[uuid].push(e.candidate);
				}
			}
		},
		// When receiving a candidate over the socket, turn it back into a real RTCIceCandidate and add it to the peerConnection.
		onCandidate: (candidate: any, uuid: string) => {
			setCaptionsText("Found other user... connecting");
			var rtcCandidate: RTCIceCandidate = new RTCIceCandidate(
				JSON.parse(candidate)
			);
			console.log(
				`onCandidate <<< Received remote ICE candidate (${rtcCandidate.port} - ${rtcCandidate.relatedAddress})`
			);
			VCData.peerConnections.get(uuid).addIceCandidate(rtcCandidate);
		},
		// Create an offer that contains the media capabilities of the browser.
		createOffer: (uuid: string): void => {
			console.log(`createOffer to ${uuid} >>> Creating offer...`);
			VCData.peerConnections.get(uuid).createOffer(
				(offer: any) => {
					/* If the offer is created successfully, set it as the local description and send it over the socket connection to initiate the peerConnection on the other side. */
					VCData.peerConnections.get(uuid).setLocalDescription(offer);
					VCData.socket.emit("offer", JSON.stringify(offer), sessionKey, uuid);
				},
				(e: any) => {
					console.log("failed offer creation");
					console.log(e, true);
				}
			);
		},

		/* Create an answer with the media capabilities that the client and peer browsers share. This function is called with the offer from the originating browser, which needs to be parsed into an RTCSessionDescription and added as the remote description to the peerConnection object. Then the answer is created in the same manner as the offer and sent over the socket. */
		createAnswer: (offer: any, uuid: string): void => {
			console.log("createAnswer");
			var rtcOffer = new RTCSessionDescription(JSON.parse(offer));
			console.log(`>>> Creating answer to ${uuid}`);
			VCData.peerConnections.get(uuid).setRemoteDescription(rtcOffer);
			VCData.peerConnections.get(uuid).createAnswer(
				(answer: any) => {
					VCData.peerConnections.get(uuid).setLocalDescription(answer);
					VCData.socket.emit(
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
		onOffer: (offer: any, uuid: string): void => {
			console.log("onOffer <<< Received offer");
			VCData.socket.on(
				"token",
				VCData.establishConnection(uuid, (a: string) => {
					VCData.createAnswer(offer, a);
				})
			);
			VCData.socket.emit("token", sessionKey, uuid);
		},

		// When an answer is received, add it to the peerConnection as the remote description.
		onAnswer: (answer: any, uuid: string) => {
			console.log(`onAnswer <<< Received answer from ${uuid}`);
			var rtcAnswer = new RTCSessionDescription(JSON.parse(answer));
			// Set remote description of RTCSession
			VCData.peerConnections.get(uuid).setRemoteDescription(rtcAnswer);
			// The caller now knows that the callee is ready to accept new ICE candidates, so sending the buffer over
			VCData.localICECandidates[uuid].forEach((candidate: any) => {
				console.log(`>>> Sending local ICE candidate (${candidate.address})`);
				// Send ice candidate over websocket
				VCData.socket.emit(
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

		// Called when a stream is added to the peer connection: Create new <video> node and append remote video source to wrapper div
		onAddStream: (e: any, uuid: string) => {
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
			if (!VCData.remoteVideoWrapper) {
				VCData.remoteVideoWrapper = document.getElementById(
					"wrapper"
				) as HTMLMediaElement;
			}
			
				setCaptionsText(
					"Session connected successfully"
				);

			VCData.remoteVideoWrapper.appendChild(node);
			// Update remote video source
			VCData.remoteVideoWrapper.srcObject = e.stream;
			// if (VideoChatData.remoteVideoWrapper?.lastChild !== null) {
			// 	// @ts-ignore
			// 	VideoChatData.remoteVideoWrapper.lastChild.srcObject = e.stream;
			// }
			toast.dismiss();
			// Remove the loading gif from video
			// TODO: if (VCData.remoteVideoWrapper.lastChild) {
			// 	VCData.remoteVideoWrapper.style.background = "none";
			// }
			// Update connection status
			VCData.connected.set(uuid, true);
			setHideCaptions(true);
		}
	};

	/* POST MESSAGING - forward post messaging from one parent to the other */
	window.onmessage = (e: MessageEvent) => {
		try {
			if (JSON.parse(e.data).type === "arbitraryData") {
				sendToAllDataChannels(e.data, dataChannel);
			}
		} catch (e) {}
	};
	if (window.location.href !== "/browser-not-supported") {
		return (
			<>
				<div id="arbitrary-data" style={{ display: "none" }}></div>
				<HeaderComponent sessionKey={sessionKey} />
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
							<button
								className="hoverButton tooltip notSelectable"
								onClick={() => handleMute(audioEnabled, setAudio, VCData)}
							>
								<span>{audioEnabled ? "Mute Audio" : "Unmute Audio"}</span>

								<FontAwesomeIcon
									icon={audioEnabled ? faMicrophone : faMicrophoneSlash}
								/>
							</button>
						</div>

						<div className="buttonContainer">
							<button
								className="hoverButton tooltip notSelectable"
								onClick={() => handlePauseVideo(videoEnabled, setVideo, VCData)}
							>
								<span>{videoEnabled ? "Pause Video" : "Unpause Video"}</span>
								<FontAwesomeIcon icon={videoEnabled ? faPause : faPlay} />
							</button>
						</div>

						<div className="buttonContainer">
							<button
								className="hoverButton tooltip notSelectable"
								id="share-button"
								onClick={() =>
									handleSharing(
										VCData,
										sharing,
										setSharing,
										videoEnabled,
										setVideo
									)
								}
							>
								<span>{!sharing ? "Share Screen" : "Stop Sharing Screen"}</span>
								<FontAwesomeIcon icon={!sharing ? faDesktop : faVideo} />
							</button>
						</div>

						<div className="buttonContainer">
							<button
								className="hoverButton tooltip notSelectable"
								onClick={() => {
									setHideChat(!hideChat);
								}}
							>
								<span>{!hideChat ? "Hide Chat" : "Show Chat"}</span>
								<FontAwesomeIcon
									icon={!hideChat ? faComment : faCommentSlash}
								/>
							</button>
						</div>

						<div className="buttonContainer">
							<button
								className="hoverButton tooltip notSelectable"
								id="pip-button"
								onClick={() => {
									setPicInPic(!picInPic);
								}}
							>
								<span>{!picInPic ? "Picture in Picture" : "Normal View"}</span>

								<FontAwesomeIcon
									icon={!picInPic ? faExternalLinkAlt : faExternalLinkSquareAlt}
								/>
							</button>
						</div>

						<div className="buttonContainer">
							<button
								className="hoverButton tooltip notSelectable"
								onClick={() => {
									handleRequestToggleCaptions(
										receivingCaptions,
										setReceivingCaptions,
										VCData,
										setCaptionsText,
										dataChannel
									);
								}}
							>
								<FontAwesomeIcon
									icon={hideCaptions ? faClosedCaptioning : faAudioDescription}
								/>
								<span>
									{hideCaptions ? "Closed Captions" : "Hide Closed Captions"}
								</span>
							</button>
						</div>

						<div className="buttonContainer">
							<button
								className="hoverButton tooltip notSelectable"
								onClick={() => {
									window.location.href = "/newcall";
								}}
							>
								<FontAwesomeIcon icon={faPhoneSlash} />
								<span>End Call</span>
							</button>
							<audio id="join-sound" src={joinSound}></audio>
							<audio id="leave-sound" src={leaveSound}></audio>
						</div>
					</div>
				</div>

				<ChatComponent hideChat={hideChat} />
				<ToastContainer
					position="top-center"
					autoClose={50000}
					hideProgressBar={false}
					newestOnTop={false}
					closeOnClick
					rtl={false}
					pauseOnFocusLoss
					draggable
					pauseOnHover
					limit={2}
				/>
			</>
		);
	} else {
		return <IncompatibleComponent />;
	}
};

export default VideoChat;
