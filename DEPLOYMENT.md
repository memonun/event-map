# Deployment Guide - Event Map Turkey

This guide covers deploying your Event Map application to Vercel with a custom domain.

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- Your custom domain (registered with any provider)
- Environment variables from your Supabase project

## Step 1: Prepare Your Code

Make sure your build works locally:
```bash
npm run build
```

## Step 2: Connect GitHub to Vercel

### 2.1 Sign Up/Login to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up** → **Continue with GitHub**
3. Authorize Vercel to access your GitHub account

### 2.2 Import Your Repository
1. Click **Add New...** → **Project**
2. Find `event-map` in your repositories list
3. Click **Import**

### 2.3 Configure Build Settings
Vercel auto-detects Next.js settings:
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `.` (leave as is)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

## Step 3: Configure Environment Variables

In the Vercel project settings, add these environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://wpydilkmtmgbunectxpx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token
OPENAI_API_KEY=your_openai_api_key
```

⚠️ **Important**: Replace with your actual values from:
- **Supabase**: Project Settings → API
- **Mapbox**: Account → Access Tokens
- **OpenAI**: API Keys page

## Step 4: Deploy

1. Click **Deploy**
2. Wait 2-3 minutes for the build to complete
3. Your app will be live at `your-project.vercel.app`

## Step 5: Add Custom Domain

### 5.1 In Vercel Dashboard
1. Go to your project → **Settings** → **Domains**
2. Add your domain: `yourdomain.com`
3. Also add `www.yourdomain.com` (optional)

### 5.2 Configure DNS

Choose ONE of these methods:

#### Option A: Nameservers (Recommended)
Change nameservers at your domain registrar to:
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```
- Takes 0-48 hours to propagate
- Vercel manages all DNS records

#### Option B: A/CNAME Records
Add these DNS records at your current provider:
```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```
- Works within 10-30 minutes
- You keep existing DNS provider

### 5.3 DNS Configuration by Registrar

**GoDaddy**
1. Domain Settings → DNS → Manage Zones
2. Add records or change nameservers

**Namecheap**
1. Domain List → Manage → Advanced DNS
2. Add records or change nameservers

**Cloudflare**
1. DNS → Records → Add Record
2. ⚠️ Set Proxy Status to **DNS only** (gray cloud)

**Google Domains**
1. DNS → Custom Records → Add

## Step 6: Verify Deployment

1. Check `your-project.vercel.app` works
2. Wait for DNS propagation (10 mins - 48 hours)
3. HTTPS certificate activates automatically
4. Your custom domain should now work!

## Continuous Deployment

After initial setup:
- Every push to `main` branch auto-deploys
- Pull requests get preview URLs
- Rollback from Vercel dashboard if needed

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` | ✅ Yes | Supabase anonymous key |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | ⚠️ Recommended | For map functionality |
| `OPENAI_API_KEY` | Optional | For AI chatbot features |

## Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Ensure all dependencies are in `package.json`
- Check build logs in Vercel dashboard

### Domain Not Working
- DNS propagation can take up to 48 hours
- Use [whatsmydns.net](https://whatsmydns.net) to check DNS status
- Ensure correct DNS records are added

### Map Not Loading
- Verify `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` is set
- Check Mapbox token has correct permissions

### Database Connection Issues
- Verify Supabase URL and key are correct
- Check Supabase project is active
- Ensure database allows connections from Vercel IPs

## Support

- **Vercel Issues**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Issues**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Issues**: [nextjs.org/docs](https://nextjs.org/docs)

## Quick Deploy Checklist

- [ ] Code builds locally (`npm run build`)
- [ ] Environment variables prepared
- [ ] GitHub repository is up to date
- [ ] Vercel account created
- [ ] Domain DNS access ready
- [ ] Supabase project is active