import {
  LocalMember,
  LocalTrack,
  Member,
  MemberEvent,
  Track,
  TrackPublication,
} from "catalyst-client";
import { useEffect, useState } from "react";

export interface MemberState {
  isSpeaking: boolean;
  isLocal: boolean;
  isMuted: boolean;
  metadata?: string;
  publications: TrackPublication[];
  subscribedTracks: TrackPublication[];
  unpublishTrack: (track: LocalTrack) => void;
}

export function useMember(member: Member): MemberState {
  const [isMuted, setMuted] = useState(false);
  const [isSpeaking, setSpeaking] = useState(false);
  const [metadata, setMetadata] = useState<string>();
  const [publications, setPublications] = useState<TrackPublication[]>([]);
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
  };
  const unpublishTrack = async (track: LocalTrack) => {
    if (!(member instanceof LocalMember)) {
      throw new Error("could not unpublish, not a local member");
    }
    (member as LocalMember).unpublishTrack(track);
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
    member.on(MemberEvent.TrackMuted, onMuted);
    member.on(MemberEvent.TrackUnmuted, onUnmuted);
    member.on(MemberEvent.MetadataChanged, onMetadataChanged);
    member.on(MemberEvent.IsSpeakingChanged, onIsSpeakingChanged);
    member.on(MemberEvent.TrackPublished, onPublicationsChanged);
    member.on(MemberEvent.TrackUnpublished, onPublicationsChanged);
    member.on(MemberEvent.TrackSubscribed, onPublicationsChanged);
    member.on(MemberEvent.TrackUnsubscribed, onPublicationsChanged);
    member.on("localtrackchanged", onPublicationsChanged);

    // set initial state
    onMetadataChanged();
    onIsSpeakingChanged();
    onPublicationsChanged();

    return () => {
      // cleanup
      member.off(MemberEvent.TrackMuted, onMuted);
      member.off(MemberEvent.TrackUnmuted, onUnmuted);
      member.off(MemberEvent.MetadataChanged, onMetadataChanged);
      member.off(MemberEvent.IsSpeakingChanged, onIsSpeakingChanged);
      member.off(MemberEvent.TrackPublished, onPublicationsChanged);
      member.off(MemberEvent.TrackUnpublished, onPublicationsChanged);
      member.off(MemberEvent.TrackSubscribed, onPublicationsChanged);
      member.off(
        MemberEvent.TrackUnsubscribed,
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
    isLocal: member instanceof LocalMember,
    isSpeaking,
    isMuted,
    publications,
    subscribedTracks,
    metadata,
    unpublishTrack,
  };
}
