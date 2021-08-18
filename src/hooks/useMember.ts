import {
  LocalParticipant,
  LocalTrack,
  Participant,
  ParticipantEvent,
  Track,
  TrackPublication,
} from 'livekit-client';
import { useEffect, useState } from 'react';

export interface MemberState {
  isSpeaking: boolean;
  isLocal: boolean;
  /** @deprecated use isAudioMuted instead */
  isMuted: boolean;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  metadata?: string;
  publications: TrackPublication[];
  subscribedTracks: TrackPublication[];
  unpublishTrack: (track: LocalTrack) => void;
}

export function useMember(member: Participant): MemberState {
  const [isAudioMuted, setAudioMuted] = useState(false);
  const [isVideoMuted, setVideoMuted] = useState(false);
  const [isSpeaking, setSpeaking] = useState(false);
  const [metadata, setMetadata] = useState<string>();
  const [publications, setPublications] = useState<TrackPublication[]>([]);
  const [subscribedTracks, setSubscribedTracks] = useState<TrackPublication[]>(
    []
  );

  const onPublicationsChanged = () => {
    setPublications(Array.from(member.tracks.values()));
    setSubscribedTracks(
      Array.from(member.tracks.values()).filter(pub => {
        return pub.track !== undefined;
      })
    );
  };
  const unpublishTrack = async (track: LocalTrack) => {
    if (!(member instanceof LocalParticipant)) {
      throw new Error('could not unpublish, not a local member');
    }
    (member as LocalParticipant).unpublishTrack(track);
    member.emit('localtrackchanged');
  };

  useEffect(() => {
    const onMuted = (pub: TrackPublication) => {
      if (pub.kind === Track.Kind.Audio) {
        setAudioMuted(true);
      } else if (pub.kind === Track.Kind.Video) {
        setVideoMuted(true);
      }
    };
    const onUnmuted = (pub: TrackPublication) => {
      if (pub.kind === Track.Kind.Audio) {
        setAudioMuted(false);
      } else if (pub.kind === Track.Kind.Video) {
        setVideoMuted(false);
      }
    };
    const onMetadataChanged = () => {
      if (member.metadata) {
        setMetadata(member.metadata);
      }
    };
    const onIsSpeakingChanged = () => {
      setSpeaking(member.isSpeaking);
    };

    // register listeners
    member.on(ParticipantEvent.TrackMuted, onMuted);
    member.on(ParticipantEvent.TrackUnmuted, onUnmuted);
    member.on(ParticipantEvent.MetadataChanged, onMetadataChanged);
    member.on(ParticipantEvent.IsSpeakingChanged, onIsSpeakingChanged);
    member.on(ParticipantEvent.TrackPublished, onPublicationsChanged);
    member.on(ParticipantEvent.TrackUnpublished, onPublicationsChanged);
    member.on(ParticipantEvent.TrackSubscribed, onPublicationsChanged);
    member.on(ParticipantEvent.TrackUnsubscribed, onPublicationsChanged);
    member.on('localtrackchanged', onPublicationsChanged);

    // set initial state
    onMetadataChanged();
    onIsSpeakingChanged();
    onPublicationsChanged();

    return () => {
      // cleanup
      member.off(ParticipantEvent.TrackMuted, onMuted);
      member.off(ParticipantEvent.TrackUnmuted, onUnmuted);
      member.off(ParticipantEvent.MetadataChanged, onMetadataChanged);
      member.off(ParticipantEvent.IsSpeakingChanged, onIsSpeakingChanged);
      member.off(ParticipantEvent.TrackPublished, onPublicationsChanged);
      member.off(ParticipantEvent.TrackUnpublished, onPublicationsChanged);
      member.off(ParticipantEvent.TrackSubscribed, onPublicationsChanged);
      member.off(
        ParticipantEvent.TrackUnsubscribed,
        onPublicationsChanged
      );
      member.off('localtrackchanged', onPublicationsChanged);
    };
  }, [member]);

  let muted: boolean | undefined;
  member.audioTracks.forEach(pub => {
    muted = pub.isMuted;
  });
  if (muted === undefined) {
    muted = true;
  }
  if (isAudioMuted !== muted) {
    setAudioMuted(muted);
  }

  return {
    isLocal: member instanceof LocalParticipant,
    isSpeaking,
    isMuted: isAudioMuted,
    isAudioMuted,
    isVideoMuted,
    publications,
    subscribedTracks,
    metadata,
    unpublishTrack,
  };
}
