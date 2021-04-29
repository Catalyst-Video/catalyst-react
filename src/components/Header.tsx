import React, { RefObject, useRef, useState } from 'react';
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
    <div className="show-top">
      <div className={alwaysBanner ? 'header-banner' : 'mobile-banner'}>
        Powered by Catalyst
      </div>
      {!alwaysBanner && (
        <>
          <div id="ct-header" ref={headerRef} className="ct-not-selectable">
            <button
              className="ct-header-btn"
              style={{ display: 'inline' }}
              onClick={() => setShowSessionDetails(!showSessionDetails)}
            >
              <HeaderImg themeColor={themeColor} />
            </button>
          </div>
          {showSessionDetails && (
            <button
              className="session-details-btn"
              onClick={() => setShowSessionDetails(!showSessionDetails)}
            >
              <span className="session-details-title">
                <strong>Session Details</strong>
                <FontAwesomeIcon
                  icon={faTimes}
                  size="lg"
                  title="Close Session Details"
                  className="session-details-close"
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
