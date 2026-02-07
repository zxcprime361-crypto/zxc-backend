import { NextRequest, NextResponse } from "next/server";
import { validateBackendToken } from "@/lib/validate-token";

export async function GET(req: NextRequest) {
  try {
    const tmdbId = req.nextUrl.searchParams.get("a");
    const mediaType = req.nextUrl.searchParams.get("b");
    const season = req.nextUrl.searchParams.get("c");
    const episode = req.nextUrl.searchParams.get("d");
    const title = req.nextUrl.searchParams.get("f");
    const year = req.nextUrl.searchParams.get("g");
    const ts = Number(req.nextUrl.searchParams.get("gago"));
    const token = req.nextUrl.searchParams.get("putanginamo")!;
    const f_token = req.nextUrl.searchParams.get("f_token")!;

    if (!tmdbId || !mediaType || !title || !year || !ts || !token) {
      return NextResponse.json(
        { success: false, error: "need token" },
        { status: 404 },
      );
    }

    if (Date.now() - ts > 8000) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 403 },
      );
    }

    if (!validateBackendToken(tmdbId, f_token, ts, token)) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 403 },
      );
    }

    // block direct /api access
    const referer = req.headers.get("referer") || "";
    if (
      !referer.includes("/api/") &&
      !referer.includes("localhost") &&
      !referer.includes("http://192.168.56.1:3000/") &&
      !referer.includes("https://www.zxcstream.xyz/") &&
      !referer.includes("https://zxcstream-xyz.netlify.app/")
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }
    // -------- MovieBox Logic --------
    const randomIP =
      africanIPs[Math.floor(Math.random() * africanIPs.length)].ip;
    const host = "h5.aoneroom.com";
    const baseUrl = `https://${host}`;
    const headers: Record<string, string> = {
      "X-Client-Info": '{"timezone":"Africa/Nairobi"}',
      "Accept-Language": "en-US,en;q=0.5",
      Accept: "application/json",
      "User-Agent": "okhttp/4.12.0",
      Referer:
        "https://fmoviesunblocked.net/spa/videoPlayPage/movies/the-housemaid-0salyuvbRw2?id=2123398053372510440&type=/movie/detail",
      "X-Forwarded-For": randomIP,
      "CF-Connecting-IP": randomIP,
      "X-Real-IP": randomIP,
      Origin: "https://fmoviesunblocked.net",
    };
    // Search for movie/TV show
    const searchRes = await fetch(
      `${baseUrl}/wefeed-h5-bff/web/subject/search`,
      {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: title,
          page: 1,
          perPage: 24,
          subjectType: mediaType === "tv" ? 2 : 1,
        }),
      },
    );

    const searchJson = await searchRes.json();
    const results = searchJson?.data?.data || searchJson?.data || searchJson;
    const items = results?.items || [];
    if (!items.length)
      return NextResponse.json(
        { success: false, error: "No search results" },
        { status: 404 },
      );

    const selectedItem =
      items.find((i: any) =>
        (i?.title || "").toLowerCase().includes(title.toLowerCase()),
      ) || items[0];
    const subjectId = String(selectedItem?.subjectId);
    if (!subjectId)
      return NextResponse.json(
        { success: false, error: "subjectId not found" },
        { status: 404 },
      );

    // Detail info
    const detailRes = await fetch(
      `${baseUrl}/wefeed-h5-bff/web/subject/detail?subjectId=${encodeURIComponent(subjectId)}`,
      { headers },
    );
    const detailJson = await detailRes.json();
    const info = detailJson?.data?.data || detailJson?.data || detailJson;
    const detailPath = info?.subject?.detailPath || "";

    // Download sources
    const params = new URLSearchParams({ subjectId });
    if (mediaType === "tv") {
      if (season) params.set("se", String(season));
      if (episode) params.set("ep", String(episode));
    }

    const sourcesRes = await fetch(
      `${baseUrl}/wefeed-h5-bff/web/subject/download?${params.toString()}`,
      {
        headers: {
          ...headers,
          Referer: `https://fmoviesunblocked.net/spa/videoPlayPage/movies/${detailPath}?id=${subjectId}&type=/movie/detail`,
          Origin: "https://fmoviesunblocked.net",
        },
      },
    );

    const sourcesJson = await sourcesRes.json();
    const sources = sourcesJson?.data?.data || sourcesJson?.data || sourcesJson;
    const downloads = sources?.downloads || [];
    if (!downloads.length)
      return NextResponse.json(
        { success: false, error: "No download sources" },
        { status: 404 },
      );

    // Pick highest resolution
    const sortedDownloads = downloads
      .filter((d: any) => d?.url && typeof d.url === "string")
      .sort((a: any, b: any) => (b.resolution || 0) - (a.resolution || 0));
    const videoUrl = sortedDownloads[0].url;

    return NextResponse.json({
      success: true,
      link: `https://still-butterfly-9b3e.zxcprime360.workers.dev/?url=${encodeURIComponent(videoUrl)}`,
      type: videoUrl.includes(".m3u8") ? "hls" : "mp4",
      // headers: {
      //   "User-Agent": "okhttp/4.12.0",
      //   Referer: "https://fmoviesunblocked.net/",
      //   Origin: "https://fmoviesunblocked.net",
      // },
    });
  } catch (err: any) {
    console.error("MovieBox API Error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
function africanLikeIP() {
  const firstOctets = [41, 102, 105, 154, 160, 165, 196];
  return [
    firstOctets[Math.floor(Math.random() * firstOctets.length)],
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
  ].join(".");
}
const africanIPs = [
  // { ip: "41.90.65.134" },
  // { ip: "41.204.187.92" },
  // { ip: "41.215.122.41" },
  { ip: "102.89.23.176" },
  { ip: "102.134.77.58" },
  { ip: "197.210.54.119" },
  { ip: "197.211.96.44" },
];
