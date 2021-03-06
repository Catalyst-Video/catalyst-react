import React from "react";
import ReactDOM from "react-dom";
import VideoChat from "./views/video_chat";
import SnackbarProvider from "react-simple-snackbar";
// styles
import "./styles/chat.css";
import "./styles/snackbar.css";

ReactDOM.render(
	<React.StrictMode>
		{/* TODO: make work for real  */}
		<SnackbarProvider>
			<VideoChat sessionKey={"testKey"} />
		</SnackbarProvider>
	</React.StrictMode>,
	document.getElementById("root")
);
