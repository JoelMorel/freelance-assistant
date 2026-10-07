/**
 * Returns the optimized URL for native app opening on mobile devices.
 * - On Android: Targets the official Upwork Android app intent (com.upwork.android.apps.main)
 *   with seamless browser fallback.
 * - On iOS & Desktop: Returns the standard verified HTTPS URL.
 */
export function getJobHref(url, platform) {
  if (!url) return "#";
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isAndroid = /Android/i.test(ua);
  const isUpwork = platform?.toLowerCase() === "upwork" || url.includes("upwork.com");

  if (isUpwork && isAndroid) {
    const raw = url.replace(/^https?:\/\//i, "");
    return `intent://${raw}#Intent;scheme=https;package=com.upwork.android.apps.main;S.browser_fallback_url=${encodeURIComponent(url)};end`;
  }

  return url;
}

export function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
}
