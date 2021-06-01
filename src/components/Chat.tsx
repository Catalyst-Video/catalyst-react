import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileUpload,
  faPaperPlane,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { logger, sendToAllDataChannels } from '../utils/general';

const ChatComponent = ({
  showChat,
  setShowChat,
  dataChannel,
  localName,
  themeColor,
  chatMessages,
  setChatMessages,
}: {
  showChat: boolean;
  setShowChat: Function;
  dataChannel: Map<string, RTCDataChannel>;
  localName: string;
  chatMessages: [string, string, string][];
  setChatMessages: Function;
  themeColor: string;
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [chatBox, setChatBox] = useState('');

  const handleSendMsg = (msg: string) => {
    // Send message over data channel, add message to screen (if message contains content)
    if (msg && msg.length > 0 && RegExp(`.`).test(msg)) {
      logger(msg);
      // Prevent cross site scripting
      msg = msg.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      msg = msg.autolink();
      sendToAllDataChannels('mesg:' + msg, dataChannel);
      setChatMessages(chatMessages => [...chatMessages, ['', localName, msg]]);
      setChatBox('');
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    });
  }, [chatMessages.length]);

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
        <div id="chat-messages" className="w-full overflow-x-none pt-10 pb-5">
          {chatMessages.map(([uuid, name, msg], idx) => {
            // console.log('in loop ', name, msg, localName);
            if (uuid.length <= 0)
              return (
                <div
                  className="sent-message relative flex flex-col items-start content-end p-1 pr-2 pl-20 fade-in-bottom"
                  key={idx}
                >
                  {(idx == 0 || chatMessages[idx - 1][0] !== uuid) && (
                    <span className="text-black font-semibold text-xs ml-auto p-1 not-selectable">
                      {name} (You)
                    </span>
                  )}
                  <div
                    className={`bg-${themeColor}-500 text-white relative rounded-tl-2xl rounded-tr-2xl rounded-br-sm rounded-bl-2xl  ml-auto p-2`}
                  >
                    <div className="message break-all px-2 py-1 text-xs">
                      {msg}
                    </div>
                  </div>
                </div>
              );
            else
              return (
                <div
                  className="received-message relative flex flex-col items-start content-end p-1 pl-2 fade-in-bottom"
                  key={idx}
                >
                  {(idx == 0 || chatMessages[idx - 1][0] !== uuid) && (
                    <span className="text-black font-semibold text-xs p-1 not-selectable">
                      {name}
                    </span>
                  )}
                  <div className="bg-gray-100 text-black relative flex items-center justify-center rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-sm p-2">
                    <div className="message break-all px-2 py-1 text-xs">
                      {msg}
                    </div>
                  </div>
                </div>
              );
          })}
          <div
            ref={chatEndRef}
            id="chat-end"
            className="invisible w-full h-1"
          ></div>
        </div>
      </div>

      <div
        id="chat-compose-wrapper"
        className="absolute bottom-0 sm:bottom-3 left-0 sm:ml-2 flex items-center border-0 sm:shadow-lg outline-none w-full shadow-inner sm:rounded-2xl p-2 h-20 sm:h-16 max-h-20 bg-white dark:bg-gray-700"
      >
        <textarea
          id="chat-compose"
          className="text-sm border-0 outline-none w-full bg-white dark:bg-gray-700 dark:text-white resize-none"
          placeholder="Type your message"
          rows={2}
          value={chatBox}
          onKeyUp={e => {
            // TODO: this may be deprecated
            if (e.keyCode === 13) {
              e.preventDefault();
              handleSendMsg(chatBox);
            }
          }}
          onChange={e => setChatBox(e.target.value)}
        ></textarea>
        <span
          onClick={() => {
            handleSendMsg(chatBox);
          }}
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
