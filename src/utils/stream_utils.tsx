import { toast } from 'react-toastify';
import { VideoChatData } from '../typings/interfaces';
import { isConnected, logger, sendToAllDataChannels } from './general_utils';
import React from 'react';

export function handleMute(
  audioEnabled: boolean,
  setAudio: Function,
  VC: VideoChatData
): void {
  setAudio(!audioEnabled);
  if (VC.localAudio) {
    sendToAllDataChannels(`mut:${audioEnabled}`, VC.dataChannel);
    if (audioEnabled) {
      VC.localAudio.enabled = false;
    } else {
      VC.localAudio.enabled = true;
    }
  }
}

export function handlePauseVideo(
  videoEnabled: boolean,
  setVideo: Function,
  VC: VideoChatData,
  setLocalVideoText: Function
): void {
  setVideo(!videoEnabled);
  if (VC && VC.localVideo) {
    sendToAllDataChannels(`vid:${videoEnabled}`, VC.dataChannel);
    if (videoEnabled) {
      VC.localStream?.getVideoTracks().forEach((track: MediaStreamTrack) => {
        // track.stop();
        track.enabled = false;
      });
      setLocalVideoText('Video Paused');
    } else {
      VC.localStream?.getVideoTracks().forEach((track: MediaStreamTrack) => {
        track.enabled = true;
      });
      setLocalVideoText('Drag Me');
    }
  }
}

// Swap current video track with passed in stream
export function handleSwitchStreamHelper(
  stream: any,
  videoEnabled: boolean,
  setVideo: Function,
  VC: VideoChatData,
  setLocalVideoText: Function
): void {
  // Get current video track
  let videoTrack = stream.getVideoTracks()[0];
  let audioTrack = stream.getAudioTracks()[0];
  // Add listen for if the current track swaps, swap back
  videoTrack.onended = () => {
    // TODO: swap();
  };
  // Swap video for every peer connection
  VC.connected.forEach(
    (value: boolean, key: string, map: Map<string, boolean>) => {
      // check if connected before swapping video channel
      if (VC.connected.get(key)) {
        const sender = VC.peerConnections
          ?.get(key)
          ?.getSenders()
          .find((s: any) => {
            return s.track.kind === videoTrack.kind;
          });
        if (sender) sender.replaceTrack(videoTrack);
        // Replace audio track if sharing screen with audio
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
  // Update local video stream
  VC.localStream = stream;
  // Update local video object
  VC.localVideo.srcObject = stream;
  // Unpause video on swap
  if (!videoEnabled) {
    handlePauseVideo(videoEnabled, setVideo, VC, setLocalVideoText);
  }
}

export function handlePictureInPicture(
  VC: VideoChatData,
  video: HTMLVideoElement
): void {
  if (
    'pictureInPictureEnabled' in document ||
    // @ts-ignore
    VC.remoteVideoWrapper.lastChild.webkitSetPresentationMode
  ) {
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
              alert('You must join a call to enter picture in picture.');
            });
        }
      }
    } else {
      alert('You must join a call to enter picture in picture.');
    }
  } else {
    alert(
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
  setLocalVideoText: Function
): void {
  // Handle swap video before video call is connected by checking that there's at least one peer connected
  if (!isConnected(VC.connected)) {
    alert('You must join a call before you can share your screen.');
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
        if (stream.getAudioTracks()[0]) {
          stream.addTrack(stream.getAudioTracks()[0]);
        }
        logger(stream.toString());
        handleSwitchStreamHelper(
          stream,
          videoEnabled,
          setVideo,
          VC,
          setLocalVideoText
        );
        setLocalVideoText('Sharing Screen');
      })
      .catch((e: Event) => {
        // Request screen share, note: we can request to capture audio for screen sharing video content.
        if (!isConnected(VC.connected)) {
          toast(
            () => (
              <div className="text-center justify-between">
                Please press allow to enable webcam & audio access
                <button
                  className="snack-btn"
                  onClick={() => {
                    window.open(
                      'https://docs.catalyst.chat/docs-permissions',
                      '_blank'
                    );
                  }}
                >
                  Help & Directions
                </button>
              </div>
            ),
            {
              autoClose: false,
              toastId: 'webcam/audio_error',
            }
          );
        }
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
          setLocalVideoText
        );
        setLocalVideoText('Drag Me');
      });
  }
}
