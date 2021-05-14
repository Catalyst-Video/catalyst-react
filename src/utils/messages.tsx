import React from 'react';
import { isConnected } from './general';

export function displayMsg(
  msg: string,
  themeColor: string,
  isOwnMessage: boolean
): void {
  if (msg.length > 0)
    if (isOwnMessage)
      document
        .querySelector('#chat-messages')
        ?.insertAdjacentHTML(
          'beforeend',
          `<div class="sent-message relative flex flex-col items-start content-end p-1 pr-2 pl-20 fade-in-bottom"><div class="bg-${themeColor}-500 text-white relative rounded-tl-2xl rounded-tr-2xl rounded-br-sm rounded-bl-2xl  ml-auto p-2"><div class="message break-all px-2 py-1 text-xs">` +
            msg +
            '</div></div></div>'
        );
    else
      document
        .querySelector('#chat-messages')
        ?.insertAdjacentHTML(
          'beforeend',
          `<div class="received-message relative flex flex-col items-start content-end p-1 pl-2 fade-in-bottom"><div class="bg-gray-100 text-black relative flex items-center justify-center rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-sm p-2"><div class="message break-all px-2 py-1 text-xs">` +
            msg +
            '</div></div></div>'
        );
}

export function handlereceiveMessage(msg: string, color?: string): void {
  displayMsg(msg, color ? color : 'var(--themeColor)', false);
  document
    .getElementById('chat-end')
    ?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
}
