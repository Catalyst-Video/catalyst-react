import { VideoChatData } from "../../typings/interfaces";
import { CSSGlobalVariables } from "css-global-variables";

export function setThemeColor(color: string): void {
	let cssVar = new CSSGlobalVariables();
	switch (color) {
		case "pink":
			cssVar.themeColor = "#D53F8C";
			break;
		case "red":
			cssVar.themeColor = "#E53E3E";
			break;
		case "orange":
			cssVar.themeColor = "#DD6B20";
			break;
		case "yellow":
			cssVar.themeColor = "#ECC94B";
			break;
		case "green":
			cssVar.themeColor = "#38A169";
			break;
		case "teal":
			cssVar.themeColor = "#319795";
			break;
		case "blue":
			cssVar.themeColor = "#3182CE"; //"#2253ff";
			break;
		case "indigo":
			cssVar.themeColor = "#5A67D8";
			break;
		case "purple":
			cssVar.themeColor = "#805AD5";
			break;
		default:
			cssVar.themeColor = color;
	}
}

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

export function isConnected(VCData: VideoChatData) {
	var connected = false;
	// No way to 'break' forEach -> we go through all anyway
	VCData.connected.forEach((value: any, key: any, map: any) => {
		if (value) {
			connected = true;
		}
	});
	return connected;
}

export function chatRoomFull(): void {
	alert(
		"Chat room is full. Check to ensure you don't have multiple tabs open, or try with a new room link."
	);
	window.location.href = "/newcall";
}

export function sendToAllDataChannels(message: string, dataChannel: any) {
	console.log("Sending" + message);
	// key is UUID, value is dataChannel object
	dataChannel.forEach((value: any, key: any, map: any) => {
		value.send(message);
	});
}

export function handlereceiveMessage(
	msg: any,
	color: any,
	hideChat: boolean,
	setHideChat: Function
) {
	// Called when a message is received over the dataChannel, adds message to screen - auto scrolls chat down
	addMessageToScreen(msg, color, false);
	document
		.getElementById("chat-end")
		?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
	if (hideChat) {
		setHideChat(false);
	}
}

export function addMessageToScreen(
	msg: any,
	border: any,
	isOwnMessage: boolean
) {
	if (msg.length > 0) {
		if (isOwnMessage) {
			document
				.querySelector(".chat-messages")
				?.insertAdjacentHTML(
					"beforeend",
					`<div class="message-item customer cssanimation fadeInBottom"><div class="message-bloc" style="--bloc-color: ${border}"><div class="message">` +
						msg +
						"</div></div></div>"
				);
		} else {
			document
				.querySelector(".chat-messages")
				?.insertAdjacentHTML(
					"beforeend",
					`<div class="message-item moderator cssanimation fadeInBottom"><div class="message-bloc" style="--bloc-color: ${border}"><div class="message">` +
						msg +
						"</div></div></div>"
				);
		}
	}
}

// Using uuid to generate random, unique pastel color
export function uuidToHue(uuid: string, VCData: VideoChatData) {
	var hash = 0;
	for (var i = 0; i < uuid.length; i++) {
		hash = uuid.charCodeAt(i) + ((hash << 5) - hash);
		hash = hash & hash;
	}
	var hue = Math.abs(hash % 360);
	// Ensure color is not similar to other colors
	var availColors = Array.from({ length: 6 }, (x, i) => i * 60);
	VCData.peerColors.forEach((value: any, key: any, map: any) => {
		availColors[Math.floor(value / 60)] = -1;
	});
	if (availColors[Math.floor(hue / 60)] === -1) {
		for (var j = 0; j < availColors.length; j++) {
			if (availColors[j] != null) {
				hue = (hue % 60) + availColors[j];
				availColors[j] = -1;
				break;
			}
		}
	}
	VCData.peerColors.set(uuid, hue);
	return hue;
}

export function hueToColor(hue: any) {
	return `hsl(${hue},100%,70%)`;
}
// Sets the border color of UUID's stream
export function setStreamColor(uuid: string, VCData: VideoChatData) {
	const hue = uuidToHue(uuid, VCData);
	let elem = document.querySelectorAll(`[uuid="${uuid}"]`)[0] as HTMLElement;
	elem.style.border = `3px solid ${hueToColor(hue)}`;
}
