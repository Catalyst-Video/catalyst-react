import React, { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
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
  // localColor,
  themeColor,
}: {
  showChat: boolean;
  setShowChat: Function;
  dataChannel: Map<string, RTCDataChannel>;
  // localColor: string;
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
      displayMsg(msg, themeColor, true);
      // displayMsg(msg, localColor ?? 'var(--themeColor)', true);
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
      className={`absolute top-7 sm:top-0 m-0 right-0 p-0 sm:right-4 flex flex-row content-end z-40 shadow-sm max-h-screen w-full sm:w-72 sm:p-0 overflow-none bg-white dark:bg-gray-800 sm:rounded-2xl sm:mb-20 sm:mt-4 items-stretch ${
        showChat ? '' : 'hidden'
      }`}
      //rounded-tl-xl rounded-bl-xl
      style={{ height: '95%' }}
    >
      <span
        id="chat-title"
        className="absolute left-3 pt-3 text-md font-bold text-black dark:text-white"
      >
        Chat
      </span>
      <button
        id="chat-close-btn"
        className="rounded-full bg-transparent z-20 fixed right-4 sm:right-8 pt-3 focus:border-0 focus:outline-none text-left cursor-pointer text-black dark:text-white"
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
        className="flex flex-1 relative flex-row justify-end text-sm overflow-y-auto"
        style={{ height: '88%' }}
      >
        <div
          id="chat-messages"
          className="w-full overflow-x-none pt-10 pb-5"
        ></div>
        <div ref={chatEndRef} id="chat-end" className="invisible"></div>
      </div>
      <div
        id="chat-compose-wrapper"
        className="absolute bottom-0 sm:bottom-3 left-0 sm:ml-2 flex items-center border-0 sm:shadow-lg outline-none w-full shadow-inner sm:rounded-2xl p-2 h-20 sm:h-16 max-h-20 bg-white dark:bg-gray-700"
      >
        <textarea
          id="chat-compose"
          ref={textInputRef}
          className="text-sm border-0 outline-none w-full bg-white dark:bg-gray-700 dark:text-white resize-none"
          placeholder="Type your message"
          rows={2}
        ></textarea>
        <span
          ref={textSendRef}
          className={`bg-${themeColor}-500 ml-2 p-2 cursor-pointer rounded-xl text-white`}
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
