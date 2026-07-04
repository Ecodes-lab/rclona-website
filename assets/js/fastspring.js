/**
 * Loads FastSpring Store Builder and exposes openRclonaDonate() globally.
 */
(function () {
  const cfg = window.RCLONA_FASTSPRING;
  if (!cfg?.storefront || cfg.storefront.includes("YOUR_STORE")) {
    document.querySelectorAll("[data-donate-btn]").forEach((el) => {
      el.classList.add("donate-unconfigured");
      el.setAttribute("title", "Configure FastSpring in assets/js/fastspring-config.js");
    });
    return;
  }

  const script = document.createElement("script");
  script.id = "fsc-api";
  script.src = "https://sbl.onfastspring.com/sbl/1.0.7/fastspring-builder.min.js";
  script.type = "text/javascript";
  script.setAttribute("data-storefront", cfg.storefront);
  document.body.appendChild(script);

  window.openRclonaDonate = function () {
    if (!window.fastspring?.builder) {
      console.warn("FastSpring not loaded yet");
      return;
    }
    if (cfg.productPath) {
      window.fastspring.builder.add(cfg.productPath);
    }
    window.fastspring.builder.checkout();
  };

  document.querySelectorAll("[data-donate-btn]").forEach((el) => {
    el.classList.add("donate-ready");
  });
})();
