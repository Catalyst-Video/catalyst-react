import { toast } from "react-toastify";
import { VideoChatData } from "../../typings/interfaces";
import { isConnected, sendToAllDataChannels } from "./general_utils";

export function handleMute(
	audioEnabled: boolean,
	setAudio: Function,
	VCData: VideoChatData
): void {
	var audioTrack: any;
	setAudio(!audioEnabled);
	VCData.peerConnections.forEach((value: any, key: any, map: any) => {
		value.getSenders().find((s: any) => {
			if (s.track.kind === "audio") {
				audioTrack = s.track;
			}
			return audioTrack;
		});
		if (audioTrack) {
			audioTrack.enabled = audioEnabled;
		}
	});
}

export function handlePauseVideo(
	videoEnabled: boolean,
	setVideo: Function,
	VCData: VideoChatData
) {
	var videoTrack: any;
	setVideo(!videoEnabled);
	VCData.peerConnections.forEach((value: any, key: any, map: any) => {
		console.log("pausing video for ", key);
		value.getSenders().find((s: any) => {
			if (s.track.kind === "video") {
				console.log("found video track");
				videoTrack = s.track;
			}
			return videoTrack;
		});
		videoTrack.enabled = videoEnabled;
	});
}

// Swap current video track with passed in stream
export function handleSwitchStreamHelper(
	stream: any,
	videoEnabled: boolean,
	setVideo: Function,
	VCData: VideoChatData
) {
	// Get current video track
	let videoTrack = stream.getVideoTracks()[0];
	let audioTrack = stream.getAudioTracks()[0];
	// Add listen for if the current track swaps, swap back
	videoTrack.onended = () => {
		// TODO: swap();
	};
	// Swap video for every peer connection
	VCData.connected.forEach((value: any, key: any, map: any) => {
		// check if connected before swapping video channel
		if (VCData.connected.get(key)) {
			const sender = VCData.peerConnections
				.get(key)
				.getSenders()
				.find((s: any) => {
					return s.track.kind === videoTrack.kind;
				});
			sender.replaceTrack(videoTrack);
			// Replace audio track if sharing screen with audio
			if (stream.getAudioTracks()[0]) {
				console.log("Audio track is", audioTrack);
				const sender2 = VCData.peerConnections
					.get(key)
					.getSenders()
					.find((s: any) => {
						if (s.track.kind === audioTrack.kind) {
							console.log("Found matching track: ", s.track);
						}
						return s.track.kind === audioTrack.kind;
					});
				// add track instead of replacing
				sender2.replaceTrack(audioTrack);
			}
		}
	});
	// Update local video stream
	VCData.localStream = stream;
	// Update local video object
	VCData.localVideo.srcObject = stream;
	// Unpause video on swap
	if (!videoEnabled) {
		handlePauseVideo(videoEnabled, setVideo, VCData);
	}
}

export function handleRequestToggleCaptions(
	receivingCaptions: boolean,
	setReceivingCaptions: Function,
	VCData: VideoChatData,
	setCaptionsText: Function,
	dataChannel: Map<any, any>
) {
	// Handle requesting captions before connected
	if (!isConnected(VCData)) {
		alert("You must be connected to a peer to use Live Caption");
		return;
	}
	if (receivingCaptions) {
		setCaptionsText("Start Live Caption");
		setReceivingCaptions(false);
	} else {
		toast(
			() =>
				`<div className="text-center justify-between">
					Experimental: The user speaking must be using a Chromium browser.
				</div>`,
			{
				toastId: "captions_start"
			}
		);

		setCaptionsText("End Live Caption");
		setReceivingCaptions(true);
	}
	// Send request to get captions over data channel
	sendToAllDataChannels("tog:", dataChannel);
}

export function handleToggleCaptions(
	sendingCaptions: boolean,
	setSendingCaptions: Function,
	VCData: VideoChatData
) {
	if (sendingCaptions) {
		setSendingCaptions(false);
		VCData.recognition.stop();
	} else {
		setSendingCaptions(true);
		sendingCaptions = true;
	}
}

