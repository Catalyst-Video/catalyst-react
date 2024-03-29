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

// ui
import React, { useState, useEffect } from 'react';
import SetupView from './views/SetupView';
import CatalystChatView from './views/CatalystChatView';
//hooks
import useIsMounted from './hooks/useIsMounted';
import { useCookies } from 'react-cookie';
// types
import { CatalystChatProps, CatalystUserData } from './typings/interfaces';
// utils
import { setThemeColor } from './utils/ui';
import { generateUUID } from './utils/general';
import { AUTH_ADDRESS, DEFAULT_AUTOFADE, THEMES } from './utils/globals';
import genRandomName from './utils/name_gen';
// import DetectRTC from 'detectrtc';
// styles & elements
import ElementQueries from 'css-element-queries/src/ElementQueries';
ElementQueries.listen();
import './styles/tailwind.output.css';
import './styles/catalyst.css';

const CatalystChat = ({
  room,
  appId,
  name,
  theme,
  fade,
  audioOffDefault,
  videoOffDefault,
  simulcast,
  // bgRemoval,
  disableChat,
  disableSelfieMode,
  disableSetupView,
  disableNameField,
  cstmSetupBg,
  disableRefreshBtn,
  cstmWelcomeMsg,
  cstmSupportUrl,
  arbData,
  handleReceiveArbData,
  handleUserData,
  onJoinCall,
  onMemberJoin,
  onMemberLeave,
  onLeaveCall,
  handleComponentRefresh,
}: CatalystChatProps) => {
  // tokens
  const [cookies, setCookie] = useCookies(['PERSISTENT_CLIENT_ID']);
  const [bgRemovalKey, setBgRemovalKey] = useState('');
  const [token, setToken] = useState('');
  // session 
  const isMounted = useIsMounted();
  if (!handleComponentRefresh) handleComponentRefresh = () => {};
  const [ready, setReady] = useState(disableSetupView ?? false);
  // user data
  const [userName, setUserName] = useState(name ?? genRandomName());
  const [audioOn, setAudioOn] = useState(audioOffDefault ? false : true);
  const [videoOn, setVideoOn] = useState(videoOffDefault ? false : true);

  useEffect(() => {
    setThemeColor(theme ?? THEMES.default);
  }, []);

  useEffect(() => {
    if (ready && token.length < 1) {
      setTimeout(() => {
         if (!isMounted()) return;
          // set client ID
          const uniqueClientIdentifier =
            cookies.PERSISTENT_CLIENT_ID || generateUUID();
          if (!cookies.PERSISTENT_CLIENT_ID)
            setCookie(
              'PERSISTENT_CLIENT_ID',
              uniqueClientIdentifier,
              {
                expires: new Date(
                  Date.now() + 1000 * 60 * 60 * 24 * 365
                ),
              }
            );
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
              if (!isMounted()) return;
              if (response.status === 200) {
                response
                  .json()
                  .then((user: CatalystUserData) => {
                    if (!isMounted()) return;
                    if (handleUserData) {
                      handleUserData(user);
                    }
                    setToken(user.token);
                    // console.log(user);
                    return user.token;
                  });
              }
              if (response.status === 500) {
                console.log(
                  'There is no user record corresponding to the provided identifier'
                );
                setToken('INVALID');
              }
              return token;
            })
            .catch(err => {
              console.log(err);
              setToken('INVALID');
            });
        }, 500)
   
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
          <CatalystChatView
            token={token}
            meta={{
              audioEnabled: audioOn,
              videoEnabled: videoOn,
              simulcast: simulcast ?? true,
              loglevel: 'trace',
            }}
            fade={fade ?? DEFAULT_AUTOFADE}
            disableChat={disableChat}
            disableSelfieMode={disableSelfieMode}
            arbData={arbData}
            bgRemovalKey={bgRemovalKey}
            // bgRemoval={bgRemoval}
            handleReceiveArbData={handleReceiveArbData}
            cstmWelcomeMsg={cstmWelcomeMsg}
            cstmSupportUrl={cstmSupportUrl}
            disableRefreshBtn={disableRefreshBtn}
            onJoinCall={onJoinCall}
            onMemberJoin={onMemberJoin}
            onMemberLeave={onMemberLeave}
            onLeaveCall={onLeaveCall}
            handleComponentRefresh={handleComponentRefresh}
          />
        ) : !disableSetupView ? (
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
            cstmSupportUrl={cstmSupportUrl}
          />
        ) : null}
      </div>
    </div>
  );
};
export default CatalystChat;
