export interface CatalystChatProps {
  room: string;
  appId: string;
  dark?: boolean;
  theme?: {
    primary: string;
    primaryDark: string;
  }
  fade?: number;
  name?: string;
  audioOnDefault?: boolean;
  videoOnDefault?: boolean;
  simulcast?: boolean;
  onEndCall: () => void;
}

export interface RoomMetaData {
  videoEnabled: boolean;
  audioEnabled: boolean;
  simulcast?: boolean;
  audioDeviceId?: string;
  videoDeviceId?: string;
  key?: string;
}