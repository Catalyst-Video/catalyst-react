import React, { useState } from "react";
import { CatalystChatProps } from "./typings/interfaces";

// Styles
import './styles/catalyst.css';
import './styles/tailwind.output.css';
import VideoChat from "./views/VideoChat";

const CatalystChat = ({ key, appId, dark, theme, fade, name, audioOnDefault, videoOnDefault }: CatalystChatProps) => {
    const [ready, setReady] = useState(true);

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
              token={
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2aWRlbyI6eyJyb29tSm9pbiI6dHJ1ZSwicm9vbSI6ImFzZGZhZCIsImNhblB1Ymxpc2giOnRydWUsImNhblN1YnNjcmliZSI6dHJ1ZX0sImlhdCI6MTYyNjUzMzk1MSwibmJmIjoxNjI2NTMzOTUxLCJleHAiOjE2MjY1NDExNTEsImlzcyI6IkFQSU1teGlMOHJxdUt6dFpFb1pKVjlGYiIsImp0aSI6InNhZmRzZGYifQ.9I0ruoY8CGNCL4lhGxbvKP8rOnS6xO7EzdBM4_RH6WU'
              }
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