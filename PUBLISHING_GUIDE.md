# 🚀 Publishing Guide - VoiceWatch AI

This guide will help you publish and deploy VoiceWatch AI to share with the world, hackathon judges, and potential users.

## 📋 Pre-Publishing Checklist

Before publishing, ensure:
- ✅ All features are working in demo mode
- ✅ Authentication flow is smooth
- ✅ No console errors in browser
- ✅ README.md is up to date with latest features
- ✅ All dependencies are properly installed
- ✅ Code is committed to git

## 🌐 Publishing Options

### Option 1: GitHub Pages (Recommended for Static Hosting)

GitHub Pages is free and perfect for Spark applications.

#### Steps:

1. **Ensure your code is on GitHub:**
   ```bash
   git add .
   git commit -m "Ready for publishing"
   git push origin main
   ```

2. **Build for production:**
   ```bash
   npm run build
   ```

3. **Deploy to GitHub Pages:**
   
   **Option A - Using gh-pages package:**
   ```bash
   npm install --save-dev gh-pages
   ```
   
   Add this script to your `package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
   
   Then deploy:
   ```bash
   npm run deploy
   ```

   **Option B - Manual deployment:**
   - Go to your GitHub repository settings
   - Navigate to "Pages" section
   - Select "GitHub Actions" as source
   - Create `.github/workflows/deploy.yml` (see below)

4. **GitHub Actions Workflow** (`.github/workflows/deploy.yml`):
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [ main ]
     workflow_dispatch:

   permissions:
     contents: read
     pages: write
     id-token: write

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4

         - name: Setup Node
           uses: actions/setup-node@v4
           with:
             node-version: '20'
             cache: 'npm'

         - name: Install dependencies
           run: npm ci

         - name: Build
           run: npm run build

         - name: Setup Pages
           uses: actions/configure-pages@v4

         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3
           with:
             path: './dist'

         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v4
   ```

5. **Access your published app:**
   - URL will be: `https://[your-username].github.io/[repo-name]/`
   - Check GitHub repository settings → Pages for exact URL

---

### Option 2: Vercel (Recommended for Easy Deployment)

Vercel offers excellent performance and zero-config deployment for Vite apps.

#### Steps:

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Follow the prompts:**
   - Link to existing project or create new
   - Select default settings for Vite
   - Deploy!

4. **Production deployment:**
   ```bash
   vercel --prod
   ```

5. **Your app is live!**
   - Vercel provides a URL like: `https://your-app.vercel.app`
   - Custom domains available in project settings

---

### Option 3: Netlify (Great for Continuous Deployment)

Netlify offers drag-and-drop deployment and automatic builds from GitHub.

#### Steps:

1. **Build your app:**
   ```bash
   npm run build
   ```

2. **Deploy via drag-and-drop:**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/login
   - Drag your `dist` folder to the deploy area

3. **Or connect GitHub repository:**
   - Click "New site from Git"
   - Connect your GitHub account
   - Select your repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Deploy!

4. **Your app is live!**
   - Netlify provides URL like: `https://your-app.netlify.app`
   - Automatic deployments on every git push

---

### Option 4: Cloudflare Pages (Excellent Performance)

Cloudflare Pages offers global CDN and fast deployment.

#### Steps:

1. **Connect GitHub:**
   - Go to [pages.cloudflare.com](https://pages.cloudflare.com)
   - Sign up/login
   - Click "Create a project"
   - Connect GitHub account
   - Select repository

2. **Configure build:**
   - Framework preset: Vite
   - Build command: `npm run build`
   - Build output directory: `dist`

3. **Deploy:**
   - Click "Save and Deploy"
   - Wait for build to complete

4. **Your app is live!**
   - URL provided: `https://your-app.pages.dev`
   - Custom domains available

---

## 🔧 Configuration for Production

### Environment Variables

If you need to configure environment variables for production:

1. **Create `.env.production` file:**
   ```env
   VITE_APP_NAME=VoiceWatch AI
   VITE_APP_VERSION=1.0.0
   ```

2. **Add to platform:**
   - **Vercel:** Project Settings → Environment Variables
   - **Netlify:** Site Settings → Build & Deploy → Environment
   - **Cloudflare:** Workers & Pages → Settings → Environment Variables

### Base URL Configuration

If deploying to a subdirectory (like GitHub Pages), update `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/your-repo-name/', // For GitHub Pages
  // or
  base: '/', // For root domain deployments
  plugins: [react()],
})
```

---

## 📊 Post-Publishing Tasks

### 1. Update README with Live Demo Link

Add the deployment URL to your README.md:

```markdown
## 🌟 Live Demo

**Try VoiceWatch AI now:** [https://your-app.vercel.app](https://your-app.vercel.app)

No API keys required - start with Demo Mode for instant exploration!
```

### 2. Share Your Project

- **Twitter/X:** Share with #AIHackathon #LLMObservability
- **LinkedIn:** Post about your project with demo link
- **Dev.to:** Write a blog post about building it
- **Hackathon submission:** Include live demo URL
- **Reddit:** Share in r/reactjs, r/webdev

### 3. Monitor Performance

Use these tools to ensure optimal performance:

- **Lighthouse:** Run audit in Chrome DevTools
- **WebPageTest:** Test loading speed globally
- **Vercel Analytics:** Built-in analytics if using Vercel

### 4. Add Analytics (Optional)

Track usage with privacy-friendly analytics:

```bash
npm install @vercel/analytics
```

Add to `src/main.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react'

// In your root component
<>
  <App />
  <Analytics />
</>
```

---

## 🐛 Troubleshooting

### Build Fails

**Issue:** Build errors during deployment

**Solution:**
```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# Try building locally
npm run build

# Check for TypeScript errors
npm run type-check
```

### Routing Issues (404 on refresh)

**Issue:** Page not found when refreshing on deployed app

**Solution:** Configure platform for SPA routing:

**Vercel:** Create `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Netlify:** Create `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Cloudflare Pages:** Create `_redirects` in `public/` folder:
```
/*    /index.html    200
```

### Assets Not Loading

**Issue:** Images or fonts not loading

**Solution:**
- Ensure all assets are in `src/assets/` directory
- Use import statements, not string paths
- Check `base` URL in vite.config.ts

---

## 🎉 Success!

Your VoiceWatch AI application is now published and accessible to the world!

### Next Steps:
1. ✅ Test the live deployment thoroughly
2. ✅ Share the link with your network
3. ✅ Submit to hackathon with live demo URL
4. ✅ Gather feedback and iterate
5. ✅ Monitor usage and performance

### Showcase Tips:
- Start with **Demo Mode** for instant impact
- Highlight all **4 sponsor integrations** clearly
- Demonstrate **voice interactions** first
- Show **real-time collaboration** features
- Emphasize **security** with encrypted credentials
- Mention **dual-mode** operation (demo + production)

---

## 📚 Additional Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages)

---

**Built with ❤️ for the AI Partner Catalyst Hackathon**

Integrating Google Cloud · Datadog · Confluent · ElevenLabs
