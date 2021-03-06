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
