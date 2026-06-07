export function detectARCapability(): "webxr" | "scene-viewer" | "quick-look" | "fallback" | "none" {
  if (typeof navigator === "undefined") return "none";
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);
  if (isIOS) return "quick-look";
  if (isAndroid) return "scene-viewer";
  if ("xr" in navigator) return "webxr";
  return "fallback";
}

export function detectDeviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/iPad|Android(?!.*Mobile)|Tablet/.test(ua)) return "tablet";
  if (/Mobi|iPhone|Android/.test(ua)) return "mobile";
  return "desktop";
}
