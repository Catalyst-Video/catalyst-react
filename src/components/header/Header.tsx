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
import HeaderImg from './HeaderImg';

const HeaderLogo = React.memo(
  ({ alwaysBanner }: { alwaysBanner?: boolean }) => {
    return (
      <div id="header">
        <div
          className={`absolute left-0 top-0 block w-full text-center bg-primary p-1 text-quinary  text-sm font-semibold z-40 ${
            alwaysBanner ? '' : 'header-bar'
          }`}
        >
          Powered by Catalyst
        </div>
        {!alwaysBanner && (
          <div className="absolute z-40 hidden sm:block not-selectable top-2 left-2">
            <div
              id="header-img-wrapper"
              className="inline bg-transparent header-img focus:border-0 focus:outline-none" //cursor-pointer
            >
              <HeaderImg />
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default HeaderLogo;
