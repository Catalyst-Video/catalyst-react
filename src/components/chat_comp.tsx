import React from 'react';
import Draggable from 'react-draggable';

const ChatComponent = ({ showChat }: { showChat: boolean }) => {
  return (
    <div id="entire-chat" className={showChat ? '' : 'hide-chat'}>
      <div id="chat-zone">
        <div className="chat-messages"></div>
        <div id="chat-end" style={{ visibility: 'hidden' }}>
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
  );
};

export default ChatComponent;
