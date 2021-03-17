import React from "react";
import ReactDOM from "react-dom";
import VideoChat from "./lib/video_chat";

ReactDOM.render(
	<React.StrictMode>
		{/* DEMO */}
		<VideoChat
			sessionKey="testKey"
			catalystUUID="4d39df3f-f67b-4217-b832-57d4ffa2b217"
			defaults={{
				audioOn: true,
				videoOn: true,
				hideChatArea: true,
				hideCaptionsArea: false
			}}
			disabled={{
				mute: false,
				pausevideo: false,
				screenshare: true,
				chat: false,
				picinpic: true,
				captions: true,
				endcall: false
			}}
			// socketServerAddress="http://localhost:3001"
			// themeColor="indigo"
		/>
	</React.StrictMode>,
	document.getElementById("root")
);
