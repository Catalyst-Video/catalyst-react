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

import { faSync } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

const SlowLoadingMessage = ({ onRefresh }: { onRefresh: Function }) => {
  return (
    <div className="absolute bottom-0 flex flex-col py-2 justify-center w-full animate-fade-in-up">
      <div className="py-1 text-sm text-center">Having connection issues?</div>
      <button
        className="cursor-pointer focus:border-0 focus:outline-none text-center"
        onClick={() => onRefresh()}
      >
        <span className="pr-2 text-primary text-base">Refresh</span>
        <FontAwesomeIcon
          icon={faSync}
          size="sm"
          className="inline text-primary"
        />
      </button>
    </div>
  );
};
export default SlowLoadingMessage;
