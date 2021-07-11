import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { ReactElement, useState } from "react";
import { Popover } from "react-tiny-popover";


interface ButtonProps {
  label: string;
  disabled?: boolean;
  onClick?: () => void;
  icon?: IconProp;
  className?: string;
  menuItems?: MenuItem[];
  onMenuItemClick?: (item: MenuItem) => void;
  bgColor?: string;iconColor?: string;
}

export interface MenuItem {
  label: string;
}

export const ControlButton = ({
         label,
         disabled,
         onClick,
         icon,
         className,
         menuItems,
         onMenuItemClick,
  bgColor,
         iconColor
       }: ButtonProps) => {
         const [menuVisible, setMenuVisible] = useState(false);

         let classes = 'button';
         if (className) {
           classes += ` ${className}`;
         }

         const handleMenuClick = (item: MenuItem) => {
           if (onMenuItemClick) {
             onMenuItemClick(item);
           }
           setMenuVisible(false);
         };

        //  let menuTrigger: ReactElement | undefined;
        //  let menu: ReactElement = <div />;
        //  if (menuItems && menuItems.length > 0) {
        //    classes += ` ${'hasDropdown'}`;
        //    menuTrigger = (
        //      <button
        //        disabled={disabled}
        //        className={`${'button'} ${'dropdown'}`}
        //        onClick={() => setMenuVisible(!menuVisible)}
        //      >
        //        <div className={'separator'} />
        //        <FontAwesomeIcon height={32} icon={faChevronDown} />
        //      </button>
        //    );

        //    menu = (
        //      <div className={'popoverMenu'}>
        //        <ul className={'list'}>
        //          {menuItems?.map((item, i) => {
        //            return (
        //              <li key={i} onClick={() => handleMenuClick(item)}>
        //                {item.label}
        //              </li>
        //            );
        //          })}
        //        </ul>
        //      </div>
        //    );
        //  }

         return (
           <Popover
             isOpen={menuVisible}
             positions={['bottom', 'right']}
             content={
               <>
                 <div className={'popoverMenu'}>
                   <ul className={'list'}>
                     {menuItems?.map((item, i) => {
                       return (
                         <li key={i} onClick={() => handleMenuClick(item)}>
                           {item.label}
                         </li>
                       );
                     })}
                   </ul>
                 </div>
               </>
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
                 {/* {label} */}
               </button>
               {menuItems && menuItems.length > 0 && (
               <button
                 disabled={disabled}
                 className={`absolute z-10 -right-1 -bottom-1 ${
                   bgColor ? bgColor : 'bg-gray-600 hover:bg-gray-500'
                 }  rounded-full border-4 border-gray-700 h-6 w-6 flex justify-center items-center `}
                 onClick={() => setMenuVisible(!menuVisible)}
               >
                 <FontAwesomeIcon
                   size="xs"
                   className={
                   iconColor ? 'text-gray-900' : 'text-white'
                 }
                   icon={faChevronDown}
                 />
               </button>
               )} 
             </div>
           </Popover>
         );
       };
