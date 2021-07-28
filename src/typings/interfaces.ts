import { Participant } from "livekit-client";

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
