import React from 'react';
import HeaderImg from './HeaderImg';

const HeaderLogo = ({
  alwaysBanner,
  theme,
}: {
  alwaysBanner?: boolean;
  theme: string;
}) => {

  return (
    <div id="header">
      <div
        className={`absolute left-0 top-0 block w-full text-center bg-${theme} p-1 text-white text-sm font-semibold z-40 ${
          alwaysBanner ? '' : 'sm:hidden'
        }`}
      >
        Powered by Catalyst
      </div>
      {!alwaysBanner && (
          <div
            className="hidden sm:block fixed not-selectable m-3 z-40"
          >
            <div
              id="header-img-wrapper"
              className="focus:border-0 focus:outline-none bg-transparent cursor-pointer inline"
            >
              <HeaderImg themeColor={theme} />
            </div>
          </div>
      )}

      <div
        id="avoid-minifying-colors"
        className="hidden text-red text-orange text-yellow text-amber text-yellow text-lime text-emerald text-green text-sky text-blue text-cyan text-teal text-violet text-indigo text-purple text-fuchsia text-pink text-rose bg-red bg-orange bg-yellow bg-amber bg-yellow bg-lime bg-emerald bg-green bg-sky bg-blue bg-cyan bg-teal bg-violet bg-indigo bg-purple bg-fuchsia bg-pink bg-rose"
      />
    </div>
  );
};

export default HeaderLogo;
