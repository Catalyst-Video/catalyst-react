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

import React, { useState } from 'react';
import { CatalystChatWrapperProps } from './typings/interfaces';

import CatalystChat from './CatalystChat';

const CatalystChatWrapper = (props: CatalystChatWrapperProps) => {
  const [refreshTriggerKey, setRefreshTriggerKey] = useState(0);

  // Refresh function that will trigger the component to re-mount. The root component also takes in a prop, handleComponentRefresh, that will also be called
  const handleRefresh = () => {
    if (props.onComponentRefresh) props.onComponentRefresh();
    setRefreshTriggerKey(refreshTriggerKey + 1);
  };

  return (
    <CatalystChat
      key={refreshTriggerKey}
      {...props}
      handleComponentRefresh={handleRefresh} // Ensure that this prop is after the spread of props (...props) so that the passed in handleComponentRefresh doesn't overwrite the wrapper function that also refreshes the component
    />
  );
};
export default CatalystChatWrapper;
