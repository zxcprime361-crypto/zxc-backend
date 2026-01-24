import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Subtitle } from "./subtitle-hooks";
interface UseSubtitlesParams {
  tmdbId: number | null;
  season?: number; // optional for movies
  episode?: number; // optional for movies
  media_type: string;
}

export function useVdrkSubtitle({
  tmdbId,
  season,
  episode,
  media_type,
}: UseSubtitlesParams) {
  return useQuery<Subtitle[], Error>({
    queryKey: ["vdrksubs", tmdbId, season, episode],
    queryFn: async () => {
      const { data } = await axios.get(
        `https://sub.vdrk.site/v1/${media_type}/${tmdbId}${media_type === "tv" ? `/${season}/${episode}` : ""}`,
      );
      data.sort((a: Subtitle, b: Subtitle) => a.label.localeCompare(b.label));

      const rewritten: Subtitle[] = data.map((sub: Subtitle) => ({
        label: sub.label,
        file: `/api/subtitle-edit?url=${encodeURIComponent(sub.file)}`,
      }));
      return rewritten;
    },
    enabled: !!tmdbId,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
