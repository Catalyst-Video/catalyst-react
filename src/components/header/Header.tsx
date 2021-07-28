import React from 'react';
import HeaderImg from './HeaderImg';

const HeaderLogo = React.memo(({
  alwaysBanner,
}: {
  alwaysBanner?: boolean;
}) => {

  return (
    <div id="header">
      <div
        className={`absolute left-0 top-0 block w-full text-center bg-accent p-1 text-white text-sm font-semibold z-40 ${
          alwaysBanner ? '' : 'sm:hidden'
        }`}
      >
        Powered by Catalyst
      </div>
      {!alwaysBanner && (
          <div
            className="hidden sm:block absolute not-selectable top-2 left-2 z-40"
          >
            <div
              id="header-img-wrapper"
              className="focus:border-0 focus:outline-none bg-transparent cursor-pointer inline"
            >
              <HeaderImg />
            </div>
          </div>
      )}

      {/* <div
        id="avoid-minifying-colors"
        className="hidden text-red text-orange text-yellow text-amber text-yellow text-lime text-emerald text-green text-sky text-blue text-cyan text-teal text-violet text-indigo text-purple text-fuchsia text-pink text-rose bg-red bg-orange bg-yellow bg-amber bg-yellow bg-lime bg-emerald bg-green bg-sky bg-blue bg-cyan bg-teal bg-violet bg-indigo bg-purple bg-fuchsia bg-pink bg-rose"
      /> */}
    </div>
  );
});

export default HeaderLogo;
