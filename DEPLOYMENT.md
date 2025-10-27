# Deployment Guide

## Quick Start Deployment

### Deploy to Vercel (Recommended)

Vercel is the optimal platform for Next.js applications.

1. **Connect GitHub Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository
   - Vercel auto-detects Next.js configuration

2. **Configure Environment Variables**
   - In Vercel dashboard, go to Settings > Environment Variables
   - Add any required variables (currently none required for basic setup)

3. **Deploy**
   - Click "Deploy"
   - Vercel builds and deploys automatically
   - Your app is live at `your-project.vercel.app`

### Deploy to Other Platforms

#### Netlify

\`\`\`bash
npm run build
netlify deploy --prod --dir=.next
\`\`\`

#### Docker

\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY .next ./
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

Build and run:
\`\`\`bash
docker build -t legal-voice .
docker run -p 3000:3000 legal-voice
\`\`\`

#### Self-Hosted (Linux/Ubuntu)

1. **Install Node.js**
\`\`\`bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
\`\`\`

2. **Clone and Setup**
\`\`\`bash
git clone <repository-url>
cd legal-voice
npm install
npm run build
\`\`\`

3. **Run with PM2**
\`\`\`bash
npm install -g pm2
pm2 start npm --name "legal-voice" -- start
pm2 startup
pm2 save
\`\`\`

4. **Setup Nginx Reverse Proxy**
\`\`\`nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

## Production Checklist

- [ ] Enable HTTPS/SSL certificate
- [ ] Set up environment variables
- [ ] Configure CORS headers
- [ ] Implement backend API
- [ ] Set up database
- [ ] Configure email service
- [ ] Set up SMS service
- [ ] Enable security headers
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Test all features
- [ ] Performance optimization
- [ ] SEO configuration
- [ ] Analytics setup

## Environment Variables

Create `.env.production` for production:

\`\`\`env
NEXT_PUBLIC_APP_NAME=LegalVoice
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_ENVIRONMENT=production
\`\`\`

## Performance Optimization

### Build Optimization

\`\`\`bash
npm run build
# Analyze bundle size
npm run analyze
\`\`\`

### Image Optimization

- Use Next.js Image component
- Optimize SVGs
- Lazy load images

### Code Splitting

- Dynamic imports for heavy components
- Route-based code splitting (automatic with Next.js)

## Monitoring

### Error Tracking

Integrate Sentry for error monitoring:

\`\`\`typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
});
\`\`\`

### Analytics

Add Google Analytics or similar:

\`\`\`typescript
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export function useAnalytics() {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url) => {
      // Track page view
      gtag.pageview({
        page_path: url,
      });
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router.events]);
}
\`\`\`

## Scaling

### Database

- Use managed database services (Supabase, Neon, PlanetScale)
- Implement connection pooling
- Regular backups

### Caching

- Implement Redis for session management
- Cache API responses
- Use CDN for static assets

### Load Balancing

- Use Vercel's automatic load balancing
- Or configure load balancer for self-hosted

## Security

### HTTPS

- Always use HTTPS in production
- Obtain SSL certificate (Let's Encrypt free option)

### Security Headers

\`\`\`typescript
// next.config.mjs
export default {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ]
  }
}
\`\`\`

### Rate Limiting

Implement rate limiting for API endpoints:

\`\`\`typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
\`\`\`

## Rollback Procedure

### Vercel

1. Go to Deployments
2. Find the previous successful deployment
3. Click the three dots menu
4. Select "Promote to Production"

### Manual Rollback

\`\`\`bash
git revert <commit-hash>
git push origin main
# Redeploy
\`\`\`

## Troubleshooting

### Build Fails

1. Check Node.js version compatibility
2. Clear cache: `npm cache clean --force`
3. Reinstall dependencies: `rm -rf node_modules && npm install`
4. Check for TypeScript errors: `npm run type-check`

### Performance Issues

1. Analyze bundle: `npm run analyze`
2. Check database queries
3. Enable caching
4. Optimize images

### Speech Recognition Not Working

1. Verify HTTPS is enabled
2. Check browser compatibility
3. Verify microphone permissions
4. Check browser console for errors

## Support

For deployment issues:
- Check Vercel documentation: https://vercel.com/docs
- Review Next.js deployment guide: https://nextjs.org/docs/deployment
- Contact support team
