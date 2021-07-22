import React, { useState } from "react";
import { CatalystChatProps } from "./typings/interfaces";

// Styles
import './styles/catalyst.css';
import './styles/tailwind.output.css';
import VideoChat from "./views/VideoChat";
import { useEffect } from "react";

const CatalystChat = ({ room, appId, dark, theme, fade, name, audioOnDefault, videoOnDefault }: CatalystChatProps) => {
  const [ready, setReady] = useState(true);
  const [token, setToken] = useState("");
  const [userName, setUserName] = useState(name ?? 'test');

  useEffect(() => {
    fetch(
      `https://pricey-somber-silence.glitch.me/token?participantName=${'test'}&customerUid=${appId}&roomName=${room}`,
      {
        method: 'GET',
        headers: {
          // 'Content-Type': 'application/json',
          mode: 'no-cors',
        },
      }
    )
      .then(response => {
          console.log(response);
        if (response.status === 200) {
          console.log(response.body)
            // setToken(response.json().token);
        }
      })
      .catch(err => {
        console.log(err);
      });
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
              theme={theme ?? 'teal'}
              meta={{
                audioEnabled: true,
                videoEnabled: true,
                simulcast: true,
              }}
              fade={fade ?? 600}
              audioOnDefault={audioOnDefault ?? true}
              videoOnDefault={videoOnDefault ?? true}
            />
          ) : null}
        </div>
      </div>
    );

};
export default CatalystChat;