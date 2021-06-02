import React, { useEffect, useState } from 'react';

// Styles
import './styles/catalyst.css';
import './styles/tailwind.output.css';

// Types
import { DefaultSettings, HiddenSettings } from './typings/interfaces';
import { PermsLoading, SetupRoom } from './components';
import { setThemeColor } from './utils/general';
import VideoChat from './components/VideoChat';
import DetectRTC from 'detectrtc';

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
  onSubmitLog,
  cstmWelcomeMsg,
  cstmOptionBtns,
  themeColor,
  autoFade,
  name,
  alwaysBanner,
  darkMode,
  disableLocalVidDrag,
  disableSetupRoom,
  cstmBackground,
  disableRedIndicators,
  fourThreeAspectRatioEnabled,
}: {
  sessionKey: string;
  uniqueAppId: string;
  cstmServerAddress?: string;
  defaults?: DefaultSettings;
  hidden?: HiddenSettings;
  picInPic?: string;
  name?: string;
  onStartCall?: Function;
  onAddPeer?: Function;
  onRemovePeer?: Function;
  onEndCall?: Function;
  onSubmitLog?: Function;
  arbitraryData?: string;
  onReceiveArbitraryData?: Function;
  cstmWelcomeMsg?: JSX.Element | string;
  cstmOptionBtns?: JSX.Element[];
  themeColor?: string;
  autoFade?: number;
  alwaysBanner?: boolean;
  darkMode?: boolean;
  disableLocalVidDrag?: boolean;
  disableSetupRoom?: boolean;
  cstmBackground?: string;
  disableRedIndicators?: boolean;
  fourThreeAspectRatioEnabled?: boolean;
}) => {
  const [hasPerms, setPermissions] = useState(false);
  const [isUserReady, setUserReady] = useState(disableSetupRoom ?? false);
  const [dark, setDark] = useState(darkMode ?? false);
  const [localName, setLocalName] = useState(name ?? '');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(
    defaults?.audioOn ?? true
  );
  const [videoEnabled, setVideoEnabled] = useState<boolean>(
    defaults?.videoOn ?? true
  );
  const [audInput, setAudInput] = useState<MediaDeviceInfo>();
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
    setThemeColor(themeColor ?? DEFAULT_THEMECOLOR);
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
        cstmServerAddress={cstmServerAddress ?? DEFAULT_SERVER_ADDRESS}
        defaults={defaults}
        hidden={hidden}
        picInPic={picInPic}
        onStartCall={onStartCall}
        onAddPeer={onAddPeer}
        onRemovePeer={onRemovePeer}
        onEndCall={onEndCall}
        onSubmitLog={onSubmitLog}
        localName={localName}
        arbitraryData={arbitraryData}
        onReceiveArbitraryData={onReceiveArbitraryData}
        cstmWelcomeMsg={cstmWelcomeMsg}
        cstmOptionBtns={cstmOptionBtns}
        themeColor={themeColor ?? DEFAULT_THEMECOLOR}
        autoFade={autoFade ?? DEFAULT_AUTOFADE}
        alwaysBanner={alwaysBanner}
        disableLocalVidDrag={disableLocalVidDrag}
        dark={dark}
        setDark={setDark}
        audioEnabled={audioEnabled}
        setAudioEnabled={setAudioEnabled}
        videoEnabled={videoEnabled}
        setVideoEnabled={setVideoEnabled}
        audInput={audInput}
        vidInput={vidInput}
        setAudInput={setAudInput}
        setVidInput={setVidInput}
        disableRedIndicators={disableRedIndicators}
        fourThreeAspectRatioEnabled={fourThreeAspectRatioEnabled}
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
      <SetupRoom
        sessionKey={sessionKey}
        setUserReady={setUserReady}
        audioEnabled={audioEnabled}
        setAudioEnabled={setAudioEnabled}
        videoEnabled={videoEnabled}
        setVideoEnabled={setVideoEnabled}
        themeColor={themeColor ?? 'blue'}
        audInput={audInput}
        vidInput={vidInput}
        setAudInput={setAudInput}
        setVidInput={setVidInput}
        cstmBackground={cstmBackground}
      />
    );
  } else {
    return (
      <PermsLoading
        hasPerms={hasPerms}
        setPermissions={setPermissions}
        cstmBackground={cstmBackground}
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
