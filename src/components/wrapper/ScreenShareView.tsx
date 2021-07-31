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

import { faDesktop } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Property } from 'csstype';
import { Track } from 'livekit-client';
import React from 'react';
import VidWrapper from './VidWrapper';

const ScreenShareWrapper = ({
  track,
  width,
  height,
  classes,
  onClick,
}: {
  track: Track;
  width?: Property.Width;
  height?: Property.Height;
  classes?: string;
  onClick?: () => void;
}) => {
  return (
    <div className={classes} onClick={onClick}>
      <div
        className="relative z-0 inline-block align-middle self-center overflow-hidden text-center bg-gray-800 rounded-lg m-1"
        style={{
          height: height,
          width: width,
        }}
      >
        <VidWrapper track={track} isLocal={false} />
        <div className="absolute bottom-0 left-0 flex text-white justify-end p-2 w-full">
          <div className="relative h-7 w-7 md:h-8 md:w-8 flex items-center justify-center p-1">
            <span className="absolute rounded-full top-0 left-0 opacity-50 bg-secondary  w-full h-full"></span>
            <FontAwesomeIcon
              icon={faDesktop}
              size="2x"
              className={`text-white not-selectable p-2 z-30`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenShareWrapper;
