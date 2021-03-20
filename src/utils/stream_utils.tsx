import { toast } from 'react-toastify';
import { VideoChatData } from '../typings/interfaces';
import { isConnected, logger, sendToAllDataChannels } from './general_utils';
import React from 'react';

export function handleMute(
  audioEnabled: boolean,
  setAudio: Function,
  VCData: VideoChatData
): void {
  var audioTrack: any;
  setAudio(!audioEnabled);
  VCData.peerConnections.forEach((value: any, key: any, map: any) => {
    value.getSenders().find((s: any) => {
      if (s.track.kind === 'audio') {
        audioTrack = s.track;
      }
      return audioTrack;
    });
    if (audioTrack) {
      audioTrack.enabled = !audioEnabled;
    }
  });
}

export function handlePauseVideo(
  videoEnabled: boolean,
  setVideo: Function,
  VCData: VideoChatData,
  setLocalVideoText: Function
): void {
  var videoTrack: any;
  setVideo(!videoEnabled);
  if (videoEnabled) {
    setLocalVideoText('Video Paused');
  } else {
    setLocalVideoText('Drag Me');
  }
  VCData.peerConnections.forEach((value: any, key: any, map: any) => {
    logger('pausing video for ' + key.toString());
    value.getSenders().find((s: any) => {
      if (s.track.kind === 'video') {
        logger('found video track');
        videoTrack = s.track;
      }
      return videoTrack;
    });
    videoTrack.enabled = !videoEnabled;
  });
}