export function handleStartSpeech(
	VCData: VideoChatData,
	sendingCaptions: boolean,
	setSendingCaptions: Function,
	dataChannel: Map<any, any>
) {
	try {
		var SpeechRecognition = window.SpeechRecognition;
		VCData.recognition = new SpeechRecognition();
	} catch (e) {
		setSendingCaptions(false);
		console.log(e);
		console.log("error importing speech library");
		// Alert other user that they cannon use live caption
		sendToAllDataChannels("cap:notusingchrome", dataChannel);
		return;
	}
	VCData.recognition.continuous = true;
	// Show results that aren't final
	VCData.recognition.interimResults = true;
	// var finalTranscript: any;
	VCData.recognition.onresult = (e: any) => {
		let interimTranscript = "";
		for (let i = e.resultIndex, len = e.results.length; i < len; i++) {
			var transcript = e.results[i][0].transcript;
			console.log(transcript);
			if (e.results[i].isFinal) {
				// finalTranscript += transcript;
			} else {
				interimTranscript += transcript;
				var charsToKeep = interimTranscript.length % 100;
				// Send captions over data chanel, subtracting as many complete 100 char slices from start
				sendToAllDataChannels(
					"cap:" +
						interimTranscript.substring(interimTranscript.length - charsToKeep),
					dataChannel
				);
			}
		}
	};
	VCData.recognition.onend = function () {
		console.log("on speech recording end");
		// Restart speech recognition if user has not stopped it
		if (sendingCaptions) {
			handleStartSpeech(
				VCData,
				sendingCaptions,
				setSendingCaptions,
				dataChannel
			);
		} else {
			VCData.recognition.stop();
		}
	};
	VCData.recognition.start();
}

export function handleReceiveCaptions(
	captions: any,
	receivingCaptions: boolean,
	setReceivingCaptions: Function,
	setHideCaptions: Function,
	setCaptionsText: Function
) {
	if (receivingCaptions) {
		setCaptionsText("");
		setHideCaptions(false);
	} else {
		setCaptionsText("");
		setHideCaptions(true);
	}
	// Other user is not using chrome
	if (captions === "notusingchrome") {
		alert(
			"Other caller must be using chrome for this feature to work. Live Caption turned off."
		);
		setCaptionsText("");
		setHideCaptions(true);
		setCaptionsText("Start Live Caption");
		// captionButtontext.text("Start Live Caption");
		return;
	}
	setCaptionsText(captions);
	// rePositionCaptions();
}

/*
export function togglePictureInPicture(VideoChat: VCDataInterface) {
	if (
		"pictureInPictureEnabled" in document 
		// || (VideoChat.remoteVideoWrapper.lastChild as HTMLVideoElement).webkitSetPresentationMode
	) {
		var video = VideoChat.remoteVideoWrapper.lastChild as HTMLMediaElement;
		if (document && document.pictureInPictureElement && video !== null) {
			document.exitPictureInPicture().catch((e: string) => {
				console.log("Error exiting pip." + e);
			});
		} else if (
			video.webkitPresentationMode === "inline"
		) {
			video?.webkitSetPresentationMode(
				"picture-in-picture"
			);
		} else if (
			video.webkitPresentationMode ===
			"picture-in-picture"
		) {
			video.webkitSetPresentationMode(
				"inline"
			);
		} else {
			video
				.requestPictureInPicture()
				.catch(error => {
					alert(
						"You must be connected to another person to enter picture in picture."
					);
				});
		}
	} else {
		alert(
			"Picture in picture is not supported in your browser. Consider using Chrome or Safari."
		);
	}
}
 */

export function handleSharing(
	VCData: VideoChatData,
	sharing: boolean,
	setSharing: Function,
	videoEnabled: boolean,
	setVideo: Function
) {
	// Handle swap video before video call is connected by checking that there's at least one peer connected
	if (!isConnected(VCData)) {
		alert("You must join a call before you can share your screen.");
		return;
	}
	if (!sharing) {
		toast(
			() =>
				`<div className="text-center justify-between">
				Please allow screen share. Click the middle of the picture above and then press share.
				</div>`,
			{
				toastId: "screen_share"
			}
		);
		// Request screen share, note: we can request to capture audio for screen sharing video content.
		navigator.mediaDevices
			.getDisplayMedia({
				video: true,
				audio: true
			})
			.then((stream: any) => {
				setSharing(true);
				if (stream.getAudioTracks()[0]) {
					stream.addTrack(stream.getAudioTracks()[0]);
				}
				console.log(stream);
				handleSwitchStreamHelper(stream, videoEnabled, setVideo, VCData);
			})
			.catch((e: any) => {
				console.log("Error sharing screen" + e);
			});
	} else {
		// Stop the screen share video track. (We don't want to stop the audio track obviously.)
		(VCData.localVideo?.srcObject as MediaStream)
			?.getVideoTracks()
			.forEach((track: any) => track.stop());
		// Get webcam input
		navigator.mediaDevices
			.getUserMedia({
				video: true,
				audio: true
			})
			.then(stream => {
				setSharing(false);
				handleSwitchStreamHelper(stream, videoEnabled, setVideo, VCData);
			});
	}
}
