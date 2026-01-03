# 🚀 Quick Deploy Guide

Deploy VoiceWatch AI in under 5 minutes! Choose your preferred platform:

## ⚡ Fastest: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (follow prompts)
vercel

# Or deploy to production directly
vercel --prod
```

**Your app will be live at:** `https://your-app.vercel.app`

---

## 🔷 GitHub Pages (Free Forever)

### Option 1: Automatic (Using GitHub Actions)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Ready to deploy"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under "Source", select **GitHub Actions**

3. **Automatic deployment:**
   - The workflow file `.github/workflows/deploy.yml` is already configured
   - Every push to `main` will trigger a new deployment
   - Check the "Actions" tab to see deployment status

**Your app will be live at:** `https://[username].github.io/[repo-name]/`

### Option 2: Manual Deploy

```bash
# Build the project
npm run build

# Install gh-pages package
npm install --save-dev gh-pages

# Add deploy script to package.json (already added!)
# Then deploy
npm run deploy
```

---

## 🟢 Netlify (Great for Continuous Deployment)

### Option 1: Drag & Drop

1. Build your app:
   ```bash
   npm run build
   ```

2. Go to [netlify.com](https://netlify.com)
3. Drag the `dist` folder to the deploy area
4. Done!

### Option 2: Git Integration

1. Go to [netlify.com](https://netlify.com) and click "New site from Git"
2. Connect your GitHub repository
3. Build settings (auto-detected from `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Click "Deploy site"

**Your app will be live at:** `https://your-app.netlify.app`

---

## 🟠 Cloudflare Pages (Global CDN)

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Click "Create a project" → "Connect to Git"
3. Select your repository
4. Build settings:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Click "Save and Deploy"

**Your app will be live at:** `https://your-app.pages.dev`

---

## 📦 Build Locally

Test the production build before deploying:

```bash
# Build the project
npm run build

# Preview the production build
npm run preview
```

Visit `http://localhost:4173` to test the production build locally.

---

## ✅ Pre-Deploy Checklist

Before deploying, make sure:

- [x] All features work in demo mode
- [x] No console errors in browser
- [x] Build completes successfully (`npm run build`)
- [x] Production preview works (`npm run preview`)
- [x] README.md is up to date
- [x] Git repository is clean (all changes committed)

---

## 🔧 Deployment Configuration Files

All configuration files are already created for you:

| File | Platform | Purpose |
|------|----------|---------|
| `vercel.json` | Vercel | SPA routing & caching |
| `netlify.toml` | Netlify | Build settings & redirects |
| `public/_redirects` | Cloudflare Pages | SPA routing |
| `.github/workflows/deploy.yml` | GitHub Pages | CI/CD pipeline |

---

## 🌐 Post-Deployment

### Update README with Live Demo

Once deployed, add your live URL to the README:

```markdown
## 🌟 Live Demo

**Try VoiceWatch AI:** [https://your-app.vercel.app](https://your-app.vercel.app)
```

### Share Your Project

- **Twitter/X:** Share with #VoiceWatchAI #LLMObservability
- **LinkedIn:** Post about your deployment
- **Dev.to:** Write about the building process
- **Hackathon:** Submit with live demo link

---

## 🐛 Troubleshooting

### Build fails on deployment

```bash
# Clean install and rebuild
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

### 404 on page refresh

**Issue:** Routes return 404 when refreshing
**Fix:** The SPA redirect configs are already in place:
- Vercel: `vercel.json`
- Netlify: `netlify.toml`
- Cloudflare: `public/_redirects`

### Assets not loading

**Issue:** CSS/JS files returning 404
**Fix:** Ensure `base` URL in `vite.config.ts` is set correctly:
- For root domain: `base: '/'` ✅ (already configured)
- For subdirectory: `base: '/repo-name/'`

---

## 🎉 Success!

Your VoiceWatch AI is now live and accessible to the world!

### Next Steps:

1. ✅ Test all features on the live deployment
2. ✅ Share the link with your network
3. ✅ Submit to hackathons with the demo URL
4. ✅ Gather feedback from users
5. ✅ Monitor performance with platform analytics

---

**Built with ❤️ for the AI Partner Catalyst Hackathon**

Integrating Google Cloud · Datadog · Confluent · ElevenLabs
