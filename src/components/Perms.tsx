import { faCamera, faMicrophone } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useRef } from 'react';

import { HeaderImg } from './Header';

const PermsComponent = ({
  sessionKey,
  hasPerms,
  setPermissions,
  setUserReady,
}: {
  sessionKey: string;
  hasPerms: boolean;
  setPermissions: Function;
  setUserReady: Function;
}) => {
  const permsRef = useRef<HTMLDivElement>(null);
  const testVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    reqPerms();
    if (
      permsRef &&
      permsRef.current?.parentNode?.parentNode?.nodeName === 'BODY'
    )
      permsRef.current.style.position = 'fixed';
  }, []);

  // useEffect(() => {
  //   if (hasPerms) reqPerms();
  // }, [hasPerms]);

  const reqPerms = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then(stream => {
        setPermissions(true);
        if (testVideoRef.current) testVideoRef.current.srcObject = stream;
        /* use the stream */
      })
      .catch(err => {
        /* handle the error */
      });
  };

  const setTestVideo = () => {};

  const joinCall = () => {
    setUserReady(true);
  };

  return (
    <div id="perms" className="perms" ref={permsRef}>
      <span className="header">
        <HeaderImg />
      </span>
      {hasPerms && (
        <span className="perms-msg">
          Welcome to <span className="text-color">{sessionKey}</span>
        </span>
      )}
      <div className="perms-cont">
        {hasPerms && (
          <div className="perms-comp">
            {/* <span className="perms-header">
              Welcome to <span className="text-color">{sessionKey}</span>
            </span>
            <span className="perms-msg">
              Join the call when you're happy with your audio/video settings
            </span> */}
            <div className="video-div">
              <video
                id="test-video"
                ref={testVideoRef}
                autoPlay
                muted
                playsInline
              />
            </div>
            <div className="opts">
              <div className="opt-item">
                <span className="opt-span">
                  <FontAwesomeIcon
                    icon={faMicrophone}
                    className="opt-icon"
                    size="lg"
                  />
                </span>
                Microphone
                <span className="opt-tog">On</span>
              </div>
              <div className="opt-item">
                <span className="opt-span">
                  <FontAwesomeIcon
                    icon={faCamera}
                    className="opt-icon"
                    size="lg"
                  />
                </span>
                Camera
                <span className="opt-tog">On</span>
              </div>
            </div>
            <button className="perms-but" onClick={() => joinCall()}>
              Join Call
            </button>
          </div>
        )}

        {!hasPerms && (
          <>
            <span className="perms-msg">
              <span className="text-color">Click “allow” above</span>
              <br />
              to give Catalyst camera and microphone access
              <br />
              <a
                href="https://docs.catalyst.chat/docs-permissions"
                target="_blank"
                className="help"
              >
                I need help!
              </a>
            </span>

            {/* <button className="perms-but" onClick={() => reqPerms()}>
              Allow permissions
            </button> */}
          </>
        )}
      </div>
    </div>
  );
};
export default PermsComponent;
