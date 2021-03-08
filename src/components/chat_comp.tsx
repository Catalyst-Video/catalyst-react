const ChatComponent = ({ hideChat }: { hideChat: boolean }) => {
	return !hideChat ? (
		<div id="entire-chat">
			<div id="chat-zone">
				<div className="chat-messages"></div>
				<div id="chat-end" style={{ visibility: "hidden" }}>
					end
				</div>
			</div>
			<form className="compose">
				<input type="text" placeholder="Message #everyone" />
			</form>
		</div>
	) : null;
};

export default ChatComponent;
