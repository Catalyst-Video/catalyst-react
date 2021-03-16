import React, { useEffect, useState, useMemo } from "react";
// components
import {
	HeaderComponent,
	ChatComponent,
	IncompatibleComponent
} from "../components/index";
// utils
import {
	getBrowserName,
	sendToAllDataChannels,
	addMessageToScreen,
	setThemeColor
} from "../utils/general_utils";
import {
	handleMute,
	handlePauseVideo,
	handleSharing
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
import { ToastContainer } from "react-toastify";
import Draggable from "react-draggable";
import DetectRTC from "detectrtc";
import VCDataStream from "./stream_class";

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
	const [hideCaptions, setHideCaptions] = useState<boolean>(
		defaultSettings?.hideCaptions ? defaultSettings.hideCaptions : true
	);
	const [captionsText, setCaptionsText] = useState(
		"Room ready. Waiting for others to join..."
	);
	const [localVideoText, setLocalVideoText] = useState("No webcam input");
	const [VCData, setVCData] = useState<VideoChatData>();

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
	}, []);

	useEffect(() => {
		setThemeColor(themeColor ? themeColor : "blue");
	}, [themeColor]);

	useEffect(() => {
		const VCD = new VCDataStream(
			sessionKey,
			setCaptionsText,
			setLocalVideoText,
			socketServerAddress,
			customSnackbarMsg
		);
		setVCData(VCD);
		VCD?.requestMediaStream();
	}, [customSnackbarMsg, sessionKey, socketServerAddress]);

	// const VCData = useMemo(() => {
	// 	return new VCDataStream(
	// 		sessionKey,
	// 		setCaptionsText,
	// 		setLocalVideoText,
	// 		socketServerAddress,
	// 		customSnackbarMsg
	// 	);
	// }, [
	// 	sessionKey,
	// 	socketServerAddress,
	// 	setCaptionsText,
	// 	setLocalVideoText,
	// 	customSnackbarMsg
	// ]);

	/* ON LOAD: detect in-app browsers & redirect, set tab title, get webcam */
	useEffect(() => {
		/* POST MESSAGING - forward post messaging from one parent to the other */
		window.onmessage = (e: MessageEvent) => {
			try {
				if (JSON.parse(e.data).type === "arbitraryData") {
					sendToAllDataChannels(e.data, VCData?.dataChannel);
				}
			} catch (e) {}
		};

		// VCData?.requestMediaStream();

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
					sendToAllDataChannels("mes:" + msg, VCData?.dataChannel);
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
								// onClick={() => handlePauseVideo(videoEnabled, setVideo, VCData)}
							>
								<span>{videoEnabled ? "Pause Video" : "Unpause Video"}</span>
								<FontAwesomeIcon icon={videoEnabled ? faPause : faPlay} />
							</button>
						</div>

						<div className="buttonContainer">
							<button
								className="hoverButton tooltip notSelectable"
								id="share-button"
								onClick={
									() => {}
									// handleSharing(
									// 	VCData,
									// 	sharing,
									// 	setSharing,
									// 	videoEnabled,
									// 	setVideo
									// )
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
									// handleRequestToggleCaptions(
									// 	receivingCaptions,
									// 	setReceivingCaptions,
									// 	VCData,
									// 	setCaptionsText,
									// 	dataChannel
									// );
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
