import React from 'react';
import Draggable from 'react-draggable';

const LocalVideo = React.memo(
  ({
    localStream,
    disableLocalVidDrag,
    localVideoText,
    themeColor,
    showDotColors,
    localName,
  }: {
    localStream?: MediaStream;
    localVideoText: string;
    disableLocalVidDrag?: boolean;
    themeColor: string;
    showDotColors?: boolean;
    localName?: string;
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
                className={`w-full h-full rounded-2xl bg-black border-2 border-${themeColor}`} //TODO: border?
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
        )}{' '}
      </>
    );
  }
);
export default LocalVideo;
