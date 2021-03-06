import React, { useState } from "react";
import ChatComponent from "../components/chat_comp";
import DetectRTC from "detectrtc";
import { getBrowserName } from "../utils/main_utils";
// sounds
import joinSound from "../assets/sound/join.mp3";
import leaveSound from "../assets/sound/leave.mp3";
import { fadeIn, fadeOut } from "../utils/fade";
import Snackbar from "../components/toast-snackbar";
// import VideoChatData from "../utils/chat_stream";

const captionText = document.querySelector("remote-video-text");
const buttonLabels = document.querySelectorAll(".HoverState");

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
	// VideoChatData.requestMediaStream();

	// Captions empty/hidden by default
	if (captionText !== null) {
		captionText.textContent = "";
		fadeOut(captionText, 400);
	}

	// Hide button labels on load
	fadeOut(buttonLabels, 400);
	// Show/hide button labels on hover
	buttonLabels.forEach((button: Element) => {
		button.addEventListener("mouseover", e => {
			fadeIn(button, 400);
		});
		button.addEventListener("mouseout", e => {
			fadeOut(button, 400);
		});
	});

	// Fade out / show UI on mouse move
	/* 	var timedelay = 1;
	function delayCheck() {
		if (timedelay === 5) {
			// $(".multi-button").fadeOut();
			$("#header").fadeOut();
			$(".multi-button").fadeOut();
			timedelay = 1;
		}
		timedelay = timedelay + 1;
	}
	$(document).mousemove(function () {
		$(".multi-button").fadeIn();
		$("#header").fadeIn();
		timedelay = 1;
		clearInterval(_delay);
		_delay = setInterval(delayCheck, 500);
	});
	_delay = setInterval(delayCheck, 500);
 */
	// Show accept webcam snackbar
	Snackbar.show({
		text: "Please press allow to enable webcam and audio access",
		actionText: "Directions",
		width: "455px",
		actionTextColor: "#000000",
		pos: "top-right",
		duration: 50000,
		onActionClick: function (element) {
			window.open(
				"https://help.clipchamp.com/en/articles/1505527-how-do-i-enable-my-webcam-for-recording",
				"_blank"
			);
		}
	});

	displayWaitingCaption();

	// On change media devices refresh page and switch to system default
	navigator.mediaDevices.ondevicechange = () => window.location.reload();
};

startUp();

const VideoChat = ({
	sessionKey,
	chatOptions,
	showChat,
	hideLogo,
	customModalMessage
}: {
	sessionKey: string;
	chatOptions?: any;
	showChat?: boolean;
	hideLogo?: boolean;
	customModalMessage?: string;
}) => {
	/* STATE */
	const mode = useState("camera");
	const isFullscreen = useState(false);
	const sendingCaptions = useState(false);
	const receivingCaptions = useState(false);

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
				<a target="_blank" href="/">
					<img
						src="/images/wordmark_logo.png"
						alt="Catalyst Logo"
						height="48"
					/>
				</a>
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
						<button className="hoverButton" onClick={muteMicrophone}>
							<i id="mic-icon" className="fas fa-microphone fa-xs"></i>
						</button>
						<div className="HoverState" id="mic-text">
							Mute
						</div>
					</div>

					<div className="buttonContainer">
						<button className="hoverButton" onClick={openFullscreen}>
							<i className="fas fa-compress fa-xs"></i>
						</button>
						<div className="HoverState">The Fanatic Mode</div>
					</div>

					<div className="buttonContainer">
						<button className="hoverButton" onClick={pauseVideo}>
							<i className="fas fa-video fa-xs" id="video-icon"></i>
						</button>
						<div className="HoverState" id="video-text">
							Pause Video
						</div>
					</div>

					<div className="buttonContainer">
						<button className="hoverButton" id="share-button" onClick={swap}>
							<i id="swap-icon" className="fas fa-desktop fa-xs"></i>
						</button>
						<div className="HoverState" id="swap-text">
							Share Screen
						</div>
					</div>

					<div className="buttonContainer">
						<button className="hoverButton" onClick={toggleChat}>
							<i id="chat-icon" className="fas fa-comment-slash fa-xs"></i>
						</button>
						<div className="HoverState" id="chat-text">
							Hide Chat
						</div>
					</div>

					<div className="buttonContainer">
						<button
							className="hoverButton"
							id="pip-button"
							onClick={togglePictureInPicture}
						>
							<i className="fas fa-external-link-alt fa-xs"></i>
						</button>
						<div className="HoverState" id="pip-text">
							Toggle Picture in Picture
						</div>
					</div>

					<div className="buttonContainer">
						<button className="hoverButton" onClick={requestToggleCaptions}>
							<i className="fas fa-closed-captioning fa-xs"></i>
						</button>
						<div className="HoverState" id="caption-button-text">
							Start Live Caption
						</div>
					</div>

					<div className="buttonContainer">
						<button
							className="hoverButton"
							onClick={() => {
								window.location.href = "/newcall";
							}}
						>
							<i className="fas fa-phone-slash fa-xs"></i>
						</button>
						<div className="HoverState">End Call</div>
						<audio id="join-sound" src={joinSound}></audio>
						<audio id="leave-sound" src={leaveSound}></audio>
					</div>
				</div>
			</div>

			<ChatComponent defaultShowChat={showChat ? showChat : true} />
		</>
	);
};

export default VideoChat;
