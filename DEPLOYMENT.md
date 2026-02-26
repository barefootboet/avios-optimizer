# Deployment Guide

This guide covers deploying the Avios Optimizer application to various hosting platforms.

## Prerequisites

- Git repository set up
- Node.js 18+ installed
- Production build tested locally

## Option 1: Vercel (Recommended)

Vercel is the easiest deployment option for Next.js applications.

### Steps

1. **Install Vercel CLI** (optional):
```bash
npm i -g vercel
```

2. **Deploy via CLI**:
```bash
vercel
```

Or **Deploy via GitHub**:
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js and configure everything
6. Click "Deploy"

### Configuration

No additional configuration needed! Vercel automatically:
- Detects Next.js
- Sets up build commands
- Configures environment
- Enables automatic deployments on git push

### Custom Domain

1. Go to Project Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed

## Option 2: Netlify

### Steps

1. **Build the application**:
```bash
npm run build
```

2. **Create `netlify.toml`** in project root:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

3. **Deploy**:
   - Connect your Git repository to Netlify
   - Or use Netlify CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod
```

## Option 3: Docker

### Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Update `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
};

export default nextConfig;
```

### Build and Run:

```bash
docker build -t avios-optimizer .
docker run -p 3000:3000 avios-optimizer
```

## Option 4: AWS (Amplify)

### Steps

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" > "Host web app"
3. Connect your Git repository
4. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `.next`
5. Deploy

### Build Settings (amplify.yml):

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

## Option 5: Self-Hosted (VPS/Dedicated Server)

### Prerequisites
- Ubuntu/Debian server
- Node.js 18+ installed
- Nginx installed

### Steps

1. **Clone repository on server**:
```bash
git clone <your-repo-url>
cd avios-optimizer
```

2. **Install dependencies**:
```bash
npm ci --production
```

3. **Build application**:
```bash
npm run build
```

4. **Install PM2** (process manager):
```bash
npm install -g pm2
```

5. **Start application**:
```bash
pm2 start npm --name "avios-optimizer" -- start
pm2 save
pm2 startup
```

6. **Configure Nginx** (`/etc/nginx/sites-available/avios-optimizer`):
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

7. **Enable site**:
```bash
sudo ln -s /etc/nginx/sites-available/avios-optimizer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

8. **Setup SSL with Let's Encrypt**:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Environment Variables

This application doesn't require environment variables for basic functionality. However, if you add features like analytics or authentication, create a `.env.local` file:

```env
# Example environment variables
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

## Build Optimization

### Enable Compression

In `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  compress: true,
  // ... other config
};
```

### Analyze Bundle Size

```bash
npm install @next/bundle-analyzer
```

Update `next.config.ts`:
```typescript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
```

Run analysis:
```bash
ANALYZE=true npm run build
```

## Performance Checklist

Before deploying:
- [ ] Test production build locally: `npm run build && npm start`
- [ ] Verify all calculations work correctly
- [ ] Test on mobile devices
- [ ] Check lighthouse scores (aim for 90+)
- [ ] Verify localStorage works
- [ ] Test dark mode
- [ ] Check all responsive breakpoints

## Monitoring

### Vercel Analytics
If deployed on Vercel, enable Analytics in project settings.

### Google Analytics
Add to `app/layout.tsx`:
```typescript
import Script from 'next/script';

// In the component:
<Script
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
  strategy="afterInteractive"
/>
```

## Troubleshooting

### Build Fails
- Check Node.js version (must be 18+)
- Clear cache: `rm -rf .next node_modules && npm install`
- Check for TypeScript errors: `npx tsc --noEmit`

### Runtime Errors
- Check browser console for errors
- Verify all dependencies are installed
- Check for localStorage quota exceeded errors

### Performance Issues
- Enable Next.js caching
- Optimize images (if you add any)
- Use CDN for static assets
- Enable compression

## Security Considerations

1. **Content Security Policy**: Add CSP headers in `next.config.ts`
2. **HTTPS**: Always use HTTPS in production
3. **Rate Limiting**: Consider adding rate limiting for API routes (if added)
4. **Input Validation**: Already implemented with number inputs

## Backup & Recovery

### Backup User Data
Since data is stored in localStorage:
- Users should export their calculation history (feature to be added)
- No server-side backup needed

### Code Backup
- Keep Git repository up to date
- Tag releases: `git tag v1.0.0`
- Maintain changelog

## Cost Estimates

### Vercel (Hobby Plan)
- **Free** for personal projects
- Unlimited bandwidth
- Automatic HTTPS
- Global CDN

### Netlify (Free Plan)
- **Free** for personal projects
- 100GB bandwidth/month
- Automatic HTTPS

### AWS Amplify
- ~$1-5/month for small traffic
- Pay per build minute and bandwidth

### VPS (DigitalOcean/Linode)
- $5-10/month for basic droplet
- Full control over server

## Post-Deployment

1. **Test thoroughly** on production URL
2. **Monitor errors** with error tracking (Sentry, etc.)
3. **Collect user feedback**
4. **Plan updates** and feature additions
5. **Keep dependencies updated**: `npm outdated`

## Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test # if you add tests
      # Add deployment step based on your platform
```

---

**Recommended**: Start with Vercel for the easiest deployment experience. It's free, fast, and requires zero configuration for Next.js apps.
