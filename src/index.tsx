import React, { useEffect, useState } from 'react';

// Styles
import './styles/catalyst.css';
import './styles/toast.css';
import './styles/video_grid.css';
import './styles/tailwind.output.css';

// Types
import { DefaultSettings, HiddenSettings } from './typings/interfaces';
import VideoChat from './components/VideoChat';
import SetupRoomComponent from './components/SetupRoom';
import DetectRTC from 'detectrtc';
import PermsLoadingComponent from './components/PermsLoading';
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
  disableSetupRoom,
  disableGradient,
  redIndicators,
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
  disableSetupRoom?: boolean;
  disableGradient?: boolean;
  redIndicators?: boolean;
}) => {
  const [hasPerms, setPermissions] = useState(false);
  const [isUserReady, setUserReady] = useState(disableSetupRoom ?? false);
  const [dark, setDark] = useState(darkMode ?? false);
  const [audioEnabled, setAudio] = useState<boolean>(defaults?.audioOn ?? true);
  const [videoEnabled, setVideo] = useState<boolean>(defaults?.videoOn ?? true);
  const [audioInput, setAudioInput] = useState<MediaDeviceInfo>();
  const [vidInput, setVidInput] = useState<MediaDeviceInfo>();

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
        themeColor={themeColor ?? 'blue'}
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
        audioInput={audioInput}
        vidInput={vidInput}
        setAudioInput={setAudioInput}
        setVidInput={setVidInput}
        redIndicators={redIndicators}
      />
    );
  } else if (
    DetectRTC.isWebRTCSupported &&
    (DetectRTC.browser.isChrome ||
      DetectRTC.browser.isEdge ||
      DetectRTC.browser.isSafari) &&
    !disableSetupRoom
  ) {
    return (
      <SetupRoomComponent
        sessionKey={sessionKey}
        hasPerms={hasPerms}
        setPermissions={setPermissions}
        setUserReady={setUserReady}
        audioEnabled={audioEnabled}
        setAudio={setAudio}
        videoEnabled={videoEnabled}
        setVideo={setVideo}
        themeColor={themeColor ?? 'blue'}
        audioInput={audioInput}
        vidInput={vidInput}
        setAudioInput={setAudioInput}
        setVidInput={setVidInput}
        disableGradient={disableGradient}
      />
    );
  } else {
    return (
      <PermsLoadingComponent
        hasPerms={hasPerms}
        disableGradient={disableGradient}
        themeColor={themeColor ?? 'blue'}
        browserSupported={
          (DetectRTC.isWebRTCSupported &&
            (DetectRTC.browser.isChrome ||
              DetectRTC.browser.isEdge ||
              DetectRTC.browser.isSafari)) ??
          true
        }
      />
    );
  }
};

export default CatalystChat;
