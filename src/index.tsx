import React, { useEffect, useRef, useState } from 'react';

// Styles
import './styles/catalyst.css';
import './styles/tailwind.output.css';
// import './styles/oldcss.css';

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
  showSetNameBox,
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

  const catalystRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    DetectRTC.load(() => {
      setPermissions(
        DetectRTC.isWebRTCSupported &&
          DetectRTC.isWebsiteHasWebcamPermissions &&
          DetectRTC.isWebsiteHasMicrophonePermissions
      );
    });

    if (
      catalystRef &&
      catalystRef.current?.parentNode?.parentNode?.nodeName === 'BODY'
    ) {
      catalystRef.current.style.position = 'fixed';
    }

    // TODO: determine if necessary? navigator.mediaDevices.ondevicechange = () => window.location.reload();
  }, []);

  useEffect(() => {
    setThemeColor(themeColor ?? DEFAULT_THEMECOLOR);
  }, [themeColor]);

  return (
    <div id="ctw" ref={catalystRef} className={dark ? 'dark' : ''}>
      {hasPerms &&
      isUserReady &&
      DetectRTC.isWebRTCSupported &&
      (DetectRTC.browser.isChrome ||
        DetectRTC.browser.isEdge ||
        DetectRTC.browser.isSafari) ? (
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
      ) : DetectRTC.isWebRTCSupported &&
        (DetectRTC.browser.isChrome ||
          DetectRTC.browser.isEdge ||
          DetectRTC.browser.isSafari) &&
        !disableSetupRoom &&
        hasPerms &&
        !isUserReady ? (
        <SetupRoom
          sessionKey={sessionKey}
          setUserReady={setUserReady}
          audioEnabled={audioEnabled}
          setAudioEnabled={setAudioEnabled}
          videoEnabled={videoEnabled}
          setVideoEnabled={setVideoEnabled}
          themeColor={themeColor ?? DEFAULT_THEMECOLOR}
          audInput={audInput}
          vidInput={vidInput}
          setAudInput={setAudInput}
          setVidInput={setVidInput}
          cstmBackground={cstmBackground}
          setLocalName={setLocalName}
          showSetNameBox={showSetNameBox}
        />
      ) : (
        <PermsLoading
          hasPerms={hasPerms}
          setPermissions={setPermissions}
          cstmBackground={cstmBackground}
          themeColor={themeColor ?? DEFAULT_THEMECOLOR}
          browserSupported={
            (DetectRTC.isWebRTCSupported &&
              (DetectRTC.browser.isChrome ||
                DetectRTC.browser.isEdge ||
                DetectRTC.browser.isSafari)) ??
            true
          }
        />
      )}
    </div>
  );
};

export default CatalystChat;
