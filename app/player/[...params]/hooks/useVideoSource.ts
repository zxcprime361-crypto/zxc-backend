import { SourceTypes } from "@/hook/source";
import { selectAudioTrack } from "@/lib/selected-audio-track";
import Hls, { Level } from "hls.js";
import { useEffect, useRef, useState } from "react";
import { ServerTypes } from "./useServerManager";
export interface AudioTrackTypes {
  id: number;
  name: string;
  lang?: string;
  groupId: string;
  default: boolean;
  autoselect: boolean;
  forced: boolean;
}
export function useVideoSource({
  videoRef,
  source,
  updateServerStatus,
  serverIndex,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  source?: SourceTypes;
  updateServerStatus: (index: number, status: ServerTypes["status"]) => void;
  serverIndex: number;
}) {
  const hlsRef = useRef<Hls | null>(null);
  const [quality, setQuality] = useState<Level[]>([]);
  const [audioTracks, setAudioTracks] = useState<AudioTrackTypes[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<number>(-1);
  const [selectedAudio, setSelectedAudio] = useState<number>(0);
  const failedRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !source?.link) return;

    // Destroy previous HLS instance if exists
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    failedRef.current = false;
    if (source.type === "hls") {
      if (Hls.isSupported()) {
        const hls = new Hls();
        // {
        //   fragLoadingMaxRetry: 0,
        //   levelLoadingMaxRetry: 0,
        //   manifestLoadingMaxRetry: 0,

        //   fragLoadingTimeOut: 8000,
        //   levelLoadingTimeOut: 8000,
        //   manifestLoadingTimeOut: 8000,

        //   backBufferLength: 90,
        // }
        hls.loadSource(source.link);
        hls.attachMedia(video);
        hlsRef.current = hls;

        hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          video.play().catch(() => {});
          setQuality(data.levels);
        });
        hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, (_, data) => {
          setAudioTracks(data.audioTracks);
          const selectedIndex = selectAudioTrack(data.audioTracks, "en");
          if (selectedIndex !== null) {
            setSelectedAudio(selectedIndex);
            hls.audioTrack = selectedIndex;
          }
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          console.groupCollapsed(
            "%c[HLS ERROR EVENT]",
            "color: orange; font-weight: bold;",
          );
          console.log("fatal:", data.fatal);
          console.log("type:", data.type);
          console.log("details:", data.details);
          console.log("reason:", data.reason);
          console.log("serverIndex:", serverIndex);
          console.log("failedRef.current (before):", failedRef.current);
          console.groupEnd();

          // Ignore non-fatal errors
          if (!data.fatal) {
            console.log("[HLS] Non-fatal error ignored");
            return;
          }

          // Prevent double-fail
          if (failedRef.current) {
            console.warn("[HLS] Server already marked as failed — skipping");
            return;
          }

          // Always try to recover media errors
          if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            console.warn("[HLS] MEDIA_ERROR → attempting recoverMediaError()");
            hls.recoverMediaError();
            return;
          }

          // Only fail server on unrecoverable network errors
          if (
            data.type === Hls.ErrorTypes.NETWORK_ERROR &&
            (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR ||
              data.details === Hls.ErrorDetails.KEY_LOAD_ERROR)
          ) {
            console.error("[HLS] UNRECOVERABLE NETWORK ERROR → failing server");
            console.log("Marking server as failed:", serverIndex);

            failedRef.current = true;
            updateServerStatus(serverIndex, "failed");

            console.log(
              "[HLS] Removing ERROR listener and destroying instance",
            );
            hls.off(Hls.Events.ERROR);
            hls.destroy();
            return;
          }

          // Catch-all for fatal but unhandled cases
          console.warn("[HLS] Fatal error but no fail condition matched");
        });

        return () => {
          hls.destroy();
          hlsRef.current = null;
        };
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source.link;
        video.play().catch(() => {});
      }
    } else {
      video.src = source.link;
      video.play().catch(() => {});
    }
  }, [source]);

  useEffect(() => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = selectedQuality;
    }
  }, [selectedQuality]);

  useEffect(() => {
    if (hlsRef.current) {
      hlsRef.current.audioTrack = selectedAudio;
    }
  }, [selectedAudio]);

  return {
    hlsRef,
    quality,
    setQuality,
    selectedQuality,
    setSelectedQuality,

    audioTracks,
    setAudioTracks,
    selectedAudio,
    setSelectedAudio,
  };
}
