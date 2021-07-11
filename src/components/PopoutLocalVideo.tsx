import React, { useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
// import PlainDraggable from 'plain-draggable';

const PopoutLocalVideo = React.memo(
  ({
    localStream,
    disableLocalVidDrag,
    localVideoText,
    themeColor,
    showDotColors,
    localName,
    setLocalPopout,
  }: {
    localStream?: MediaStream;
    localVideoText?: string;
    disableLocalVidDrag?: boolean;
    themeColor: string;
    showDotColors?: boolean;
    localName?: string;
    setLocalPopout: Function;
  }) => {
    var draggableRef = useRef<HTMLDivElement>(null);

    // useEffect(() => {
    //   if (draggableRef.current)
    //     var draggable = new PlainDraggable(draggableRef.current, {
    //       snap: {
    //         targets: [
    //           { left: 0, top: 0, gravity: 500 },
    //           { left: 0, bottom: 0, gravity: 500 },
    //           { right: 0, top: 0, gravity: 500 },
    //           { right: 0, bottom: 0, gravity: 500 },
    //         ],
    //       },
    // movingClass: 'popout-drag',
    // snap: {
    //   left: 0,
    //   top: 0,
    //   width: '100%',
    //   height: '100%',
    //   gravity: 400,
    // },

    // {
    //   targets: [
    //     { x: 0, y: 0, gravity: 400, corner: 'br' },
    //     { x: '100%', y: 0, gravity: 400, corner: 'tl' },
    //   ],
    // },
    //     });
    // }, []);

    return (
      <>
        {localStream && (
          <Draggable
            defaultPosition={
              disableLocalVidDrag ? { x: 5, y: 35 } : { x: 30, y: 150 }
            }
            bounds="parent"
            disabled={disableLocalVidDrag ?? false}
          >
            <div
              id="local-vid-wrapper"
              onDoubleClick={() => setLocalPopout(localPopup => !localPopup)}
              className="inline-block align-middle self-center overflow-hidden text-center h-auto focus:cursor-move z-20  justify-center shadow-xl bg-gray-800 rounded-2xl absolute w-40 lg:w-64"
              // style={{
              //   // 16:9
              //   width: '192px',
              //   height: '108px',
              // }}
            >
              {/* <p
              id="local-text"
              className="absolute flex items-center text-white opacity-40 whitespace-nowrap h-full font-bold z-5 text-xs sm:text-sm not-selectable"
            >
              {localVideoText}
            </p> */}
              <video
                id="local-video"
                className={`w-full h-full relative z-20 overflow-hidden inline-block shadow-md object-cover`} //TODO: border? border-2 border-${themeColor}
                autoPlay
                muted
                playsInline
                ref={audio => {
                  if (audio) audio.srcObject = localStream;
                }}
              ></video>
              {/* TODO: {localName && (
              <div
                id="local-name"
                className="text-white font-semibold opacity-40 text-xs not-selectable absolute bottom-0 right-0  z-20 text-md rounded-full"
              >
                {localName}
              </div>
            )} */}
            </div>
          </Draggable>
        )}
      </>
    );
  }
);
export default PopoutLocalVideo;
