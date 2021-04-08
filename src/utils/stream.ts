import { isConnected, logger, sendToAllDataChannels } from './general';
import { VideoChatData } from '../typings/interfaces';
import { displayMessage, displayWebcamErrorMessage } from './messages';

export function handleMute(
  audioEnabled: boolean,
  setAudio: Function,
  VC: VideoChatData
): void {
  setAudio(!audioEnabled);
  if (VC.localAudio) {
    sendToAllDataChannels(`mut:${audioEnabled}`, VC.dataChannel);
    if (audioEnabled) VC.localAudio.enabled = false;
    else VC.localAudio.enabled = true;
  }
}

export function handlePauseVideo(
  videoEnabled: boolean,
  setVideo: Function,
  VC: VideoChatData,
  setLocalVideoText: Function,
  disableLocalVidDrag: boolean | undefined
): void {
  setVideo(!videoEnabled);
  if (VC && VC.localVideo) {
    sendToAllDataChannels(`vid:${videoEnabled}`, VC.dataChannel);
    if (videoEnabled) {
      VC.localStream?.getVideoTracks().forEach((track: MediaStreamTrack) => {
        track.enabled = false;
        // TODO: experiment with track.stop(); to remove recording indicator on PC
      });
      // if (VC.localVideo.srcObject && VC.localStream)
      //   VC.localVideo.srcObject = VC.localStream;
      setLocalVideoText('Video Paused');
    } else {
      VC.localStream?.getVideoTracks().forEach((track: MediaStreamTrack) => {
        track.enabled = true;
      });
      setLocalVideoText(disableLocalVidDrag ? '' : 'Drag Me');
    }
  }
}

// Swap current video track with passed in stream by getting current track, swapping video for each peer connection
export function handleSwitchStreamHelper(
  stream: MediaStream,
  videoEnabled: boolean,
  setVideo: Function,
  VC: VideoChatData,
  setLocalVideoText: Function,
  disableLocalVidDrag: boolean | undefined
): void {
  let videoTrack = stream.getVideoTracks()[0];
  let audioTrack = stream.getAudioTracks()[0];

  VC.connected.forEach(
    (value: boolean, key: string, map: Map<string, boolean>) => {
      if (VC.connected.get(key)) {
        const sender = VC.peerConnections
          ?.get(key)
          ?.getSenders()
          .find((s: any) => {
            return s.track.kind === videoTrack.kind;
          });
        if (sender) sender.replaceTrack(videoTrack);
        if (stream.getAudioTracks()[0]) {
          logger('Audio track is' + audioTrack.toString());
          const sender2 = VC.peerConnections
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
  VC.localStream = stream;
  VC.localVideo.srcObject = stream;
  if (!videoEnabled)
    handlePauseVideo(
      videoEnabled,
      setVideo,
      VC,
      setLocalVideoText,
      disableLocalVidDrag
    );
}

export function handlePictureInPicture(
  VC: VideoChatData,
  video: HTMLVideoElement
): void {
  if ('pictureInPictureEnabled' in document) {
    if (video) {
      // @ts-ignore
      if (document && document.pictureInPictureElement && video) {
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
              if (!isConnected(VC.connected))
                displayMessage(
                  'You must join a call to enter picture in picture'
                );
            });
        }
      }
    } else {
      if (!isConnected(VC.connected))
        displayMessage('You must join a call to enter picture in picture');
    }
  } else {
    if (!isConnected(VC.connected))
      displayMessage(
        'Your browser does not support Picture in Picture. Consider using Chrome, Edge, or Safari.'
      );
  }
}

export function handleSharing(
  VC: VideoChatData,
  sharing: boolean,
  setSharing: Function,
  videoEnabled: boolean,
  setVideo: Function,
  setLocalVideoText: Function,
  disableLocalVidDrag: boolean | undefined
): void {
  // Handle swap video before video call is connected by checking that there's at least one peer connected
  if (!isConnected(VC.connected)) {
    displayMessage('You must join a call before you can screen share');
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
        if (!isConnected(VC.connected)) displayWebcamErrorMessage(VC.connected);
        logger('Error sharing screen' + e);
      });
  } else {
    // Stop the screen share video track. (We don't want to stop the audio track obviously.)
    (VC.localVideo?.srcObject as MediaStream)
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
