//stackoverflow.com/a/20533102/13519580

export function fadeIn(elem, ms) {
	if (!elem) return;
	if (!elem.style) return;

	elem.style.opacity = 0;
	elem.style.filter = "alpha(opacity=0)";
	elem.style.display = "inline-block";
	elem.style.visibility = "visible";

	if (ms) {
		var opacity = 0;
		var timer = setInterval(function () {
			opacity += 50 / ms;
			if (opacity >= 1) {
				clearInterval(timer);
				opacity = 1;
			}
			elem.style.opacity = opacity;
			elem.style.filter = "alpha(opacity=" + opacity * 100 + ")";
		}, 50);
	} else {
		elem.style.opacity = 1;
		elem.style.filter = "alpha(opacity=1)";
	}
}

export function fadeOut(elem, ms) {
	if (!elem) return;
	if (!elem.style) return;

	if (ms) {
		var opacity = 1;
		var timer = setInterval(function () {
			opacity -= 50 / ms;
			if (opacity <= 0) {
				clearInterval(timer);
				opacity = 0;
				elem.style.display = "none";
				elem.style.visibility = "hidden";
			}
			elem.style.opacity = opacity;
			elem.style.filter = "alpha(opacity=" + opacity * 100 + ")";
		}, 50);
	} else {
		elem.style.opacity = 0;
		elem.style.filter = "alpha(opacity=0)";
		elem.style.display = "none";
		elem.style.visibility = "hidden";
	}
}
