import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { Popover } from "react-tiny-popover";

export interface MenuItem {
  label: string;
}

export const ControlButton = ({
         label,
         disabled,
         onClick,
         icon,
         devices,
         onMenuItemClick,
         bgColor,
         iconColor,
       }: {
         label: string;
         disabled?: boolean;
         onClick?: () => void;
         icon?: IconProp;
         className?: string;
         devices?: MenuItem[];
         onMenuItemClick?: (item: MenuItem) => void;
         bgColor?: string;
         iconColor?: string;
       }) => {
         const [deviceMenu, setDeviceMenu] = useState(false);

         const handleDeviceClick = (item: MenuItem) => {
           if (onMenuItemClick) {
             onMenuItemClick(item);
           }
           setDeviceMenu(false);
         };

         return (
           <Popover
             isOpen={deviceMenu}
             positions={['bottom', 'right']}
             reposition={true}
             onClickOutside={() => setDeviceMenu(false)}
             content={
               <div className="bg-gray-600 rounded-md mb-3 z-20 bullet-none">
                 <ul
                   style={{
                     cursor: 'pointer',
                     listStyle: 'none',
                     background: '#4B5563',
                     borderRadius: '5px',
                     padding: '4px',
                     margin: 0,
                     paddingInline: 'none',
                     marginBottom: '7px',
                     fontFamily:
                       'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
                   }}
                   className="bg-gray-600 border-0 margin-0 bullet-none p-5 cursor-pointer"
                 >
                   {devices?.map((item, i) => {
                     return (
                       <li
                         key={i}
                         style={{
                           color: 'white',
                           padding: 1,
                         }}
                         //  className="text-white bullet-none p-1"
                         onClick={() => handleDeviceClick(item)}
                       >
                         {item.label}
                       </li>
                     );
                   })}
                 </ul>
               </div>
             }
           >
             <div className="inline-block m-1 relative">
               {/* whitespace-nowrap */}
               <button
                 disabled={disabled}
                 className={`rounded-full w-16 h-16 flex justify-center items-center ${
                   bgColor ? bgColor : 'bg-gray-600 hover:bg-gray-500'
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
                     bgColor ? bgColor : 'bg-gray-600 hover:bg-gray-500'
                   }  rounded-full border-4 border-gray-700 h-6 w-6 flex justify-center items-center focus:outline-none focus:border-0 `}
                   onClick={() => setDeviceMenu(!deviceMenu)}
                 >
                   <FontAwesomeIcon
                     size="xs"
                     className={iconColor ? 'text-gray-900' : 'text-white'}
                     icon={deviceMenu ? faChevronUp : faChevronDown}
                   />
                 </button>
               )}
             </div>
           </Popover>
         );
       };
