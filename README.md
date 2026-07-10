# Rclona website (GitHub Pages)

Public landing page and installation docs for **Rclona**. This repo contains no application source code.

- **Live site:** https://ecodes-lab.github.io/rclona-website/ (after GitHub Pages is enabled)
- **Custom domain (optional):** configure in repo Settings → Pages

## Contents

| Path | Purpose |
|------|---------|
| `index.html` | Product landing page |
| `install/docker.html` | Docker installation guide |
| `install/desktop.html` | Desktop apps (coming soon) |
| `assets/css/style.css` | Shared styles |

## Enable GitHub Pages

1. Push this repo to GitHub as **`rclona-website`** (public).
2. Go to **Settings → Pages**.
3. Source: **Deploy from branch**.
4. Branch: **`main`** / **`/ (root)`**.
5. Save. The site will be live in 1–2 minutes.

## Local preview

```bash
cd rclona-website
python3 -m http.server 8080
# open http://localhost:8080
```

## Updating install docs

When the Docker image name or env vars change in the private app repo, update:

- `install/docker.html`
- The compose snippet on the home page

## Donation button (Paystack / FastSpring)

1. Edit `assets/js/donate-config.js` — set `provider`, `paystackPageUrl` (or FastSpring fields), and `donationsEnabled: true`
2. See the app repo `docs/DONATIONS.md` for full setup
3. Push to redeploy GitHub Pages:

```bash
git add .
git commit -m "Configure Paystack donate button"
git push origin master
```
## License

Site content © Rclona. Not open source.
