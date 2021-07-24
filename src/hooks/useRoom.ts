import {
  AudioTrack,
  connect,
  ConnectOptions,
  LocalMember,
  Member,
  RemoteTrack,
  Room,
  RoomEvent,
  Track,
} from "catalyst-client";
import { useCallback, useState } from "react";

export interface RoomState {
  connect: (
    url: string,
    token: string,
    options?: ConnectOptions
  ) => Promise<Room | undefined>;
  isConnecting: boolean;
  room?: Room;
  /* all members in the room, including the local member. */
  members: Member[];
  /* all subscribed audio tracks in the room, not including local member. */
  audioTracks: AudioTrack[];
  error?: Error;
}

export function useRoom(): RoomState {
  const [room, setRoom] = useState<Room>();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error>();
  const [members, setMembers] = useState<Member[]>([]);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);

  const connectFn = useCallback(
    async (url: string, token: string, options?: ConnectOptions) => {
      setIsConnecting(true);
      try {
        const newRoom = await connect(url, token, options);
        setRoom(newRoom);
        const onMembersChanged = () => {
          const remotes = Array.from(newRoom.members.values());
          const members: Member[] = [newRoom.localMember];
          members.push(...remotes);
          sortMembers(members, newRoom.localMember);
          setMembers(members);
        };
        const onSubscribedTrackChanged = (track?: RemoteTrack) => {
          // ordering may have changed, re-sort
          onMembersChanged();
          if (track && track.kind !== Track.Kind.Audio) {
            return;
          }
          const tracks: AudioTrack[] = [];
          newRoom.members.forEach((p) => {
            p.audioTracks.forEach((pub) => {
              if (pub.track && pub.kind === Track.Kind.Audio) {
                tracks.push(pub.track);
              }
            });
          });
          setAudioTracks(tracks);
        };

        newRoom.once(RoomEvent.Disconnected, () => {
          setTimeout(() => setRoom(undefined));

          newRoom.off(RoomEvent.MemberConnected, onMembersChanged);
          newRoom.off(RoomEvent.MemberDisconnected, onMembersChanged);
          newRoom.off(RoomEvent.ActiveSpeakersChanged, onMembersChanged);
          newRoom.off(RoomEvent.TrackSubscribed, onSubscribedTrackChanged);
          newRoom.off(RoomEvent.TrackUnsubscribed, onSubscribedTrackChanged);
        });
        newRoom.on(RoomEvent.MemberConnected, onMembersChanged);
        newRoom.on(RoomEvent.MemberDisconnected, onMembersChanged);
        newRoom.on(RoomEvent.ActiveSpeakersChanged, onMembersChanged);
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
    members,
    audioTracks,
  };
}

/**
 * Default sort for members, it'll order members by:
 * 1. dominant speaker (speaker with the loudest audio level)
 * 2. local member
 * 3. other speakers that are recently active
 * 4. members with video on
 * 5. by joinedAt
 */
export function sortMembers(
  members: Member[],
  localMember?: LocalMember
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

  if (localMember) {
    const localIdx = members.indexOf(localMember);
    if (localIdx >= 0) {
      members.splice(localIdx, 1);
      if (members.length > 0) {
        members.splice(1, 0, localMember);
      } else {
        members.push(localMember);
      }
    }
  }
}
