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

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faCheckCircle,
  faChevronDown,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import { faCircle } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { RefObject, useState } from 'react';
import { CatalystDev } from '../../typings/interfaces';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { useRef } from 'react';
import { SUPPORT_URL } from '../../utils/globals';
import { isMobile } from 'react-device-detect';

const ToolbarButton = React.memo(
  ({
    type,
    tooltip,
    disabled,
    onClick,
    icon,
    inputDevices,
    outputDevices,
    onIpDeviceClick,
    onOpDeviceClick,
    bgColor,
    iconColor,
    selectedOpDevice,
    selectedIpDevice,
    chatOpen,
    cstmSupportUrl,
  }: {
    type?: string;
    tooltip?: string;
    disabled?: boolean;
    onClick?: () => void;
    icon?: IconProp;
    className?: string;
    inputDevices?: CatalystDev[];
    outputDevices?: CatalystDev[];
    onIpDeviceClick?: (id: CatalystDev) => void;
    onOpDeviceClick?: (id: CatalystDev) => void;
    bgColor?: string;
    iconColor?: string;
    selectedOpDevice?: MediaDeviceInfo;
    selectedIpDevice?: MediaDeviceInfo;
    chatOpen?: boolean;
    cstmSupportUrl?: string;
  }) => {
    const [deviceSelectEnabled, setDeviceSelectEnabled] = useState(false);
    const selectRef = useRef<HTMLButtonElement>(null);

    const handleOnIpDeviceClick = (id: CatalystDev) => {
      if (onIpDeviceClick) {
        onIpDeviceClick(id);
      }
      setDeviceSelectEnabled(false);
    };

    const handleOnOpDeviceClick = (id: CatalystDev) => {
      if (onOpDeviceClick) {
        onOpDeviceClick(id);
      }
      setDeviceSelectEnabled(false);
    };

    return (
      <Tippy
        interactive
        triggerTarget={selectRef.current}
        className="bg-tertiary font-sans"
        trigger="click"
        disabled={!inputDevices && !outputDevices}
        onShown={() => {
          setDeviceSelectEnabled(true);
        }}
        onHidden={() => {
          setDeviceSelectEnabled(false);
        }}
        content={
          outputDevices || inputDevices ? (
            inputDevices?.length === 0 && !isMobile ? (
              <div className="font-sans flex flex-col justify-center items-center text-center text-quinary text-c">
                <span className="block mb-1">
                  Catalyst couldn't find any {type?.toLowerCase()} devices.
                </span>
                <span className="inline-block mb-1">
                  If you are having trouble,{' '}
                  <a
                    className="text-primary whitespace-nowrap font-semibold"
                    href="https://docs.catalyst.chat/docs-permissions"
                    target="_blank"
                    rel="noreferrer"
                  >
                    read our guide here
                  </a>
                  ,
                </span>
                <span className="block mb-1">
                  or{' '}
                  <a
                    className="text-primary font-semibold"
                    target="_blank"
                    rel="noreferrer"
                    href={cstmSupportUrl && cstmSupportUrl?.length > 0 ? cstmSupportUrl : SUPPORT_URL}
                  >
                    contact support
                  </a>
                </span>
              </div>
            ) : 
              inputDevices?.length !==
              0  && (
              <div>
                <ul
                  className="font-sans list-none m-0 p-0" //style={popoverStyles}
                >
                  {outputDevices && outputDevices.length > 0 && (
                    <>
                      <li
                        key={'input-row'}
                        className="flex items-center text-xs text-quinary  font-semibold p-2 border-white  border-b border-opacity-20 whitespace-nowrap "
                      >
                        {type} Output
                      </li>
                      {outputDevices?.map((id, i) => {
                        // TODO: add prop to allow for enabling showing device ids
                        let idLabel = id.label.includes('(')
                          ? id.label.substring(0, id.label.indexOf('('))
                          : id.label;
                        return (
                          <li
                            key={i}
                            className="flex items-center text-xs text-quinary  p-2 cursor-pointer whitespace-nowrap"
                            onClick={() => handleOnOpDeviceClick(id)}
                          >
                            {id.label === selectedOpDevice?.label ? (
                              <FontAwesomeIcon
                                icon={faCheckCircle}
                                className="mr-1 text-primary "
                              />
                            ) : (
                              <FontAwesomeIcon
                                icon={faCircle}
                                className="mr-1 "
                              />
                            )}
                            {idLabel}
                          </li>
                        );
                      })}
                    </>
                  )}
                  <li
                    key={'input-row'}
                    className="flex items-center text-xs text-quinary  font-semibold p-2 border-white  border-b border-opacity-20 whitespace-nowrap"
                  >
                    {type} Input
                  </li>
                  {inputDevices?.map((id, i) => {
                    // TODO: add prop to allow for enabling showing device ids
                    let idLabel = id.label.includes('(')
                      ? id.label.substring(0, id.label.indexOf('('))
                      : id.label;
                    return (
                      <li
                        key={i}
                        className="flex items-center text-xs text-quinary  p-2 whitespace-nowrap cursor-pointer"
                        onClick={() => handleOnIpDeviceClick(id)}
                      >
                        {id.label === selectedIpDevice?.label ? (
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="mr-1 text-primary"
                          />
                        ) : (
                          <FontAwesomeIcon icon={faCircle} className="mr-1 " />
                        )}
                        {idLabel}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )
          ) : null
        }
      >
        <div className="inline-block m-1 relative">
          <Tippy
            content={tooltip}
            theme="catalyst"
            disabled={deviceSelectEnabled}
            zIndex={40}
          >
            <button
              id={`${type}-btn`}
              disabled={disabled}
              className={`rounded-full w-14 h-14 flex justify-center items-center ${
                bgColor ? bgColor : 'bg-tertiary hover:bg-quaternary'
              } focus:outline-none focus:border-0 `}
              onClick={onClick}
            >
              {icon && (
                <FontAwesomeIcon
                  className={
                    iconColor ? iconColor : 'text-quinary  hover:text-gray-50'
                  }
                  size="lg"
                  icon={icon}
                />
              )}
            </button>
          </Tippy>
          {inputDevices && inputDevices.length > 0 && (
            <button
              disabled={disabled}
              ref={selectRef}
              className={`absolute z-10 -right-1 -bottom-1 ${
                bgColor ? bgColor : 'bg-tertiary hover:bg-quaternary '
              }  rounded-full border-4 border-secondary h-6 w-6 flex justify-center items-center focus:outline-none`}
              onClick={() => setDeviceSelectEnabled(deviceMenu => !deviceMenu)}
            >
              <FontAwesomeIcon
                size="xs"
                className={`transition transform hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:transform-none  ${
                  iconColor ? 'text-gray-900' : 'text-quinary'
                }`}
                icon={deviceSelectEnabled ? faChevronUp : faChevronDown}
              />
            </button>
          )}
        </div>
      </Tippy>
    );
  }
);
export default ToolbarButton;
