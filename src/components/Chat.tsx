import React, { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowCircleRight,
  faFileUpload,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { sendToAllDataChannels } from '../utils/general';
import { displayMsg } from '../utils/messages';

const ChatComponent = ({
  showChat,
  setShowChat,
  dataChannel,
  localColor,
}: {
  showChat: boolean;
  setShowChat: Function;
  dataChannel: Map<string, RTCDataChannel>;
  localColor: string;
}) => {
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const textSendRef = useRef<HTMLSpanElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSendMsg = (msg: string) => {
    console.log(msg);
    // Send message over data channel, add message to screen, auto scroll chat down
    if (msg && msg.length > 0) {
      // Prevent cross site scripting
      msg = msg.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      msg = msg.autolink();
      sendToAllDataChannels('mes:' + msg, dataChannel);
      displayMsg(msg, localColor ?? 'var(--themeColor)', true);
      chatEndRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
      });
      if (textInputRef.current) textInputRef.current.value = '';
    }
  };

  textInputRef.current?.addEventListener('keypress', (e: any) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      handleSendMsg(textInputRef.current?.value ?? '');
    }
  });

  textSendRef.current?.addEventListener('click', (e: any) => {
    e.preventDefault();
    handleSendMsg(textInputRef.current?.value ?? '');
  });

  return (
    <div id="chat-entire" className={showChat ? '' : 'hide-chat'}>
      <span className="chat-title">Chat</span>
      <button className="chat-close-btn" onClick={() => setShowChat(!showChat)}>
        <FontAwesomeIcon icon={faTimes} size="lg" title="Close Chat Panel" />
      </button>
      <div id="chat-zone">
        <div className="chat-messages"></div>
        <div
          ref={chatEndRef}
          id="chat-end"
          style={{ visibility: 'hidden' }}
        ></div>
      </div>
      <div className="chat-compose-wrapper">
        <textarea
          ref={textInputRef}
          className="chat-compose"
          placeholder="Send Message"
          rows={2}
        ></textarea>
        <span ref={textSendRef}>
          <FontAwesomeIcon
            id="chat-send"
            icon={faArrowCircleRight}
            size="lg"
            title="Send Message"
            className="chat-btn"
          />
        </span>

        {/* <FontAwesomeIcon
          icon={faFileUpload}
          size="lg"
          title="Upload File"
          id="upload-send"
          className="chat-btn"
        /> */}
      </div>
    </div>
  );
};

export default ChatComponent;
