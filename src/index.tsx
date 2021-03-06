import React from "react";
import ReactDOM from "react-dom";
import VideoChat from "./views/video_chat";

// styles
import "./styles/chat.css";
import "./styles/snackbar.css";

ReactDOM.render(
	<React.StrictMode>
		{/* TODO: make work for real  */}
		<VideoChat sessionKey={"testKey"} />
	</React.StrictMode>,
	document.getElementById("root")
);
