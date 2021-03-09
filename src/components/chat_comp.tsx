import Draggable from "react-draggable";

const ChatComponent = ({ hideChat }: { hideChat: boolean }) => {
	return !hideChat ? (
		<div id="entire-chat">
			<div id="chat-zone">
				<div className="chat-messages"></div>
				<div id="chat-end" style={{ visibility: "hidden" }}>
					end
				</div>
			</div>
			<Draggable>
				<textarea
					className="compose"
					placeholder="Send Message"
					rows={2}
				></textarea>
			</Draggable>
		</div>
	) : null;
};

export default ChatComponent;