// Swap current video track with passed in stream
export function handleSwitchStreamHelper(
  stream: any,
  videoEnabled: boolean,
  setVideo: Function,
  VCData: VideoChatData,
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
  VCData.connected.forEach(
    (value: boolean, key: string, map: Map<string, boolean>) => {
      // check if connected before swapping video channel
      if (VCData.connected.get(key)) {
        const sender = VCData.peerConnections
          ?.get(key)
          ?.getSenders()
          .find((s: any) => {
            return s.track.kind === videoTrack.kind;
          });
        if (sender) sender.replaceTrack(videoTrack);
        // Replace audio track if sharing screen with audio
        if (stream.getAudioTracks()[0]) {
          logger('Audio track is' + audioTrack.toString());
          const sender2 = VCData.peerConnections
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
  VCData.localStream = stream;
  // Update local video object
  VCData.localVideo.srcObject = stream;
  // Unpause video on swap
  if (!videoEnabled) {
    handlePauseVideo(videoEnabled, setVideo, VCData, setLocalVideoText);
  }
}

export function handleRequestToggleCaptions(
  VCData: VideoChatData,
  setCaptionsText: Function
): void {
  // Handle requesting captions before connected
  if (!isConnected(VCData)) {
    alert('You must join a call to use Live Captions');
    return;
  }
  if (VCData.receivingCaptions) {
    setCaptionsText('CLOSED CAPTIONS');
    VCData.receivingCaptions = false;
  } else {
    toast(
      () => (
        <div className="text-center justify-between">
          <strong>Experimental:</strong> The user speaking must be using a
          Chromium browser
        </div>
      ),
      {
        toastId: 'captions_start',
      }
    );

    setCaptionsText('Captions Enabled');
    VCData.receivingCaptions = true;
  }
  // Send request to get captions over data channel
  sendToAllDataChannels('tog:', VCData.dataChannel);
}

export function handleReceiveCaptions(
  captions: string,
  VCData: VideoChatData,
  setCaptionsText: Function
): void {
  if (VCData.receivingCaptions) {
    setCaptionsText(captions);
  }
  // Other user is not using chrome
  if (captions === 'notusingchrome') {
    alert(
      'Other caller must be using chrome for this feature to work. Live Captions disabled.'
    );
    setCaptionsText('CLOSED CAPTIONS');
  }
}

// export function handleReceiveCaptions(
//   captions: any,
//   VCData: VideoChatData,
//   // setHideCaptions: Function,
//   setCaptionsText: Function
// ): void {
//   if (VCData.receivingCaptions) {
//     setCaptionsText('');
//     VCData.receivingCaptions = false;
//   } else {
//     setCaptionsText('CLOSED CAPTIONS');
//     VCData.receivingCaptions = true;
//   }
//   // Other user is not using chrome
//   if (captions === 'notusingchrome') {
//     alert(
//       'Other caller must be using chrome for this feature to work. Live Captions disabled.'
//     );
//     setCaptionsText('CLOSED CAPTIONS');
//     return;
//   }
//   setCaptionsText(captions);
// }

export function handleToggleCaptions(VCData: VideoChatData) {
  if (VCData.sendingCaptions && VCData.recognition) {
    VCData.sendingCaptions = false;
    VCData.recognition.stop();
  } else {
    VCData.sendingCaptions = true;
    handleStartSpeech(VCData);
  }
}

export function handleStartSpeech(VCData: VideoChatData) {
  try {
    var SpeechRecognition = window.SpeechRecognition;
    VCData.recognition = new SpeechRecognition();
  } catch (e) {
    VCData.sendingCaptions = false;
    logger('error importing speech library' + e);
    // Alert other user that they cannon use live captions
    sendToAllDataChannels('cap:notusingchrome', VCData.dataChannel);
    return;
  }
  VCData.recognition.continuous = true;
  // Show results that aren't final
  VCData.recognition.interimResults = true;
  // var finalTranscript: any;
  VCData.recognition.onresult = (e: any) => {
    let interimTranscript = '';
    for (let i = e.resultIndex, len = e.results.length; i < len; i++) {
      var transcript = e.results[i][0].transcript;
      logger(transcript);
      if (e.results[i].isFinal) {
        // finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
        var charsToKeep = interimTranscript.length % 100;
        // Send captions over data chanel, subtracting as many complete 100 char slices from start
        sendToAllDataChannels(
          'cap:' +
            interimTranscript.substring(interimTranscript.length - charsToKeep),
          VCData.dataChannel
        );
      }
    }
  };
  VCData.recognition.onend = function() {
    logger('on speech recording end');
    // Restart speech recognition if user has not stopped it
    if (VCData.sendingCaptions) {
      handleStartSpeech(VCData);
    } else if (VCData.recognition) {
      VCData.recognition.stop();
    }
  };
  VCData.recognition.start();
}

export function handlePictureInPicture(
  VCData: VideoChatData,
  video: HTMLVideoElement
): void {
  if (
    'pictureInPictureEnabled' in document ||
    // @ts-ignore
    VCData.remoteVideoWrapper.lastChild.webkitSetPresentationMode
  ) {
    // var video = VCData.remoteVideoWrapper.lastChild as HTMLVideoElement;
    if (video) {
      // video.addEventListener('enterpictureinpicture', setPicInPic(true), false);
      // video.addEventListener(
      //   'leavepictureinpicture ',
      //   setPicInPic(false),
      //   false
      // );
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
  VCData: VideoChatData,
  sharing: boolean,
  setSharing: Function,
  videoEnabled: boolean,
  setVideo: Function,
  setLocalVideoText: Function
): void {
  // Handle swap video before video call is connected by checking that there's at least one peer connected
  if (!isConnected(VCData)) {
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
          VCData,
          setLocalVideoText
        );
        setLocalVideoText('Sharing Screen');
      })
      .catch((e: Event) => {
        // Request screen share, note: we can request to capture audio for screen sharing video content.
        toast(
          () => (
            <div className="text-center justify-between">
              Please press allow to enable webcam & audio access
              <button
                className="snack-btn"
                onClick={() => {
                  window.open(
                    'https://help.clipchamp.com/en/articles/1505527-how-do-i-enable-my-webcam-for-recording',
                    '_blank'
                  );
                }}
              >
                Directions
              </button>
            </div>
          ),
          {
            toastId: 'screen_share',
          }
        );
        logger('Error sharing screen' + e);
      });
  } else {
    // Stop the screen share video track. (We don't want to stop the audio track obviously.)
    (VCData.localVideo?.srcObject as MediaStream)
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
          VCData,
          setLocalVideoText
        );
        setLocalVideoText('Drag Me');
      });
  }
}
