import React from "react";
import ReactDOM from "react-dom";
import VideoChat from "./lib/video_chat";

ReactDOM.render(
	<React.StrictMode>
		{/* DEMO */}
		<VideoChat
			sessionKey="testKey"
			defaultSettings={{
				hideChat: true,
				audioOn: true,
				videoOn: true,
				hideCaptions: true,
				hideLogo: false
			}}
			// socketServerAddress="http://localhost:3001"
			themeColor="indigo"
		/>
	</React.StrictMode>,
	document.getElementById("root")
);
