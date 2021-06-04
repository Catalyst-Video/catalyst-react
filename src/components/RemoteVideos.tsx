import React, { useEffect, useRef, useState } from 'react';
import WelcomeMessage from './WelcomeMessage';
import { logger } from '../utils/general';
import { PeerMetadata } from '../typings/interfaces';

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
  }) => {
    const vidRef = useRef<HTMLDivElement>(null);

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
    }, [remoteStreams]);

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
        let w = area(i, remoteStreams.size, width, height, margin);
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

    const handlePictureInPicture = (video: HTMLVideoElement) => {
      if ('pictureInPictureEnabled' in document) {
        // @ts-ignore
        if (document && document.pictureInPictureElement) {
          // @ts-ignore
          document.exitPictureInPicture().catch((e: string) => {
            logger('Error exiting pip.' + e);
          });
        } else {
          // @ts-ignore
          switch (video?.webkitPresentationMode) {
            case 'inline':
              // @ts-ignore
              video?.webkitSetPresentationMode('picture-in-picture');
              break;
            case 'picture-in-picture':
              // @ts-ignore
              video?.webkitSetPresentationMode('inline');
              break;
            default:
              // @ts-ignore
              video.requestPictureInPicture().catch((e: string) => {
                logger('You must join a call to enter picture in picture');
              });
          }
        }
      } else {
        logger('You must join a call to enter picture in picture');
      }
    };

    return (
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

        {Array.from(remoteStreams.entries(), ([uuid, track], idx) => {
          return (
            <div
              className="relative z-0 inline-block align-middle self-center overflow-hidden text-center h-auto bg-gray-800 rounded-2xl" // aspect-w-16 aspect-h-9
              key={uuid}
              style={{
                width: vidDims.width,
                height: vidDims.height,
                margin: vidDims.margin,
                maxHeight: vidDims.height,
              }}
            >
              <video
                id="remote-video"
                className="w-full h-full relative z-0 overflow-hidden inline-block shadow-md"
                ref={vid => {
                  if (vid) {
                    vid.srcObject = track as MediaProvider;
                    if (picInPic != 'disabled')
                      vid.addEventListener(picInPic ?? 'dblclick', () => {
                        handlePictureInPicture(vid);
                      });
                  }
                }}
                key={idx}
                autoPlay
                playsInline
                vid-uuid={uuid}
              ></video>
              <div
                id="remote-indicators"
                className="absolute bottom-4 left-3 flex justify-around items-center z-20 text-md rounded-full"
              >
                {/* muted-uuid */}
                <i
                  id="remote-muted"
                  className={`text-${
                    disableRedIndicators ? themeColor : 'red'
                  } h-4 w-4 mr-3 ${
                    peerMetadata.get(uuid)?.audioOn ? 'hidden' : ''
                  }`}
                >
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon="microphone-slash"
                    className="svg-inline--fa fa-microphone-slash fa-w-20 "
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 512"
                  >
                    <path
                      fill="currentColor"
                      d="M633.82 458.1l-157.8-121.96C488.61 312.13 496 285.01 496 256v-48c0-8.84-7.16-16-16-16h-16c-8.84 0-16 7.16-16 16v48c0 17.92-3.96 34.8-10.72 50.2l-26.55-20.52c3.1-9.4 5.28-19.22 5.28-29.67V96c0-53.02-42.98-96-96-96s-96 42.98-96 96v45.36L45.47 3.37C38.49-2.05 28.43-.8 23.01 6.18L3.37 31.45C-2.05 38.42-.8 48.47 6.18 53.9l588.36 454.73c6.98 5.43 17.03 4.17 22.46-2.81l19.64-25.27c5.41-6.97 4.16-17.02-2.82-22.45zM400 464h-56v-33.77c11.66-1.6 22.85-4.54 33.67-8.31l-50.11-38.73c-6.71.4-13.41.87-20.35.2-55.85-5.45-98.74-48.63-111.18-101.85L144 241.31v6.85c0 89.64 63.97 169.55 152 181.69V464h-56c-8.84 0-16 7.16-16 16v16c0 8.84 7.16 16 16 16h160c8.84 0 16-7.16 16-16v-16c0-8.84-7.16-16-16-16z"
                    ></path>
                  </svg>
                </i>
                {/* paused-uuid */}
                <i
                  id="remote-paused"
                  className={`text-${
                    disableRedIndicators ? themeColor : 'red'
                  }  h-4 w-4 ${
                    peerMetadata.get(uuid)?.videoOn ? 'hidden' : ''
                  }`}
                >
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fas"
                    data-icon="video-slash"
                    className="svg-inline--fa fa-video-slash fa-w-20"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 512"
                  >
                    <path
                      fill="currentColor"
                      d="M633.8 458.1l-55-42.5c15.4-1.4 29.2-13.7 29.2-31.1v-257c0-25.5-29.1-40.4-50.4-25.8L448 177.3v137.2l-32-24.7v-178c0-26.4-21.4-47.8-47.8-47.8H123.9L45.5 3.4C38.5-2 28.5-.8 23 6.2L3.4 31.4c-5.4 7-4.2 17 2.8 22.4L42.7 82 416 370.6l178.5 138c7 5.4 17 4.2 22.5-2.8l19.6-25.3c5.5-6.9 4.2-17-2.8-22.4zM32 400.2c0 26.4 21.4 47.8 47.8 47.8h288.4c11.2 0 21.4-4 29.6-10.5L32 154.7v245.5z"
                    ></path>
                  </svg>
                </i>
              </div>
              <div
                id="remote-name"
                className="absolute bottom-2 right-3 flex justify-around items-center z-20 text-md rounded-full"
              >
                {peerMetadata &&
                  (peerMetadata.get(uuid)?.name ?? '').length > 0 && (
                    <div
                      id="name"
                      indicator-uuid={uuid}
                      className="text-white text-xs not-selectable bg-gray-700 bg-opacity-40 px-2 py-1 rounded-xl"
                    >
                      {peerMetadata.get(uuid)?.name}
                    </div>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);
export default RemoteVideos;
