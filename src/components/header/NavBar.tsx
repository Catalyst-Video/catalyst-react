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

import {
  faUserFriends,
  faQuestion,
  faSync,
  faTh,
  faThLarge,
  faCompressAlt,
  faExpandAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import React, { RefObject } from 'react';
import { isMobile } from 'react-device-detect';
import { FullScreenHandle } from 'react-full-screen';
import { contactSupport } from '../../utils/general';
import HeaderLogo from './Header';
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
