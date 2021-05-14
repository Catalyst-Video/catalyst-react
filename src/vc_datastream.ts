/* VIDEO CHAT DATASTREAM: track video/audio streams, peer connections, handle webrtc */
import io from 'socket.io-client';
import {
  closeAllToasts,
  createMuteNode,
  createPauseNode,
  hueToColor,
  ResizeWrapper,
  setMutedIndicator,
  setPausedIndicator,
  setStreamColor,
  uuidToHue,
} from './utils/ui';
import { handlePictureInPicture } from './utils/stream';
import { logger, sendToAllDataChannels } from './utils/general';
import { TwilioToken, VideoChatData } from './typings/interfaces';
import {
  displayWebcamErrorMessage,
  handlereceiveMessage,
  displayMessage,
} from './utils/messages';
import './utils/autolink.js';
import { RefObject } from 'react';

export default class VCDataStream implements VideoChatData {
  sessionId: string;
  dataChannel: Map<string, RTCDataChannel>;
  connected: Map<string, boolean>;
  localICECandidates: Record<string, RTCIceCandidate[]>;
  socket: any;
  localVidRef: RefObject<HTMLVideoElement>;
  remoteVidRef: RefObject<HTMLDivElement>;
  peerConnections: Map<string, RTCPeerConnection>;
  localStream: MediaStream | undefined;
  localAudio: MediaStreamTrack | undefined;
  picInPic: string;
  setNumPeers: Function;
  showDotColors: boolean;
  showBorderColors: boolean;
  peerColors: Map<string, number>;
  localColor: string;
  incrementUnseenChats: Function;
  onAddPeer: Function | undefined;
  onRemovePeer: Function | undefined;
  handleArbitraryData: Function | undefined;
  startedCall: boolean;
  audioInput: MediaDeviceInfo | undefined;
  vidInput: MediaDeviceInfo | undefined;

  constructor(
    sessionKey: string,
    uniqueAppId: string,
    localVidRef: RefObject<HTMLVideoElement>,
    remoteVidRef: RefObject<HTMLDivElement>,
    incrementUnseenChats: Function,
    setNumPeers: Function,
    cstmServerAddress: string,
    picInPic?: string,
    onAddPeer?: Function,
    onRemovePeer?: Function,
    audioInput?: MediaDeviceInfo,
    vidInput?: MediaDeviceInfo,
    showBorderColors?: boolean,
    showDotColors?: boolean,
    handleArbitraryData?: Function
  ) {
    this.sessionId = uniqueAppId + sessionKey;
    this.dataChannel = new Map();
    this.connected = new Map();
    this.localICECandidates = {};
    this.socket = io(cstmServerAddress);
    this.remoteVidRef = remoteVidRef;
    this.localVidRef = localVidRef;
    this.peerConnections = new Map();
    this.audioInput = audioInput;
    this.vidInput = vidInput;
    this.picInPic = picInPic ?? 'dblclick';
    this.peerColors = new Map();
    this.localColor = 'var(--themeColor)';
    this.incrementUnseenChats = incrementUnseenChats;
    this.setNumPeers = setNumPeers;
    this.showBorderColors = showBorderColors ?? false;
    this.showDotColors = showDotColors ?? false;
    this.onAddPeer = onAddPeer;
    this.onRemovePeer = onRemovePeer;
    this.handleArbitraryData = handleArbitraryData;
    this.startedCall = false;
  }

  /* Call to getUserMedia requesting access to video and audio streams. If the request is accepted callback to the onMediaStream function, otherwise callback to the noMediaStream function. */
  requestMediaStream = () => {
    logger('requestMediaStream');
    let audioProp: boolean | { deviceId: string | undefined } = true;
    let videoProp: boolean | { deviceId: string | undefined } = true;
    audioProp = { deviceId: this.audioInput?.deviceId };
    videoProp = { deviceId: this.vidInput?.deviceId };
    navigator.mediaDevices
      .getUserMedia({
        audio: audioProp,
        video: videoProp,
      })
      .then(stream => {
        this.onMediaStream(stream);
      })
      .catch(error => {
        logger(error);
        displayWebcamErrorMessage(this.connected);
        logger(
          'Failed to get local webcam video, check webcam privacy settings'
        );
        // Keep attempting to get user media
        setTimeout(this.requestMediaStream, 1000);
      });
  };

