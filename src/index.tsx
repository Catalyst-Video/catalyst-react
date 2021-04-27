import React, { useEffect, useRef, useState } from 'react';

// Styles
import './styles/catalyst.css';
import './styles/toast.css';
import './styles/video_grid.css';
import './styles/tailwind.output.css';

// Types
import { DefaultSettings, HiddenSettings } from './typings/interfaces';
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
  setupRoom,
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
  setupRoom?: boolean;
}) => {
  const [hasPerms, setPermissions] = useState(false);
  const [isUserReady, setUserReady] = useState(setupRoom ?? false);
  const [dark, setDark] = useState(darkMode ?? false);
  const [audioEnabled, setAudio] = useState<boolean>(defaults?.audioOn ?? true);
  const [videoEnabled, setVideo] = useState<boolean>(defaults?.videoOn ?? true);

  useEffect(() => {
    DetectRTC.load(() => {
      setPermissions(
        DetectRTC.isWebRTCSupported &&
          DetectRTC.isWebsiteHasWebcamPermissions &&
          DetectRTC.isWebsiteHasMicrophonePermissions
      );
    });

    navigator.mediaDevices.ondevicechange = () => window.location.reload();
  }, []);

  useEffect(() => {
    setThemeColor(themeColor ?? 'blue');
  }, [themeColor]);

  if (
    hasPerms &&
    isUserReady &&
    (DetectRTC.browser.isChrome ||
      DetectRTC.browser.isEdge ||
      DetectRTC.browser.isSafari)
  ) {
    return (
      <VideoChat
        sessionKey={sessionKey}
        uniqueAppId={uniqueAppId}
        cstmServerAddress={cstmServerAddress ?? 'https://server.catalyst.chat/'}
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
        autoFade={autoFade ?? 600}
        alwaysBanner={alwaysBanner}
        disableLocalVidDrag={disableLocalVidDrag}
        dark={dark}
        setDark={setDark}
        audioEnabled={audioEnabled}
        setAudio={setAudio}
        videoEnabled={videoEnabled}
        setVideo={setVideo}
      />
    );
  } else if (
    DetectRTC.isWebRTCSupported &&
    (DetectRTC.browser.isChrome ||
      DetectRTC.browser.isEdge ||
      DetectRTC.browser.isSafari)
  ) {
    return (
      <PermsComponent
        sessionKey={sessionKey}
        hasPerms={hasPerms}
        setPermissions={setPermissions}
        setUserReady={setUserReady}
        audioEnabled={audioEnabled}
        setAudio={setAudio}
        videoEnabled={videoEnabled}
        setVideo={setVideo}
        themeColor={themeColor ?? 'blue'}
      />
    );
  } else {
    return <IncompatibleAlert />;
  }
};

export default CatalystChat;
