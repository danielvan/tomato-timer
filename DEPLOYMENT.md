# Deployment Guide - Timmy on Vercel

## 🚀 Quick Deploy

1. **Connect GitHub to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import `danielvan/tomato-timer`

2. **Configure Environment Variables**
   In your Vercel dashboard, add these environment variables:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. **Deploy**
   - Click "Deploy" (no build settings needed)
   - Your app will be live at `https://your-project-name.vercel.app`

## 🔧 Post-Deployment Setup

### Update Supabase CORS
1. Go to Supabase Dashboard → Settings → API
2. Add your Vercel domain to **Site URL**:
   ```
   https://your-project-name.vercel.app
   ```
3. Add to **Redirect URLs**:
   ```
   https://your-project-name.vercel.app/**
   ```

### Custom Domain (Optional)
1. In Vercel dashboard → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update Supabase URLs to match your domain

## 📁 Files for Deployment

- `vercel.json` - Vercel configuration with SPA routing
- `.env.example` - Environment variables template
- All source files are deployment-ready (vanilla JS + CDN)

## 🔄 Continuous Deployment

- Automatic deployments on every push to `main` branch
- Preview deployments for pull requests
- Instant rollbacks available in Vercel dashboard

## 🐛 Troubleshooting

**App loads but won't connect to Supabase:**
- Check environment variables are set correctly in Vercel
- Verify Supabase CORS settings include your domain

**Authentication not working:**
- Ensure redirect URLs in Supabase match your domain
- Check browser console for CORS errors

**Tasks not persisting:**
- Verify database migrations have been run in Supabase
- Check browser network tab for API errors