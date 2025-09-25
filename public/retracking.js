(function () {
  function detectDeviceType() {
    const userAgent = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(userAgent)) return "iOS";
    if (/Android/i.test(userAgent)) return "Android";
    if (/Windows Phone/i.test(userAgent)) return "Windows Phone";
    if (/Windows NT/i.test(userAgent)) return "Windows";
    if (/Macintosh/i.test(userAgent)) return "Mac";
    if (/Linux/i.test(userAgent)) return "Linux";
    return "Unknown";
  }

  function sendTracking(eventType, extra = {}) {
    const payload = {
      event: eventType,
      page: window.location.href,
      device: detectDeviceType(),
      referrer: document.referrer || null,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      ...extra
    };

    fetch("https://www.adclickboost.com/api/track-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(() => {});
  }

 
  sendTracking("page_view");


  document.addEventListener("click", function (e) {
    const target = e.target.closest("a");
    if (target && target.href.includes("aff=")) {
      sendTracking("affiliate_click", { affiliateUrl: target.href });
    }
  });
})();
