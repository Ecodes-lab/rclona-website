/**
 * Donation checkout configuration.
 *
 * 1. Copy to donate-config.js (or edit donate-config.js in place)
 * 2. Set provider to "paystack" or "fastspring"
 * 3. Fill the matching fields below
 * 4. Set donationsEnabled to true when ready
 */
window.RCLONA_DONATE = {
  donationsEnabled: false,

  /** "paystack" | "fastspring" */
  provider: "paystack",

  // Paystack — Payment Page base URL (tiers add ?amount=…)
  paystackPageUrl: "https://paystack.shop/pay/YOUR_SLUG",

  // FastSpring — from Popup Checkout → Place on your website
  storefront: "YOUR_STORE.test.onfastspring.com/popup-YOUR_CHECKOUT",
  productPath: "donate-5",

  tiers: [
    { amount: 5000, path: "donate-5", emoji: "☕", label: "Buy me a coffee", price: "₦5,000" },
    { amount: 15000, path: "donate-15", emoji: "🙏", label: "Support the project", price: "₦15,000" },
    { amount: 25000, path: "donate-25", emoji: "⭐", label: "Super supporter", price: "₦25,000" },
  ],
};

window.RCLONA_FASTSPRING = window.RCLONA_DONATE;
