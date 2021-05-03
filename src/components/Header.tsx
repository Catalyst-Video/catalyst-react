import React, { RefObject, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import HeaderImg from './HeaderImg';

const Header = ({
  autoFade,
  sessionKey,
  alwaysBanner,
  toolbarRef,
  uniqueAppId,
  themeColor,
}: {
  autoFade: number;
  sessionKey: string;
  alwaysBanner: boolean | undefined;
  toolbarRef: RefObject<HTMLDivElement>;
  uniqueAppId: string;
  themeColor: string;
}) => {
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  // fade or show UI on mouse move
  if (autoFade > 0 && toolbarRef) {
    console.log(toolbarRef.current);
    var timedelay = 1;
    const delayCheck = () => {
      if (timedelay === 5) {
        headerRef.current?.classList.add('hide');
        headerRef.current?.classList.remove('show');
        toolbarRef.current?.classList.add('hide');
        toolbarRef.current?.classList.remove('show');
        timedelay = 1;
      }
      timedelay += 1;
    };
    document.addEventListener('mousemove', () => {
      headerRef.current?.classList.add('show');
      headerRef.current?.classList.remove('hide');
      toolbarRef.current?.classList.add('show');
      toolbarRef.current?.classList.remove('hide');
      timedelay = 1;
      clearInterval(_delay);
      _delay = setInterval(delayCheck, autoFade);
    });
    var _delay = setInterval(delayCheck, autoFade);
  }

  return (
    <div>
      <div
        className={`absolute left-0 top-0 block w-full text-center bg-${themeColor}-500 p-1 text-white text-sm font-semibold z-4 ${
          alwaysBanner ? '' : 'sm:hidden'
        }`}
      >
        Powered by Catalyst
      </div>
      {!alwaysBanner && (
        <>
          <div
            id="header"
            ref={headerRef}
            className="hidden sm:block fixed not-selectable m-3"
          >
            <button
              id="header-btn"
              className="focus:border-0 focus:outline-none bg-transparent cursor-pointer inline"
              onClick={() => setShowSessionDetails(!showSessionDetails)}
            >
              <HeaderImg themeColor={themeColor} />
            </button>
          </div>
          {showSessionDetails && (
            <button
              id="sess-details-btn"
              className="bg-white rounded-md p-10 z-20 absolute m-5 cursor-pointer shadow-md focus:border-0 focus:outline-none"
              onClick={() => setShowSessionDetails(!showSessionDetails)}
            >
              <span id="sess-details-title" className="flex mb-5">
                <strong>Session Details</strong>
                <FontAwesomeIcon
                  icon={faTimes}
                  size="lg"
                  id="sess-details-close"
                  title="Close Session Details"
                  className="absolute right-1 top-1 cursor-pointer"
                />
              </span>
              Room:<i> {sessionKey}</i>
              <br />
              UUID: <i>{uniqueAppId}</i>
              <br />
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Header;
