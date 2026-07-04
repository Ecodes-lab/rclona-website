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

  let scriptReady = false;
  let scriptPromise = null;

  function waitForBuilder(timeoutMs) {
    if (window.fastspring?.builder) {
      return Promise.resolve(window.fastspring.builder);
    }
    if (scriptPromise) return scriptPromise;

    scriptPromise = new Promise(function (resolve, reject) {
      const script = document.createElement("script");
      script.id = "fsc-api";
      script.src = "https://sbl.onfastspring.com/sbl/1.0.7/fastspring-builder.min.js";
      script.type = "text/javascript";
      script.setAttribute("data-storefront", cfg.storefront);
      script.setAttribute("data-continuous", "true");

      script.onload = function () {
        const started = Date.now();
        (function poll() {
          if (window.fastspring?.builder) {
            scriptReady = true;
            resolve(window.fastspring.builder);
            return;
          }
          if (Date.now() - started > timeoutMs) {
            reject(new Error("FastSpring builder did not initialize"));
            return;
          }
          setTimeout(poll, 50);
        })();
      };

      script.onerror = function () {
        reject(new Error("Failed to load FastSpring script"));
      };

      document.body.appendChild(script);
    });

    return scriptPromise;
  }

  function openCheckout(builder) {
    const product = (cfg.productPath || "").trim();

    if (product) {
      if (typeof builder.reset === "function") {
        builder.reset();
      }
      builder.add(product, function () {
        builder.checkout();
      });
      return;
    }

    // No default product — show popup catalog (requires products on checkout homepage)
    builder.checkout();
  }

  window.openRclonaDonate = function () {
    waitForBuilder(15000)
      .then(openCheckout)
      .catch(function (err) {
        console.warn("[Rclona FastSpring]", err);
      });
  };

  document.querySelectorAll("[data-donate-btn]").forEach(function (el) {
    el.classList.add("donate-ready");
  });

  // Preload SBL so the first click is faster
  waitForBuilder(15000).catch(function () {
    /* ignore preload errors */
  });
})();
