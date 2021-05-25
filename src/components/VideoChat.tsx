import React, { useEffect, useRef, useState } from 'react';

// Other packages
import io from 'socket.io-client';

import '../utils/autolink.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import Draggable from 'react-draggable';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import {
  DefaultSettings,
  HiddenSettings,
  TwilioToken,
} from '../typings/interfaces';
import {
  hueToColor,
  ResizeWrapper,
  setMutedIndicator,
  setPausedIndicator,
  setStreamColor,
} from '../utils/ui';
import { logger, sendToAllDataChannels } from '../utils/general';
import Header from './Header';
import Chat from './Chat';
import Settings from './Settings';
import Toolbar from './Toolbar';
import RemoteVideos from './RemoteVideos';
import { handlereceiveMessage } from '../utils/messages';
import LocalVideo from './LocalVideo.js';

const VideoChat = ({
  sessionKey,
  uniqueAppId,
  cstmServerAddress,
  defaults,
  hidden,
  picInPic,
  onStartCall,
  onAddPeer,
  onRemovePeer,
  onEndCall,
  arbitraryData,
  onReceiveArbitraryData,
  cstmWelcomeMsg,
  cstmOptionBtns,
  showDotColors,
  showBorderColors,
  autoFade,
  alwaysBanner,
  dark,
  setDark,
  disableLocalVidDrag,
  audioEnabled,
  videoEnabled,
  setAudio,
  setVideo,
  audioInput,
  vidInput,
  setAudioInput,
  setVidInput,
  themeColor,
  redIndicators,
}: {
  sessionKey: string;
  uniqueAppId: string;
  autoFade: number;
  cstmServerAddress: string;
  defaults?: DefaultSettings;
  hidden?: HiddenSettings;
  picInPic?: string;
  onStartCall?: Function;
  onAddPeer?: Function;
  onRemovePeer?: Function;
  onEndCall?: Function;
  arbitraryData?: string;
  onReceiveArbitraryData?: Function;
  cstmWelcomeMsg?: JSX.Element | string;
  cstmOptionBtns?: JSX.Element[];
  showDotColors?: boolean;
  showBorderColors?: boolean;
  alwaysBanner?: boolean;
  dark?: boolean;
  setDark?: Function;
  disableLocalVidDrag?: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  setAudio: Function;
  setVideo: Function;
  audioInput?: MediaDeviceInfo;
  vidInput?: MediaDeviceInfo;
  setAudioInput: Function;
  setVidInput: Function;
  themeColor: string;
  redIndicators?: boolean;
}) => {
  const fsHandle = useFullScreenHandle();
  // const [VC, setVCData] = useState<VideoChatData>();
  const [sharing, setSharing] = useState(false);
  const [unseenChats, setUnseenChats] = useState(0);
  const [localVideoText, setLocalVideoText] = useState('No webcam input');
  const [showChat, setShowChat] = useState<boolean>(
    defaults?.showChatArea ?? false
  );
  const [showSettings, setSettings] = useState(false);
  const [peerColors, setPeerColors] = useState<Map<string, number>>(new Map());

  // video chat data
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [localAudio, setLocalAudio] = useState<MediaStreamTrack>();
  const [peerConnections, setPeerConnections] = useState<
    Map<string, RTCPeerConnection>
  >(new Map());
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map()
  );
  const [dataChannel, setDataChannel] = useState<Map<string, RTCDataChannel>>(
    new Map()
  );
  const [connected, setConnected] = useState<Map<string, boolean>>(new Map());
  const [localICECandidates, setLocalICECandidates] = useState<
    Record<string, RTCIceCandidate[]>
  >({});
  const [socket] = useState<any>(io(cstmServerAddress));
  const [startedCall, setStartedCall] = useState(false);

  // refs
  const catalystRef = useRef<HTMLDivElement>(null);
  // const localVidRef = useRef<HTMLVideoElement>(null);
  // const remoteVidRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const requestMediaStream = () => {
    logger('requestMediaStream');
    let audioProp: boolean | { deviceId: string | undefined } = true;
    let videoProp: boolean | { deviceId: string | undefined } = true;
    audioProp = { deviceId: audioInput?.deviceId };
    videoProp = { deviceId: vidInput?.deviceId };
    navigator.mediaDevices
      .getUserMedia({
        audio: audioProp,
        video: videoProp,
      })
      .then(stream => {
        onMediaStream(stream);
      })
      .catch(error => {
        logger(error);
        logger(
          'Failed to get local webcam video, check webcam privacy settings'
        );
        // Keep attempting to get user media
        setTimeout(requestMediaStream, 1000);
      });
  };

  const onMediaStream = (stream: MediaStream) => {
    logger('onMediaStream');
    setLocalStream(stream);
  };

  useEffect(() => {
    if (localStream) {
      setLocalVideoText(disableLocalVidDrag ? '' : 'Drag Me');
      /* When a video stream is added to VideoChat, we need to store the local audio track, because the screen sharing MediaStream doesn't have audio by default, which is problematic for peer C who joins while another peer A/B is screen sharing (C won't receive A/Bs audio). */
      let localAudio = localStream.getAudioTracks()[0];
      setLocalAudio(localAudio);
      /*  if (localVidRef.current && !localVidRef.current.srcObject)
      localVidRef.current.srcObject = stream; */
      // Join the chat room
      socket.emit('join', uniqueAppId + sessionKey, () => {
        /*TODO: border/dot colors
       if (showBorderColors) {
        localColor = hueToColor(
          uuidToHue(socket.id, this).toString()
        );
        if (localVidRef.current)
          localVidRef.current.style.border = `2px solid ${localColor}`;
      } 
      
      if (showDotColors) {
        let localIndicator = document.getElementById(
          'local-indicator'
        ) as HTMLDivElement;
        localIndicator.style.background = localColor;
      }
      */
        logger('joined');
      });
      // Add listeners to the websocket
      socket.on('leave', onPeerLeave);
      socket.on('offer', onOffer);
      socket.on('willInitiateCall', call);
      socket.on('full', logger('chatRoomFull'));
      // Set up listeners on the socket
      socket.on('candidate', onCandidate);
      socket.on('answer', onAnswer);
    }
  }, [localStream]);

  const call = (uuid: string, room: string) => {
    logger(`call >>> Initiating call with ${uuid}...`);
    socket.on(
      'token',
      establishConnection(uuid, (a: string) => {
        createOffer(a);
      })
    );
    socket.emit('token', uniqueAppId + sessionKey, uuid);
  };

  // Remove video element container, delete connection & metadata
  const onPeerLeave = (uuid: string) => {
    try {
      logger('disconnected - UUID ' + uuid);
      /* TODO:  let leaveSound = document.getElementById(
        'leave-sound'
      ) as HTMLAudioElement;
       if (leaveSound) leaveSound?.play(); */
      /* this?.remoteVidRef.current?.removeChild(
        document.querySelectorAll(`[uuid="${uuid}"]`)[0]
      ); 
      ResizeWrapper();*/
    } catch (e) {
      logger(e);
    }
    connected?.delete(uuid);
    peerConnections?.get(uuid)?.close(); // necessary b/c otherwise the RTC connection isn't closed
    peerConnections?.delete(uuid);
    dataChannel?.delete(uuid);
    // setNumPeers(peerConnections?.size);
    if (onRemovePeer) onRemovePeer();
  };

  const establishConnection = (correctUuid: string, callback: Function) => {
    return (token: TwilioToken, uuid: string) => {
      if (correctUuid !== uuid) return;
      logger(`<<< Received token, connecting to ${uuid}`);
      // Initialize localICEcandidates for peer uuid to empty array
      localICECandidates[uuid] = [];
      // Initialize connection status with peer uuid to false
      setConnected(new Map(connected?.set(uuid, false)));
      // Set up a new RTCPeerConnection using the token's iceServers
      setPeerConnections(
        new Map(
          peerConnections?.set(
            uuid,
            new RTCPeerConnection({
              iceServers: token.iceServers,
            })
          )
        )
      );

      // Add the local video stream to the peerConnection
      localStream?.getTracks().forEach((track: MediaStreamTrack) => {
        /* TODO: Request 16:9 standard high definition (HD) video size
        track
          .applyConstraints({
            width: 1920,
            height: 1080,
            aspectRatio: 1.777777778,
          })
          .then(() => {
            peerConnections?
              .get(uuid)
              ?.addTrack(track, localStream as MediaStream);
          })
          .catch(err => {
            logger(err);
            peerConnections?
              .get(uuid)
              ?.addTrack(track, localStream as MediaStream);
          }); */
        peerConnections?.get(uuid)?.addTrack(track, localStream);
      });

      // Add general purpose data channel to peer connection: used for chats, toggling indicators, and arbitrary data. Both peers *must* have same "id"
      setDataChannel(
        new Map(
          dataChannel?.set(
            uuid,
            peerConnections?.get(uuid)?.createDataChannel('chat', {
              negotiated: true,
              id: 0,
            }) as RTCDataChannel
          )
        )
      );
      // Handle different dataChannel? types: First 4 chars represent data type
      if (dataChannel)
        dataChannel.get(uuid)!.onmessage = (e: MessageEvent) => {
          const dataId = e.data.substring(0, 4);
          const msg = e.data.slice(4);
          switch (dataId) {
            case 'mes:':
              if (showBorderColors || showDotColors)
                handlereceiveMessage(
                  msg,
                  hueToColor(peerColors?.get(uuid)?.toString() ?? '')
                );
              else handlereceiveMessage(msg);
              incrementUnseenChats();
              break;
            case 'mut:':
              setMutedIndicator(uuid, msg);
              break;
            case 'vid:':
              setPausedIndicator(uuid, msg);
              break;
            case 'clr:' && (showBorderColors || showDotColors):
              //  setStreamColor(uuid, msg, showDotColors, showBorderColors);
              break;
            default:
              logger('Received arbitrary data: ' + e.data);
              if (onReceiveArbitraryData) onReceiveArbitraryData(e.data);
              else window.top.postMessage(e.data, '*');
          }
        };

      /* POST MESSAGING - handle arbitrary data in iFrames by forwarding post messaging from one peer to the other */
      window.onmessage = (e: MessageEvent) => {
        try {
          if (
            JSON.parse(e.data).type === 'arbitrary_data' &&
            dataChannel &&
            remoteStreams.size > 0
          )
            sendToAllDataChannels(e.data, dataChannel);
        } catch (e) {
          logger(e);
        }
      };

      /* Called when dataChannel? is successfully opened - Set up callbacks for the connection generating iceCandidates or receiving the remote media stream. Wrapping callback functions to pass in the peer uuids. */
      /* TODO: dataChannel?.get(uuid)!.onopen = () => {
       logger('dataChannel? opened');
       if (showBorderColors || showDotColors)
         setStreamColor(uuid, this, showDotColors, showBorderColors);
     }; */
      if (peerConnections?.get(uuid) !== undefined) {
        peerConnections.get(uuid)!.onicecandidate = (
          e: RTCPeerConnectionIceEvent
        ) => {
          onIceCandidate(e, uuid);
        };

        peerConnections.get(uuid)!.ontrack = (e: RTCTrackEvent) => {
          onAddStream(e, uuid);

          //  start call
          if (!startedCall) {
            setStartedCall(true);
            if (onStartCall) onStartCall();
            if (!audioEnabled && localAudio) localAudio.enabled = false;
            if (!videoEnabled && localStream)
              localStream
                ?.getVideoTracks()
                .forEach((track: MediaStreamTrack) => {
                  track.enabled = false;
                });
          }
        };
        // Called when there is a change in connection state
        peerConnections.get(uuid)!.oniceconnectionstatechange = (e: Event) => {
          switch (peerConnections?.get(uuid)?.iceConnectionState) {
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
      }
    };
  };

  // When the peerConnection generates an ice candidate, send it over the socket to the peer
  const onIceCandidate = (e: RTCPeerConnectionIceEvent, uuid: string) => {
    logger('onIceCandidate');
    if (e.candidate) {
      logger(
        // @ts-ignore
        `<<< Received local ICE candidate from STUN/TURN server (${e.candidate.address}) for connection with ${uuid}`
      );
      if (connected?.get(uuid)) {
        // @ts-ignore
        logger(`>>> Sending local ICE candidate (${e.candidate.address})`);
        socket.emit(
          'candidate',
          JSON.stringify(e.candidate),
          uniqueAppId + sessionKey,
          uuid
        );
      } else {
        /* If we are not 'connected?' to the other peer, we are buffering the local ICE candidates. This most likely is happening on the "caller" side. The peer may not have created the RTCPeerConnection yet, so we are waiting for the 'answer' to arrive. This will signal that the peer is ready to receive signaling. */
        localICECandidates[uuid].push(e.candidate);
        setLocalICECandidates(localICECandidates);
      }
    }
  };
  // When receiving a candidate over the socket, turn it back into a real RTCIceCandidate and add it to the peerConnection.
  const onCandidate = (candidate: RTCIceCandidate, uuid: string) => {
    var rtcCandidate: RTCIceCandidate = new RTCIceCandidate(
      JSON.parse(candidate.toString())
    );
    logger(
      `onCandidate <<< Received remote ICE candidate (${rtcCandidate.port} - ${rtcCandidate.relatedAddress})`
    );
    peerConnections?.get(uuid)?.addIceCandidate(rtcCandidate);
  };
  // Create an offer that contains the media capabilities of the browser.
  const createOffer = (uuid: string): void => {
    logger(`createOffer to ${uuid} >>> Creating offer...`);
    peerConnections
      ?.get(uuid)
      ?.createOffer()
      .then((offer: RTCSessionDescriptionInit) => {
        /* If the offer is created successfully, set it as the local description and send it over the socket connection to initiate the peerConnection on the other side. */
        peerConnections?.get(uuid)?.setLocalDescription(offer);
        socket.emit(
          'offer',
          JSON.stringify(offer),
          uniqueAppId + sessionKey,
          uuid
        );
      })
      .catch((err: string) => {
        logger('failed offer creation' + err);
      });
  };

  /* Create an answer with the media capabilities that the client and peer browsers share. This function is called with the offer from the originating browser, which needs to be parsed into an RTCSessionDescription and added as the remote description to the peerConnection object. Then the answer is created in the same manner as the offer and sent over the socket. */
  const createAnswer = (offer: RTCSessionDescription, uuid: string): void => {
    logger('createAnswer');
    var rtcOffer = new RTCSessionDescription(JSON.parse(offer.toString()));
    logger(`>>> Creating answer to ${uuid}`);
    peerConnections?.get(uuid)?.setRemoteDescription(rtcOffer);
    peerConnections
      ?.get(uuid)
      ?.createAnswer()
      .then((answer: RTCSessionDescriptionInit) => {
        peerConnections?.get(uuid)?.setLocalDescription(answer);
        socket.emit(
          'answer',
          JSON.stringify(answer),
          uniqueAppId + sessionKey,
          uuid
        );
      })
      .catch((err: any) => {
        logger('Failed answer creation. ' + err.toString());
      });
  };

  // When a browser receives an offer, set up a callback to be run when the ephemeral token is returned from Twilio
  const onOffer = (offer: RTCSessionDescription, uuid: string): void => {
    logger('onOffer <<< Received offer');
    socket.on(
      'token',
      establishConnection(uuid, (a: string) => {
        createAnswer(offer, a);
      })
    );
    socket.emit('token', uniqueAppId + sessionKey, uuid);
  };

  // When an answer is received, add it to the peerConnection as the remote description
  const onAnswer = (answer: RTCSessionDescription, uuid: string) => {
    logger(`onAnswer <<< Received answer from ${uuid}`);
    var rtcAnswer = new RTCSessionDescription(JSON.parse(answer.toString()));
    // Set remote description of RTCSession
    peerConnections?.get(uuid)?.setRemoteDescription(rtcAnswer);
    // The caller now knows that the callee is ready to accept new ICE candidates, so sending the buffer over
    localICECandidates[uuid].forEach((candidate: RTCIceCandidate) => {
      // @ts-ignore
      logger(`>>> Sending local ICE candidate (${candidate.address})`);
      // Send ICE candidate over websocket
      socket.emit(
        'candidate',
        JSON.stringify(candidate),
        uniqueAppId + sessionKey,
        uuid
      );
    });
  };

  // Called when a stream is added to the peer connection: Create new <video> node and append remote video source to wrapper div
  const onAddStream = (e: RTCTrackEvent, uuid: string) => {
    if (!remoteStreams.get(uuid)) {
      logger('onAddStream <<< Received new stream from remote. Adding it...');
      setRemoteStreams(
        // remoteStreams =>
        new Map(remoteStreams.set(uuid, e.streams.slice(-1)[0]))
      );
      if (onAddPeer) onAddPeer();
      setConnected(new Map(connected?.set(uuid, true)));
    }
  };

  useEffect(() => {
    if (
      catalystRef &&
      catalystRef.current?.parentNode?.parentNode?.nodeName === 'BODY'
    )
      catalystRef.current.style.position = 'fixed';

    /* TODO:  // Load and resize Event
    window.addEventListener(
      'load',
      (e: Event) => {
        ResizeWrapper();
        window.onresize = ResizeWrapper;
      },
      false
    ); */

    // start call
    requestMediaStream();

    return () => {
      socket.emit('disconnecting');
      socket.disconnect();
      localStream?.getTracks().forEach(track => track.stop());
      peerConnections?.forEach(peer => peer.close());
    };
  }, []);

  useEffect(() => {
    ResizeWrapper();
    setUnseenChats(0);
  }, [showChat]);

  useEffect(() => {
    if (arbitraryData && remoteStreams.size > 0)
      sendToAllDataChannels(arbitraryData, dataChannel);
  }, [arbitraryData]);

  useEffect(() => {
    setTimeout(() => {
      if (dataChannel) {
        if (!audioEnabled && remoteStreams.size > 0)
          sendToAllDataChannels(`mut:true`, dataChannel);
        if (!videoEnabled && remoteStreams.size > 0)
          sendToAllDataChannels(`vid:true`, dataChannel);
      }
    }, 2000);
    if (!audioEnabled && localAudio) localAudio.enabled = false;
    if (!videoEnabled && localStream)
      localStream?.getVideoTracks().forEach((track: MediaStreamTrack) => {
        track.enabled = false;
      });
  }, [peerConnections]);

  const incrementUnseenChats = () => {
    setUnseenChats(unseenChats => unseenChats + 1);
  };

  const SettingsButton = () => (
    <button
      onClick={() => {
        setSettings(!showSettings);
      }}
      className="absolute top-10 sm:top-4 right-4 text-black dark:text-white cursor-pointer z-10 focus:border-0 focus:outline-none"
    >
      <FontAwesomeIcon icon={faEllipsisV} size="lg" className="" />
    </button>
  );
  return (
    <div
      id="catalyst"
      ref={catalystRef}
      className={`${
        dark ? 'dark' : ''
      } box-border h-full w-full m-0 p-0 opacity-0 overflow-hidden max-h-screen max-w-screen relative`}
    >
      <div id="bg-theme" className="h-full w-full bg-gray-200 dark:bg-gray-900">
        <FullScreen
          handle={fsHandle}
          className="h-full w-full bg-gray-200 dark:bg-gray-900"
        >
          <Header
            autoFade={autoFade}
            toolbarRef={toolbarRef}
            sessionKey={sessionKey}
            alwaysBanner={alwaysBanner}
            uniqueAppId={uniqueAppId}
            themeColor={themeColor}
          />
          <Chat
            showChat={showChat}
            setShowChat={setShowChat}
            dataChannel={dataChannel}
            // localColor={localColor}
            themeColor={themeColor}
          />
          <div id="call-section" className="w-full h-full items-end">
            <LocalVideo
              localStream={localStream}
              disableLocalVidDrag={disableLocalVidDrag}
              localVideoText={localVideoText}
              themeColor={themeColor}
            />

            <RemoteVideos
              peerConnections={peerConnections}
              remoteStreams={remoteStreams}
              showDotColors={showDotColors}
              showChat={showChat}
              cstmWelcomeMsg={cstmWelcomeMsg}
              sessionKey={sessionKey}
              themeColor={themeColor}
            />

            {!showChat && (
              <>
                <SettingsButton />
                {showSettings && (
                  <Settings
                    themeColor={themeColor}
                    vidInput={vidInput}
                    audioInput={audioInput}
                    setAudioInput={setAudioInput}
                    setVidInput={setVidInput}
                    setSettings={setSettings}
                    audioEnabled={audioEnabled}
                    setAudio={setAudio}
                    videoEnabled={videoEnabled}
                    setVideo={setVideo}
                    dark={dark}
                    setDark={setDark}
                    setLocalVideoText={setLocalVideoText}
                    disableLocalVidDrag={disableLocalVidDrag}
                  />
                )}
              </>
            )}

            <Toolbar
              toolbarRef={toolbarRef}
              hidden={hidden}
              audioEnabled={audioEnabled}
              redIndicators={redIndicators}
              themeColor={themeColor}
              setAudio={setAudio}
              videoEnabled={videoEnabled}
              setVideo={setVideo}
              setLocalVideoText={setLocalVideoText}
              disableLocalVidDrag={disableLocalVidDrag}
              fsHandle={fsHandle}
              showChat={showChat}
              setShowChat={setShowChat}
              unseenChats={unseenChats}
              sharing={sharing}
              setSharing={setSharing}
              cstmOptionBtns={cstmOptionBtns}
              onEndCall={onEndCall}
              localAudio={localAudio}
              localStream={localStream}
              setLocalAudio={setLocalAudio}
              setLocalStream={setLocalStream}
              dataChannel={dataChannel}
            />
          </div>
        </FullScreen>
      </div>
    </div>
  );
};
export default VideoChat;
