/*  Catalyst Scientific Video Chat Component File
Copyright (C) 2021 Catalyst Scientific LLC, Seth Goldin & Joseph Semrai

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version. 

While this code is open-source, you may not use your own version of this
program commerically for free (whether as a business or attempting to sell a variation
of Catalyst for a profit). If you are interested in using Catalyst in an 
enterprise setting, please either visit our website at https://catalyst.chat 
or contact us for more information.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

You can contact us for more details at support@catalyst.chat. */

import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPaperPlane,
} from '@fortawesome/free-solid-svg-icons';
import { DataPacket_Kind, LocalParticipant } from 'livekit-client';
import { ChatMessage } from '../typings/interfaces';

const Chat = ({
  chatOpen,
  localParticipant,
  chatMessages,
  setChatMessages,
}: {
  chatOpen: boolean;
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
          className={`${isSelf ? 'text-white dark:text-black' : `text-primary`} underline`}
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
          className={`bg-secondary flex h-full absolute right-0 sm:relative z-50 shadow-lg sm:z-20 w-72 sm:w-64 ${
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
                      <span className="text-white dark:text-black font-semibold text-xs ml-auto p-1 not-selectable">
                        {msg.sender?.identity} (You)
                      </span>
                      <div
                        className={`bg-primary text-white dark:text-black rounded-tl-2xl rounded-tr-2xl rounded-br-sm rounded-bl-2xl  ml-auto p-2`}
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
                      <span className="text-white dark:text-black font-semibold text-xs p-1 not-selectable">
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
            className="w-full bottom-0 fixed bg-secondary flex z-30 flex-row"
          >
            <textarea
              id="chat-compose"
              placeholder="Type your message"
              className="focus:outline-none focus:border-0 w-full resize-none text-white dark:text-black bg-secondary ml-1"
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
              className={`bg-primary mt-2 ml-2 p-2 cursor-pointer fixed right-0 z-30 rounded-xl text-white dark:text-black h-10 mr-1`}
            >
              <FontAwesomeIcon
                id="chat-send"
                icon={faPaperPlane}
                size="lg"
                // title="Send Message"
                className={`text-white dark:text-black`}
              />
            </span>
          </div>
        </div>
      )}
      {/* <div
        className={`absolute  ${
          chatOpen
            ? 'left-3 sm:left-auto sm:right-48 animate-fade-in-right'
            : 'right-2 animate-fade-in-left'
        } z-40 top-10 sm:top-auto sm:bottom-4 right-3`} // flex items-center h-full inset-y-0
      >
        <button
          className="z-40 focus:outline-none focus:border-0 flex bg-tertiary dark:bg-secondary hover:bg-quaternary dark:hover:bg-tertiary rounded-full w-16 h-16 items-center justify-center"
          onClick={() => setChatOpen(chatOpen => !chatOpen)}
        >
          {!chatOpen && (
            <FontAwesomeIcon
              id="chat-send"
              icon={faChevronLeft}
              size="lg"
              // title="Send Message"
              className={`text-white dark:text-black mr-1`}
            />
          )}
          <FontAwesomeIcon
            id="chat-send"
            icon={faCommentAlt}
            size="lg"
            // title="Send Message"
            className={`text-white dark:text-black `}
          />
          {chatOpen && (
            <FontAwesomeIcon
              id="chat-send"
              icon={faChevronRight}
              size="lg"
              // title="Send Message"
              className={`text-white dark:text-black ml-1`}
            />
          )}
        </button>
      </div> */}
    </>
  );
};

export default Chat;
