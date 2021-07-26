import React, { useState, useEffect } from 'react';
import { CatalystChatProps } from "./typings/interfaces";

// Styles
import './styles/catalyst.css';
import './styles/tailwind.output.css';
import VideoChat from "./views/VideoChatView";
import { generateUUID, setThemeColor } from "./utils/general";
import { DEFAULT_AUTOFADE, DEFAULT_THEME } from "./utils/globals";
import genRandomName from "./utils/name_gen";
import { useCookies } from 'react-cookie';

const CatalystChat = ({
  room,
  appId,
  name,
  theme,
  dark,
  fade,
  audioOnDefault,
  videoOnDefault,
  simulcast,
  disableChat,
  arbData,
  handleReceiveArbData,
  onEndCall,
}: CatalystChatProps) => {
  const [ready, setReady] = useState(true);
  const [token, setToken] = useState('');
  const [userName, setUserName] = useState(name ?? genRandomName());
  const [cookies, setCookie] = useCookies(['PERSISTENT_CLIENT_ID']);
  

  useEffect(() => {
    const persistentClientId = cookies.PERSISTENT_CLIENT_ID || generateUUID();
    if (!cookies.PERSISTENT_CLIENT_ID)
      setCookie('PERSISTENT_CLIENT_ID', persistentClientId, {
        expires: new Date(Date.now() + (1000 * 60 * 60 * 24 * 365)),
      });
      // obtain user token
      fetch(
        `https://pricey-somber-silence.glitch.me/token?participantName=${userName}&customerUid=${appId}&roomName=${room}&persistentClientId=${persistentClientId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            mode: 'no-cors',
          },
        }
      )
        .then(response => {
          if (response.status === 200) {
            response.json().then(json => {
              setToken(json.token);
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
      // set global theme
    setThemeColor(
      theme ?? DEFAULT_THEME
    );

  }, []);

  return (
    <div
      id="ctw"
      ref={ref => {
        // dynamically make Catalyst work properly if there is no parent component
        if (ref && ref.parentNode?.parentNode?.nodeName === 'BODY') {
          ref.style.position = 'fixed';
          let ss = document.createElement('style');
          document.head.appendChild(ss);
          ss?.sheet?.insertRule(
            'html, body { margin: 0px; padding: 0px; height: 100%; }'
          );
        }
      }}
    >
      <div
        id="dark-wrapper"
        className={`${
          dark ? 'dark' : ''
        } h-full w-full m-0 p-0 overflow-hidden max-h-screen max-w-screen box-border`}
      >
        {ready ? (
          <VideoChat
            token={token}
            // theme={theme ?? 'teal'}
            meta={{
              audioEnabled: audioOnDefault ?? true,
              videoEnabled: videoOnDefault ?? true,
              simulcast: simulcast ?? true,
              loglevel: 'trace',
            }}
            fade={fade ?? DEFAULT_AUTOFADE}
            onEndCall={onEndCall}
            disableChat={disableChat}
            arbData={arbData}
            handleReceiveArbData={handleReceiveArbData}
          />
        ) : null}
      </div>
    </div>
  );
};
export default CatalystChat;