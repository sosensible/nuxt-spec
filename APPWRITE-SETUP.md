# Appwrite Setup Guide

This guide walks you through setting up Appwrite for the authentication system.

## Prerequisites

- An Appwrite account (Cloud or Self-hosted)
- Access to Appwrite Console
- A GitHub account (for OAuth setup)

## 1. Create Appwrite Project

1. Go to [Appwrite Console](https://cloud.appwrite.io/console)
2. Click **"Create Project"**
3. Enter project name (e.g., "nuxt-spec")
4. Copy the **Project ID** - you'll need this for `.env`

## 2. Get API Credentials

### API Key

1. In your project, go to **Settings → API Keys**
2. Click **"Add API Key"**
3. Name it: `nuxt-server-key`
4. Set expiration (or select "Never")
5. **Select Scopes:**
   - ✅ `users.read`
   - ✅ `users.write`
   - ✅ `sessions.write`
6. Click **"Create"**
7. Copy the API key - you'll need this for `.env`

### API Endpoint

- For Appwrite Cloud (EU): `https://fra.cloud.appwrite.io/v1`
- For Appwrite Cloud (US): `https://us.cloud.appwrite.io/v1`
- For self-hosted: Your custom domain + `/v1`

## 3. Configure Authentication Settings

### Enable Email/Password Authentication

1. Go to **Auth → Settings**
2. Under **Auth Methods**, find **Email/Password**
3. Toggle it **ON**
4. Configure options:
   - ✅ **Email Verification**: Enable (recommended)
   - **Session Length**: `1209600` seconds (14 days)
   - ✅ **Password Dictionary**: Enable (prevents common passwords)
   - ✅ **Password History**: Enable (optional, prevents reuse)

### Password Requirements

Appwrite enforces these by default:

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

## 4. Configure Email Service (SMTP)

### Option A: Appwrite Cloud Email (Recommended for Testing)

Appwrite Cloud includes a built-in email service for development. No additional setup needed!

### Option B: Custom SMTP Provider

1. Go to **Settings → SMTP**
2. Toggle **"Custom SMTP"** ON
3. Enter your SMTP settings:
   - **Host**: `smtp.gmail.com` (for Gmail)
   - **Port**: `587` (TLS) or `465` (SSL)
   - **Username**: Your email
   - **Password**: App password (not your regular password)
   - **Sender Email**: `noreply@yourdomain.com`
   - **Sender Name**: Your app name
4. Click **"Update"**

### Test Email Delivery

1. Go to **Auth → Users**
2. Create a test user
3. Check if verification email arrives

## 5. Setup GitHub OAuth

### Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in details:
   - **Application name**: `nuxt-spec` (or your app name)
   - **Homepage URL**:
     - Dev: `http://localhost:3000`
     - Prod: `https://yourdomain.com`
   - **Authorization callback URL**:
     - Dev: `http://localhost:3000/api/auth/callback/github`
     - Prod: `https://yourdomain.com/api/auth/callback/github`
4. Click **"Register application"**
5. On the next page:
   - Copy the **Client ID**
   - Click **"Generate a new client secret"**
   - Copy the **Client Secret** (you can't see it again!)

### Configure GitHub OAuth in Appwrite

1. In Appwrite Console, go to **Auth → Settings**
2. Scroll to **OAuth2 Providers**
3. Find **GitHub** and click to expand
4. Toggle **"GitHub"** ON
5. Enter your GitHub OAuth credentials:
   - **App ID**: Your GitHub Client ID
   - **App Secret**: Your GitHub Client Secret
6. Click **"Update"**

## 6. Configure Rate Limiting (Optional but Recommended)

1. Go to **Settings → Security**
2. Under **Rate Limits**, configure:
   - **Users Endpoint**: 10 requests per hour per IP
   - **Sessions Endpoint**: 10 requests per hour per IP
3. Click **"Update"**

## 7. Setup Environment Variables

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Fill in your Appwrite credentials:

   ```bash
   APPWRITE_PROJECT_ID=your-project-id-here
   APPWRITE_API_KEY=your-api-key-here
   APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   NUXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Important**: Never commit `.env` to git! It's already in `.gitignore`.

## 8. Test the Setup

### Test Email/Password Registration

1. Start the dev server:

   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/register`
3. Create a test account
4. Check your email for verification link

### Test GitHub OAuth

1. Navigate to `http://localhost:3000/login`
2. Click **"Continue with GitHub"**
3. Authorize the app on GitHub
4. You should be redirected back and logged in

### Verify in Appwrite Console

1. Go to **Auth → Users**
2. You should see your test users listed
3. Check **Sessions** tab to see active sessions

## Troubleshooting

### Email not received?

- Check Appwrite Console → **Settings → SMTP** status
- Verify SMTP credentials are correct
- Check spam folder
- Try using a different email provider

### GitHub OAuth not working?

- Verify callback URL exactly matches in:
  - GitHub OAuth App settings
  - Your `.env` file's `NUXT_PUBLIC_APP_URL`
- Check that GitHub Client ID and Secret are correct
- Ensure Appwrite GitHub OAuth provider is enabled

### API Key errors?

- Verify scopes include `users.read`, `users.write`, `sessions.write`
- Check that API key hasn't expired
- Regenerate API key if needed

### "Invalid credentials" errors?

- Check that `APPWRITE_PROJECT_ID` matches your project
- Verify `APPWRITE_ENDPOINT` is correct
- Restart dev server after changing `.env`

## Security Checklist

Before going to production:

- [ ] Use strong, unique API keys
- [ ] Enable email verification
- [ ] Configure rate limiting
- [ ] Use environment-specific callback URLs
- [ ] Enable password dictionary
- [ ] Set up proper SMTP (not development email service)
- [ ] Review user permissions
- [ ] Enable 2FA for Appwrite Console access
- [ ] Set up backup strategy for user data

## Additional Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite Auth Guide](https://appwrite.io/docs/products/auth)
- [GitHub OAuth Apps](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Nuxt Server API](https://nuxt.com/docs/guide/directory-structure/server)
