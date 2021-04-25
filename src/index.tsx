import React, { useEffect, useRef, useState } from 'react';

// Styles
import './styles/catalyst.css';
import './styles/toast.css';
import './styles/video_grid.css';

// Types
import {
  DefaultSettings,
  HiddenSettings,
  VideoChatData,
} from './typings/interfaces';
import VideoChat from './components/VideoChat';
import PermsComponent from './components/Perms';
import DetectRTC from 'detectrtc';
import IncompatibleAlert from './components/IncompatibleAlert';
import { setThemeColor } from './utils/ui';

const CatalystChat = ({
  sessionKey,
  uniqueAppId,
  cstmServerAddress,
  defaults,
  hidden,
  picInPic,
  onStartCall,
  onAddPeer,
  onRemovePeer,
  onEndCall,
  arbitraryData,
  onReceiveArbitraryData,
  cstmWelcomeMsg,
  cstmOptionBtns,
  themeColor,
  showDotColors,
  showBorderColors,
  autoFade,
  alwaysBanner,
  darkMode,
  disableLocalVidDrag,
}: {
  sessionKey: string;
  uniqueAppId: string;
  cstmServerAddress?: string;
  defaults?: DefaultSettings;
  hidden?: HiddenSettings;
  picInPic?: string;
  onStartCall?: Function;
  onAddPeer?: Function;
  onRemovePeer?: Function;
  onEndCall?: Function;
  arbitraryData?: string;
  onReceiveArbitraryData?: Function;
  cstmWelcomeMsg?: JSX.Element | string;
  cstmOptionBtns?: JSX.Element[];
  themeColor?: string;
  showDotColors?: boolean;
  showBorderColors?: boolean;
  autoFade?: number;
  alwaysBanner?: boolean;
  darkMode?: boolean;
  disableLocalVidDrag?: boolean;
}) => {
  const [hasPerms, setPermissions] = useState(false);
  const [dark, setDark] = useState(darkMode ?? false);

  useEffect(() => {
    DetectRTC.load(() => {
      setPermissions(
        DetectRTC.isWebRTCSupported &&
          DetectRTC.isWebsiteHasWebcamPermissions &&
          DetectRTC.isWebsiteHasMicrophonePermissions
      );
    });
  }, []);

  useEffect(() => {
    setThemeColor(themeColor ?? 'blue');
  }, [themeColor]);

  if (
    hasPerms &&
    (DetectRTC.browser.isChrome ||
      DetectRTC.browser.isEdge ||
      DetectRTC.browser.isSafari)
  ) {
    return (
      <VideoChat
        sessionKey={sessionKey}
        uniqueAppId={uniqueAppId}
        cstmServerAddress={cstmServerAddress}
        defaults={defaults}
        hidden={hidden}
        picInPic={picInPic}
        onStartCall={onStartCall}
        onAddPeer={onAddPeer}
        onRemovePeer={onRemovePeer}
        onEndCall={onEndCall}
        arbitraryData={arbitraryData}
        onReceiveArbitraryData={onReceiveArbitraryData}
        cstmWelcomeMsg={cstmWelcomeMsg}
        cstmOptionBtns={cstmOptionBtns}
        showDotColors={showDotColors}
        showBorderColors={showBorderColors}
        autoFade={autoFade}
        alwaysBanner={alwaysBanner}
        disableLocalVidDrag={disableLocalVidDrag}
        dark={dark}
        setDark={setDark}
      />
    );
  } else if (
    DetectRTC.isWebRTCSupported &&
    (DetectRTC.browser.isChrome ||
      DetectRTC.browser.isEdge ||
      DetectRTC.browser.isSafari)
  ) {
    return <PermsComponent />;
  } else {
    return <IncompatibleAlert />;
  }
};

export default CatalystChat;
