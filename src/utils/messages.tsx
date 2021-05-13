import React from 'react';
import { toast } from 'react-toastify';
import { isConnected } from './general';

export function displayWebcamErrorMessage(
  connected: Map<string, boolean>
): void {
  if (!isConnected(connected)) {
    toast(
      () => (
        <div className="text-center justify-between">
          Failed to access video, check webcam privacy settings
          <button
            className="snack-btn"
            onClick={() => {
              window.open(
                'https://docs.catalyst.chat/docs-permissions',
                '_blank'
              );
            }}
          >
            Help & Directions
          </button>
        </div>
      ),
      {
        autoClose: false,
        toastId: 'webcam/audio_error',
      }
    );
  }
}

export function displayWelcomeMessage(
  sessionKey: string,
  connected: Map<string, boolean>,
  cstmSnackbarMsg?: JSX.Element | string
): void {
  if (!isConnected(connected) && cstmSnackbarMsg !== 'DISABLED') {
    toast(
      () => (
        <div className="text-center justify-between">
          {cstmSnackbarMsg ? (
            cstmSnackbarMsg
          ) : (
            <>
              <span>
                Room ready! Waiting for others to join with session key{' '}
              </span>
              <strong>{sessionKey}</strong>
            </>
          )}
        </div>
      ),
      {
        autoClose: false,
        toastId: 'peer_prompt',
      }
    );
  }
}

export function displayMsg(
  msg: string,
  border: string,
  isOwnMessage: boolean
): void {
  if (msg.length > 0)
    if (isOwnMessage)
      document
        .querySelector('#chat-messages')
        ?.insertAdjacentHTML(
          'beforeend',
          `<div class="sent-message relative flex flex-col items-start content-end p-1 pl-20 fade-in-bottom"><div class="bg-gray-50 text-black relative shadow-sm rounded-tl-full rounded-tr-full rounded-br-sm rounded-bl-full border-2 border-${border}-500 ml-auto p-2"><div class="message break-all p-1">` +
            msg +
            '</div></div></div>'
        );
    else
      document
        .querySelector('#chat-messages')
        ?.insertAdjacentHTML(
          'beforeend',
          `<div class="received-message relative flex flex-col items-start content-end p-1 pl-20 fade-in-bottom"><div class="bg-gray-50 text-black relative flex items-center justify-center shadow-sm rounded-tl-full rounded-tr-full rounded-br-full rounded-bl-sm border-2 p-2 border-${border}-500"><div class="message break-all p-1">` +
            msg +
            '</div></div></div>'
        );
}

export function displayMessage(msg: string, displayLength?: number): void {
  toast(() => <div className="text-center justify-between">{msg}</div>, {
    toastId: 'info_msg',
    autoClose: displayLength ? displayLength : 5000,
  });
}

export function handlereceiveMessage(msg: string, color?: string): void {
  displayMsg(msg, color ? color : 'var(--themeColor)', false);
  document
    .getElementById('chat-end')
    ?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
}
