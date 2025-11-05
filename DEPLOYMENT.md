# LoreWeaver Deployment Guide

## GitHub Pages Setup (5 minutes)

### Step 1: Enable GitHub Pages

1. Go to your repository: https://github.com/alekzandr/loreweaver
2. Click **Settings** (top right)
3. Click **Pages** (left sidebar)
4. Under "Build and deployment":
   - Source: Select **"GitHub Actions"**
5. Click **Save**

### Step 2: Push Your Code

```bash
git add .
git commit -m "Add GitHub Pages deployment"
git push origin main
```

### Step 3: Watch It Deploy

1. Go to the **Actions** tab in your repository
2. You'll see the "Deploy to GitHub Pages" workflow running
3. Wait 1-2 minutes for completion (green checkmark ✅)

### Step 4: Visit Your Site

Your site will be live at:
**https://alekzandr.github.io/loreweaver/**

## How It Works

- **Every push to `main`** triggers automatic deployment
- The **entire repository** is deployed as-is (static files only)
- **No build step needed** - your HTML/CSS/JS works directly
- Takes **1-2 minutes** from push to live

## Updating Your Site

Just push changes to main:

```bash
git add .
git commit -m "Update encounter data"
git push origin main
```

GitHub automatically redeploys in 1-2 minutes!

## Troubleshooting

### Site shows 404
- Wait 2-3 minutes after first deployment
- Make sure GitHub Pages source is set to "GitHub Actions"
- Check Actions tab for deployment errors

### Changes not showing
- Hard refresh: `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)
- GitHub Pages has ~1 minute cache
- Check Actions tab to ensure deployment completed

### Deployment fails
- Check Actions tab for error messages
- Ensure all files are committed and pushed
- Verify repository is public (or you have GitHub Pro for private repos)

## Custom Domain (Optional)

To use your own domain:

1. Go to Settings → Pages
2. Add your custom domain under "Custom domain"
3. Update your DNS settings (see GitHub docs)

## Alternative: Manual Deployment

If you don't want automatic deployment, you can disable the workflow:

1. Go to `.github/workflows/deploy.yml`
2. Delete the file or rename it to `deploy.yml.disabled`

Then deploy manually through Settings → Pages by selecting branch.

---

**Next Steps:**
1. Enable GitHub Pages (Step 1 above)
2. Push your code
3. Visit your live site!
