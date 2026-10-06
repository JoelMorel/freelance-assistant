/**
 * Cross-platform deep-linking utility for mobile devices (Android, iPhone, iPad) and desktop.
 * - On Android: Uses Android App Intent to directly open the Upwork app (package: com.upwork.android.apps.main)
 *   with fallback to the web page.
 * - On iOS (iPhone / iPad): Navigates top-level so Apple Universal Links can hand off to the installed Upwork app.
 * - On Desktop / other platforms: Opens cleanly in a new tab.
 */

export function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
}

export function openJobLink(url, platform) {
  if (!url) return;

  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isUpwork = platform?.toLowerCase() === "upwork" || url.includes("upwork.com");

  if (isUpwork) {
    if (isAndroid) {
      // Android Intent for official Upwork App
      const withoutProtocol = url.replace(/^https?:\/\//i, "");
      const intentUrl = `intent://${withoutProtocol}#Intent;scheme=https;package=com.upwork.android.apps.main;S.browser_fallback_url=${encodeURIComponent(url)};end`;
      window.location.href = intentUrl;
      return;
    }

    if (isIOS) {
      // iOS Universal Links: Direct top-level navigation allows iOS to open the native app
      window.location.href = url;
      return;
    }
  }

  // Mobile fallback for other platforms (RemoteOK, WWR)
  if (isMobileDevice()) {
    window.location.href = url;
    return;
  }

  // Desktop: open in a new tab
  window.open(url, "_blank", "noopener,noreferrer");
}
