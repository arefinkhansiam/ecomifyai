(function () {
  "use strict";
  // Ecomify Try-On Widget - drop-in script for any website
  var SUPABASE_URL = "https://ygsaduwfmycbrvjqbdbu.supabase.co";
  var SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnc2FkdXdmbXljYnJ2anFiZGJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MTc1MTYsImV4cCI6MjA5NjM5MzUxNn0.H_sQ0JmPLfR62HXaJ5NrXWmVcm1s8xk5a1ez2XhF8M0";

  var currentScript = document.currentScript || (function () {
    var scripts = document.getElementsByTagName("script");
    return scripts[scripts.length - 1];
  })();

  var productId = currentScript.getAttribute("data-product-id");
  if (!productId) {
    console.warn("[Ecomify] Missing data-product-id");
    return;
  }
  var overrideLabel = currentScript.getAttribute("data-label");
  var overrideBg = currentScript.getAttribute("data-color");
  var overrideText = currentScript.getAttribute("data-text-color");
  var origin = new URL(currentScript.src).origin;

  // Center-aligned wrapper so the button always sits in the middle of its container
  var placeholder = document.createElement("div");
  placeholder.style.cssText = "display:flex;justify-content:center;align-items:center;width:100%;margin:14px 0;";
  currentScript.parentNode.insertBefore(placeholder, currentScript);

  // ----- Session tracking -----
  function uuid() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  var session = null;
  function startSession(camera) {
    session = {
      session_id: uuid(),
      start: Date.now(),
      camera_used: camera || "back",
      ar_mode: "model-viewer",
      did_interact: false,
      did_close_manually: false,
    };
  }
  function markInteract() { if (session) session.did_interact = true; }
  function endSession(closedManually) {
    if (!session) return;
    var payload = {
      product_id: productId,
      session_id: session.session_id,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
      time_spent_seconds: Math.max(0, Math.round((Date.now() - session.start) / 1000)),
      camera_used: session.camera_used,
      ar_mode: session.ar_mode,
      did_interact: session.did_interact,
      did_close_manually: !!closedManually,
    };
    session = null;
    var url = origin + "/api/public/track-ar-session";
    try {
      var blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      if (navigator.sendBeacon && navigator.sendBeacon(url, blob)) return;
    } catch (e) {}
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), keepalive: true }).catch(function () {});
  }
  window.__ecomifyMarkInteract = markInteract;
  window.__ecomifyEndSession = endSession;

  function render(cfg) {
    var label = overrideLabel || cfg.button_label || "View Try-On";
    var bg = overrideBg || cfg.button_bg_color || "#0284C7";
    var fg = overrideText || cfg.button_text_color || "#FFFFFF";
    var radius = (cfg.button_border_radius != null ? cfg.button_border_radius : 14) + "px";
    var size = cfg.button_size || "medium";
    var pad = size === "small" ? "10px 22px" : size === "large" ? "18px 40px" : "14px 32px";
    var fs = size === "small" ? "13px" : size === "large" ? "17px" : "15px";
    var glow = !!(cfg.ar_customization && cfg.ar_customization.button_glow);
    var accent = (cfg.ar_customization && cfg.ar_customization.accent_color) || bg;
    var useGradient = !!cfg.use_gradient;
    var bgCss = useGradient && cfg.gradient_from && cfg.gradient_to
      ? "linear-gradient(135deg," + cfg.gradient_from + " 0%," + cfg.gradient_to + " 100%)"
      : bg;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px;">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="' + fg + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><path d="M12 18v4"/><path d="m4.93 4.93 2.83 2.83"/><path d="m16.24 16.24 2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="m4.93 19.07 2.83-2.83"/><path d="m16.24 7.76 2.83-2.83"/></svg>' +
      escapeHtml(label) + '</span>';
    btn.style.cssText = [
      "display:inline-flex", "align-items:center", "justify-content:center",
      "background:" + bgCss, "color:" + fg, "padding:" + pad, "font-size:" + fs,
      "border:0", "border-radius:" + radius, "font-weight:700", "cursor:pointer",
      "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
      "transition:transform .2s ease, box-shadow .2s ease, filter .2s ease",
      "letter-spacing:.3px",
      "position:relative",
      glow
        ? "box-shadow:0 0 0 0 " + accent + "33, 0 8px 28px -6px " + accent + "88, 0 0 24px " + accent + "66"
        : "box-shadow:0 6px 20px -6px rgba(2,132,199,0.45)",
      glow ? "animation:ecomifyGlow 2.4s ease-in-out infinite" : ""
    ].join(";");
    btn.onmouseenter = function () {
      btn.style.transform = "translateY(-2px) scale(1.02)";
      if (glow) btn.style.filter = "brightness(1.08)";
    };
    btn.onmouseleave = function () {
      btn.style.transform = "translateY(0) scale(1)";
      btn.style.filter = "";
    };
    btn.onclick = function () { openTryOn(productId); };
    placeholder.appendChild(btn);

    if (glow && !document.getElementById("ecomify-glow-kf")) {
      var s = document.createElement("style"); s.id = "ecomify-glow-kf";
      s.textContent = "@keyframes ecomifyGlow{" +
        "0%,100%{box-shadow:0 8px 28px -6px " + accent + "88,0 0 18px " + accent + "55}" +
        "50%{box-shadow:0 10px 36px -6px " + accent + "cc,0 0 36px " + accent + "aa}" +
        "}";
      document.head.appendChild(s);
    }
  }

  function openTryOn(id) {
    startSession("back");
    var url = origin + "/ar/view/" + encodeURIComponent(id);
    var isMobile = /Mobi|Android|iPhone|iPad/.test(navigator.userAgent);
    if (isMobile) {
      window.addEventListener("pagehide", function () { endSession(false); }, { once: true });
      window.location.href = url;
      return;
    }
    var wrap = document.createElement("div");
    wrap.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:rgba(11,18,32,.85);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;animation:ecomifyFade .25s ease both;";
    var inner = document.createElement("div");
    inner.style.cssText = "position:relative;width:min(440px,92vw);height:min(820px,92vh);border-radius:28px;overflow:hidden;box-shadow:0 40px 100px -30px rgba(0,0,0,.6);background:#000";
    var iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.allow = "camera; xr-spatial-tracking; gyroscope; accelerometer";
    iframe.style.cssText = "width:100%;height:100%;border:0;display:block";
    var close = document.createElement("button");
    close.innerHTML = "&times;";
    close.style.cssText = "position:absolute;top:14px;right:14px;width:38px;height:38px;border-radius:999px;border:0;background:rgba(255,255,255,.92);color:#0B1220;font-size:22px;cursor:pointer;font-weight:600;z-index:2;";
    close.onclick = function () { endSession(true); wrap.remove(); };
    inner.appendChild(iframe); inner.appendChild(close); wrap.appendChild(inner);
    document.body.appendChild(wrap);
    if (!document.getElementById("ecomify-kf")) {
      var st = document.createElement("style"); st.id = "ecomify-kf";
      st.textContent = "@keyframes ecomifyFade{from{opacity:0}to{opacity:1}}";
      document.head.appendChild(st);
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  fetch(SUPABASE_URL + "/rest/v1/ar_products?id=eq." + encodeURIComponent(productId) +
    "&select=button_label,button_bg_color,button_text_color,button_border_radius,button_size,use_gradient,gradient_from,gradient_to,ar_customization", {
    headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY },
  })
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(function (rows) { render((rows && rows[0]) || {}); })
    .catch(function () { render({}); });
})();
