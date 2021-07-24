export interface CatalystChatProps {
  room: string;
  appId: string;
  name?: string;
  dark?: boolean;
  theme?: {
    primary: string;
    primaryDark: string;
  };
  fade?: number;
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
  loglevel?: string;
}