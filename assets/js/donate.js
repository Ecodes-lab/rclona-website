/**
 * Donate modal + checkout (Paystack Payment Page or FastSpring popup).
 */
(function () {
  const cfg = window.RCLONA_DONATE || window.RCLONA_FASTSPRING;
  const provider = (cfg?.provider || "paystack").toLowerCase();

  if (!cfg?.donationsEnabled) {
    document.querySelectorAll("[data-donate-ui]").forEach(function (el) {
      el.remove();
    });
    document.getElementById("donate-modal")?.remove();
    return;
  }

  document.documentElement.classList.add("donations-enabled");

  const modal = document.getElementById("donate-modal");
  const tiersRoot = document.getElementById("donate-modal-tiers");
  const lead = document.querySelector(".donate-modal-lead");
  const supportCopy = document.querySelector("#support .support-inner > p");

  const providerLabel = provider === "fastspring" ? "FastSpring" : "Paystack";
  if (lead) {
    lead.textContent = "Pick an amount — secure checkout via " + providerLabel + ".";
  }
  if (supportCopy && supportCopy.textContent.includes("FastSpring")) {
    supportCopy.textContent = supportCopy.textContent.replace(/FastSpring/g, providerLabel);
  }

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

  function isPaystackConfigured() {
    const base = (cfg.paystackPageUrl || "").trim();
    return Boolean(base) && !base.includes("YOUR_SLUG");
  }

  function isFastSpringConfigured() {
    return Boolean(cfg.storefront) && !String(cfg.storefront).includes("YOUR_STORE");
  }

  function isConfigured() {
    return provider === "paystack" ? isPaystackConfigured() : isFastSpringConfigured();
  }

  function buildPaystackUrl(amount) {
    const base = (cfg.paystackPageUrl || "").replace(/\/$/, "");
    const url = new URL(base);
    if (amount != null) url.searchParams.set("amount", String(amount));
    return url.toString();
  }

  function openPaystack(amount) {
    const href = buildPaystackUrl(amount);
    window.open(href, "_blank", "noopener,noreferrer");
  }

  function populateModalTiers(configured) {
    if (!tiersRoot || !cfg?.tiers?.length) return;

    tiersRoot.innerHTML = "";
    cfg.tiers.forEach(function (tier) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "btn btn-donate donate-tier" + (configured ? " donate-ready" : " donate-unconfigured");
      btn.setAttribute("data-donate-tier", tier.path || String(tier.amount));
      if (tier.amount != null) btn.setAttribute("data-donate-amount", String(tier.amount));
      if (!configured) {
        btn.setAttribute("title", "Configure donations in assets/js/donate-config.js");
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
    const path = tierBtn.getAttribute("data-donate-tier");
    const amountAttr = tierBtn.getAttribute("data-donate-amount");
    const amount = amountAttr ? Number(amountAttr) : undefined;
    closeDonateModal();

    if (provider === "paystack") {
      openPaystack(amount);
      return;
    }

    if (typeof window.openRclonaDonate === "function") {
      window.openRclonaDonate(path);
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

  const configured = isConfigured();
  populateModalTiers(configured);

  if (!configured) {
    document.querySelectorAll("[data-donate-open]").forEach(function (el) {
      el.classList.add("donate-unconfigured");
      el.setAttribute("title", "Configure donations in assets/js/donate-config.js");
    });
    if (shouldOpenFromUrl()) {
      openDonateModal();
      cleanDonateParam();
    }
    return;
  }

  document.querySelectorAll("[data-donate-open]").forEach(function (el) {
    el.classList.add("donate-ready");
  });

  if (shouldOpenFromUrl()) {
    openDonateModal();
    cleanDonateParam();
  }

  // FastSpring-only: load Store Builder
  if (provider !== "fastspring") {
    window.openRclonaDonate = function (productPath) {
      const tier = (cfg.tiers || []).find(function (t) {
        return t.path === productPath;
      });
      openPaystack(tier?.amount);
    };
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

  waitForBuilder(15000).catch(function () {
    /* ignore preload errors */
  });
})();
