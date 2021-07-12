import React, { RefObject, useRef, useState } from 'react';
import HeaderImg from './HeaderImg';

const Header = ({
  alwaysBanner,
  theme,
}: {
  alwaysBanner?: boolean;
  theme: string;
}) => {
  const headerRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <div
        className={`absolute left-0 top-0 block w-full text-center bg-${theme} p-1 text-white text-sm font-semibold z-4 ${
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
            <div
              id="header"
              className="focus:border-0 focus:outline-none bg-transparent cursor-pointer inline"
            >
              <HeaderImg themeColor={theme} />
            </div>
          </div>
        </>
      )}

      <div
        id="avoid-minifying-colors"
        className="hidden text-red text-orange text-yellow text-amber text-yellow text-lime text-emerald text-green text-sky text-blue text-cyan text-teal text-violet text-indigo text-purple text-fuchsia text-pink text-rose bg-red bg-orange bg-yellow bg-amber bg-yellow bg-lime bg-emerald bg-green bg-sky bg-blue bg-cyan bg-teal bg-violet bg-indigo bg-purple bg-fuchsia bg-pink bg-rose"
      />
    </div>
  );
};

export default Header;
