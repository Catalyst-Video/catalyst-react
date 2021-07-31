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

import { Participant } from 'livekit-client';

export interface CatalystChatProps {
  room: string;
  appId: string;
  name?: string;
  dark?: boolean;
  theme?: CatalystTheme | string;
  fade?: number;
  audioOnDefault?: boolean;
  videoOnDefault?: boolean;
  simulcast?: boolean;
  disableChat?: boolean;
  disableSetupRoom?: boolean;
  disableNameField?: boolean;
  cstmSetupBg?: string;
  arbData?: Uint8Array;
  handleReceiveArbData: (arbData: Uint8Array) => void;
  onJoinCall: () => void;
  onMemberJoin: () => void;
  onMemberLeave: () => void;
  onLeaveCall: () => void;
}

export interface RoomMetaData {
  videoEnabled: boolean;
  audioEnabled: boolean;
  simulcast?: boolean;
  audioDeviceId?: string;
  videoDeviceId?: string;
  key?: string;
  loglevel?: string;
}

export interface ChatMessage {
  text: string;
  sender?: Participant;
}

export interface CatalystTheme {
  primary?: string;
  secondary?: string;
  tertiary?: string;
  quaternary?: string;
}
