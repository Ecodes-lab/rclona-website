/**
 * FastSpring popup checkout — edit before deploying.
 */
window.RCLONA_FASTSPRING = {
  /** Set to true after FastSpring account is verified and checkout is tested. */
  donationsEnabled: false,
  storefront: "ecodes.test.onfastspring.com/popup-donate",
  productPath: "donate-5",
  tiers: [
    { path: "donate-5", emoji: "☕", label: "Buy me a coffee", price: "$5" },
    { path: "donate-15", emoji: "🙏", label: "Support the project", price: "$15" },
    { path: "donate-25", emoji: "⭐", label: "Super supporter", price: "$25" },
  ],
};
