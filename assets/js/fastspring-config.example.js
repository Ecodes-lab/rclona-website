/**
 * FastSpring popup checkout configuration.
 *
 * 1. Copy this file to fastspring-config.js (or edit in place)
 * 2. In FastSpring: Checkouts → Popup Checkouts → your checkout → Place on your website
 * 3. Paste the data-storefront URL below
 * 4. For testing, keep .test. in the URL (e.g. yourstore.test.onfastspring.com/popup-donate)
 * 5. For production, remove .test. and whitelist your GitHub Pages domain in FastSpring
 */
window.RCLONA_FASTSPRING = {
  // Required — from the data-storefront attribute in FastSpring's snippet
  storefront: "YOUR_STORE.test.onfastspring.com/popup-YOUR_CHECKOUT",

  // Optional — product path from FastSpring Catalog (e.g. a fixed "donate" product)
  // Leave empty to open checkout with default products linked to the popup
  productPath: "",
};
