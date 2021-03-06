import React, { useState } from "react";
import ChatComponent from "../components/chat_comp";
import DetectRTC from "detectrtc";
import { getBrowserName, displayWaitingCaption } from "../utils/main_utils";
import { fadeIn, fadeOut } from "../utils/fade";
import { VideoChatData } from "../utils/chat_stream";
import { useSnackbar } from "react-simple-snackbar";
import ReactTooltip from "react-tooltip";
// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faClosedCaptioning,
	faComment,
	faDesktop,
	faExternalLinkAlt,
	faMicrophone,
	faPause,
	faPhoneSlash
} from "@fortawesome/free-solid-svg-icons";
// sounds
import joinSound from "../assets/sound/join.mp3";
import leaveSound from "../assets/sound/leave.mp3";

const captionText = document.querySelector("remote-video-text");
const buttonLabels = document.querySelectorAll(
	".HoverState"
) as NodeListOf<HTMLElement>;

const startUp = () => {
	//  Detect in-app browsers and redirect
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
	// Redirect all iOS browsers that are not Safari
	if (DetectRTC.isMobileDevice) {
		if (DetectRTC.osName === "iOS" && !DetectRTC.browser.isSafari) {
			window.location.href = "/browser-not-supported";
		}
	}

	const isWebRTCSupported = navigator.getUserMedia || window.RTCPeerConnection;
	const browserName: string = getBrowserName();
	if (!isWebRTCSupported || browserName === "MSIE") {
		window.location.href = "/browser-not-supported";
	}

	// Set tab title
	document.title =
		"Catalyst - " +
		window.location.href.substring(window.location.href.lastIndexOf("/") + 1);

	// get webcam on load
	VideoChatData.requestMediaStream();

	// Captions empty/hidden by default
	if (captionText !== null) {
		captionText.textContent = "";
		fadeOut(captionText, 400);
	}

	// Hide button labels on load
	fadeOut(buttonLabels, 400);
	// Show/hide button labels on hover
	buttonLabels.forEach((button: HTMLElement) => {
		button.addEventListener("mouseover", e => {
			console.log("hover");
			fadeIn(button, 400);
		});
		button.addEventListener("mouseout", e => {
			fadeOut(button, 400);
		});
	});

	displayWaitingCaption();
	// On change media devices refresh page and switch to system default
	navigator.mediaDevices.ondevicechange = () => window.location.reload();
};

startUp();

const VideoChat = ({
	sessionKey,
	chatOptions,
	defaultSettings,
	hideLogo,
	customModalMessage
}: {
	sessionKey: string;
	chatOptions?: any;
	defaultSettings?: {
		showChat?: boolean;
		muted?: boolean;
		showCaptions?: boolean;
	};
	hideLogo?: boolean;
	customModalMessage?: string;
}) => {
	/* STATE */
	// const mode = useState("camera");
	// const isFullscreen = useState(false);
	// const sendingCaptions = useState(false);
	// const receivingCaptions = useState(false);

	const [muted, setMuted] = useState(
		defaultSettings?.muted ? defaultSettings.muted : false
	);
	const [vidPaused, setVidPaused] = useState(false);
	const [sharing, setSharing] = useState(false);
	const [showChat, setShowChat] = useState(
		defaultSettings?.showChat ? defaultSettings.showChat : true
	);
	const [captions, setCaptions] = useState(
		defaultSettings?.showCaptions ? defaultSettings.showCaptions : false
	);

	const [openSnackbar, closeSnackbar] = useSnackbar({ position: "top-center" });

	// Map to keep track of dataChannel connecting with each peer
	var dataChannel = new Map();

	/* POST MESSAGING */
	window.onmessage = function (e: MessageEvent) {
		// forward post messaging from one parent to the other
		if (JSON.parse(e.data).type === "arbitraryData") {
			sendToAllDataChannels(e.data);
		}
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
					<img
						src="/images/wordmark_logo.png"
						alt="Catalyst Logo"
						height="48"
					/>
				</button>
			</div>

			<div id="call-section">
				<div id="remote-video-text" draggable="true"></div>

				<div id="wrapper"></div>
				<div id="moveable" draggable="true">
					<p id="local-video-text">No webcam input</p>
					<video id="local-video" autoPlay muted playsInline></video>
				</div>

				<div className="multi-button">
					<div className="buttonContainer">
						<ReactTooltip
							id="mute-tooltip"
							place="top"
							type="dark"
							effect="float"
						>
							<div className="HoverState" id="mic-text">
								Mute Audio
							</div>
						</ReactTooltip>
						<button
							data-tip="mute-tooltip"
							data-for="mute-tooltip"
							className="hoverButton"
							onClick={
								// TODO: muteMicrophone
								() => {}
							}
						>
							<FontAwesomeIcon icon={faMicrophone} />
						</button>
					</div>

					{/* <div className="buttonContainer">
						<button
							className="hoverButton"
							onClick={
								// TODO: openFullScreen
								() => {}
							}
						>
							<i className="fas fa-compress fa-xs"></i>
						</button>
						<div className="HoverState">The Fanatic Mode</div>
					</div> */}

					<div className="buttonContainer">
						<ReactTooltip
							id="pause-tooltip"
							place="top"
							type="dark"
							effect="float"
						>
							<div className="HoverState" id="video-text">
								Pause Video
							</div>
						</ReactTooltip>
						<button
							data-tip="pause-tooltip"
							data-for="pause-tooltip"
							className="hoverButton"
							onClick={
								// TODO: pauseVideo
								() => {}
							}
						>
							<FontAwesomeIcon icon={faPause} />
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
							onClick={
								// TODO: swap
								() => {}
							}
						>
							<FontAwesomeIcon icon={faDesktop} />
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
								Hide Chat
							</div>
						</ReactTooltip>
						<button
							data-tip="chat-tooltip"
							data-for="chat-tooltip"
							className="hoverButton"
							onClick={
								// TODO: toggleChat
								() => {}
							}
						>
							<FontAwesomeIcon icon={faComment} />
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
								Picture in Picture
							</div>
						</ReactTooltip>
						<button
							data-tip="pic-tooltip"
							data-for="pic-tooltip"
							className="hoverButton"
							id="pip-button"
							onClick={
								// TODO: togglePictureInPicture
								() => {}
							}
						>
							<FontAwesomeIcon icon={faExternalLinkAlt} />
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
								Closed Captions
							</div>
						</ReactTooltip>
						<button
							data-tip="caption-tooltip"
							data-for="caption-tooltip"
							className="hoverButton"
							onClick={
								// TODO: requestToggleCaptions
								() => {}
							}
						>
							<FontAwesomeIcon icon={faClosedCaptioning} />
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

			<ChatComponent defaultShowChat={chatVisible} />
		</>
	);
};

export default VideoChat;
