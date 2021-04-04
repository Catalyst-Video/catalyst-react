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
  if (!isConnected(connected)) {
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
        .querySelector('.chat-messages')
        ?.insertAdjacentHTML(
          'beforeend',
          `<div class="message-item customer cssanimation fadeInBottom"><div class="message-bloc" style="border: 3px solid ${border}"><div class="message">` +
            msg +
            '</div></div></div>'
        );
    else
      document
        .querySelector('.chat-messages')
        ?.insertAdjacentHTML(
          'beforeend',
          `<div class="message-item moderator cssanimation fadeInBottom"><div class="message-bloc" style="border: 3px solid ${border}"><div class="message">` +
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
