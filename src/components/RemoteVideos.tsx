import React, { useEffect, useRef, useState } from 'react';
import { handlePictureInPicture } from '../utils/stream';
import { ResizeWrapper, setWidth } from '../utils/ui';
import WelcomeMessage from './WelcomeMessage';
import debounce from 'lodash/debounce';

const RemoteVideos = React.memo(
  ({
    peerConnections,
    remoteStreams,
    showDotColors,
    showChat,
    cstmWelcomeMsg,
    sessionKey,
    themeColor,
  }: {
    remoteStreams: Map<string, MediaStream>;
    peerConnections: Map<string, RTCPeerConnection>;
    showDotColors?: boolean;
    showChat: boolean;
    cstmWelcomeMsg?: string | JSX.Element;
    sessionKey: string;
    themeColor: string;
  }) => {
    //   console.log('peers' + peerConnections.size + ' tracks' + remoteStreams.size);
    // useEffect(() => {
    //   ResizeWrapper();
    // });

    const vidRef = useRef<HTMLDivElement>(null);

    // useEffect will run on stageCanvasRef value assignments
    useEffect(() => {
      // The 'current' property contains info of the reference:
      // align, title, ... , width, height, etc.
      if (vidRef && vidRef.current) {
        let height = vidRef.current.offsetHeight;
        let width = vidRef.current.offsetWidth;
      }
    }, [vidRef]);

    const [vidDims, setVidDims] = useState<any>({
      area: 0,
      cols: 0,
      rows: 0,
      width: 0,
      height: 0,
    });

    const recalculateLayout = () => {
      const aspectRatio = 16 / 9;
      const screenWidth = document.body.getBoundingClientRect().width;
      const screenHeight = document.body.getBoundingClientRect().height;

      // or use this nice lib: https://github.com/fzembow/rect-scaler
      const calculateLayout = (
        containerWidth: number,
        containerHeight: number,
        videoCount: number,
        aspectRatio: number
      ): { width: number; height: number; cols: number } => {
        let bestLayout = {
          area: 0,
          cols: 0,
          rows: 0,
          width: 0,
          height: 0,
        };

        // brute-force search layout where video occupy the largest area of the container
        for (let cols = 1; cols <= videoCount; cols++) {
          const rows = Math.ceil(videoCount / cols);
          const hScale = containerWidth / (cols * aspectRatio);
          const vScale = containerHeight / rows;
          let width;
          let height;
          if (hScale <= vScale) {
            width = Math.floor(containerWidth / cols);
            height = Math.floor(width / aspectRatio);
          } else {
            height = Math.floor(containerHeight / rows);
            width = Math.floor(height * aspectRatio);
          }
          const area = width * height;
          if (area > bestLayout.area) {
            bestLayout = {
              area,
              width,
              height,
              rows,
              cols,
            };
          }
        }
        setVidDims(bestLayout);
        return bestLayout;
      };

      calculateLayout(
        screenWidth,
        screenHeight,
        remoteStreams.size,
        aspectRatio
      );
    };

    useEffect(() => {
      const debouncedRecalculateLayout = debounce(recalculateLayout, 50);
      window.addEventListener('resize', debouncedRecalculateLayout);
      debouncedRecalculateLayout();
    }, []);

    return (
      <div
        id="remote-vid-wrapper"
        ref={vidRef}
        className={`flex justify-center items-center flex-wrap absolute top-0 left-0 h-full w-full max-h-screen`}
        style={{
          maxWidth: `${vidDims.width * vidDims.cols}px`,
        }}
      >
        {peerConnections.size === 0 && (
          <WelcomeMessage
            cstmWelcomeMsg={cstmWelcomeMsg}
            sessionKey={sessionKey}
          />
        )}
        {/* <div
        id="gallery"
        className="flex justify-center flex-wrap"
        style={{
          maxWidth: `calc(var(${vidWidth}px) * var(${vidCols}))`,
        }}
      > */}
        {Array.from(remoteStreams.entries(), ([uuid, track], idx) => {
          return (
            <div
              style={{
                width: vidDims.width,
                height: vidDims.height,
              }}
              key={idx}
            >
              <video
                id="remote-video"
                className="w-full h-full " //z-0 rounded-2xl
                autoPlay
                muted
                playsInline
                vid-uuid={uuid}
                key={uuid}
                ref={vid => {
                  if (vid) vid.srcObject = track as MediaProvider;
                }}
              ></video>
            </div>
          );
        })}
      </div>
    );

    // return (
    //   <div
    //     id="remote-vid-wrapper"
    //     className={`flex justify-center content-center items-center absolute flex-wrap align-middle z-2 top-0 left-0 w-full h-full max-h-screen max-w-screen ${
    //       showChat ? 'ct-chat' : ''
    //     }`}
    //   >
    //     {peerConnections.size === 0 && (
    //       <WelcomeMessage
    //         cstmWelcomeMsg={cstmWelcomeMsg}
    //         sessionKey={sessionKey}
    //       />
    //     )}
    //     {Array.from(remoteStreams.entries(), ([uuid, track], idx) => {
    //       return (
    //         <div
    //           className="relative z-0 inline-block align-middle self-center overflow-hidden text-center h-auto" //bg-gray-700 aspect-w-16 aspect-h-9
    //           key={uuid}
    //         >
    //           <video
    //             // id="remote-video"
    //             className="w-full h-full relative z-0 rounded-2xl overflow-hidden inline-block shadow-md"
    //             //TODO: onDoubleClick={() => handlePictureInPicture(VC)}
    //             //   src={remoteStreams.get(uuid)}
    //             ref={vid => {
    //               if (vid) vid.srcObject = track as MediaProvider;
    //             }}
    //             key={idx}
    //             autoPlay
    //             muted
    //             playsInline
    //             vid-uuid={uuid}
    //           ></video>
    //           {/* paused-uuid */}
    //           <i className="remote-paused" paused-uuid={uuid}>
    //             <svg
    //               aria-hidden="true"
    //               focusable="false"
    //               data-prefix="fas"
    //               data-icon="video-slash"
    //               className="svg-inline--fa fa-video-slash fa-w-20"
    //               role="img"
    //               xmlns="http://www.w3.org/2000/svg"
    //               viewBox="0 0 640 512"
    //             >
    //               <path
    //                 fill="currentColor"
    //                 d="M633.8 458.1l-55-42.5c15.4-1.4 29.2-13.7 29.2-31.1v-257c0-25.5-29.1-40.4-50.4-25.8L448 177.3v137.2l-32-24.7v-178c0-26.4-21.4-47.8-47.8-47.8H123.9L45.5 3.4C38.5-2 28.5-.8 23 6.2L3.4 31.4c-5.4 7-4.2 17 2.8 22.4L42.7 82 416 370.6l178.5 138c7 5.4 17 4.2 22.5-2.8l19.6-25.3c5.5-6.9 4.2-17-2.8-22.4zM32 400.2c0 26.4 21.4 47.8 47.8 47.8h288.4c11.2 0 21.4-4 29.6-10.5L32 154.7v245.5z"
    //               ></path>
    //             </svg>
    //           </i>
    //           {/* muted-uuid */}
    //           <i className="remote-muted" muted-uuid={uuid}>
    //             <svg
    //               aria-hidden="true"
    //               focusable="false"
    //               data-prefix="fas"
    //               data-icon="microphone-slash"
    //               className="svg-inline--fa fa-microphone-slash fa-w-20 "
    //               role="img"
    //               xmlns="http://www.w3.org/2000/svg"
    //               viewBox="0 0 640 512"
    //             >
    //               <path
    //                 fill="currentColor"
    //                 d="M633.82 458.1l-157.8-121.96C488.61 312.13 496 285.01 496 256v-48c0-8.84-7.16-16-16-16h-16c-8.84 0-16 7.16-16 16v48c0 17.92-3.96 34.8-10.72 50.2l-26.55-20.52c3.1-9.4 5.28-19.22 5.28-29.67V96c0-53.02-42.98-96-96-96s-96 42.98-96 96v45.36L45.47 3.37C38.49-2.05 28.43-.8 23.01 6.18L3.37 31.45C-2.05 38.42-.8 48.47 6.18 53.9l588.36 454.73c6.98 5.43 17.03 4.17 22.46-2.81l19.64-25.27c5.41-6.97 4.16-17.02-2.82-22.45zM400 464h-56v-33.77c11.66-1.6 22.85-4.54 33.67-8.31l-50.11-38.73c-6.71.4-13.41.87-20.35.2-55.85-5.45-98.74-48.63-111.18-101.85L144 241.31v6.85c0 89.64 63.97 169.55 152 181.69V464h-56c-8.84 0-16 7.16-16 16v16c0 8.84 7.16 16 16 16h160c8.84 0 16-7.16 16-16v-16c0-8.84-7.16-16-16-16z"
    //               ></path>
    //             </svg>
    //           </i>
    //           {showDotColors && (
    //             <div id="indicator" indicator-uuid={uuid}></div>
    //           )}
    //         </div>
    //       );
    //     })}
    //   </div>
    // );
  }
);
export default RemoteVideos;
