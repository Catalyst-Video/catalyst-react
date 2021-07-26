import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileUpload,
  faPaperPlane,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { DataPacket_Kind, LocalParticipant, Participant } from 'livekit-client';

export interface ChatMessage {
    text: string;
    sender: Participant;
}

const Chat = ({
  chatOpen,
  setChatOpen,
//   participants,
  localParticipant,
}: {
  chatOpen: boolean;
  setChatOpen: Function;
//   participants: Participant[];
  localParticipant?: LocalParticipant;
}) => {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [chatBox, setChatBox] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const handleSendMsg = (msg: string) => {
    // Send message over data channel, add message to screen (if message contains content)
    if (msg && msg.length > 0 && RegExp(`.`).test(msg)) {
      console.log(msg);
      // Prevent cross site scripting
      msg = msg.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      // msg = msg.autolink();
      // TODO:  sendToAllDataChannels('mesg:' + msg, dataChannel);
      //   setChatMessages(chatMessages => [...chatMessages, ['', localName, msg]]);
        if (localParticipant) {
            const encoder = new TextEncoder();
            const data = encoder.encode(msg);
            localParticipant.publishData(data, DataPacket_Kind.RELIABLE)
            setChatMessages([...chatMessages, { text: msg, sender: localParticipant }]);
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
  }, [chatMessages.length]);

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
          className={`bg-gray-500 flex h-full relative z-20 w-64 ${
            chatOpen ? 'animate-fade-in-right' : 'animate-fade-out-right'
          }`}
        >
          <div
            id="chat-zone"
            className="flex flex-1 flex-row justify-end text-sm h-full absolute left-0 top-0 right-0 pt-16 pb-30"
          >
            <div
              id="chat-messages"
              className="w-full h-auto overflow-x-none overflow-y-auto z-20 left-0 right-0"
            >
              {chatMessages.map((msg, idx) => {
                console.log(msg);
                if (msg.sender instanceof LocalParticipant)
                  return (
                    <div
                      className="sent-message relative flex flex-col items-start content-end p-1 pr-2 float-right fade-in-bottom z-40"
                      key={idx}
                    >
                      <span className="text-black dark:text-white font-semibold text-xs ml-auto p-1 not-selectable">
                        {msg.sender.identity} (You)
                      </span>
                      <div
                        className={`bg-primary text-white relative rounded-tl-2xl rounded-tr-2xl rounded-br-sm rounded-bl-2xl  ml-auto p-2`}
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
                      className="received-message relative flex flex-col items-start content-end p-1 pl-2 fade-in-bottom"
                      key={idx}
                    >
                      <span className="text-black dark:text-white font-semibold text-xs p-1 not-selectable">
                        {msg.sender.identity}
                      </span>
                      <div className="bg-gray-100 text-black relative flex items-center justify-center rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-sm p-2">
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
                className="bg-blue w-full h-1" //invisible
              ></div>
            </div>
          </div>
          <div
            id="chat-compose-wrapper"
            className="w-full bottom-0 fixed bg-gray-500 flex z-30"
          >
            <textarea
              id="chat-compose"
              placeholder="Type your message"
              className="focus:outline-none focus:border-0 w-full resize-none text-gray-900 bg-gray-500 ml-1"
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
              className={`bg-primary ml-2 p-2 cursor-pointer rounded-xl text-white h-10 mr-1`}
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
      <div className="absolute bottom-2 right-2 z-40">
        <button
          className="z-40"
          onClick={() => setChatOpen(chatOpen => !chatOpen)}
        >
          Toggle Chat
        </button>
      </div>
    </>
  );
};

export default Chat;
