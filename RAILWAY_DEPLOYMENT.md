# Railway Deployment Guide

This guide will help you resolve the Prisma migration error and successfully deploy your MVMIS application to Railway.

## Problem Solved

The error you encountered was:
```
Error: P3014 Prisma Migrate could not create the shadow database
ERROR: template database "template1" has a collation version mismatch
```

This has been fixed by:
1. Adding `shadowDatabaseUrl` configuration to Prisma schema
2. Updating build scripts for Railway compatibility
3. Creating proper Railway configuration

## Railway Setup Instructions

### 1. Environment Variables

In your Railway project dashboard, set these environment variables:

```bash
# Database (Railway will auto-generate this)
DATABASE_URL=postgresql://...

# Shadow Database (set to same value as DATABASE_URL)
SHADOW_DATABASE_URL=${{DATABASE_URL}}

# Next Auth (generate with: npx auth secret)
AUTH_SECRET=your-generated-secret

# Your Railway app URL
AUTH_URL=https://your-app-name.up.railway.app
```

### 2. Railway Configuration

The `railway.toml` file has been created with optimal settings:
- Uses Nixpacks builder
- Sets proper health check configuration
- Configures environment variables

### 3. Build Process

The updated build script now:
1. Generates Prisma client
2. Deploys migrations (without shadow database issues)
3. Builds Next.js application

### 4. Deployment Steps

1. **Push your changes to GitHub:**
   ```bash
   git add .
   git commit -m "Fix Railway deployment with shadow database configuration"
   git push origin main
   ```

2. **In Railway Dashboard:**
   - Go to your project settings
   - Set the environment variables listed above
   - Ensure `SHADOW_DATABASE_URL` is set to `${{DATABASE_URL}}`
   - Redeploy your application

3. **Monitor the build:**
   - Watch the build logs for any errors
   - The migration should now complete successfully

## Alternative Solutions (if needed)

If you still encounter issues, try these alternatives:

### Option 1: Use db push instead of migrations
Update your build script in `package.json`:
```json
"build": "prisma generate && prisma db push && next build"
```

### Option 2: Skip shadow database entirely
Add this to your Prisma schema:
```prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["migrate"]
}
```

## Troubleshooting

### Build Still Failing?
1. Check Railway logs for specific error messages
2. Ensure all environment variables are set correctly
3. Verify your DATABASE_URL is accessible
4. Try redeploying after clearing build cache

### Migration Issues?
1. Check if your migrations are compatible with Railway's PostgreSQL version
2. Consider using `prisma db push` for simpler deployments
3. Ensure foreign key constraints are properly defined

## Testing Your Deployment

After successful deployment:
1. Visit your Railway app URL
2. Test database connectivity
3. Verify all features work as expected
4. Check that new WorkOrder model is accessible

## Support

If you continue to experience issues:
1. Check Railway's documentation
2. Review Prisma's Railway deployment guide
3. Consider reaching out to Railway support

Your application should now deploy successfully to Railway without the shadow database error!
