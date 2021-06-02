import React, { useEffect, useState } from 'react';

// Styles
import './styles/catalyst.css';
import './styles/tailwind.output.css';

// Types
import { CatalystVideoChatProps } from './typings/interfaces';
import { PermsLoading, SetupRoom } from './components';
import { setThemeColor } from './utils/general';
import VideoChat from './components/VideoChat';
import DetectRTC from 'detectrtc';
import {
  DEFAULT_AUTOFADE,
  DEFAULT_SERVER_ADDRESS,
  DEFAULT_THEMECOLOR,
} from './utils/globals';

const CatalystChat = ({
  sessionKey,
  uniqueAppId,
  cstmServerAddress,
  defaults,
  hiddenTools,
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
  darkModeDefault,
  disableLocalVidDrag,
  disableSetupRoom,
  cstmBackground,
  disableRedIndicators,
  fourThreeAspectRatioEnabled,
}: CatalystVideoChatProps) => {
  const [hasPerms, setPermissions] = useState(false);
  const [isUserReady, setUserReady] = useState(disableSetupRoom ?? false);
  const [dark, setDark] = useState(darkModeDefault ?? false);
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
        hiddenTools={hiddenTools}
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
