export {};

// export function muteMicrophone(): void {
// 	var audioTrack: any;
// 	VideoChat.audioEnabled = !VideoChat.audioEnabled;
// 	VideoChat.peerConnections.forEach((value: any, key: any, map: any) => {
// 		value.getSenders().find((s: any) => {
// 			if (s.track.kind === "audio") {
// 				audioTrack = s.track;
// 			}
// 		});
// 		if (audioTrack) {
// 			audioTrack.enabled = VideoChat.audioEnabled;
// 		}
// 	});
// }

// // Communicate pause to all the peers' video tracks
// export function pauseVideo() {
// 	var videoTrack: any;
// 	VideoChat.videoEnabled = !VideoChat.videoEnabled;
// 	VideoChat.peerConnections.forEach((value: any, key: any, map: any) => {
// 		console.log("pausing video for ", key);
// 		value.getSenders().find((s: any) => {
// 			if (s.track.kind === "video") {
// 				console.log("found video track");
// 				videoTrack = s.track;
// 			}
// 		});
// 		videoTrack.enabled = VideoChat.videoEnabled;
// 	});
// }

/* 
// Swap current video track with passed in stream
function switchStreamHelper(stream: any) {
	// Get current video track
	let videoTrack = stream.getVideoTracks()[0];
	let audioTrack = stream.getAudioTracks()[0];
	// Add listen for if the current track swaps, swap back
	videoTrack.onended =  () => {
		swap();
	};
	// Swap video for every peer connection
	VideoChat.connected.forEach( (value, key, map) => {
		// Just to be safe, check if connected before swapping video channel
		if (VideoChat.connected.get(key)) {
			const sender = VideoChat.peerConnections
				.get(key)
				.getSenders()
				.find( (s: any) => {
					return s.track.kind === videoTrack.kind;
				});
			sender.replaceTrack(videoTrack);

			// TEST: Replace audio track if sharing screen with audio
			if (stream.getAudioTracks()[0]) {
				console.log("Audio track is", audioTrack);
				// START TEST ADDING STREAM (NOT WORKING)

				// // TEST: Add the local audio stream to the peerConnection.
				// console.log("Attempting to add track.");
				// console.log("Getting Socket ID");
				// console.log("SOCKET ID", VideoChat.socket.id);
				// // VideoChat.peerConnections.forEach((peerConnection) => {
				// //   peerConnection.addTrack(audioTrack);
				// //   console.log("Adding track to: ", peerConnection.key);
				// // });

				// VideoChat.peerConnections.get(key).addTrack(audioTrack);

				// console.log(
				//   "Adding audio track to this peer connection: ",
				//   VideoChat.peerConnections.get(key)
				// );

				// console.log("Adding this audio track: ", audioTrack);

				// END TEST ADDING STREAM (NOT WORKING)

				const sender2 = VideoChat.peerConnections
					.get(key)
					.getSenders()
					.find(function (s) {
						if (s.track.kind === audioTrack.kind) {
							console.log("Found matching track: ", s.track);
						}
						return s.track.kind === audioTrack.kind;
					});
				// Try with Add Track to add track instead of replacing
				sender2.replaceTrack(audioTrack);
			}
		}
	});
	// Update local video stream
	VideoChat.localStream = stream;
	// Update local video object
	VideoChat.localVideo.srcObject = stream;
	// Unpause video on swap
	if (!VideoChat.videoEnabled) {
		pauseVideo();
	}
}
// End swap camera / screen share

// Live caption
// Request captions from other user, toggles state
function requestToggleCaptions() {
	// Handle requesting captions before connected
	if (!isConnected()) {
		alert("You must be connected to a peer to use Live Caption");
		return;
	}
	if (receivingCaptions) {
		captionText.text("").fadeOut();
		captionButtontext.text("Start Live Caption");
		receivingCaptions = false;
	} else {
		Snackbar.show({
			text: "Experimental: The user speaking must be using a Chromium browser.",
			width: "400px",
			pos: "bottom-center",
			actionTextColor: "#000000",
			duration: 10000
		});
		captionButtontext.text("End Live Caption");
		receivingCaptions = true;
	}
	// Send request to get captions over data channel
	sendToAllDataChannels("tog:");
}

// Start/stop sending captions to other user
function toggleSendCaptions() {
	if (sendingCaptions) {
		sendingCaptions = false;
		VideoChat.recognition.stop();
	} else {
		startSpeech();
		sendingCaptions = true;
	}
}

// Start speech recognition
function startSpeech() {
	try {
		var SpeechRecognition =
			window.SpeechRecognition || window.webkitSpeechRecognition;
		VideoChat.recognition = new SpeechRecognition();
		// VideoChat.recognition.lang = "en";
	} catch (e) {
		sendingCaptions = false;
		logIt(e);
		logIt("error importing speech library");
		// Alert other user that they cannon use live caption
		sendToAllDataChannels("cap:notusingchrome");
		return;
	}
	// recognition.maxAlternatives = 3;
	VideoChat.recognition.continuous = true;
	// Show results that aren't final
	VideoChat.recognition.interimResults = true;
	var finalTranscript;
	VideoChat.recognition.onresult = event => {
		let interimTranscript = "";
		for (let i = event.resultIndex, len = event.results.length; i < len; i++) {
			var transcript = event.results[i][0].transcript;
			console.log(transcript);
			if (event.results[i].isFinal) {
				finalTranscript += transcript;
			} else {
				interimTranscript += transcript;
				var charsToKeep = interimTranscript.length % 100;
				// Send captions over data chanel,
				// subtracting as many complete 100 char slices from start
				sendToAllDataChannels(
					"cap:" +
						interimTranscript.substring(interimTranscript.length - charsToKeep)
				);
			}
		}
	};
	VideoChat.recognition.onend = function () {
		logIt("on speech recording end");
		// Restart speech recognition if user has not stopped it
		if (sendingCaptions) {
			startSpeech();
		} else {
			VideoChat.recognition.stop();
		}
	};
	VideoChat.recognition.start();
}

// receive captions over datachannel
function receiveCaptions(captions) {
	if (receivingCaptions) {
		captionText.text("").fadeIn();
	} else {
		captionText.text("").fadeOut();
	}
	// Other user is not using chrome
	if (captions === "notusingchrome") {
		alert(
			"Other caller must be using chrome for this feature to work. Live Caption turned off."
		);
		receivingCaptions = false;
		captionText.text("").fadeOut();
		captionButtontext.text("Start Live Caption");
		return;
	}
	captionText.text(captions);
	rePositionCaptions();
}
// End Live caption

// Text Chat
// Add text message to chat screen on page
function addMessageToScreen(msg, border, isOwnMessage) {
	if (isOwnMessage) {
		$(".chat-messages").append(
			`<div class="message-item customer cssanimation fadeInBottom"><div class="message-bloc" style="--bloc-color: ${border}"><div class="message">` +
				msg +
				"</div></div></div>"
		);
	} else {
		$(".chat-messages").append(
			`<div class="message-item moderator cssanimation fadeInBottom"><div class="message-bloc" style="--bloc-color: ${border}"><div class="message">` +
				msg +
				"</div></div></div>"
		);
	}
}

// Listen for enter press on chat input
chatInput.addEventListener("keypress", function (event) {
	if (event.keyCode === 13) {
		// Prevent page refresh on enter
		event.preventDefault();
		var msg = chatInput.value;
		// Prevent cross site scripting
		msg = msg.replace(/</g, "&lt;").replace(/>/g, "&gt;");
		// Make links clickable
		msg = msg.autoLink();
		// Send message over data channel
		sendToAllDataChannels("mes:" + msg);
		// Add message to screen
		addMessageToScreen(msg, VideoChat.borderColor, true);
		// Auto scroll chat down
		chatZone.scrollTop(chatZone[0].scrollHeight);
		// Clear chat input
		chatInput.value = "";
	}
});



// Picture in picture
function togglePictureInPicture() {
	if (
		"pictureInPictureEnabled" in document ||
		VideoChat.remoteVideoWrapper.lastChild.webkitSetPresentationMode
	) {
		if (document.pictureInPictureElement) {
			document.exitPictureInPicture().catch(error => {
				logIt("Error exiting pip.");
				logIt(error);
			});
		} else if (
			VideoChat.remoteVideoWrapper.lastChild.webkitPresentationMode === "inline"
		) {
			VideoChat.remoteVideoWrapper.lastChild.webkitSetPresentationMode(
				"picture-in-picture"
			);
		} else if (
			VideoChat.remoteVideoWrapper.lastChild.webkitPresentationMode ===
			"picture-in-picture"
		) {
			VideoChat.remoteVideoWrapper.lastChild.webkitSetPresentationMode(
				"inline"
			);
		} else {
			VideoChat.remoteVideoWrapper.lastChild
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

/* // Swap camera / screen share
function swap() {
	// Handle swap video before video call is connected by checking that there's at least one peer connected
	if (!isConnected()) {
		alert("You must join a call before you can share your screen.");
		return;
	}

	// If mode is camera then switch to screen share
	if (mode === "camera") {
		// Show accept screenshare snackbar
		Snackbar.show({
			text:
				"Please allow screen share. Click the middle of the picture above and then press share.",
			width: "400px",
			pos: "bottom-center",
			actionTextColor: "#000000",
			duration: 50000
		});
		// Request screen share, note: we can request to capture audio for screen sharing video content.
		navigator.mediaDevices
			.getDisplayMedia({
				video: true,
				audio: true
			})
			.then( (stream: any) => {
				// Change display mode
				mode = "screen";
				if (stream.getAudioTracks()[0]) {
					stream.addTrack(stream.getAudioTracks()[0]);
				}
				console.log(stream);
				switchStreamHelper(stream);
			})
			.catch( (err: any) => {
				logIt(err);
				logIt("Error sharing screen");
			});
		// If mode is screenshare then switch to webcam
	} else {
		// Stop the screen share video track. (We don't want to stop the audio track obviously.)
		VideoChat.localVideo?.srcObject
			.getVideoTracks()
			.forEach((track: any) => track.stop());
		// Get webcam input
		navigator.mediaDevices
			.getUserMedia({
				video: true,
				audio: true
			})
			.then( (stream) => {
				// Change display mode
				mode = "camera";
				switchStreamHelper(stream);
			});
	}
} */
