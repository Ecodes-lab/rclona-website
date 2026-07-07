/**
 * FastSpring checkout + donate modal (single header button, tier picker in modal).
 */
(function () {
  const cfg = window.RCLONA_FASTSPRING;
  const modal = document.getElementById("donate-modal");
  const tiersRoot = document.getElementById("donate-modal-tiers");

  function openDonateModal() {
    if (!modal) return;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("donate-modal-open");
    const firstTier = modal.querySelector("[data-donate-tier]");
    if (firstTier instanceof HTMLElement) {
      firstTier.focus();
    }
  }

  function closeDonateModal() {
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("donate-modal-open");
  }

  window.openDonateModal = openDonateModal;
  window.closeDonateModal = closeDonateModal;

  function shouldOpenFromUrl() {
    const value = new URLSearchParams(window.location.search).get("donate");
    return value === "1" || value === "true" || value === "open" || value === "modal";
  }

  function cleanDonateParam() {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("donate")) return;
    url.searchParams.delete("donate");
    const next = url.pathname + url.search + url.hash;
    history.replaceState(null, "", next);
  }

  function populateModalTiers(configured) {
    if (!tiersRoot || !cfg?.tiers?.length) return;

    tiersRoot.innerHTML = "";
    cfg.tiers.forEach(function (tier) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-donate donate-tier" + (configured ? " donate-ready" : " donate-unconfigured");
      btn.setAttribute("data-donate-tier", tier.path);
      if (!configured) {
        btn.setAttribute("title", "Configure FastSpring in assets/js/fastspring-config.js");
      }
      btn.innerHTML =
        '<span class="donate-tier-emoji">' +
        tier.emoji +
        '</span><span class="donate-tier-label">' +
        tier.label +
        '</span><span class="donate-tier-price">' +
        tier.price +
        "</span>";
      tiersRoot.appendChild(btn);
    });
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-donate-open]")) {
      e.preventDefault();
      openDonateModal();
      return;
    }

    if (e.target.closest("[data-donate-close]")) {
      e.preventDefault();
      closeDonateModal();
      return;
    }

    const tierBtn = e.target.closest("[data-donate-tier]");
    if (!tierBtn || !modal || !modal.contains(tierBtn)) return;

    e.preventDefault();
    const tier = tierBtn.getAttribute("data-donate-tier");
    closeDonateModal();
    if (typeof window.openRclonaDonate === "function") {
      window.openRclonaDonate(tier);
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal && !modal.hidden) {
      closeDonateModal();
    }
  });

  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeDonateModal();
    });
  }

  populateModalTiers(false);

  if (!cfg?.storefront || cfg.storefront.includes("YOUR_STORE")) {
    document.querySelectorAll("[data-donate-open]").forEach(function (el) {
      el.classList.add("donate-unconfigured");
      el.setAttribute("title", "Configure FastSpring in assets/js/fastspring-config.js");
    });
    if (shouldOpenFromUrl()) {
      openDonateModal();
      cleanDonateParam();
    }
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

  document.querySelectorAll("[data-donate-open]").forEach(function (el) {
    el.classList.add("donate-ready");
  });

  populateModalTiers(true);

  if (shouldOpenFromUrl()) {
    openDonateModal();
    cleanDonateParam();
  }

  waitForBuilder(15000).catch(function () {
    /* ignore preload errors */
  });
})();
