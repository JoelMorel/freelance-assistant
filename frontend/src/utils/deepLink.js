/**
 * Opens a job posting, prioritizing the native mobile app if installed (e.g. Upwork on Android).
 * Automatically falls back to the web browser if the app is not installed or on desktop/iOS.
 */
export function openJobLink(url, platform) {
  if (!url) return;

  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isAndroid = /Android/i.test(userAgent);
  const isUpwork = platform?.toLowerCase() === "upwork" || url.includes("upwork.com");

  if (isAndroid && isUpwork) {
    // Official Upwork Android App Intent
    // If Upwork is installed, Android OS immediately opens the native app.
    // If not installed, it seamlessly navigates to browser_fallback_url in Chrome.
    const rawPath = url.replace(/^https?:\/\//i, "");
    const intentUrl = `intent://${rawPath}#Intent;scheme=https;package=com.upwork.android.apps.main;S.browser_fallback_url=${encodeURIComponent(url)};end`;

    window.location.href = intentUrl;
    return;
  }

  // Standard web navigation for desktop, iOS, or other platforms
  window.open(url, "_blank", "noopener,noreferrer");
}
