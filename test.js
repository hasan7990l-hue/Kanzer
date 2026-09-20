/* Kanzer · PO auth test · runs inside pocketoption.com */
(async () => {
  // ---- لوحة عرض النتائج ----
  const box = document.createElement("div");
  box.style.cssText = `
    position:fixed;bottom:10px;left:10px;right:10px;z-index:999999;
    background:#0b0d12;color:#e7e9ee;font:12px/1.5 ui-monospace,monospace;
    padding:12px;border-radius:12px;border:1px solid #c9a227;
    max-height:60vh;overflow:auto;white-space:pre-wrap;direction:ltr;
    box-shadow:0 0 30px rgba(0,0,0,.7);`;
  document.body.appendChild(box);
  const L = (m) => { box.textContent += m + "\n"; box.scrollTop = box.scrollHeight; };
  L("▶ Kanzer PO test starting...");

  // ---- تحميل Socket.IO ----
  if (typeof io === "undefined") {
    L("• loading socket.io...");
    await new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://cdn.socket.io/4.7.5/socket.io.min.js";
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  L("✔ socket.io ready");

  // ---- قراءة SSID من localStorage إن وُجد، وإلا اطلبه ----
  let ssid = localStorage.getItem("kanzer_test_ssid") || "";
  let uid  = parseInt(localStorage.getItem("kanzer_test_uid") || "0", 10);
  if (!ssid) {
    ssid = prompt("الصق SSID:") || "";
    uid = parseInt(prompt("الصق UID:", "0") || "0", 10);
    localStorage.setItem("kanzer_test_ssid", ssid);
    localStorage.setItem("kanzer_test_uid", String(uid));
  }
  if (!ssid) { L("✖ لا SSID — ألغيت."); return; }
  L(`• ssid: ${ssid.slice(0,12)}...  uid: ${uid}`);

  // ---- الاتصال ----
  const socket = io("wss://api-eu.po.market", {
    transports: ["websocket"], path: "/socket.io/", reconnection: false,
  });
  window._kanzer_socket = socket;

  socket.onAny((ev, ...a) =>
    L("📩 " + ev + " " + JSON.stringify(a).slice(0, 220))
  );
  socket.on("connect", () => {
    L("✔ ws connected — sending auth");
    socket.emit("auth", {
      session: ssid, isDemo: 1, uid, platform: 2,
    });
  });
  socket.on("connect_error", (e) => L("✖ " + e.message));
  socket.on("disconnect", (r) => L("🔌 " + r));

  setTimeout(() => L(`⏱ after 15s — connected: ${socket.connected}`), 15000);
})();
