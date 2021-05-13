import React, { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowCircleRight,
  faFileUpload,
  faPaperPlane,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { sendToAllDataChannels } from '../utils/general';
import { displayMsg } from '../utils/messages';

const ChatComponent = ({
  showChat,
  setShowChat,
  dataChannel,
  localColor,
  themeColor,
}: {
  showChat: boolean;
  setShowChat: Function;
  dataChannel: Map<string, RTCDataChannel>;
  localColor: string;
  themeColor: string;
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
    <div
      id="chat-entire"
      className={`absolute right-0 flex flex-row content-end z-10 max-h-screen w-72 p-0 overflow-none bg-white dark:bg-gray-700 rounded-tl-xl rounded-bl-xl mb-20 mt-5 items-stretch ${
        showChat ? '' : 'hidden'
      }`}
      style={{ height: '90%' }}
    >
      <span
        id="chat-title"
        className="absolute left-3 pt-3 text-md font-bold text-black dark:text-white"
      >
        Chat
      </span>
      <button
        id="chat-close-btn"
        className="rounded-full bg-transparent z-20 fixed right-3 pt-3 focus:border-0 focus:outline-none text-left cursor-pointer text-black dark:text-white"
        onClick={() => setShowChat(!showChat)}
      >
        <FontAwesomeIcon
          icon={faTimes}
          size="lg"
          // TODO:  title="Close Chat Panel"
        />
      </button>
      <div
        id="chat-zone"
        className="flex flex-1 relative flex-row justify-end text-sm overflow-y-scroll"
        style={{ height: '85%' }}
      >
        <div
          id="chat-messages"
          className="w-full overflow-x-none pt-10 pb-5"
        ></div>
        <div ref={chatEndRef} id="chat-end" className="invisible"></div>
      </div>
      <div
        id="chat-compose-wrapper"
        className="absolute -bottom-6 left-0 -ml-3 flex items-center border-0 shadow-md outline-none w-full rounded-xl p-4 h-20 max-h-20 bg-white dark:bg-gray-600"
      >
        <textarea
          id="chat-compose"
          ref={textInputRef}
          className="text-sm border-0 outline-none w-full bg-white dark:bg-gray-600 resize-none"
          placeholder="Type your message"
          rows={3}
        ></textarea>
        <span
          ref={textSendRef}
          className={`bg-${themeColor}-500 ml-3 p-2 rounded-xl text-white`}
        >
          <FontAwesomeIcon
            id="chat-send"
            icon={faPaperPlane}
            size="lg"
            // title="Send Message"
            className={`text-white`}
          />
        </span>
        {/* 
         <FontAwesomeIcon
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
