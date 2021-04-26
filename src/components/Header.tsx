import React, { RefObject, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const Header = ({
  autoFade,
  sessionKey,
  alwaysBanner,
  toolbarRef,
  uniqueAppId,
}: {
  autoFade: number;
  sessionKey: string;
  alwaysBanner: boolean | undefined;
  toolbarRef: RefObject<HTMLDivElement>;
  uniqueAppId: string;
}) => {
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  // fade or show UI on mouse move
  if (autoFade > 0 && toolbarRef) {
    var timedelay = 1;
    const delayCheck = () => {
      if (timedelay === 5) {
        headerRef.current?.classList.add('hide');
        headerRef.current?.classList.remove('show');
        toolbarRef.current?.classList.add('hide');
        toolbarRef.current?.classList.remove('show');
        timedelay = 1;
      }
      timedelay += 1;
    };
    document.addEventListener('mousemove', () => {
      headerRef.current?.classList.add('show');
      headerRef.current?.classList.remove('hide');
      toolbarRef.current?.classList.add('show');
      toolbarRef.current?.classList.remove('hide');
      timedelay = 1;
      clearInterval(_delay);
      _delay = setInterval(delayCheck, autoFade);
    });
    var _delay = setInterval(delayCheck, autoFade);
  }

  return (
    <div className="show-top">
      <div className={alwaysBanner ? 'header-banner' : 'mobile-banner'}>
        Powered by Catalyst
      </div>
      {!alwaysBanner && (
        <>
          <div id="ct-header" ref={headerRef} className="ct-not-selectable">
            <button
              className="ct-header-btn"
              style={{ display: 'inline' }}
              onClick={() => setShowSessionDetails(!showSessionDetails)}
            >
              <HeaderImg />
            </button>
          </div>
          {showSessionDetails && (
            <button
              className="session-details-btn"
              onClick={() => setShowSessionDetails(!showSessionDetails)}
            >
              <span className="session-details-title">
                <strong>Session Details</strong>
                <FontAwesomeIcon
                  icon={faTimes}
                  size="lg"
                  title="Close Session Details"
                  className="session-details-close"
                />
              </span>
              Room:<i> {sessionKey}</i>
              <br />
              UUID: <i>{uniqueAppId}</i>
              <br />
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Header;

const HeaderImg = () => {
  return (
    <svg
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      height="48"
      viewBox="0 0 2327.000000 813.000000"
      preserveAspectRatio="xMidYMid meet"
      className="ct-header-logo"
    >
      <g
        transform="translate(0.000000,813.000000) scale(0.100000,-0.100000)"
        className="ct-header-logo"
        stroke="none"
      >
        <path
          d="M3415 6614 c-102 -8 -333 -46 -433 -70 -275 -67 -568 -196 -804 -353
-367 -244 -660 -570 -859 -955 -269 -522 -350 -1087 -238 -1666 72 -377 235
-743 473 -1059 88 -118 271 -308 396 -414 315 -265 722 -460 1128 -542 201
-40 298 -49 517 -49 299 0 536 39 820 135 642 216 1185 698 1481 1314 188 390
275 837 245 1258 -46 637 -285 1179 -721 1631 -392 406 -899 662 -1490 751
-103 15 -417 27 -515 19z m283 -1275 c79 -126 163 -293 200 -401 46 -128 63
-229 63 -353 0 -189 -39 -336 -147 -543 -63 -122 -200 -342 -213 -342 -3 0
-29 37 -58 83 -210 338 -293 567 -293 811 0 170 36 315 124 501 52 110 156
290 204 354 l25 34 18 -24 c9 -13 44 -67 77 -120z m-1069 -1035 c377 -197 591
-408 690 -681 58 -157 66 -222 66 -515 0 -146 -3 -269 -6 -273 -8 -7 -110 43
-224 110 -476 282 -653 555 -681 1052 -8 143 3 373 19 373 6 0 67 -30 136 -66z
m2104 -71 c7 -140 -4 -348 -24 -457 -57 -314 -218 -540 -534 -751 -122 -81
-334 -199 -343 -190 -11 11 -21 140 -21 273 -2 311 54 537 179 723 67 100 221
246 353 333 110 73 349 205 373 206 7 0 13 -48 17 -137z"
        />
        <path
          d="M15890 4110 l0 -1380 290 0 290 0 0 1380 0 1380 -290 0 -290 0 0
-1380z"
        />
        <path
          d="M8305 5356 c-331 -56 -584 -184 -798 -405 -237 -246 -357 -551 -357
-911 0 -313 86 -584 257 -811 201 -267 484 -440 837 -511 150 -31 460 -33 611
-4 192 36 375 108 521 206 79 53 244 206 244 226 0 9 -320 312 -360 341 -14
10 -27 2 -83 -52 -167 -160 -357 -235 -596 -235 -399 0 -702 228 -802 605 -31
117 -31 348 0 460 43 158 120 287 235 391 85 78 157 120 274 160 316 109 646
42 877 -177 40 -38 76 -69 80 -69 12 0 376 342 373 351 -2 5 -36 43 -77 84
-162 163 -381 278 -644 336 -119 27 -469 35 -592 15z"
        />
        <path
          d="M12200 4930 l0 -240 -155 0 -155 0 0 -225 0 -225 154 0 155 0 3 -492
c4 -467 5 -497 25 -569 27 -95 79 -200 128 -257 78 -90 208 -161 361 -198 107
-26 343 -24 459 5 89 22 235 84 235 100 0 7 -41 117 -141 378 l-8 23 -33 -19
c-97 -57 -255 -66 -336 -21 -42 24 -80 70 -104 125 -9 22 -13 145 -16 478 l-3
447 250 0 251 0 0 225 0 225 -250 0 -250 0 0 240 0 240 -285 0 -285 0 0 -240z"
        />
        <path
          d="M21030 4930 l0 -240 -155 0 -155 0 0 -225 0 -225 154 0 155 0 4 -492
c4 -552 3 -548 79 -707 73 -154 213 -259 413 -312 117 -31 354 -31 480 0 96
23 235 85 235 103 0 10 -135 370 -147 390 -2 4 -19 -2 -38 -13 -74 -44 -205
-61 -289 -38 -21 6 -58 28 -81 50 -75 69 -75 71 -75 576 l0 443 245 0 245 0 0
225 0 225 -245 0 -245 0 0 240 0 240 -290 0 -290 0 0 -240z"
        />
        <path
          d="M10590 4754 c-272 -26 -490 -88 -661 -188 l-77 -45 90 -178 c50 -98
97 -188 104 -200 l14 -22 61 39 c131 85 330 140 504 140 227 0 369 -68 432
-206 20 -45 43 -139 43 -181 0 -10 -68 -13 -307 -13 -409 0 -536 -19 -713
-104 -62 -29 -103 -58 -152 -107 -112 -110 -156 -235 -145 -417 12 -220 125
-385 332 -483 100 -47 177 -67 307 -79 162 -16 340 7 462 60 73 31 170 104
207 155 18 25 36 45 41 45 4 0 8 -54 8 -120 l0 -120 266 0 265 0 -4 668 c-4
731 -3 715 -67 879 -106 272 -354 435 -721 473 -95 9 -210 11 -289 4z m510
-1291 c0 -101 -2 -111 -29 -159 -42 -73 -127 -146 -208 -180 -62 -25 -79 -28
-193 -28 -114 -1 -130 1 -181 25 -102 48 -149 118 -149 223 0 111 70 181 210
212 34 8 148 13 303 13 l247 1 0 -107z"
        />
        <path
          d="M14305 4749 c-124 -12 -270 -43 -379 -80 -97 -33 -246 -104 -284
-135 l-23 -19 101 -198 c68 -132 105 -195 113 -190 7 4 35 21 62 38 60 38 176
86 270 111 55 14 105 18 230 18 145 0 166 -2 220 -23 33 -13 76 -34 96 -47 79
-49 136 -150 146 -258 l6 -66 -306 0 c-408 0 -534 -19 -713 -105 -160 -77
-254 -196 -290 -365 -30 -141 0 -312 76 -430 47 -73 149 -162 234 -204 125
-62 247 -88 416 -88 278 -1 458 68 581 224 l39 50 0 -126 0 -126 270 0 270 0
0 573 c0 690 -8 793 -71 967 -46 126 -159 266 -274 339 -188 119 -473 170
-790 140z m555 -1292 l0 -114 -38 -59 c-88 -135 -236 -202 -427 -192 -157 9
-260 79 -286 195 -24 104 22 196 118 240 78 36 121 41 391 42 l242 1 0 -113z"
        />
        <path
          d="M19705 4754 c-16 -2 -64 -9 -105 -15 -458 -65 -723 -336 -680 -695
11 -92 19 -124 50 -184 36 -72 85 -125 163 -178 108 -71 251 -116 511 -157
241 -39 335 -60 387 -86 121 -61 119 -194 -4 -253 -78 -38 -170 -49 -331 -43
-204 8 -389 54 -549 137 -44 22 -82 40 -86 40 -14 0 -194 -401 -185 -410 21
-21 165 -84 262 -116 206 -67 444 -99 647 -89 356 18 589 103 747 274 120 129
163 299 123 486 -42 199 -182 327 -435 399 -47 13 -168 38 -270 56 -277 47
-328 59 -390 90 -67 34 -93 69 -94 125 -2 75 61 136 172 166 84 24 291 26 414
4 92 -16 233 -62 311 -102 27 -13 50 -23 52 -21 2 2 44 92 95 201 57 122 89
202 83 208 -17 17 -178 78 -274 104 -52 13 -139 32 -194 40 -99 15 -363 27
-420 19z"
        />
        <path
          d="M17045 3793 c221 -516 416 -970 433 -1009 l30 -71 -31 -64 c-42 -84
-117 -160 -181 -182 -114 -39 -281 -12 -392 62 l-58 39 -19 -30 c-27 -45 -187
-366 -187 -376 0 -16 102 -77 180 -109 128 -53 216 -68 385 -67 132 1 161 4
240 28 215 65 363 190 484 409 22 39 239 542 484 1117 244 575 458 1078 475
1118 l31 72 -277 0 -277 0 -280 -675 c-154 -371 -283 -675 -286 -675 -3 0
-131 304 -284 675 l-279 675 -297 0 -297 0 403 -937z"
        />
      </g>
    </svg>
  );
};
export { HeaderImg };
