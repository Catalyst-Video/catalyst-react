import { isConnected, logger, sendToAllDataChannels } from './general';

// Swap current video track with passed in stream by getting current track, swapping video for each peer connection
export function handleSwitchStreamHelper(
  stream: MediaStream,
  localStream: MediaStream,
  connected: Map<string, boolean>,
  peerConnections: Map<string, RTCPeerConnection>,
  disableLocalVidDrag?: boolean
): void {
  let videoTrack = stream.getVideoTracks()[0];
  let audioTrack = stream.getAudioTracks()[0];

  connected.forEach(
    (value: boolean, key: string, map: Map<string, boolean>) => {
      if (connected.get(key)) {
        const sender = peerConnections
          ?.get(key)
          ?.getSenders()
          .find((s: any) => {
            return s.track.kind === videoTrack.kind;
          });
        if (sender) sender.replaceTrack(videoTrack);
        if (stream.getAudioTracks()[0]) {
          logger('Audio track is' + audioTrack.toString());
          const sender2 = peerConnections
            ?.get(key)
            ?.getSenders()
            .find((s: any) => {
              if (s.track.kind === audioTrack.kind) {
                logger('Found matching track: ' + s.track.toString());
              }
              return s.track.kind === audioTrack.kind;
            });
          // add track instead of replacing
          if (sender2) sender2.replaceTrack(audioTrack);
        }
      }
    }
  );
  // Update local video stream, local video object, unpause video on swap
  localStream = stream;
  localVidRef.current.srcObject = stream;
  
}


export function handleSharing(
  ,
  sharing: boolean,
  setSharing: Function,
  videoEnabled: boolean,
  setVideo: Function,
  setLocalVideoText: Function,
  disableLocalVidDrag: boolean | undefined
): void {
  // Handle swap video before video call is connected by checking that there's at least one peer connected
  if (!isConnected(connected)) {
    logger('You must join a call before you can screen share');
    return;
  }
  if (!sharing) {
    navigator.mediaDevices
      .getDisplayMedia({
        video: true,
        audio: true,
      })
      .then((stream: MediaStream) => {
        setSharing(true);
        if (stream.getAudioTracks()[0])
          stream.addTrack(stream.getAudioTracks()[0]);
        logger(stream.toString());
        handleSwitchStreamHelper(
          stream,
          videoEnabled,
          setVideo,
          VC,
          setLocalVideoText,
          disableLocalVidDrag
        );
        setLocalVideoText('Sharing Screen');
      })
      .catch((e: Event) => {
        // Request screen share, note: we can request to capture audio for screen sharing video content.
        logger('Error sharing screen' + e);
      });
  } else {
    // Stop the screen share video track. (We don't want to stop the audio track obviously.)
    (localVidRef.current?.srcObject as MediaStream)
      ?.getVideoTracks()
      .forEach((track: MediaStreamTrack) => track.stop());
    // Get webcam input
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then(stream => {
        setSharing(false);
        handleSwitchStreamHelper(
          stream,
          videoEnabled,
          setVideo,
          VC,
          setLocalVideoText,
          disableLocalVidDrag
        );
        setLocalVideoText(disableLocalVidDrag ? '' : 'Drag Me');
      });
  }
}
