import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChevronLeft,
    faChevronRight,
    faCommentAlt,
  faCommentSlash,
  faFileUpload,
  faPaperPlane,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { DataPacket_Kind, LocalParticipant, Participant } from 'livekit-client';
import { ChatMessage } from '../typings/interfaces';

const Chat = ({
  chatOpen,
  setChatOpen,
    localParticipant,
    chatMessages,
  setChatMessages
}: {
  chatOpen: boolean;
  setChatOpen: Function;
  localParticipant?: LocalParticipant;
  chatMessages: ChatMessage[];
  setChatMessages: Function;
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [chatBox, setChatBox] = useState('');
  const encoder = new TextEncoder();

  const handleSendMsg = (msg: string) => {
    if (msg && msg.length > 0 && RegExp(`.`).test(msg)) {
      // console.log(msg);
      // Prevent cross site scripting
      msg = msg.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (localParticipant) {
        let chat = {
          type: 'ctw-chat',
          text: msg,
          sender: localParticipant.sid,
        };
        const data = encoder.encode(JSON.stringify(chat));
        localParticipant.publishData(data, DataPacket_Kind.RELIABLE);
        setChatMessages(chatMessages => [
          ...chatMessages,
          {
            text: msg,
            sender: localParticipant,
          },
        ]);
        setChatBox('');
      }
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    });
  }, [chatMessages, chatOpen]);

  const autolink = (msg: string, isSelf: boolean) => {
    const pattern = /(^|[\s\n]|<[A-Za-z]*\/?>)((?:https?|ftp):\/\/[\-A-Z0-9+\u0026\u2019@#\/%?=()~_|!:,.;]*[\-A-Z0-9+\u0026@#\/%=~()_|])/gi;
    let matches = msg.match(pattern);
    if (matches) {
      return (
        <a
          target="_blank"
          href={matches[0]}
          className={`${isSelf ? 'text-white' : `text-primary`} underline`}
        >
          {matches[0]}
        </a>
      );
    } else return msg;
  };

  return (
    <>
      {chatOpen && (
        <div
          className={`bg-gray-700 flex h-full absolute right-0 sm:relative z-50 sm:z-20 w-72 sm:w-64 ${
            chatOpen ? 'animate-fade-in-right' : 'animate-fade-out-right'
          }`}
        >
          <div
            id="chat-zone"
            className="flex h-full absolute overflow-x-none inset-0 pt-6 sm:pt-16 pb-36"
          >
            <div
              id="chat-messages"
              className="w-full h-auto overflow-x-none overflow-y-auto z-20 inset-0 relative no-scrollbar "
            >
              {chatMessages.map((msg, idx) => {
                if (msg.sender instanceof LocalParticipant)
                  return (
                    <div
                      className="sent-message flex flex-col items-start content-end p-1 pr-2 ml-20 fade-in-bottom z-40"
                      key={idx}
                    >
                      <span className="text-white dark:text-white font-semibold text-xs ml-auto p-1 not-selectable">
                        {msg.sender?.identity} (You)
                      </span>
                      <div
                        className={`bg-primary text-white rounded-tl-2xl rounded-tr-2xl rounded-br-sm rounded-bl-2xl  ml-auto p-2`}
                      >
                        <div className="message break-all px-2 py-1 text-xs">
                          {autolink(msg.text, true)}
                        </div>
                      </div>
                    </div>
                  );
                else
                  return (
                    <div
                      className="received-message flex flex-col items-start content-end p-1 pl-2 fade-in-bottom"
                      key={idx}
                    >
                      <span className="text-white dark:text-white font-semibold text-xs p-1 not-selectable">
                        {msg?.sender?.identity}
                      </span>
                      <div className="bg-gray-100 text-black flex items-center justify-center rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-sm p-2">
                        <div className="message break-all px-2 py-1 text-xs">
                          {autolink(msg.text, false)}
                        </div>
                      </div>
                    </div>
                  );
              })}
              <div
                ref={chatEndRef}
                id="chat-end"
                className="invisible w-full h-1 content-end"
              ></div>
            </div>
          </div>
          <div
            id="chat-compose-wrapper"
            className="w-full bottom-0 fixed bg-gray-700 flex z-30 flex-row"
          >
            <textarea
              id="chat-compose"
              placeholder="Type your message"
              className="focus:outline-none focus:border-0 w-full resize-none text-white bg-gray-700 ml-1"
              rows={6}
              value={chatBox}
              onKeyUp={e => {
                // TODO: this may be deprecated
                if (e.keyCode === 13) {
                  e.preventDefault();
                  handleSendMsg(chatBox);
                }
              }}
              onChange={e => setChatBox(e.target.value)}
            />
            <span
              onClick={() => {
                handleSendMsg(chatBox);
              }}
              className={`bg-primary mt-2 ml-2 p-2 cursor-pointer fixed right-0 z-30 rounded-xl text-white h-10 mr-1`}
            >
              <FontAwesomeIcon
                id="chat-send"
                icon={faPaperPlane}
                size="lg"
                // title="Send Message"
                className={`text-white`}
              />
            </span>
          </div>
        </div>
      )}
      <div
        className={`absolute  ${
          chatOpen
            ? 'left-3 sm:left-auto sm:right-48 animate-fade-in-right'
            : 'right-2 animate-fade-in-left'
        } z-40 top-10 sm:top-auto sm:bottom-4 right-3`} // flex items-center h-full inset-y-0
      >
        <button
          className="z-40 focus:outline-none focus:border-0 flex bg-gray-600 dark:bg-gray-700 hover:bg-gray-500 dark:hover:bg-gray-600 rounded-full w-16 h-16 items-center justify-center"
          onClick={() => setChatOpen(chatOpen => !chatOpen)}
        >
          {!chatOpen && (
            <FontAwesomeIcon
              id="chat-send"
              icon={faChevronLeft}
              size="lg"
              // title="Send Message"
              className={`text-white mr-1`}
            />
          )}
          <FontAwesomeIcon
            id="chat-send"
            icon={faCommentAlt}
            size="lg"
            // title="Send Message"
            className={`text-white `}
          />
          {chatOpen && (
            <FontAwesomeIcon
              id="chat-send"
              icon={faChevronRight}
              size="lg"
              // title="Send Message"
              className={`text-white ml-1`}
            />
          )}
        </button>
      </div>
    </>
  );
};

export default Chat;
