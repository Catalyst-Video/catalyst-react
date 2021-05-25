import React, { useEffect, useRef, useState } from 'react';
import HeaderImg from './HeaderImg';
import { logger } from '../utils/general';

const PermsLoading = ({
  hasPerms,
  setPermissions,

  browserSupported,
  themeColor,
  disableGradient,
}: {
  hasPerms: boolean;
  setPermissions: Function;
  browserSupported: boolean;
  themeColor: string;
  disableGradient?: boolean;
}) => {
  const [gradient] = useState(`linear-gradient(217deg, hsla(${~~(
    360 * Math.random()
  )},70%,70%,0.8),hsla(${~~(360 * Math.random())},70%,70%,0.8) 70.71%), 
              linear-gradient(127deg, hsla(${~~(
                360 * Math.random()
              )},70%,70%,0.8),hsla(${~~(
    360 * Math.random()
  )},70%,70%,0.8) 70.71%),
            linear-gradient(336deg, hsla(${~~(
              360 * Math.random()
            )},70%,70%,0.8),hsla(${~~(
    360 * Math.random()
  )},70%,70%,0.8) 70.71%)`);

  const permsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      permsRef &&
      permsRef.current?.parentNode?.parentNode?.nodeName === 'BODY'
    )
      permsRef.current.style.position = 'fixed';
  }, []);

  useEffect(() => {
    reqPerms();
  }, []);

  const reqPerms = () => {
    if (browserSupported)
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: true,
        })
        .then(stream => {
          setPermissions(true);
          logger(stream.id);
        })
        .catch(err => {
          logger(err);
        });
  };

  return (
    <>
      <div
        id="perms-loading"
        ref={permsRef}
        className="h-full w-full flex justify-between items-center flex-col flex-1"
        style={
          disableGradient
            ? {
                background: '#f3f5fd', // TODO: dark/light theme
              }
            : {
                background: gradient,
              }
        }
      >
        <span id="pl-header" className="mx-2 mt-5">
          <HeaderImg themeColor={disableGradient ? themeColor : undefined} />
        </span>
        {!browserSupported && (
          <div
            id="incompatible"
            className="h-full w-full flex flex-col content-evenly text-center"
          >
            <span
              id="perms-msg"
              className={`block m-auto text-xl  ${`text-${
                disableGradient ? `black` : `white`
              }`}`}
            >
              <span
                className={`text-${
                  disableGradient ? themeColor + `-500` : `white`
                } font-semibold text-2xl`}
              >
                Your browser is not supported.
                <br /> <br />
                Try updating your browser or using a different one.
              </span>
            </span>
            <a
              href="https://caniuse.com/?search=webrtc"
              target="_blank"
              className={`text-base underline mb-4 mt-10 ${`text-${
                disableGradient ? `black` : `white`
              }`}`}
            >
              Learn More
            </a>
          </div>
        )}
        {hasPerms && browserSupported && (
          <div className="flex justify-center items-center h-full w-full -ml-20 catalyst-lds-roller">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        )}
        {!hasPerms && browserSupported && (
          <div
            id="perms-cont"
            className="flex-col flex-1 text-center mx-3 my-3 rounded-md flex justify-center"
          >
            <div className="h-full w-full flex flex-col content-evenly">
              <span
                id="perms-msg"
                className={`block m-auto text-xl  ${`text-${
                  disableGradient ? `black` : `white`
                }`}`}
              >
                <span
                  className={`text-${
                    disableGradient ? themeColor + `-500` : `white`
                  } font-semibold text-2xl`}
                >
                  Click “allow” above
                </span>
                <br />
                to give Catalyst camera and microphone access
                <br />
              </span>
              <span className=" mb-4 mt-10 inline">
                <button
                  onClick={() => reqPerms()}
                  className={`text-base focus:border-0 focus:outline-none underline mr-3 ${`text-${
                    disableGradient ? `black` : `white`
                  }`}`}
                >
                  Ask again
                </button>
                <a
                  href="https://docs.catalyst.chat/docs-permissions"
                  target="_blank"
                  className={`text-base underline ${`text-${
                    disableGradient ? `black` : `white`
                  }`}`}
                >
                  I need help!
                </a>
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
export default PermsLoading;
