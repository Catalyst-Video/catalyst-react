import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const ChatComponent = ({
  showChat,
  setShowChat,
}: {
  showChat: boolean;
  setShowChat: Function;
}) => {
  return (
    <div id="chat-entire" className={showChat ? '' : 'hide-chat'}>
      <span className="chat-title">Chat</span>
      <button className="chat-close-btn" onClick={() => setShowChat(!showChat)}>
        <FontAwesomeIcon icon={faTimes} size="lg" title="Close Chat Panel" />
      </button>
      <div id="chat-zone">
        <div className="chat-messages"></div>
        <div id="chat-end" style={{ visibility: 'hidden' }}></div>
      </div>
      <textarea
        className="chat-compose"
        placeholder="Send Message"
        rows={2}
      ></textarea>
    </div>
  );
};

export default ChatComponent;
