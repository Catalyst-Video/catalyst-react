import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faCheckCircle, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import {
  faCircle,
} from '@fortawesome/free-regular-svg-icons';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Popover } from 'react-tiny-popover';
import React, {  RefObject, useState } from "react";

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

export const ToolbarButton = ({
         label,
         disabled,
         onClick,
         icon,
         devices,
         onDeviceClick,
         bgColor,
         iconColor,
         selectedDevice,
         parentRef,
       }: {
         label: string;
         disabled?: boolean;
         onClick?: () => void;
         icon?: IconProp;
         className?: string;
         devices?: Device[];
         onDeviceClick?: (id: Device) => void;
         bgColor?: string;
         iconColor?: string;
         selectedDevice?: MediaDeviceInfo;
         parentRef?: RefObject<HTMLDivElement>;
       }) => {
         const [deviceMenu, setDeviceMenu] = useState(false);

         const handleDeviceClick = (id: Device) => {
           if (onDeviceClick) {
             onDeviceClick(id);
           }
           setDeviceMenu(false);
         };

         return (
           <Popover
             isOpen={deviceMenu}
             positions={['top', 'right']}
             reposition={true}
             onClickOutside={() => setDeviceMenu(false)}
             containerStyle={{ zIndex: '40' }}
             containerParent={parentRef?.current ?? document.body}
             content={
               <div>
                 <ul style={popoverStyles}>
                   {devices?.map((id, i) => {
                     return (
                       <li
                         key={i}
                         className="flex items-center text-xs text-white"
                         style={{
                           //  color: 'white',
                           padding: '8px',
                           borderTop:
                             i > 0 ? '1px solid rgba(255, 255, 255, 0.2)' : '0',
                         }}
                         onClick={() => handleDeviceClick(id)}
                       >
                         {id.label === selectedDevice?.label ? (
                           <FontAwesomeIcon
                             icon={faCheckCircle}
                             className="mr-1 "
                           />
                         ) : (
                           <FontAwesomeIcon
                             icon={faCircle}
                             className="mr-1 "
                           />
                         )}
                         {id.label}
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
                     : 'bg-gray-600 dark:bg-gray-700 hover:bg-gray-500 dark:hover:bg-gray-600'
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
               {devices && devices.length > 0 && (
                 <button
                   disabled={disabled}
                   className={`absolute z-10 -right-1 -bottom-1 ${
                     bgColor
                       ? bgColor
                       : 'bg-gray-600 dark:bg-gray-700 hover:bg-gray-500 dark:hover:bg-gray-600'
                   }  rounded-full border-4 border-gray-700 h-6 w-6 flex justify-center items-center focus:outline-none focus:border-0 `}
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
       };
export default ToolbarButton;