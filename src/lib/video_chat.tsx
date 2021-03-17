import { useEffect, useState } from "react";
// components
import {
	HeaderComponent,
	ChatComponent,
	IncompatibleComponent
} from "../components/index";
// utils
import { getBrowserName, setThemeColor } from "../utils/general_utils";
import {
	handleMute,
	handlePauseVideo,
	handleSharing
} from "../utils/stream_utils";
// typings
import {
	DefaultSettings,
	DisabledSettings,
	VideoChatData
} from "../../typings/interfaces";
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
	catalystUUID,
	socketServerAddress,
	defaultSettings,
	disabledSettings,
	customSnackbarMsg,
	themeColor,
	styles
}: {
	sessionKey: string;
	catalystUUID: string;
	socketServerAddress?: string;
	defaultSettings?: DefaultSettings;
	disabledSettings?: DisabledSettings;
	customSnackbarMsg?: HTMLElement | Element | string;
	themeColor?: string;
	styles?: Object;
}) => {
	const [browserSupported, setBrowserSupported] = useState(true);
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
				setBrowserSupported(false);
			}
		}
		if (DetectRTC.isMobileDevice) {
			if (DetectRTC.osName === "iOS" && !DetectRTC.browser.isSafari) {
				setBrowserSupported(false);
			}
		}
		const isWebRTCSupported =
			navigator.getUserMedia || window.RTCPeerConnection;
		const browserName: string = getBrowserName();
		if (!isWebRTCSupported || browserName === "MSIE") {
			setBrowserSupported(false);
		}
		navigator.mediaDevices.ondevicechange = () => window.location.reload();
	}, []);

	useEffect(() => {
		setThemeColor(themeColor ? themeColor : "blue");
	}, [themeColor]);

	useEffect(() => {
		const VCD = new VCDataStream(
			sessionKey,
			catalystUUID,
			setCaptionsText,
			setLocalVideoText,
			socketServerAddress,
			customSnackbarMsg
		);
		setVCData(VCD);
		VCD?.requestMediaStream();
	}, [sessionKey, catalystUUID, socketServerAddress, customSnackbarMsg]);

	if (browserSupported) {
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
						<div
							className={`buttonContainer ${
								disabledSettings?.mute ? "none" : ""
							}`}
						>
							<button
								className={`${
									audioEnabled ? "" : "btn-on"
								} hoverButton tooltip notSelectable`}
								onClick={() => {
									if (VCData) handleMute(audioEnabled, setAudio, VCData);
								}}
							>
								<span>{audioEnabled ? "Mute Audio" : "Unmute Audio"}</span>

								<FontAwesomeIcon
									icon={audioEnabled ? faMicrophone : faMicrophoneSlash}
								/>
							</button>
						</div>

						<div
							className={`buttonContainer ${
								disabledSettings?.pausevideo ? "none" : ""
							}`}
						>
							<button
								className={`${
									videoEnabled ? "" : "btn-on"
								} hoverButton tooltip notSelectable`}
								onClick={() => {
									if (VCData)
										handlePauseVideo(
											videoEnabled,
											setVideo,
											VCData,
											setLocalVideoText
										);
								}}
							>
								<span>{videoEnabled ? "Pause Video" : "Unpause Video"}</span>
								<FontAwesomeIcon icon={videoEnabled ? faPause : faPlay} />
							</button>
						</div>

						<div
							className={`buttonContainer ${
								disabledSettings?.screenshare ? "none" : ""
							}`}
						>
							<button
								className="hoverButton tooltip notSelectable"
								id="share-button"
								onClick={
									() => {
										alert("Enable Screen Share");
									}
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

						<div
							className={`buttonContainer ${
								disabledSettings?.chat ? "none" : ""
							}`}
						>
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

						<div
							className={`buttonContainer ${
								disabledSettings?.picinpic ? "none" : ""
							}`}
						>
							<button
								className="hoverButton tooltip notSelectable"
								id="pip-button"
								onClick={() => {
									alert("Enable Pic in Pic");
									setPicInPic(!picInPic);
								}}
							>
								<span>{!picInPic ? "Picture in Picture" : "Normal View"}</span>

								<FontAwesomeIcon
									icon={!picInPic ? faExternalLinkAlt : faExternalLinkSquareAlt}
								/>
							</button>
						</div>

						<div
							className={`buttonContainer ${
								disabledSettings?.captions ? "none" : ""
							}`}
						>
							<button
								className="hoverButton tooltip notSelectable"
								onClick={() => {
									alert("Enable Captions");
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

						<div
							className={`buttonContainer ${
								disabledSettings?.endcall ? "none" : ""
							}`}
						>
							<button
								className="hoverButton tooltip notSelectable"
								onClick={() => {
									alert("End Call");
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
