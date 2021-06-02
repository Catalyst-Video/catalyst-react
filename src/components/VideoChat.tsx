import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import '../utils/autolink.js';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import {
  DefaultSettings,
  HiddenToolbarItems,
  PeerMetadata,
  TwilioToken,
} from '../typings/interfaces';
// import { setMutedIndicator, setPausedIndicator } from '../utils/ui';
import {
  logger,
  millisecondsToTime,
  sendToAllDataChannels,
} from '../utils/general';
import {
  Chat,
  Header,
  LocalVideo,
  RemoteVideos,
  Settings,
  Toolbar,
} from './index.js';

const VideoChat = ({
  sessionKey,
  uniqueAppId,
  cstmServerAddress,
  defaults,
  hiddenTools,
  picInPic,
  onStartCall,
  onAddPeer,
  onRemovePeer,
  onEndCall,
  onSubmitLog,
  arbitraryData,
  onReceiveArbitraryData,
  cstmWelcomeMsg,
  cstmOptionBtns,
  localName,
  autoFade,
  alwaysBanner,
  dark,
  setDark,
  disableLocalVidDrag,
  audioEnabled,
  videoEnabled,
  setAudioEnabled,
  setVideoEnabled,
  audInput,
  vidInput,
  setAudInput,
  setVidInput,
  themeColor,
  disableRedIndicators,
  fourThreeAspectRatioEnabled,
}: {
  sessionKey: string;
  uniqueAppId: string;
  autoFade: number;
  cstmServerAddress: string;
  defaults?: DefaultSettings;
  hiddenTools?: HiddenToolbarItems;
  picInPic?: string;
  onStartCall?: Function;
  onAddPeer?: Function;
  onRemovePeer?: Function;
  onEndCall?: Function;
  onSubmitLog?: Function;
  arbitraryData?: string;
  onReceiveArbitraryData?: Function;
  cstmWelcomeMsg?: JSX.Element | string;
  cstmOptionBtns?: JSX.Element[];
  localName: string;
  alwaysBanner?: boolean;
  dark?: boolean;
  setDark?: Function;
  disableLocalVidDrag?: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  setAudioEnabled: Function;
  setVideoEnabled: Function;
  audInput?: MediaDeviceInfo;
  vidInput?: MediaDeviceInfo;
  setAudInput: Function;
  setVidInput: Function;
  themeColor: string;
  disableRedIndicators?: boolean;
  fourThreeAspectRatioEnabled?: boolean;
}) => {
  const fsHandle = useFullScreenHandle();
  const [sharing, setSharing] = useState(false);
  const [unseenChats, setUnseenChats] = useState(0);
  const [localVideoText, setLocalVideoText] = useState('No webcam input');
  const [showChat, setShowChat] = useState<boolean>(
    defaults?.showChatArea ?? false
  );
  // uuid, name, msg
  const [chatMessages, setChatMessages] = useState<[string, string, string][]>(
    []
  );

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
  const [peerMetadata, setPeerMetadata] = useState<Map<string, PeerMetadata>>(
    new Map()
  );
  const [connected, setConnected] = useState<Map<string, boolean>>(new Map());
  const [localICECandidates, setLocalICECandidates] = useState<
    Record<string, RTCIceCandidate[]>
  >({});
  const [socket] = useState<any>(io(cstmServerAddress));
  const [startedCall, setStartedCall] = useState(false);

  const [startTime, setStartTime] = useState(new Date());

  const catalystRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const requestMediaStream = () => {
    logger('requestMediaStream');
    let audioProp: boolean | { deviceId: string | undefined } = true;
    let videoProp: boolean | { deviceId: string | undefined } = true;
    audioProp = { deviceId: audInput?.deviceId };
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
    if (localStream && remoteStreams.size < 1) {
      // officially start session
      setStartTime(new Date());
      // TODO: setLocalVideoText(disableLocalVidDrag ? '' : 'Drag Me');
      setLocalVideoText('');
      /* When a video stream is added to VideoChat, we need to store the local audio track, because the screen sharing MediaStream doesn't have audio by default, which is problematic for peer C who joins while another peer A/B is screen sharing (C won't receive A/Bs audio). */
      let audio = localStream.getAudioTracks()[0];
      if (!audioEnabled) audio.enabled = false;
      setLocalAudio(audio);

      if (!videoEnabled) {
        setLocalVideoText('Video Paused');
        localStream?.getVideoTracks().forEach((track: MediaStreamTrack) => {
          track.enabled = false;
        });
      }
      // Join the chat room
      socket.emit('join', uniqueAppId + sessionKey, () => {
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
    } catch (e) {
      logger(e);
    }
    connected.delete(uuid);
    peerConnections.get(uuid)?.close(); // necessary b/c otherwise the RTC connection isn't closed
    peerConnections.delete(uuid);
    remoteStreams.delete(uuid);
    dataChannel.delete(uuid);
    peerMetadata.delete(uuid);
    setRemoteStreams(remoteStreams);
    setPeerConnections(peerConnections);
    setDataChannel(dataChannel);
    setPeerMetadata(peerMetadata);
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
      // Handle different dataChannel types: First 4 chars represent data type
      if (dataChannel) {
        dataChannel.get(uuid)!.onmessage = (e: MessageEvent) => {
          const dataId: string = e.data.substring(0, 5);
          const msg: string = e.data.slice(5);
          switch (dataId) {
            case 'mesg:':
              setChatMessages(chatMessages => [
                ...chatMessages,
                [uuid, peerMetadata.get(uuid)?.name ?? '', msg],
              ]);
              incrementUnseenChats();
              break;
            case 'meta:':
              setPeerMetadata(new Map(peerMetadata.set(uuid, JSON.parse(msg))));
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
        dataChannel.get(uuid)!.onopen = e => {
          logger('dataChannel opened');
          sendToAllDataChannels(
            `meta:${JSON.stringify({
              name: localName,
              audioOn: audioEnabled,
              videoOn: videoEnabled,
            })}`,
            dataChannel
          );
        };
      }
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
        new Map(remoteStreams.set(uuid, e.streams.slice(-1)[0]))
      );
      if (onAddPeer) onAddPeer();
      setConnected(new Map(connected?.set(uuid, true)));
    }
  };

  const switchInputDevices = () => {
    logger('switchInputDevices');
    let audioProp: boolean | { deviceId: string | undefined } = true;
    let videoProp: boolean | { deviceId: string | undefined } = true;
    audioProp = { deviceId: audInput?.deviceId };
    videoProp = { deviceId: vidInput?.deviceId };
    navigator.mediaDevices
      .getUserMedia({
        audio: audioProp,
        video: videoProp,
      })
      .then(stream => {
        setLocalStream(stream);
        let videoTrack = stream.getVideoTracks()[0];
        let audioTrack = stream.getAudioTracks()[0];
        peerConnections.forEach(pc => {
          //  video
          let vidSender = pc.getSenders().find(s => {
            return s?.track?.kind == videoTrack.kind;
          });
          if (!videoEnabled) videoTrack.enabled = false;
          if (vidSender) vidSender.replaceTrack(videoTrack);
          // audio
          let audSender = pc.getSenders().find(s => {
            return s?.track?.kind == audioTrack.kind;
          });
          if (!audioEnabled) audioTrack.enabled = false;
          if (audSender) audSender.replaceTrack(audioTrack);
        });
      })
      .catch(error => {
        logger(error);
        logger(
          'Failed to get local webcam video, check webcam privacy settings'
        );
      });
  };

  const handleLog = () => {
    const diff = new Date().getTime() - startTime.getTime();
    const timestamp = new Date().toLocaleDateString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    let log = JSON.stringify({
      timestamp: timestamp,
      session_id: sessionKey,
      session_length: millisecondsToTime(diff),
      session_size: peerConnections.size + 1,
    });
    logger('logging: ' + log);
    if (onSubmitLog) onSubmitLog(log);
    setStartTime(new Date());
  };

  useEffect(() => {
    if (localStream && remoteStreams.size >= 1) switchInputDevices();
  }, [audInput, vidInput]);

  useEffect(() => {
    if (
      catalystRef &&
      catalystRef.current?.parentNode?.parentNode?.nodeName === 'BODY'
    )
      catalystRef.current.style.position = 'fixed';

    window.addEventListener('unload', handleLog);
    // window.addEventListener('beforeunload', alertUser);

    requestMediaStream();

    return () => {
      window.removeEventListener('unload', handleLog);
      socket.emit('disconnecting');
      socket.disconnect();
      localStream?.getTracks().forEach(track => track.stop());
      peerConnections?.forEach(peer => peer.close());
      setPeerConnections(new Map());
      setRemoteStreams(new Map());
      setDataChannel(new Map());
      setConnected(new Map());
      setPeerMetadata(new Map());
    };
  }, []);

  useEffect(() => {
    if (arbitraryData && remoteStreams.size > 0)
      sendToAllDataChannels(arbitraryData, dataChannel);
  }, [arbitraryData]);

  useEffect(() => {
    if (!audioEnabled && localAudio) localAudio.enabled = false;
    if (!videoEnabled && localStream)
      localStream?.getVideoTracks().forEach((track: MediaStreamTrack) => {
        track.enabled = false;
      });
  }, [remoteStreams]);

  const incrementUnseenChats = () => {
    setUnseenChats(unseenChats => unseenChats + 1);
  };

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
            localName={localName}
            chatMessages={chatMessages}
            setChatMessages={setChatMessages}
            showChat={showChat}
            setShowChat={setShowChat}
            dataChannel={dataChannel}
            themeColor={themeColor}
            setUnseenChats={setUnseenChats}
          />
          <div id="call-section" className="w-full h-full items-end">
            <LocalVideo
              localStream={localStream}
              disableLocalVidDrag={disableLocalVidDrag}
              localVideoText={localVideoText}
              themeColor={themeColor}
              localName={localName}
            />

            <RemoteVideos
              fourThreeAspectRatioEnabled={fourThreeAspectRatioEnabled}
              peerConnections={peerConnections}
              remoteStreams={remoteStreams}
              disableRedIndicators={disableRedIndicators}
              showChat={showChat}
              peerMetadata={peerMetadata}
              cstmWelcomeMsg={cstmWelcomeMsg}
              sessionKey={sessionKey}
              themeColor={themeColor}
              picInPic={picInPic}
            />

            {!showChat && (
              <Settings
                themeColor={themeColor}
                vidInput={vidInput}
                audInput={audInput}
                setAudInput={setAudInput}
                setVidInput={setVidInput}
                audioEnabled={audioEnabled}
                setAudioEnabled={setAudioEnabled}
                videoEnabled={videoEnabled}
                setVideoEnabled={setVideoEnabled}
                dark={dark}
                setDark={setDark}
                setLocalVideoText={setLocalVideoText}
                disableLocalVidDrag={disableLocalVidDrag}
                localAudio={localAudio}
                localStream={localStream}
                setLocalAudio={setLocalAudio}
                setLocalStream={setLocalStream}
                dataChannel={dataChannel}
                localName={localName}
              />
            )}

            <Toolbar
              toolbarRef={toolbarRef}
              hiddenTools={hiddenTools}
              localName={localName}
              audioEnabled={audioEnabled}
              disableRedIndicators={disableRedIndicators}
              themeColor={themeColor}
              setAudioEnabled={setAudioEnabled}
              videoEnabled={videoEnabled}
              setVideoEnabled={setVideoEnabled}
              setLocalVideoText={setLocalVideoText}
              disableLocalVidDrag={disableLocalVidDrag}
              fsHandle={fsHandle}
              showChat={showChat}
              setShowChat={setShowChat}
              unseenChats={unseenChats}
              setUnseenChats={setUnseenChats}
              sharing={sharing}
              setSharing={setSharing}
              cstmOptionBtns={cstmOptionBtns}
              onEndCall={onEndCall}
              localAudio={localAudio}
              localStream={localStream}
              setLocalAudio={setLocalAudio}
              setLocalStream={setLocalStream}
              dataChannel={dataChannel}
              switchInputDevices={switchInputDevices}
              connected={connected}
              peerConnections={peerConnections}
              handleLog={handleLog}
            />
          </div>
        </FullScreen>
      </div>
    </div>
  );
};
export default VideoChat;
