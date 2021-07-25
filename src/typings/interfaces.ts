export interface CatalystChatProps {
  room: string;
  appId: string;
  name?: string;
  dark?: boolean;
  theme?: {
    primary: string;
    primaryDark: string;
    secondary: string;
    secondaryDark: string;
    tertiary: string;
    tertiaryDark: string;
  };
  fade?: number;
  audioOnDefault?: boolean;
  videoOnDefault?: boolean;
  simulcast?: boolean;
  arbData?: Uint8Array;
  handleReceiveArbData: (arbData: Uint8Array) => void;
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