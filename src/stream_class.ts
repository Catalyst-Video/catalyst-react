/* VIDEO CHAT DATA: track video/audio streams, peer connections, handle webrtc */
import io, { Socket } from 'socket.io-client';
import {
  chatRoomFull,
  handlereceiveMessage,
  sendToAllDataChannels,
  addMessageToScreen,
  logger,
} from './utils/general_utils';
import { TwilioToken, VideoChatData } from './typings/interfaces';

import {
  closeAllMessages,
  displayVideoErrorMessage,
  displayWelcomeMessage,
  ResizeWrapper,
} from './utils/ui_utils';

const DEFAULT_SERVER_ADDRESS = 'https://catalyst-video-server.herokuapp.com/';

export default class VCDataStream implements VideoChatData {
  sessionId: string;
  roomName: string;
  dataChannel: Map<string, RTCDataChannel>;
  connected: Map<string, boolean>;
  localICECandidates: Record<string, RTCIceCandidate[]>;
  socket: typeof Socket;
  remoteVideoWrapper: HTMLDivElement;
  localVideo: HTMLMediaElement;
  // recognition: SpeechRecognition;
  peerConnections: Map<string, RTCPeerConnection>;
  localStream: MediaStream | undefined;
  localAudio: MediaStreamTrack | undefined;
  sendingCaptions: boolean;
  receivingCaptions: boolean;
  seenWelcomeSnackbar: boolean;
  setLocalVideoText: Function;
  setCaptionsText: Function;
  customSnackbarMsg: string | HTMLElement | Element | undefined;

  constructor(
    name: string,
    catalystUUID: string,
    setCapText: Function,
    setVidText: Function,
    socketServerAddress?: string,
    cstMsg?: string | HTMLElement | Element
  ) {
    this.roomName = name;
    this.sessionId = catalystUUID + name;
    this.dataChannel = new Map();
    this.connected = new Map();
    this.localICECandidates = {};
    this.socket = io(socketServerAddress ?? DEFAULT_SERVER_ADDRESS);
    this.remoteVideoWrapper = document.getElementById(
      'wrapper'
    ) as HTMLDivElement;
    this.localVideo = document.getElementById(
      'local-video'
    ) as HTMLMediaElement;
    this.peerConnections = new Map();
    this.localAudio = undefined;
    this.localStream = undefined;
    this.sendingCaptions = false;
    this.receivingCaptions = false;
    this.seenWelcomeSnackbar = false;
    this.setCaptionsText = setCapText;
    this.setLocalVideoText = setVidText;
    this.customSnackbarMsg = cstMsg;
    // this.recognition = {};
  }

  /* Call to getUserMedia (provided by adapter.js for  browser compatibility) asking for access to both the video and audio streams. If the request is accepted callback to the onMediaStream function, otherwise callback to the noMediaStream function. */
  requestMediaStream = () => {
    logger('requestMediaStream');
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then(stream => {
        this.onMediaStream(stream);
        this.setLocalVideoText('Drag Me');
      })
      .catch(error => {
        logger(error);
        displayVideoErrorMessage();
        this.setCaptionsText(
          'Failed to activate your webcam. Check your webcam/privacy settings.'
        );
        logger(
          'Failed to get local webcam video, check webcam privacy settings'
        );
        // Keep trying to get user media
        setTimeout(this.requestMediaStream, 1000);
      });
  };

