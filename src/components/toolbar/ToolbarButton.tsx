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
import { Popover } from 'react-tiny-popover';
import React, { RefObject, useState } from 'react';

export interface Device {
  label: string;
}

const popoverStyles = {
  cursor: 'pointer',
  listStyle: 'none',
  background: '#4B5563',
  borderRadius: '5px',
  padding: 0,
  margin: 0,
  paddingInline: 'none',
  marginBottom: '10px',
  fontFamily:
    'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
};

const ToolbarButton = React.memo(({
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
  parentRef,
}: {
  type?: string;
  tooltip?: string;
  disabled?: boolean;
  onClick?: () => void;
  icon?: IconProp;
  className?: string;
  inputDevices?: Device[];
  outputDevices?: Device[];
  onIpDeviceClick?: (id: Device) => void;
  onOpDeviceClick?: (id: Device) => void;
  bgColor?: string;
  iconColor?: string;
  selectedOpDevice?: MediaDeviceInfo;
  selectedIpDevice?: MediaDeviceInfo;
  parentRef?: RefObject<HTMLDivElement>;
}) => {
  const [deviceMenu, setDeviceMenu] = useState(false);

  const handleOnIpDeviceClick = (id: Device) => {
    if (onIpDeviceClick) {
      onIpDeviceClick(id);
    }
    setDeviceMenu(false);
  };

  const handleOnOpDeviceClick = (id: Device) => {
    if (onOpDeviceClick) {
      onOpDeviceClick(id);
    }
    setDeviceMenu(false);
  };

  // console.log(parentRef?.current);

  return (
    <Popover
      isOpen={deviceMenu}
      positions={['top']}
      reposition={false}
      onClickOutside={() => setDeviceMenu(false)}
      containerStyle={{ zIndex: '40' }}
      // contentLocation={{
      //   left: 0,
      //   top: 20,
      // }}
      // boundaryInset={0}
      // boundaryTolerance={0}
      containerParent={parentRef?.current ?? document.body}
      content={
        <div>
          <ul style={popoverStyles}>
            {outputDevices && outputDevices.length > 0 && (
              <>
                <li
                  key={'input-row'}
                  className="flex items-center text-xs lg:text-sm text-white font-semibold p-2"
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
                      className="flex items-center text-xs lg:text-sm text-white p-2"
                      style={{
                        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                      }}
                      onClick={() => handleOnOpDeviceClick(id)}
                    >
                      {id.label === selectedOpDevice?.label ? (
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
              </>
            )}
            <li
              key={'input-row'}
              className="flex items-center text-xs lg:text-sm text-white font-semibold p-2"
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
                  className="flex items-center text-xs lg:text-sm text-white p-2"
                  style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
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
      }
    >
      <div className="inline-block m-1 relative">
        <button
          disabled={disabled}
          className={`rounded-full w-16 h-16 flex justify-center items-center ${
            bgColor
              ? bgColor
              : 'bg-tertiary dark:bg-secondary hover:bg-quaternary dark:hover:bg-tertiary'
          } focus:outline-none focus:border-0 `}
          onClick={onClick}
        >
          {icon && (
            <FontAwesomeIcon
              className={
                iconColor ? iconColor : 'text-white hover:text-gray-50'
              }
              size="lg"
              icon={icon}
            />
          )}
          {/*TODO: tooltip {label} */}
        </button>
        {inputDevices && inputDevices.length > 0 && (
          <button
            disabled={disabled}
            className={`absolute z-10 -right-1 -bottom-1 ${
              bgColor
                ? bgColor
                : 'bg-tertiary dark:bg-secondary hover:bg-quaternary dark:hover:bg-tertiary'
            }  rounded-full border-4 border-secondary h-6 w-6 flex justify-center items-center focus:outline-none focus:border-0 `}
            onClick={() => setDeviceMenu(!deviceMenu)}
          >
            <FontAwesomeIcon
              size="xs"
              className={`transition transform hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:transform-none  ${
                iconColor ? 'text-gray-900' : 'text-white'
              }`}
              icon={deviceMenu ? faChevronUp : faChevronDown}
            />
          </button>
        )}
      </div>
    </Popover>
  );
})
export default ToolbarButton;
