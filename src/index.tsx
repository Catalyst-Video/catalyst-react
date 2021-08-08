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

import React, { useState, useEffect } from 'react';
import { CatalystChatProps } from './typings/interfaces';
import './styles/catalyst.css';
import './styles/tailwind.output.css';
import { generateUUID, setThemeColor } from './utils/general';
import { AUTH_ADDRESS, DEFAULT_AUTOFADE, THEMES } from './utils/globals';
import genRandomName from './utils/name_gen';
import { useCookies } from 'react-cookie';
// import DetectRTC from 'detectrtc';
import SetupView from './views/SetupView';
import VideoChat from './views/VideoChatView';

import ElementQueries from 'css-element-queries/src/ElementQueries';
ElementQueries.listen();

const CatalystChat = ({
  room,
  appId,
  name,
  theme,
  fade,
  audioOnDefault,
  videoOnDefault,
  simulcast,
  disableChat,
  disableSetupRoom,
  disableNameField,
  cstmSetupBg,
  arbData,
  handleReceiveArbData,
  onJoinCall,
  onMemberJoin,
  onMemberLeave,
  onLeaveCall,
}: CatalystChatProps) => {
  const [ready, setReady] = useState(disableSetupRoom ?? false);
  const [userName, setUserName] = useState(name ?? genRandomName());
  const [cookies, setCookie] = useCookies(['PERSISTENT_CLIENT_ID']);
  const [audioOn, setAudioOn] = useState(audioOnDefault ?? true);
  const [videoOn, setVideoOn] = useState(videoOnDefault ?? true);
  const [token, setToken] = useState('');

  useEffect(() => {
    // set global theme
    setThemeColor(theme ?? THEMES.default);
  }, []);

  useEffect(() => {
    if (ready) {
      // set client ID
      const uniqueClientIdentifier =
        cookies.PERSISTENT_CLIENT_ID || generateUUID();
      if (!cookies.PERSISTENT_CLIENT_ID)
        setCookie('PERSISTENT_CLIENT_ID', uniqueClientIdentifier, {
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
        });
      // obtain user token
      fetch(
        `${AUTH_ADDRESS}?participantName=${userName}&appId=${appId}&roomName=${room}&uniqueClientIdentifier=${uniqueClientIdentifier}`,
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
              // TODO: expose rest of return data
              setToken(json.token);
            });
          }
          if (response.status === 500) {
            console.log('There is no user record corresponding to the provided identifier');
            setToken('INVALID');
          }
        })
        .catch(err => {
          console.log(err);
          setToken('INVALID')
        });
    }
  }, [ready]);

  return (
    <div
      id="ctw"
      className="catalyst-parent"
      ref={ref => {
        // dynamically make Catalyst size properly if there is no parent component
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
        id="catalyst-wrapper"
        className={`h-full w-full m-0 p-0 overflow-hidden max-h-screen max-w-screen box-border`}
      >
        {ready ? (
          <VideoChat
            token={token}
            meta={{
              audioEnabled: audioOn,
              videoEnabled: videoOn,
              simulcast: simulcast ?? true,
              loglevel: 'trace',
            }}
            fade={fade ?? DEFAULT_AUTOFADE}
            disableChat={disableChat}
            arbData={arbData}
            handleReceiveArbData={handleReceiveArbData}
            onJoinCall={onJoinCall}
            onMemberJoin={onMemberJoin}
            onMemberLeave={onMemberLeave}
            onLeaveCall={onLeaveCall}
          />
        ) : !disableSetupRoom ? (
          <SetupView
            meta={{
              audioEnabled: audioOn,
              videoEnabled: videoOn,
              simulcast: simulcast ?? true,
              loglevel: 'trace',
            }}
            setAudioOn={setAudioOn}
            setVideoOn={setVideoOn}
            audioOn={audioOn}
            videoOn={videoOn}
            setReady={setReady}
            userName={userName}
            setUserName={setUserName}
            disableNameField={disableNameField}
            cstmSetupBg={cstmSetupBg}
          />
        ) : null}
      </div>
    </div>
  );
};
export default CatalystChat;
