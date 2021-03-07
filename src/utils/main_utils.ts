import { fadeIn } from "./fade";

export function getBrowserName(): string {
	var name = "Unknown";
	if (window.navigator.userAgent.indexOf("MSIE") !== -1) {
	} else if (window.navigator.userAgent.indexOf("Firefox") !== -1) {
		name = "Firefox";
	} else if (window.navigator.userAgent.indexOf("Opera") !== -1) {
		name = "Opera";
	} else if (window.navigator.userAgent.indexOf("Chrome") !== -1) {
		name = "Chrome";
	} else if (window.navigator.userAgent.indexOf("Safari") !== -1) {
		name = "Safari";
	}
	return name;
}

export function chatRoomFull(): void {
	alert(
		"Chat room is full. Check to ensure you don't have multiple tabs open, or try with a new room link."
	);
	// Exit room and redirect
	window.location.href = "/newcall";
}

// Mute microphone
export function muteMicrophone(): void {
	var audioTrack: any;
	VideoChat.audioEnabled = !VideoChat.audioEnabled;
	VideoChat.peerConnections.forEach((value: any, key: any, map: any) => {
		value.getSenders().find((s: any) => {
			if (s.track.kind === "audio") {
				audioTrack = s.track;
			}
		});
		if (audioTrack) {
			audioTrack.enabled = VideoChat.audioEnabled;
		}
	});

	// select mic button and mic button text
	const micButtonIcon = document.getElementById("mic-icon");
	const micButtonText = document.getElementById("mic-text");
	// Update mute button text and icon
	if (micButtonIcon && micButtonText) {
		if (!VideoChat.audioEnabled) {
			micButtonIcon.classList.remove("fa-microphone");
			micButtonIcon.classList.add("fa-microphone-slash");
			micButtonText.innerText = "Unmute";
		} else {
			micButtonIcon.classList.add("fa-microphone");
			micButtonIcon.classList.remove("fa-microphone-slash");
			micButtonText.innerText = "Mute";
		}
	}
}

// // Reposition local video to top left of remote video
// export function rePositionLocalVideo() {
// 	// Get position of remote video
// 	console.log("Repositioning video...");
// 	var bounds = (document.querySelector("wrapper") as HTMLElement).style.position;
// 	let localVideo = document.querySelector("local-video");
// 	if (
// 		/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
// 			navigator.userAgent
// 		)
// 	) {
// 		bounds.top =
// 			(window.innerHeight ||
// 				document.documentElement.clientHeight ||
// 				document.body.clientHeight) * 0.7;
// 		bounds.left += 10;
// 	} else {
// 		bounds.top += 10;
// 		bounds.left += 10;
// 	}
// 	// Set position of local video
// 	let moveable = document.querySelector("moveable") as HTMLElement;
// 	moveable.style.position =

// }
