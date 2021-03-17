import React from "react";
import ReactDOM from "react-dom";
import VideoChat from "./lib/video_chat";

ReactDOM.render(
	<React.StrictMode>
		{/* DEMO */}
		<VideoChat
			sessionKey="testKey"
			catalystUUID="4d39df3f-f67b-4217-b832-57d4ffa2b217"
			defaultSettings={{
				hideChat: true,
				audioOn: true,
				videoOn: true,
				hideCaptions: true,
				hideLogo: false
			}}
			disabledSettings={{
				disableMute: false,
				disablePauseVideo: false,
				disableScreenShare: false,
				disableChat: false,
				disablePicInPic: false,
				disableCaptions: false,
				disableEndCall: false
			}}
			// socketServerAddress="http://localhost:3001"
			// themeColor="indigo"
		/>
	</React.StrictMode>,
	document.getElementById("root")
);
