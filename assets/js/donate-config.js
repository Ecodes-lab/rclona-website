/**
 * Donation checkout config — edit before deploying.
 *
 * provider:
 *   "paystack"   → tier buttons open Paystack Payment Page URLs
 *   "fastspring" → tier buttons open FastSpring popup checkout
 */
window.RCLONA_DONATE = {
  /** Set to true when ready to show Coffee / Support UI. */
  donationsEnabled: true,

  /** "paystack" | "fastspring" */
  provider: "paystack",

  // --- Paystack Payment Page (no trailing slash) ---
  // Live/test page: https://paystack.shop/pay/rclona
  // Tiers append ?amount=5000 | 15000 | 25000 (NGN major units)
  paystackPageUrl: "https://paystack.shop/pay/rclona",

  // --- FastSpring (used only when provider === "fastspring") ---
  storefront: "ecodes.test.onfastspring.com/popup-donate",
  productPath: "donate-5",

  tiers: [
    {
      amount: 5000,
      path: "donate-5",
      emoji: "☕",
      label: "Buy me a coffee",
      price: "₦5,000",
    },
    {
      amount: 15000,
      path: "donate-15",
      emoji: "🙏",
      label: "Support the project",
      price: "₦15,000",
    },
    {
      amount: 25000,
      path: "donate-25",
      emoji: "⭐",
      label: "Super supporter",
      price: "₦25,000",
    },
  ],
};

// Back-compat alias for older scripts
window.RCLONA_FASTSPRING = window.RCLONA_DONATE;
