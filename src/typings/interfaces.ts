export interface CatalystChatProps {
	key: string;
	appId: string;
	dark?: boolean;
}

export interface RoomMetaData {
  videoEnabled: boolean;
  audioEnabled: boolean;
  simulcast?: boolean;
  audioDeviceId?: string;
  videoDeviceId?: string;
  key?: string;
}