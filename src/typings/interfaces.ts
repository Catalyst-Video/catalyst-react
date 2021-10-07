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

import { AudioTrack, ConnectOptions, LocalParticipant, Participant, Room } from 'catalyst-lk-client';

export interface CatalystChatProps {
  room: string;
  appId: string;
  handleComponentRefresh?: () => void;
  name?: string;
  theme?: CatalystTheme | string;
  fade?: number;
  audioOffDefault?: boolean;
  videoOffDefault?: boolean;
  simulcast?: boolean;
  bgRemoval?: 'blur' | string;
  disableChat?: boolean;
  disableSelfieMode?: boolean;
  disableSetupView?: boolean;
  disableNameField?: boolean;
  cstmSetupBg?: string;
  disableRefreshBtn?: boolean;
  cstmWelcomeMsg?: string | HTMLElement;
  cstmSupportUrl?: string;
  arbData?: Uint8Array;
  handleReceiveArbData?: (arbData: Uint8Array) => void;
  handleUserData?: (userData: CatalystUserData) => void;
  onJoinCall?: () => void;
  onMemberJoin?: () => void;
  onMemberLeave?: () => void;
  onLeaveCall?: () => void;
}

export interface CatalystChatWrapperProps extends CatalystChatProps {
  onComponentRefresh?: () => void;
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
  quinary?: string;
}

export interface CatalystDev {
  label: string;
}

export type BgRemovalOps = string[];

export interface CatalystUserData {
  token: string;
  roomName: string;
  participantName: string;
  persistedUserResult: {
    meetingJoins: {
      roomName: string;
      joinTime: string;
    }[];
    _id: string;
    appId: string;
    uniqueClientIdentifier: string;
    lastActive: string;
    lastParticipantName: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  isNewUser: boolean;
  vectorlyToken: string;
}

export interface RoomData {
  connectAll: (
    url: string,
    token: string,
    options?: ConnectOptions
  ) => Promise<Room | undefined>;
  disconnectAll: () => void;
  isConnecting: boolean;
  room?: Room;
  members: Participant[];
  localMember?: LocalParticipant;
  audioTracks: AudioTrack[];
  error?: Error;
}

export type Procedure = (...args: any[]) => any;

export type Options<TT> = {
  isImmediate?: boolean;
  maxWait?: number;
  callback?: (data: TT) => void;
};

export interface DebouncedFunction<F extends Procedure> {
  (this: ThisParameterType<F>, ...args: Parameters<F>): Promise<ReturnType<F>>;
  cancel: (reason?: any) => void;
}