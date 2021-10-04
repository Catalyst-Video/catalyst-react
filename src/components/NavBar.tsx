import { faUserFriends, faQuestion, faSync, faTh, faThLarge, faCompressAlt, faExpandAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tippy from "@tippyjs/react";
import React, { RefObject } from "react";
import { isMobile } from "react-device-detect";
import { FullScreenHandle } from "react-full-screen";
import { contactSupport } from "../utils/general";
import HeaderLogo from "./header/Header";
import 'tippy.js/dist/tippy.css';

const NavBar = ({
  fsHandle,
  headerRef,
  chatOpen,
  memberCount,
  cstmSupportUrl,
  disableRefreshBtn,
  handleComponentRefresh,
  speakerMode,
  setSpeakerMode,
}: {
  fsHandle: FullScreenHandle;
  headerRef: RefObject<HTMLDivElement>;
  chatOpen: boolean;
  memberCount: number;
  cstmSupportUrl?: string;
  disableRefreshBtn?: boolean;
  handleComponentRefresh: () => void;
  speakerMode: boolean;
  setSpeakerMode: Function;
}) => {
  return (
    <div id="header-wrapper" className="animate-fade-in-down" ref={headerRef}>
      <HeaderLogo alwaysBanner={false} />
      {/* room count */}
      <div
        className={`${
          chatOpen ? 'chat-open-shift' : ''
        } absolute z-50 flex nav-ops`}
      >
        <FontAwesomeIcon
          icon={faUserFriends}
          size="lg"
          className="mr-1 text-quinary"
        />
        <span className="text-quinary ">{memberCount}</span>

        {/* help */}
        {!(cstmSupportUrl?.length == 0) && (
          <Tippy content="Help" theme="catalyst" placement="bottom">
            <button
              className="ml-5 cursor-pointer focus:border-0 focus:outline-none"
              onClick={() => contactSupport(cstmSupportUrl)}
            >
              <FontAwesomeIcon
                icon={faQuestion}
                size="lg"
                className="text-quinary"
              />
            </button>
          </Tippy>
        )}
        {/* refresh */}
        {!disableRefreshBtn && (
          <Tippy content="Refresh" theme="catalyst" placement="bottom">
            <button
              className="ml-5 cursor-pointer focus:border-0 focus:outline-none"
              onClick={() => {
                handleComponentRefresh();
              }}
            >
              <FontAwesomeIcon
                icon={faSync}
                size="lg"
                className="text-quinary"
              />
            </button>
          </Tippy>
        )}
        {/* speaker mode toggle  */}
        <Tippy content="Toggle View" theme="catalyst" placement="bottom">
          <button
            className="ml-5 cursor-pointer focus:border-0 focus:outline-none"
            onClick={() => setSpeakerMode(sMode => !sMode)}
          >
            <FontAwesomeIcon
              icon={speakerMode ? faTh : faThLarge}
              size="lg"
              className="text-quinary"
            />
          </button>
        </Tippy>
        {/* full screen  */}
        {!isMobile && (
          <Tippy content="Full Screen" theme="catalyst" placement="bottom">
            <button
              className="ml-5 cursor-pointer focus:border-0 focus:outline-none"
              onClick={() => {
                if (fsHandle.active) fsHandle.exit();
                else fsHandle.enter();
              }}
            >
              <FontAwesomeIcon
                icon={fsHandle.active ? faCompressAlt : faExpandAlt}
                size="lg"
                className="text-quinary"
              />
            </button>
          </Tippy>
        )}
      </div>
    </div>
  );
};
export default NavBar;