import {
  AudioTrack,
  connect,
  ConnectOptions,
  LocalParticipant,
  Participant,
  RemoteTrack,
  Room,
  RoomEvent,
  Track,
} from 'livekit-client';
import { useCallback, useState } from 'react';
import { RoomState } from '../typings/interfaces';

const useRoom = (options?: {
  sortMembers?: (members: Participant[]) => void;
}): RoomState => {
  const [room, setRoom] = useState<Room>();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error>();
  const [members, setMembers] = useState<Participant[]>([]);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [localMember, setLocalMember] = useState<LocalParticipant>();

  const sortFunc = options?.sortMembers ?? sortMembers;

  const connectFn = useCallback(
    async (url: string, token: string, options?: ConnectOptions) => {
      setIsConnecting(true);
      try {
        const newRoom = await connect(url, token, options);
        setRoom(newRoom);
        setLocalMember(newRoom.localParticipant);
        const onParticipantsChanged = () => {
          const remotes = Array.from(newRoom.participants.values());
          const members: Participant[] = [newRoom.localParticipant];
          members.push(...remotes);
          sortFunc(members, newRoom.localParticipant);
          setMembers(members);
        };
        const onSubscribedTrackChanged = (track?: RemoteTrack) => {
          // ordering may have changed, re-sort
          onParticipantsChanged();
          if (track && track.kind !== Track.Kind.Audio) {
            return;
          }
          const tracks: AudioTrack[] = [];
          newRoom.participants.forEach(p => {
            p.audioTracks.forEach(pub => {
              if (pub.track && pub.kind === Track.Kind.Audio) {
                tracks.push(pub.track);
              }
            });
          });
          setAudioTracks(tracks);
        };

        newRoom.once(RoomEvent.Disconnected, () => {
          setTimeout(() => setRoom(undefined));

          newRoom.off(RoomEvent.ParticipantConnected, onParticipantsChanged);
          newRoom.off(RoomEvent.ParticipantDisconnected, onParticipantsChanged);
          newRoom.off(RoomEvent.ActiveSpeakersChanged, onParticipantsChanged);
          newRoom.off(RoomEvent.TrackSubscribed, onSubscribedTrackChanged);
          newRoom.off(RoomEvent.TrackUnsubscribed, onSubscribedTrackChanged);
        });
        newRoom.on(RoomEvent.ParticipantConnected, onParticipantsChanged);
        newRoom.on(RoomEvent.ParticipantDisconnected, onParticipantsChanged);
        newRoom.on(RoomEvent.ActiveSpeakersChanged, onParticipantsChanged);
        newRoom.on(RoomEvent.TrackSubscribed, onSubscribedTrackChanged);
        newRoom.on(RoomEvent.TrackUnsubscribed, onSubscribedTrackChanged);

        setIsConnecting(false);
        onSubscribedTrackChanged();

        return newRoom;
      } catch (error) {
        setIsConnecting(false);
        setError(error);

        return undefined;
      }
    },
    []
  );

  return {
    connect: connectFn,
    isConnecting,
    room,
    error,
    localMember,
    members,
    audioTracks,
  };
}

/**
 * TODO: alterative sort function
 * Default sort for members, it'll order members by:
 * 1. dominant speaker (speaker with the loudest audio level)
 * 2. local participant
 * 3. other speakers that are recently active
 * 4. members with video on
 * 5. by joinedAt
 */
export function sortMembers(
  members: Participant[],
  localMembers?: LocalParticipant
) {
  members.sort((a, b) => {
    // loudest speaker first
    if (a.isSpeaking && b.isSpeaking) {
      return b.audioLevel - a.audioLevel;
    }

    // speaker goes first
    if (a.isSpeaking !== b.isSpeaking) {
      if (a.isSpeaking) {
        return -1;
      } else {
        return 1;
      }
    }

    // last active speaker first
    if (a.lastSpokeAt !== b.lastSpokeAt) {
      const aLast = a.lastSpokeAt?.getTime() ?? 0;
      const bLast = b.lastSpokeAt?.getTime() ?? 0;
      return bLast - aLast;
    }

    // video on
    const aVideo = a.videoTracks.size > 0;
    const bVideo = b.videoTracks.size > 0;
    if (aVideo !== bVideo) {
      if (aVideo) {
        return -1;
      } else {
        return 1;
      }
    }

    // joinedAt
    return (a.joinedAt?.getTime() ?? 0) - (b.joinedAt?.getTime() ?? 0);
  });

  if (localMembers) {
    const localIdx = members.indexOf(localMembers);
    if (localIdx >= 0) {
      members.splice(localIdx, 1);
      if (members.length > 0) {
        members.splice(1, 0, localMembers);
      } else {
        members.push(localMembers);
      }
    }
  }
}
export default useRoom;