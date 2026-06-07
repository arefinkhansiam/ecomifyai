(function () {
  "use strict";
  // Easibie AR Widget — drop-in script for any website
  var SUPABASE_URL = "https://ygsaduwfmycbrvjqbdbu.supabase.co";
  var SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnc2FkdXdmbXljYnJ2anFiZGJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MTc1MTYsImV4cCI6MjA5NjM5MzUxNn0.H_sQ0JmPLfR62HXaJ5NrXWmVcm1s8xk5a1ez2XhF8M0";

  var currentScript = document.currentScript || (function () {
    var scripts = document.getElementsByTagName("script");
    return scripts[scripts.length - 1];
  })();

  var productId = currentScript.getAttribute("data-product-id");
  if (!productId) {
    console.warn("[Easibie] Missing data-product-id");
    return;
  }
  var overrideLabel = currentScript.getAttribute("data-label");
  var overrideBg = currentScript.getAttribute("data-color");
  var overrideText = currentScript.getAttribute("data-text-color");
  var origin = new URL(currentScript.src).origin;

  var placeholder = document.createElement("span");
  placeholder.style.display = "inline-block";
  currentScript.parentNode.insertBefore(placeholder, currentScript);

  function render(cfg) {
    var label = overrideLabel || cfg.button_label || "View in AR";
    var bg = overrideBg || cfg.button_bg_color || "#0284C7";
    var fg = overrideText || cfg.button_text_color || "#FFFFFF";
    var radius = (cfg.button_border_radius != null ? cfg.button_border_radius : 12) + "px";
    var size = cfg.button_size || "medium";
    var pad = size === "small" ? "10px 18px" : size === "large" ? "18px 36px" : "14px 28px";
    var fs = size === "small" ? "13px" : size === "large" ? "17px" : "15px";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.innerHTML =
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:8px"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="3"/></svg>' +
      '<span>' + escapeHtml(label) + '</span>';
    btn.style.cssText = [
      "display:inline-flex", "align-items:center", "justify-content:center",
      "background:" + bg, "color:" + fg, "padding:" + pad, "font-size:" + fs,
      "border:none", "border-radius:" + radius, "font-weight:600", "cursor:pointer",
      "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
      "box-shadow:0 6px 20px -6px rgba(2,132,199,0.55)", "transition:transform .15s ease, box-shadow .15s ease",
      "letter-spacing:.2px"
    ].join(";");
    btn.onmouseenter = function () { btn.style.transform = "translateY(-1px)"; };
    btn.onmouseleave = function () { btn.style.transform = "translateY(0)"; };
    btn.onclick = function () { openAR(productId); };
    placeholder.appendChild(btn);
  }

  function openAR(id) {
    var url = origin + "/ar/view/" + encodeURIComponent(id);
    var isMobile = /Mobi|Android|iPhone|iPad/.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = url;
      return;
    }
    // Desktop: full-screen overlay iframe
    var wrap = document.createElement("div");
    wrap.style.cssText = "position:fixed;inset:0;z-index:2147483647;background:rgba(11,18,32,.85);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;animation:easibieFade .25s ease both;";
    var inner = document.createElement("div");
    inner.style.cssText = "position:relative;width:min(440px,92vw);height:min(820px,92vh);border-radius:28px;overflow:hidden;box-shadow:0 40px 100px -30px rgba(0,0,0,.6);background:#000";
    var iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.allow = "camera; xr-spatial-tracking; gyroscope; accelerometer";
    iframe.style.cssText = "width:100%;height:100%;border:0;display:block";
    var close = document.createElement("button");
    close.innerHTML = "&times;";
    close.style.cssText = "position:absolute;top:14px;right:14px;width:38px;height:38px;border-radius:999px;border:0;background:rgba(255,255,255,.92);color:#0B1220;font-size:22px;cursor:pointer;font-weight:600;z-index:2;";
    close.onclick = function () { wrap.remove(); };
    inner.appendChild(iframe); inner.appendChild(close); wrap.appendChild(inner);
    document.body.appendChild(wrap);
    if (!document.getElementById("easibie-kf")) {
      var st = document.createElement("style"); st.id = "easibie-kf";
      st.textContent = "@keyframes easibieFade{from{opacity:0}to{opacity:1}}";
      document.head.appendChild(st);
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  // Fetch product config (RLS: ready + public). Fall back to defaults if blocked.
  fetch(SUPABASE_URL + "/rest/v1/ar_products?id=eq." + encodeURIComponent(productId) +
    "&select=button_label,button_bg_color,button_text_color,button_border_radius,button_size", {
    headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY },
  })
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(function (rows) { render((rows && rows[0]) || {}); })
    .catch(function () { render({}); });
})();
