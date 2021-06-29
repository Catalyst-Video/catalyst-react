import React, { useEffect, useRef, useState } from 'react';
import WelcomeMessage from './WelcomeMessage';
import { logger } from '../utils/general';
import { PeerMetadata } from '../typings/interfaces';
import PopoutLocalVideo from './PopoutLocalVideo';
import RemoteVideo from './RemoteVideo';
import LocalVideo from './LocalVideo';

const RemoteVideos = React.memo(
  ({
    peerConnections,
    remoteStreams,
    peerMetadata,
    showChat,
    cstmWelcomeMsg,
    sessionKey,
    themeColor,
    fourThreeAspectRatioEnabled,
    disableRedIndicators,
    picInPic,
    localStream,
    localName,
    audioEnabled,
    videoEnabled,
  }: {
    remoteStreams: Map<string, MediaStream>;
    peerConnections: Map<string, RTCPeerConnection>;
    peerMetadata: Map<string, PeerMetadata>;
    showChat: boolean;
    cstmWelcomeMsg?: string | JSX.Element;
    sessionKey: string;
    themeColor: string;
    fourThreeAspectRatioEnabled?: boolean;
    disableRedIndicators?: boolean;
    picInPic?: string;
    localStream?: MediaStream;
    localName?: string;
    audioEnabled: boolean;
    videoEnabled: boolean;
  }) => {
    const vidRef = useRef<HTMLDivElement>(null);
    const [isLocalPopout, setLocalPopout] = useState(true);

    const [vidDims, setVidDims] = useState({
      width: '0px',
      height: '0px',
      margin: '2px',
    });

    useEffect(() => {
      window.addEventListener(
        'load',
        () => {
          resizeWrapper();
          window.onresize = resizeWrapper;
        },
        false
      );
    }, []);

    useEffect(() => {
      resizeWrapper();
    }, [remoteStreams, isLocalPopout]);

    const area = (
      increment: number,
      count: number,
      width: number,
      height: number,
      margin: number = 10
    ) => {
      let i = 0;
      let w = 0;
      let h = increment * 0.75 + margin * 2;
      while (i < count) {
        if (w + increment > width) {
          w = 0;
          h = h + increment * 0.75 + margin * 2;
        }
        w = w + increment + margin * 2;
        i++;
      }
      if (h > height) return false;
      else return increment;
    };

    const resizeWrapper = () => {
      let margin = 2;
      let width = 0;
      let height = 0;
      if (vidRef.current) {
        width = vidRef.current.offsetWidth - margin * 2;
        height = vidRef.current.offsetHeight - margin * 2;
      }
      let max = 0;
      //  TODO: loop needs to be optimized
      let i = 1;
      while (i < 5000) {
        let w = area(
          i,
          remoteStreams.size + (isLocalPopout ? 0 : 1),
          width,
          height,
          margin
        );
        if (w === false) {
          max = i - 1;
          break;
        }
        i++;
      }
      max = max - margin * 2;
      setVidDims({
        width: max + 'px',
        height: max * (fourThreeAspectRatioEnabled ? 0.75 : 0.5625) + 'px', // 0.5625 enforce 16:9 (vs 0.75 for 4:3)
        margin: margin + 'px',
      });
    };

    return (
      <>
        {isLocalPopout && localStream && (
          <PopoutLocalVideo
            localStream={localStream}
            // disableLocalVidDrag={disableLocalVidDrag}
            // localVideoText={localVideoText}
            themeColor={themeColor}
            localName={localName}
            setLocalPopout={setLocalPopout}
          />
        )}
        <div
          id="remote-vid-wrapper"
          ref={vidRef}
          className={`flex justify-center content-center items-center flex-wrap align-middle z-2 w-full h-full max-h-screen max-w-screen box-border`}
        >
          {peerConnections.size === 0 && (
            <WelcomeMessage
              cstmWelcomeMsg={cstmWelcomeMsg}
              sessionKey={sessionKey}
            />
          )}
          {!isLocalPopout && localStream && peerConnections.size > 0 && (
            <LocalVideo
              track={localStream}
              vidDims={vidDims}
              picInPic={picInPic}
              disableRedIndicators={disableRedIndicators}
              themeColor={themeColor}
              localName={localName}
              audioEnabled={audioEnabled}
              videoEnabled={videoEnabled}
              setLocalPopout={setLocalPopout}
            />
          )}
          {Array.from(remoteStreams.entries(), ([uuid, track], idx) => {
            return (
              <RemoteVideo
                uuid={uuid}
                track={track}
                vidDims={vidDims}
                idx={idx}
                picInPic={picInPic}
                disableRedIndicators={disableRedIndicators}
                themeColor={themeColor}
                peerMetadata={peerMetadata}
              />
            );
          })}
        </div>
      </>
    );
  }
);
export default RemoteVideos;
