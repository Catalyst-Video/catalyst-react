import {
  LocalParticipant,
  LocalTrack,
  Participant,
  ParticipantEvent,
  RemoteVideoTrack,
  Track,
  TrackPublication,
} from "livekit-client";
import { useEffect, useState } from "react";

export interface ParticipantState {
  isSpeaking: boolean;
  isLocal: boolean;
  isMuted: boolean;
  // isSharing: boolean;
  metadata?: string;
  publications: TrackPublication[];
  subscribedTracks: TrackPublication[];
  unpublishTrack: (track: LocalTrack) => void;
}

export function useMember(member: Participant): ParticipantState {
  const [isMuted, setMuted] = useState(false);
  const [isSpeaking, setSpeaking] = useState(false);
  const [metadata, setMetadata] = useState<string>();
  const [publications, setPublications] = useState<TrackPublication[]>([]);
  // const [isSharing, setSharing] = useState(false);
  const [subscribedTracks, setSubscribedTracks] = useState<TrackPublication[]>(
    []
  );

  const onPublicationsChanged = () => {
    setPublications(Array.from(member.tracks.values()));
    setSubscribedTracks(
      Array.from(member.tracks.values()).filter((pub) => {
        return pub.track !== undefined;
      })
    );
    // if (!isSharing) {
    //   member.tracks.forEach((pub) => {
    //     if (pub.trackName === 'screen' && pub.track) {
    //       setSharing(true)
    //     }
    //   });
    // }
  };
  
  const unpublishTrack = async (track: LocalTrack) => {
    if (!(member instanceof LocalParticipant)) {
      throw new Error("could not unpublish, not a local member");
    }
    // if (isSharing) {
    //   if (track.name === 'screen' && track) {
    //     setSharing(false);
    //   }
    // }
    (member as LocalParticipant).unpublishTrack(track);
    member.emit("localtrackchanged");
  };

  useEffect(() => {
    const onMuted = (pub: TrackPublication) => {
      if (pub.kind === Track.Kind.Audio) {
        setMuted(true);
      }
    };
    const onUnmuted = (pub: TrackPublication) => {
      if (pub.kind === Track.Kind.Audio) {
        setMuted(false);
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
    member.on("localtrackchanged", onPublicationsChanged);

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
      member.off("localtrackchanged", onPublicationsChanged);
    };
  }, [member]);

  let muted: boolean | undefined;
  member.audioTracks.forEach((pub) => {
    muted = pub.isMuted;
  });
  if (muted === undefined) {
    muted = true;
  }
  if (isMuted !== muted) {
    setMuted(muted);
  }

  return {
    isLocal: member instanceof LocalParticipant,
    isSpeaking,
    isMuted,
    // isSharing,
    publications,
    subscribedTracks,
    metadata,
    unpublishTrack,
  };
}
