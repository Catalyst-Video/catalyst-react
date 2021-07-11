import React, { useState } from "react";
import { CatalystChatProps } from "./typings/interfaces";

// Styles
import './styles/catalyst.css';
import './styles/tailwind.output.css';
import VideoChat from "./views/VideoChat";

const CatalystChat = ({ key, appId, dark }: CatalystChatProps) => {
    const [ready, setReady] = useState(true);

    return (
			<div
				id="ctw"
				ref={ref => {
					// dynamically make Catalyst work properly if there is no parent component
					if (ref && ref.parentNode?.parentNode?.nodeName === "BODY") {
						ref.style.position = "fixed";
						let ss = document.createElement("style");
						document.head.appendChild(ss);
						ss?.sheet?.insertRule(
							"html, body { margin: 0px; padding: 0px; height: 100%; }"
						);
					}
				}}
			>
				<div
					id="theme-wrapper"
					className={`${
						dark ? "dark" : ""
					} h-full w-full m-0 p-0 overflow-hidden max-h-screen max-w-screen box-border`}
				>
					{ready ? <VideoChat token={"token"} /> : null}
				</div>
			</div>
		);

};
export default CatalystChat;