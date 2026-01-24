import { fetchWithTimeout } from "./fetch-timeout";

export async function getWorkingProxy(url: string, proxies: string[]) {
  for (const proxy of proxies) {
    try {
      const testUrl = `${proxy}?m3u8-proxy=${url}`;
      const res = await fetchWithTimeout(testUrl, { method: "HEAD" }, 3000);
      if (res.ok) return proxy;
    } catch (e) {
      // ignore failed proxy
    }
  }
  return null; // no working proxy found
}
