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

import React from 'react';

const HeaderImg = React.memo(({ color }: { color?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.0"
      height="48"
      viewBox="0 0 1561.000000 421.000000"
      preserveAspectRatio="xMidYMid meet"
      className={`fill-current ${color ?? 'text-primary'}`}
    >
      <g
        transform="translate(0.000000,421.000000) scale(0.100000,-0.100000)"
        fill="#000000"
        stroke="none"
        className={`fill-current ${color ?? 'text-primary'}`}
      >
        <path d="M3790 3883 c-614 -58 -1138 -421 -1395 -966 -100 -213 -164 -470 -165 -664 l0 -53 -425 0 -425 0 0 450 0 450 -450 0 -450 0 0 -450 0 -450 448 0 449 0 7 -111 c28 -458 246 -898 591 -1187 298 -250 617 -379 1013 -408 l92 -7 0 427 0 426 -45 0 c-178 0 -425 110 -562 252 -144 149 -242 370 -243 551 l0 57 425 0 425 0 0 53 c0 111 56 279 132 399 141 220 433 388 674 388 l44 0 0 425 0 425 -52 -2 c-29 0 -69 -3 -88 -5z" />
        <path d="M10240 2200 l0 -840 175 0 175 0 0 840 0 840 -175 0 -175 0 0 -840z" />
        <path d="M5427 2970 c-119 -21 -278 -84 -361 -143 -58 -40 -158 -142 -198 -201 -95 -139 -138 -285 -138 -471 0 -247 79 -437 248 -597 88 -83 181 -138 297 -177 127 -42 218 -54 365 -48 214 9 394 78 530 204 38 36 70 68 70 73 0 4 -52 56 -115 115 l-115 107 -55 -51 c-31 -28 -90 -67 -131 -87 -69 -35 -83 -38 -183 -42 -176 -7 -275 26 -385 129 -207 193 -207 555 0 748 110 103 209 136 385 129 100 -4 114 -7 183 -42 41 -20 100 -59 130 -87 l56 -51 102 93 c57 50 109 97 116 104 20 18 -7 56 -86 121 -83 68 -175 116 -287 149 -75 23 -114 28 -235 31 -80 1 -167 -1 -193 -6z" />
        <path d="M7900 2700 l0 -150 -95 0 -95 0 0 -135 0 -135 94 0 95 0 3 -322 c3 -309 4 -325 26 -380 47 -117 156 -201 300 -228 86 -17 241 -8 317 19 104 37 102 32 55 157 -55 147 -50 141 -97 118 -52 -25 -149 -25 -187 -1 -15 10 -36 37 -47 60 -17 38 -19 69 -19 310 l0 267 155 0 155 0 0 135 0 135 -155 0 -155 0 0 150 0 150 -175 0 -175 0 0 -150z" />
        <path d="M13510 2700 l0 -150 -95 0 -95 0 0 -135 0 -135 94 0 95 0 3 -322 c3 -309 4 -325 26 -380 47 -117 156 -201 300 -228 86 -17 241 -8 317 19 104 37 102 32 55 157 -55 147 -50 141 -97 118 -52 -25 -149 -25 -187 -1 -15 10 -36 37 -47 60 -17 38 -19 69 -19 310 l0 267 155 0 155 0 0 135 0 135 -155 0 -155 0 0 150 0 150 -175 0 -175 0 0 -150z" />
        <path d="M6764 2585 c-105 -19 -181 -43 -259 -82 -38 -19 -74 -38 -78 -43 -9 -8 110 -253 121 -248 4 2 41 20 82 41 167 84 390 84 483 -1 27 -24 53 -80 61 -128 l7 -42 -223 -5 c-235 -5 -288 -13 -393 -61 -74 -33 -120 -79 -157 -153 -28 -57 -32 -75 -32 -147 1 -231 176 -376 454 -376 145 0 241 32 320 106 l50 47 0 -67 0 -66 165 0 165 0 0 403 c0 323 -3 415 -15 466 -45 189 -180 312 -388 355 -91 19 -262 20 -363 1z m416 -775 c0 -73 -24 -125 -77 -169 -101 -84 -289 -79 -355 9 -45 60 -27 154 36 187 48 25 89 31 249 32 l147 1 0 -60z" />
        <path d="M9154 2585 c-105 -19 -181 -43 -259 -82 -38 -19 -74 -38 -78 -43 -9 -8 110 -253 121 -248 4 2 41 20 82 41 167 84 390 84 483 -1 27 -24 53 -80 61 -128 l7 -42 -223 -5 c-235 -5 -288 -13 -393 -61 -74 -33 -120 -79 -157 -153 -28 -57 -32 -75 -32 -147 1 -231 176 -376 454 -376 145 0 241 32 320 106 l50 47 0 -67 0 -66 165 0 165 0 0 403 c0 323 -3 415 -15 466 -45 189 -180 312 -388 355 -91 19 -262 20 -363 1z m416 -775 c0 -73 -24 -125 -77 -169 -101 -84 -289 -79 -355 9 -45 60 -27 154 36 187 48 25 89 31 249 32 l147 1 0 -60z" />
        <path d="M12585 2593 c-141 -22 -262 -80 -335 -160 -120 -131 -117 -349 5 -462 80 -73 151 -99 383 -137 205 -33 262 -58 262 -113 0 -65 -59 -101 -176 -109 -141 -8 -318 29 -431 92 l-44 25 -30 -64 c-16 -36 -42 -94 -58 -130 l-30 -64 32 -20 c48 -30 200 -78 301 -96 49 -8 139 -15 200 -15 270 0 472 92 546 246 31 65 38 172 17 245 -42 143 -160 214 -433 259 -172 28 -239 48 -269 78 -28 27 -31 48 -13 86 41 92 319 100 506 15 36 -16 66 -28 67 -27 6 12 115 249 115 252 0 10 -127 58 -201 76 -83 21 -339 36 -414 23z" />
        <path d="M11007 1964 c263 -612 265 -617 250 -648 -23 -49 -68 -97 -104 -112 -18 -8 -59 -14 -92 -14 -49 0 -72 6 -127 35 -37 19 -68 34 -69 33 -1 -2 -30 -58 -65 -126 -71 -140 -72 -129 27 -177 73 -35 165 -55 258 -55 197 0 346 86 440 254 26 48 389 890 600 1394 l14 32 -172 0 -173 0 -169 -409 c-93 -225 -172 -408 -174 -405 -3 2 -79 185 -171 407 l-166 402 -186 3 -186 2 265 -616z" />
      </g>
    </svg>
  );
});
export default HeaderImg;
