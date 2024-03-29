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
  faGlasses,
  faPhotoVideo,
  faVolumeUp,
} from '@fortawesome/free-solid-svg-icons';
import { faCircle } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { RefObject, useState } from 'react';
import { BgRemovalOps, CatalystDev } from '../../typings/interfaces';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { useRef } from 'react';
import { BUILT_IN_BACKGROUNDS, SUPPORT_URL } from '../../utils/globals';
import { isMobile } from 'react-device-detect';


const ToolbarButton = React.memo(
  ({
    ref,
    type,
    tooltip,
    disabled,
    disabledTooltip,
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
    bgRemovalEffect,
    setBgRemovalEffect,
    bgRemovalEnabled,
  }: {
    ref?: RefObject<HTMLButtonElement>;
    type?: string;
    tooltip?: string;
    disabled?: boolean;
    disabledTooltip?: boolean;
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
    bgRemovalEffect?: string;
    setBgRemovalEffect?: Function;
    bgRemovalEnabled?: boolean;
  }) => {
    const [deviceSelectEnabled, setDeviceSelectEnabled] = useState(false);
    const selectRef = useRef<HTMLButtonElement>(null);
    const [audioTestPlaying, setAudioTestPlaying] = useState(false);
    const audioTestRef = useRef<HTMLAudioElement>(null);
    const [bgRemovalOps] = useState<BgRemovalOps>([
      'none',
      'blur',
      !bgRemovalEffect ||
      bgRemovalEffect === 'none' ||
      bgRemovalEffect === 'blur'
        ? BUILT_IN_BACKGROUNDS[
            Math.floor(Math.random() * BUILT_IN_BACKGROUNDS.length)
          ]
        : bgRemovalEffect,
    ]);

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
          if (audioTestPlaying) setAudioTestPlaying(false);
          // if (showBgRemovalOps) setShowBgRemovalOps(false);
        }}
        content={
          // !showBgRemovalOps ?
          //   (
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
                    href={
                      cstmSupportUrl && cstmSupportUrl?.length > 0
                        ? cstmSupportUrl
                        : SUPPORT_URL
                    }
                  >
                    contact support
                  </a>
                </span>
              </div>
            ) : (
              inputDevices?.length !== 0 && (
                <div>
                  <ul
                    className="font-sans list-none m-0 p-0" //style={popoverStyles}
                  >
                    {outputDevices && outputDevices.length > 0 && (
                      <>
                        <li
                          key={'input-row'}
                          className="flex items-center text-xs text-quinary font-semibold p-1 border-white border-b border-opacity-20 whitespace-nowrap "
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
                              className="flex items-center text-xs text-quinary p-1 cursor-pointer whitespace-nowrap"
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
                      className="flex items-center text-xs text-quinary font-semibold p-1 border-white border-b border-opacity-20 whitespace-nowrap"
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
                          className="flex items-center text-xs text-quinary p-1 whitespace-nowrap cursor-pointer"
                          onClick={() => handleOnIpDeviceClick(id)}
                        >
                          {id.label === selectedIpDevice?.label ? (
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              className="mr-1 text-primary"
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
                    {type?.toLowerCase() === 'audio' && (
                      <button
                        className="flex items-center text-xs text-quinary p-1 mt-1 w-full whitespace-nowrap border-white border-t border-opacity-20 focus:outline-none focus:border-0 focus:ring-1 focus:ring-primary"
                        onClick={() => audioTestRef.current?.play()}
                      >
                        <FontAwesomeIcon
                          icon={faVolumeUp}
                          className={`mr-1 ${
                            audioTestPlaying ? 'text-primary' : 'text-quinary'
                          }`}
                        />
                        {audioTestPlaying ? (
                          <> Testing {type}...</>
                        ) : (
                          <> Test {type} Output</>
                        )}
                        <audio
                          onPlay={() => setAudioTestPlaying(true)}
                          onEnded={() => setAudioTestPlaying(false)}
                          ref={audioTestRef}
                          //src={audioTest} //{require('../../assets/sounds/audio-test.mp3')}
                        >
                          <source src="https://github.com/Catalyst-Video/catalyst-react/blob/master/src/assets/sounds/audio-test.mp3?raw=true"></source>
                        </audio>
                      </button>
                    )}{' '}
                    {type?.toLowerCase() === 'video' && bgRemovalEnabled && (
                      <div>
                        <li
                          key={'input-row'}
                          className="flex items-center text-xs text-quinary font-semibold p-1 whitespace-nowrap border-white border-b border-opacity-20"
                        >
                          Background Filter
                        </li>
                        {bgRemovalOps.map((op: string, i) => {
                          return (
                            <button
                              key={'bg-rm' + i}
                              className={`flex items-center text-xs text-quinary p-1 w-full whitespace-nowrap focus:outline-none focus:border-0 focus:ring-1 focus:ring-primary capitalize`}
                              onClick={() => {
                                if (setBgRemovalEffect) setBgRemovalEffect(op);
                                // console.log(op, bgRemoval);
                              }}
                            >
                              <FontAwesomeIcon
                                icon={
                                  op === bgRemovalEffect
                                    ? faCheckCircle
                                    : faCircle
                                }
                                className={`mr-1 ${
                                  op === bgRemovalEffect
                                    ? 'text-primary'
                                    : 'text-quinary'
                                }`}
                              />
                              <span className="capitalize">
                                {op === 'blur'
                                  ? 'Blur'
                                  : op === 'none'
                                  ? 'None'
                                  : 'Image'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </ul>
                </div>
              )
            )
          ) : null
          // ) : (
          //   <div>
          //     <li
          //       key={'input-row'}
          //       className="flex items-center text-xs text-quinary font-semibold p-2 border-white border-b border-opacity-20 whitespace-nowrap flex-row flex-wrap "
          //     >
          //       Background Removal
          //     </li>
          //     {BUILT_IN_BACKGROUNDS.map((bg, i) => (
          //       <button
          //         className={`items-center text-xs text-quinary p-2 mt-1 w-full whitespace-nowrap focus:outline-none focus:border-0 focus:ring-1 focus:ring-primary`}
          //         onClick={() => setShowBgRemovalOps(true)}
          //       >
          //         <img
          //           src={bg}
          //           alt="builtin-bg"
          //           className="w-20"
          //           key={bg + i}
          //         />
          //       </button>
          //     ))}
          //   </div>
          // )
        }
      >
        <div className="inline-block m-1 relative">
          <Tippy
            content={tooltip}
            theme="catalyst"
            disabled={deviceSelectEnabled || disabledTooltip}
            zIndex={40}
            // onHidden={() => {
            //   setDeviceSelectEnabled(false);
            // }}
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
              ref={ref ?? selectRef}
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
