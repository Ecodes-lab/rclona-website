/**
 * Loads FastSpring Store Builder and exposes openRclonaDonate(productPath) globally.
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

  function openCheckout(builder, productPath) {
    const product = (productPath || cfg.productPath || "").trim();
    if (!product) {
      builder.checkout();
      return;
    }
    if (typeof builder.reset === "function") {
      builder.reset();
    }
    builder.add(product, function () {
      builder.checkout();
    });
  }

  window.openRclonaDonate = function (productPath) {
    waitForBuilder(15000)
      .then(function (builder) {
        openCheckout(builder, productPath);
      })
      .catch(function (err) {
        console.warn("[Rclona FastSpring]", err);
      });
  };

  document.querySelectorAll("[data-donate-btn]").forEach(function (el) {
    el.classList.add("donate-ready");
    const tier = el.getAttribute("data-donate-tier");
    if (tier) {
      el.addEventListener("click", function () {
        window.openRclonaDonate(tier);
      });
    }
  });

  waitForBuilder(15000).catch(function () {
    /* ignore preload errors */
  });
})();
