import { useState } from "react";

const ChatComponent = ({ defaultShowChat }) => {
	const showChatComp = useState(defaultShowChat);

	const toggleChat = () => {
		var chatIcon = document.querySelector("#chat-icon") as HTMLInputElement;
		var chatText = document.querySelector("#chat-text");
		if (entireChat.is(":visible")) {
			entireChat.fadeOut();
			// Update show chat buttton
			if (chatText !== null) {
				chatText.textContent = "Show chat";
			}
			chatIcon?.classList.remove("fa-comment-slash");
			chatIcon?.classList.add("fa-comment");
		} else {
			entireChat.fadeIn();
			// Update show chat buttton
			if (chatText !== null) {
				chatText.textContent = "Hide chat";
			}
			chatIcon?.classList.remove("fa-comment");
			chatIcon?.classList.add("fa-comment-slash");
		}
	};

	return showChatComp ? (
		<div id="entire-chat">
			<div id="chat-zone">
				<div className="chat-messages"></div>
			</div>
			<form className="compose">
				<input type="text" placeholder="Message #everyone" />
			</form>
		</div>
	) : null;
};

export default ChatComponent;
