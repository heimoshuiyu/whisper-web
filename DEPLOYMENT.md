# Deployment Guide

## Quick Deploy Options

### 1. Vercel (Recommended)

1. Fork this repository
2. Go to [vercel.com](https://vercel.com) and sign up/login
3. Click "New Project"
4. Import your forked repository
5. Deploy - it will work out of the box!

### 2. Netlify

1. Fork this repository
2. Go to [netlify.com](https://netlify.com) and sign up/login
3. Click "New site from Git"
4. Connect your GitHub account and select the repository
5. Build command: `npm run build`
6. Publish directory: `dist`
7. Deploy - it will work out of the box!

### 3. GitHub Pages (Limited Functionality)

**Note**: GitHub Pages doesn't support SharedArrayBuffer, so FFmpeg processing will be disabled.

1. Fork this repository
2. Go to Settings > Pages
3. Source: Deploy from a branch
4. Branch: `master` (or your default branch)
5. Folder: `/ (root)`
6. Save

The app will work but users will need to:
- Upload pre-converted audio files (MP3, WAV, etc.)
- Enable "Skip FFmpeg" in settings for direct API upload

## Local Development

```bash
# Clone the repository
git clone <your-repo-url>
cd whisper-web

# Install dependencies
npm install

# Start development server
npm run dev
```

The local development server includes the necessary CORS headers, so FFmpeg will work perfectly.

## Custom Domain Setup

If you want to use a custom domain with GitHub Pages or another service:

1. Configure your domain's DNS
2. Add a `_headers` file to your `public` folder:

```
/*
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: cross-origin
```

3. Deploy your site

## Troubleshooting

### FFmpeg Not Loading
- Check if your hosting platform supports SharedArrayBuffer
- Try uploading a pre-converted audio file instead
- Enable "Skip FFmpeg" in the app settings

### CORS Errors
- Ensure your hosting platform sets the required CORS headers
- For custom domains, add the `_headers` file as shown above

### Build Errors
- Make sure you're using Node.js 18+ for building
- Check that all dependencies are installed: `npm install` 