  onMediaStream = (stream: MediaStream) => {
    logger('onMediaStream');
    this.localStream = stream;
    if (!this.seenWelcomeSnackbar) {
      displayWelcomeMessage(this.customSnackbarMsg, this.roomName);
      this.seenWelcomeSnackbar = true;
    }

    /* When a video stream is added to VideoChat, we need to store the local audio track, because the screen sharing MediaStream doesn't have audio by default, which is problematic for peer C who joins while another peer A/B is screen sharing (C won't receive A/Bs audio). */
    this.localAudio = stream.getAudioTracks()[0];
    if (!this.localVideo) {
      this.localVideo = document.getElementById(
        'local-video'
      ) as HTMLMediaElement;
    }
    if (
      this.localVideo.srcObject === null ||
      this.localVideo.srcObject === undefined
    ) {
      this.localVideo.srcObject = stream;
    }
    // Join the chat room
    this.socket.emit('join', this.sessionId, () => {
      logger('joined');
    });
    // Add listeners to the websocket
    this.socket.on('leave', this.onLeave);
    this.socket.on('full', chatRoomFull);
    this.socket.on('offer', this.onOffer);
    this.socket.on('willInitiateCall', this.call);
    // Set up listeners on the socket
    this.socket.on('candidate', this.onCandidate);
    this.socket.on('answer', this.onAnswer);
    this.socket.on('requestToggleCaptions', () => {});
    // TODO: handleToggleCaptions(this);
    this.socket.on('receiveCaptions', (captions: any) => {
      // TODO: handleReceiveCaptions(
      // 	captions,
      // 	receivingCaptions,
      // 	setReceivingCaptions,
      // 	setHideCaptions,
      // 	setCaptionsText
      // );
      logger(captions);
    });

    const TextInput = document.querySelector(
      'textarea.compose'
    ) as HTMLTextAreaElement;
    TextInput?.addEventListener('keypress', (e: any) => {
      if (e.keyCode === 13) {
        e.preventDefault();
        var msg = TextInput.value;
        logger('textarea ' + msg);
        // Send message over data channel, add message to screen, auto scroll chat down
        if (msg && msg.length > 0) {
          // Prevent cross site scripting
          msg = msg.replace(/</g, '&lt;').replace(/>/g, '&gt;');
          sendToAllDataChannels('mes:' + msg, this.dataChannel);
          addMessageToScreen(msg, true);
          document.getElementById('chat-end')?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'start',
          });
          TextInput.value = '';
        }
      }
    });

    /* POST MESSAGING - forward post messaging from one parent to the other */
    window.onmessage = (e: MessageEvent) => {
      try {
        if (JSON.parse(e.data).type === 'arbitraryData') {
          sendToAllDataChannels(e.data, this.dataChannel);
        }
      } catch (e) {}
    };
  };

  call = (uuid: string, room: string) => {
    logger(`call >>> Initiating call with ${uuid}...`);
    this.socket.on(
      'token',
      this.establishConnection(uuid, (a: string) => {
        this.createOffer(a);
      })
    );
    this.socket.emit('token', this.sessionId, uuid);
  };

  onLeave = (uuid: string) => {
    // Remove video element
    try {
      logger('disconnected - UUID ' + uuid);
      (document.getElementById('leave-sound') as HTMLVideoElement)?.play();
      this?.remoteVideoWrapper?.removeChild(
        document.querySelectorAll(`[uuid="${uuid}"]`)[0]
      );
      ResizeWrapper();
    } catch (e) {
      logger(e);
    }

    // Delete connection & metadata
    this.connected.delete(uuid);
    this.peerConnections.get(uuid)?.close(); // This is necessary, because otherwise the RTC connection isn't closed
    this.peerConnections.delete(uuid);
    this.dataChannel.delete(uuid);
    if (this.peerConnections.size === 0) {
      this.setCaptionsText('Room ready. Waiting for others to join...');
    }
  };

  establishConnection = (correctUuid: string, callback: Function) => {
    return (token: TwilioToken, uuid: string) => {
      if (correctUuid !== uuid) {
        return;
      }
      logger(`<<< Received token, connecting to ${uuid}`);
      // Initialize localICEcandidates for peer uuid to empty array
      this.localICECandidates[uuid] = [];
      // Initialize connection status with peer uuid to false
      this.connected.set(uuid, false);
      // Set up a new RTCPeerConnection using the token's iceServers.
      this.peerConnections.set(
        uuid,
        new RTCPeerConnection({
          iceServers: token.iceServers,
        })
      );
      // Add the local video stream to the peerConnection.
      this.localStream?.getTracks().forEach((track: MediaStreamTrack) => {
        this.peerConnections
          .get(uuid)
          ?.addTrack(track, this.localStream as MediaStream);
      });
      // Add general purpose data channel to peer connection, used for text chats, captions, and toggling sending captions
      this.dataChannel.set(
        uuid,
        this.peerConnections.get(uuid)?.createDataChannel('chat', {
          negotiated: true,
          // both peers must have same id
          id: 0,
        }) as RTCDataChannel
      );
      // Handle different dataChannel types
      this.dataChannel.get(uuid)!.onmessage = (e: MessageEvent) => {
        const receivedData = e.data;
        // First 4 chars represent data type
        const dataType = receivedData.substring(0, 4);
        const cleanedMessage = receivedData.slice(4);
        if (dataType === 'mes:') {
          handlereceiveMessage(cleanedMessage);
        } else if (dataType === 'cap:') {
          // TODO: handleReceiveCaptions(
          // 	cleanedMessage,
          // 	receivingCaptions,
          // 	setReceivingCaptions,
          // 	setHideCaptions,
          // 	setCaptionsText
          // );
        } else if (dataType === 'tog:') {
          this.sendingCaptions = !this.sendingCaptions;
          // setSendingCaptions(!sendingCaptions);
        } else {
          // Arbitrary data handling
          logger('Received arbitrary data: ' + receivedData.toString());
          window.top.postMessage(receivedData, '*');
        }
      };
      /* 	Called when dataChannel is successfully opened - Set up callbacks for the connection generating iceCandidates or receiving the remote media stream. Wrapping callback functions to pass in the peer uuids. */
      this.dataChannel.get(uuid)!.onopen = (e: Event) => {
        logger('dataChannel opened');
      };
      if (this.peerConnections.get(uuid) !== undefined)
        this.peerConnections.get(uuid)!.onicecandidate = (
          e: RTCPeerConnectionIceEvent
        ) => {
          this.onIceCandidate(e, uuid);
        };

      this.peerConnections.get(uuid)!.ontrack = (e: RTCTrackEvent) => {
        this.onAddStream(e, uuid);
        this.setCaptionsText('Session connected successfully');
      };
      // Called when there is a change in connection state
      this.peerConnections.get(uuid)!.oniceconnectionstatechange = (
        e: Event
      ) => {
        switch (this.peerConnections.get(uuid)?.iceConnectionState) {
          case 'connected':
            logger('connected');
            break;
          case 'disconnected':
            // Disconnects are handled server-side
            logger('disconnected - UUID ' + uuid);
            break;
          case 'failed':
            logger('>>> would trigger refresh: failed ICE connection');
            window.location.reload();
            break;
          case 'closed':
            logger('closed');
            break;
        }
      };
      callback(uuid);
    };
  };

  // When the peerConnection generates an ice candidate, send it over the socket to the peer.
  onIceCandidate = (e: RTCPeerConnectionIceEvent, uuid: string) => {
    logger('onIceCandidate');
    if (e.candidate) {
      logger(
        // @ts-ignore
        `<<< Received local ICE candidate from STUN/TURN server (${e.candidate.address}) for connection with ${uuid}`
      );
      if (this.connected.get(uuid)) {
        // @ts-ignore
        logger(`>>> Sending local ICE candidate (${e.candidate.address})`);
        this.socket.emit(
          'candidate',
          JSON.stringify(e.candidate),
          this.sessionId,
          uuid
        );
      } else {
        /* If we are not 'connected' to the other peer, we are buffering the local ICE candidates. This most likely is happening on the "caller" side. The peer may not have created the RTCPeerConnection yet, so we are waiting for the 'answer' to arrive. This will signal that the peer is ready to receive signaling. */
        this.localICECandidates[uuid].push(e.candidate);
      }
    }
  };
  // When receiving a candidate over the socket, turn it back into a real RTCIceCandidate and add it to the peerConnection.
  onCandidate = (candidate: RTCIceCandidate, uuid: string) => {
    if (this.peerConnections.size === 0) {
      this.setCaptionsText('Found other user. Connecting...');
    }
    var rtcCandidate: RTCIceCandidate = new RTCIceCandidate(
      JSON.parse(candidate.toString())
    );
    logger(
      `onCandidate <<< Received remote ICE candidate (${rtcCandidate.port} - ${rtcCandidate.relatedAddress})`
    );
    this.peerConnections.get(uuid)?.addIceCandidate(rtcCandidate);
  };
  // Create an offer that contains the media capabilities of the browser.
  createOffer = (uuid: string): void => {
    logger(`createOffer to ${uuid} >>> Creating offer...`);
    this.peerConnections
      .get(uuid)
      ?.createOffer()
      .then((offer: RTCSessionDescriptionInit) => {
        /* If the offer is created successfully, set it as the local description and send it over the socket connection to initiate the peerConnection on the other side. */
        this.peerConnections.get(uuid)?.setLocalDescription(offer);
        this.socket.emit('offer', JSON.stringify(offer), this.sessionId, uuid);
      })
      .catch((err: any) => {
        logger('failed offer creation');
        // logger(err, true);
      });
  };

  /* Create an answer with the media capabilities that the client and peer browsers share. This function is called with the offer from the originating browser, which needs to be parsed into an RTCSessionDescription and added as the remote description to the peerConnection object. Then the answer is created in the same manner as the offer and sent over the socket. */
  createAnswer = (offer: RTCSessionDescription, uuid: string): void => {
    logger('createAnswer');
    var rtcOffer = new RTCSessionDescription(JSON.parse(offer.toString()));
    logger(`>>> Creating answer to ${uuid}`);
    this.peerConnections.get(uuid)?.setRemoteDescription(rtcOffer);
    this.peerConnections
      .get(uuid)
      ?.createAnswer()
      .then((answer: RTCSessionDescriptionInit) => {
        this.peerConnections.get(uuid)?.setLocalDescription(answer);
        this.socket.emit(
          'answer',
          JSON.stringify(answer),
          this.sessionId,
          uuid
        );
      })
      .catch((err: any) => {
        logger('Failed answer creation. ' + err.toString());
      });
  };

  // When a browser receives an offer, set up a callback to be run when the ephemeral token is returned from Twilio.
  onOffer = (offer: RTCSessionDescription, uuid: string): void => {
    logger('onOffer <<< Received offer');
    this.socket.on(
      'token',
      this.establishConnection(uuid, (a: string) => {
        this.createAnswer(offer, a);
      })
    );
    this.socket.emit('token', this.sessionId, uuid);
  };

  // When an answer is received, add it to the peerConnection as the remote description.
  onAnswer = (answer: RTCSessionDescription, uuid: string) => {
    logger(`onAnswer <<< Received answer from ${uuid}`);
    var rtcAnswer = new RTCSessionDescription(JSON.parse(answer.toString()));
    // Set remote description of RTCSession
    this.peerConnections.get(uuid)?.setRemoteDescription(rtcAnswer);
    // The caller now knows that the callee is ready to accept new ICE candidates, so sending the buffer over
    this.localICECandidates[uuid].forEach((candidate: RTCIceCandidate) => {
      // @ts-ignore
      logger(`>>> Sending local ICE candidate (${candidate.address})`);
      // Send ice candidate over websocket
      this.socket.emit(
        'candidate',
        JSON.stringify(candidate),
        this.sessionId,
        uuid
      );
    });
  };

  // Called when a stream is added to the peer connection: Create new <video> node and append remote video source to wrapper div
  onAddStream = (e: RTCTrackEvent, uuid: string) => {
    if (document.querySelector(`[uuid="${uuid}"]`) === null) {
      logger('onAddStream <<< Received new stream from remote. Adding it...');
      // this.setCaptionsText("Session connected successfully");

      logger('onAddStream <<< Playing join sound...');
      (document.getElementById('join-sound') as HTMLVideoElement)?.play();
      var node = document.createElement('video');
      node.setAttribute('autoplay', '');
      node.setAttribute('playsinline', '');
      node.setAttribute('id', 'remote-video');
      node.setAttribute('uuid', uuid);
      node.setAttribute('className', 'RemoteVideo');
      if (!this.remoteVideoWrapper) {
        this.remoteVideoWrapper = document.getElementById(
          'wrapper'
        ) as HTMLDivElement;
      }
      this.remoteVideoWrapper.appendChild(node);
      ResizeWrapper();
      // Update remote video source
      if (this.remoteVideoWrapper?.lastChild !== null) {
        let newVid = this.remoteVideoWrapper.lastChild as HTMLVideoElement;
        newVid.srcObject = e.streams.slice(-1)[0];
      }
      closeAllMessages();
      // Update connection status
      this.connected.set(uuid, true);
      // TODO: setHideCaptions(true);
    }
  };
}