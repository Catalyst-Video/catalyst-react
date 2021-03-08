import React from "react";
import ReactDOM from "react-dom";
import VideoChat from "./lib/video_chat";

ReactDOM.render(
	<React.StrictMode>
		{/* DEMO */}
		<VideoChat
			sessionKey={"testKey"}
			// uniqueIdentifier={""}
			defaultSettings={{
				hideChat: true,
				audioOn: true,
				videoOn: true,
				hideCaptions: true,
				hideLogo: false
			}}
		/>
	</React.StrictMode>,
	document.getElementById("root")
);