  onMediaStream = (stream: MediaStream) => {
    logger('onMediaStream');
    this.localStream = stream;

    /* When a video stream is added to VideoChat, we need to store the local audio track, because the screen sharing MediaStream doesn't have audio by default, which is problematic for peer C who joins while another peer A/B is screen sharing (C won't receive A/Bs audio). */
    this.localAudio = stream.getAudioTracks()[0];
    if (this.localVidRef.current && !this.localVidRef.current.srcObject)
      this.localVidRef.current.srcObject = stream;
    // Join the chat room
    this.socket.emit('join', this.sessionId, () => {
      if (this.showBorderColors) {
        this.localColor = hueToColor(
          uuidToHue(this.socket.id, this).toString()
        );
        if (this.localVidRef.current)
          this.localVidRef.current.style.border = `2px solid ${this.localColor}`;
      }
      if (this.showDotColors) {
        let localIndicator = document.getElementById(
          'local-indicator'
        ) as HTMLDivElement;
        localIndicator.style.background = this.localColor;
      }
      logger('joined');
    });
    // Add listeners to the websocket
    this.socket.on('leave', this.onPeerLeave);
    this.socket.on('offer', this.onOffer);
    this.socket.on('willInitiateCall', this.call);
    this.socket.on('full', logger('chatRoomFull'));
    // Set up listeners on the socket
    this.socket.on('candidate', this.onCandidate);
    this.socket.on('answer', this.onAnswer);
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

  // Remove video element container, delete connection & metadata
  onPeerLeave = (uuid: string) => {
    try {
      logger('disconnected - UUID ' + uuid);
      /* TODO:  let leaveSound = document.getElementById(
        'leave-sound'
      ) as HTMLAudioElement;
       if (leaveSound) leaveSound?.play(); */
      this?.remoteVidRef.current?.removeChild(
        document.querySelectorAll(`[uuid="${uuid}"]`)[0]
      );
      ResizeWrapper();
    } catch (e) {
      logger(e);
    }
    this.connected.delete(uuid);
    this.peerConnections.get(uuid)?.close(); // necessary b/c otherwise the RTC connection isn't closed
    this.peerConnections.delete(uuid);
    this.dataChannel.delete(uuid);
    this.setNumPeers(this.peerConnections.size);
    if (this.onRemovePeer) this.onRemovePeer();
  };

  establishConnection = (correctUuid: string, callback: Function) => {
    return (token: TwilioToken, uuid: string) => {
      if (correctUuid !== uuid) return;
      logger(`<<< Received token, connecting to ${uuid}`);
      // Initialize localICEcandidates for peer uuid to empty array
      this.localICECandidates[uuid] = [];
      // Initialize connection status with peer uuid to false
      this.connected.set(uuid, false);
      // Set up a new RTCPeerConnection using the token's iceServers
      this.peerConnections.set(
        uuid,
        new RTCPeerConnection({
          iceServers: token.iceServers,
        })
      );
      // Add the local video stream to the peerConnection
      this.localStream?.getTracks().forEach((track: MediaStreamTrack) => {
        this.peerConnections
          .get(uuid)
          ?.addTrack(track, this.localStream as MediaStream);
      });

      // Add general purpose data channel to peer connection: used for chats, toggling indicators, and arbitrary data. Both peers *must* have same "id"
      this.dataChannel.set(
        uuid,
        this.peerConnections.get(uuid)?.createDataChannel('chat', {
          negotiated: true,
          id: 0,
        }) as RTCDataChannel
      );
      // Handle different dataChannel types: First 4 chars represent data type
      this.dataChannel.get(uuid)!.onmessage = (e: MessageEvent) => {
        const dataId = e.data.substring(0, 4);
        const msg = e.data.slice(4);
        switch (dataId) {
          case 'mes:':
            if (this.showBorderColors || this.showDotColors)
              handlereceiveMessage(
                msg,
                hueToColor(this.peerColors.get(uuid)?.toString() ?? '')
              );
            else handlereceiveMessage(msg);
            this.incrementUnseenChats();
            break;
          case 'mut:':
            setMutedIndicator(uuid, msg);
            break;
          case 'vid:':
            setPausedIndicator(uuid, msg);
            break;
          case 'clr:' && (this.showBorderColors || this.showDotColors):
            setStreamColor(
              uuid,
              msg,
              this.showDotColors,
              this.showBorderColors
            );
            break;
          default:
            logger('Received arbitrary data: ' + e.data);
            if (this.handleArbitraryData) this.handleArbitraryData(e.data);
            else window.top.postMessage(e.data, '*');
        }
      };

      /* POST MESSAGING - handle arbitrary data in iFrames by forwarding post messaging from one peer to the other */
      window.onmessage = (e: MessageEvent) => {
        try {
          if (JSON.parse(e.data).type === 'arbitrary_data')
            sendToAllDataChannels(e.data, this.dataChannel);
        } catch (e) {
          logger(e);
        }
      };

      /* Called when dataChannel is successfully opened - Set up callbacks for the connection generating iceCandidates or receiving the remote media stream. Wrapping callback functions to pass in the peer uuids. */
      this.dataChannel.get(uuid)!.onopen = () => {
        logger('dataChannel opened');
        if (this.showBorderColors || this.showDotColors)
          setStreamColor(uuid, this, this.showDotColors, this.showBorderColors);
      };
      if (this.peerConnections.get(uuid) !== undefined)
        this.peerConnections.get(uuid)!.onicecandidate = (
          e: RTCPeerConnectionIceEvent
        ) => {
          this.onIceCandidate(e, uuid);
        };

      this.peerConnections.get(uuid)!.ontrack = (e: RTCTrackEvent) => {
        this.onAddStream(e, uuid);

        if (!this.startedCall) this.startedCall = true;
        displayMessage('Session connected successfully', 500);
        setTimeout(() => closeAllToasts(), 1000);
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
            logger('disconnected (handled server-side) - UUID: ' + uuid);
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

  // When the peerConnection generates an ice candidate, send it over the socket to the peer
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
    if (this.peerConnections.size === 0)
      displayMessage('Found other user. Connecting...');
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
      .catch((err: string) => {
        logger('failed offer creation' + err);
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

  // When a browser receives an offer, set up a callback to be run when the ephemeral token is returned from Twilio
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

  // When an answer is received, add it to the peerConnection as the remote description
  onAnswer = (answer: RTCSessionDescription, uuid: string) => {
    logger(`onAnswer <<< Received answer from ${uuid}`);
    var rtcAnswer = new RTCSessionDescription(JSON.parse(answer.toString()));
    // Set remote description of RTCSession
    this.peerConnections.get(uuid)?.setRemoteDescription(rtcAnswer);
    // The caller now knows that the callee is ready to accept new ICE candidates, so sending the buffer over
    this.localICECandidates[uuid].forEach((candidate: RTCIceCandidate) => {
      // @ts-ignore
      logger(`>>> Sending local ICE candidate (${candidate.address})`);
      // Send ICE candidate over websocket
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
      this.setNumPeers(this.peerConnections.size);
      logger('onAddStream <<< Received new stream from remote. Adding it...');

      /*TODO:   logger('onAddStream <<< Playing join sound...');
      let joinSound = document.getElementById('join-sound') as HTMLAudioElement;
      if (joinSound) joinSound?.play(); */
      var vidDiv = document.createElement('div');
      vidDiv.setAttribute('id', 'remote-div');
      vidDiv.setAttribute('uuid', uuid);

      var vidNode = document.createElement('video');
      vidNode.setAttribute('autoplay', '');
      vidNode.setAttribute('playsinline', '');
      vidNode.setAttribute('id', 'remote-video');
      vidNode.setAttribute('className', 'RemoteVideo');
      vidNode.setAttribute('vid-uuid', uuid);

      var muteNode = createMuteNode(uuid);
      var pauseNode = createPauseNode(uuid);
      vidDiv.appendChild(muteNode);
      vidDiv.appendChild(pauseNode);

      // TODO: easiest way to add optional names?
      // indicatorNode.textContent = 'John Doe';

      if (this.remoteVidRef.current) {
        vidNode.srcObject = e.streams.slice(-1)[0];

        if (this.picInPic !== 'disabled') {
          vidNode.addEventListener(this.picInPic, () => {
            handlePictureInPicture(this, vidNode);
          });
        }

        if (this.showDotColors) {
          var indicatorNode = document.createElement('div');
          indicatorNode.setAttribute('id', 'indicator');
          indicatorNode.setAttribute('indicator-uuid', uuid);
          vidDiv.appendChild(indicatorNode);
        }

        vidDiv.appendChild(vidNode);
        this.remoteVidRef.current.appendChild(vidDiv);
        ResizeWrapper();

        if (this.onAddPeer) this.onAddPeer();
        closeAllToasts();
        this.connected.set(uuid, true);
      }
    }
  };
}
