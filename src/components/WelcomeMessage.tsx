import React from 'react';

export default function WelcomeMessage({
  cstmWelcomeMsg,
  sessionKey,
}: {
  cstmWelcomeMsg: string | JSX.Element | undefined;
  sessionKey: string;
}) {
  return (
    <div className="relative m-auto h-full w-full flex justify-center items-center content-evenly text-center">
      <span
        id="welcome-msg"
        className={`text-lg text-gray-800 dark:text-white not-selectable`}
      >
        {cstmWelcomeMsg ? (
          cstmWelcomeMsg
        ) : (
          <>
            Welcome to <span className="font-semibold">{sessionKey}</span>
            !
            <br />
            Waiting for others to join...
          </>
        )}
      </span>
    </div>
  );
}
