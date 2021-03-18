import { toast } from "react-toastify";

export function displayWelcomeMessage(
	customSnackbarMsg: string | HTMLElement | Element | undefined,
	sessionKey: string
): void {
	toast(
		() => (
			<div className="text-center justify-between">
				{customSnackbarMsg ? (
					customSnackbarMsg
				) : (
					<>
						<span>Share your session key </span>
						<strong>{sessionKey}</strong>
						<span> with whoever wants to join</span>
					</>
				)}
			</div>
		),
		{
			toastId: "peer_prompt"
		}
	);
}

export function displayVideoErrorMessage(): void {
	toast(
		() => (
			<div className="text-center justify-between">
				Please press allow to enable webcam & audio access
				<button
					className="snack-btn"
					onClick={() => {
						window.open(
							"https://help.clipchamp.com/en/articles/1505527-how-do-i-enable-my-webcam-for-recording",
							"_blank"
						);
					}}
				>
					Directions
				</button>
			</div>
		),
		{
			autoClose: false,
			toastId: "webcam/audio_error"
		}
	);
}

export function closeAllMessages(): void {
	toast.dismiss();
}

export function Area(
	Increment: number,
	Count: number,
	Width: number,
	Height: number,
	Margin = 10
) {
	let i = 0;
	let w = 0;
	let h = Increment * 0.75 + Margin * 2;
	while (i < Count) {
		if (w + Increment > Width) {
			w = 0;
			h = h + Increment * 0.75 + Margin * 2;
		}
		w = w + Increment + Margin * 2;
		i++;
	}
	if (h > Height) return false;
	else return Increment;
}

export function ResizeWrapper(): void {
	let Margin = 2;
	let Wrapper = document.getElementById("wrapper");
	let Width = 0;
	let Height = 0;
	if (Wrapper) {
		Width = Wrapper.offsetWidth - Margin * 2;
		Height = Wrapper.offsetHeight - Margin * 2;
	}
	let RemoteVideos = document.querySelectorAll("#remote-video");
	// console.log(RemoteVideos);
	let max = 0;

	// loop TODO: needs to be optimized
	let i = 1;
	while (i < 5000) {
		let w = Area(i, RemoteVideos.length, Width, Height, Margin);
		if (w === false) {
			max = i - 1;
			break;
		}
		i++;
	}

	max = max - Margin * 2;
	setWidth(max, Margin);
}

export function setWidth(width: number, margin: number): void {
	let RemoteVideos = document.querySelectorAll(
		"#remote-video"
	) as NodeListOf<HTMLVideoElement>;
	for (var s = 0; s < RemoteVideos.length; s++) {
		RemoteVideos[s].style.width = width + "px";
		RemoteVideos[s].style.margin = margin + "px";
		RemoteVideos[s].style.height = width * 0.75 + "px";
	}
}
