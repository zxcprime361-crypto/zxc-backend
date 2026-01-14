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
  const [networkError, setIsNetworkError] = useState(false);
  const segmentRetryRef = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !source?.link) return;

    // Destroy previous HLS instance if exists
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    setIsNetworkError(false);
    segmentRetryRef.current = 0;
    if (source.type === "hls") {
      if (Hls.isSupported()) {
        const hls = new Hls({
          fragLoadingMaxRetry: 0,
          levelLoadingMaxRetry: 0,
          manifestLoadingMaxRetry: 0,

          fragLoadingTimeOut: 8000,
          levelLoadingTimeOut: 8000,
          manifestLoadingTimeOut: 8000,

          backBufferLength: 90,
        });
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
        hls.on(Hls.Events.ERROR, (_, errorData) => {
          console.log("HLS error", errorData);

          if (!errorData.fatal) return;

          switch (errorData.type) {
            case Hls.ErrorTypes.NETWORK_ERROR: {
              switch (errorData.details) {
                case Hls.ErrorDetails.FRAG_LOAD_ERROR:
                case Hls.ErrorDetails.FRAG_LOAD_TIMEOUT: {
                  segmentRetryRef.current += 1;

                  if (segmentRetryRef.current <= 1) {
                    console.warn("Retrying segment...");
                    hls.startLoad();
                  } else {
                    console.error("Segment failed permanently");
                    setIsNetworkError(true);
                    updateServerStatus(serverIndex, "failed");
                    hls.destroy();
                  }
                  break;
                }

                case Hls.ErrorDetails.MANIFEST_LOAD_ERROR:
                case Hls.ErrorDetails.LEVEL_LOAD_ERROR:
                case Hls.ErrorDetails.KEY_LOAD_ERROR: {
                  console.error("Playlist / key error");
                  setIsNetworkError(true);
                  updateServerStatus(serverIndex, "failed");
                  hls.destroy();
                  break;
                }

                default:
                  setIsNetworkError(true);
                  updateServerStatus(serverIndex, "failed");
                  hls.destroy();
              }
              break;
            }

            case Hls.ErrorTypes.MEDIA_ERROR:
              // Try to recover from media errors (including parsing errors)
              if (errorData.details === Hls.ErrorDetails.FRAG_PARSING_ERROR) {
                console.warn("Fragment parsing error, attempting recovery");
                hls.recoverMediaError();
              } else {
                console.warn("Recovering media error");
                hls.recoverMediaError();
              }
              break;

            default:
              setIsNetworkError(true);
              updateServerStatus(serverIndex, "failed");
              hls.destroy();
              break;
          }
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
    networkError,
    audioTracks,
    setAudioTracks,
    selectedAudio,
    setSelectedAudio,
  };
}
