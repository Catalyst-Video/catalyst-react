import React from 'react';
import Draggable from 'react-draggable';

const LocalVideo = React.memo(
  ({
    localStream,
    disableLocalVidDrag,
    localVideoText,
    themeColor,
    showDotColors,
  }: {
    localStream?: MediaStream;
    localVideoText: string;
    disableLocalVidDrag?: boolean;
    themeColor: string;
    showDotColors?: boolean;
  }) => {
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
              className="cursor-move z-20 relative flex justify-center w-full h-auto"
            >
              <p
                id="local-text"
                className="absolute flex items-center text-white opacity-40 whitespace-nowrap h-full font-bold z-5 text-xs sm:text-sm not-selectable"
              >
                {localVideoText}
              </p>
              <video
                id="local-video"
                className={`w-full h-full rounded-2xl bg-black border-2 border-${themeColor}-500`} //TODO: border?
                autoPlay
                muted
                playsInline
                ref={audio => {
                  if (audio) audio.srcObject = localStream;
                }}
              ></video>
              {showDotColors && <div id="local-indicator"></div>}
            </div>
          </Draggable>
        )}{' '}
      </>
    );
  }
);
export default LocalVideo;
