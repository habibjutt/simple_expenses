# Google OAuth — Setup & Production Guide

## What Was Configured (Local Dev)

| Setting | Value |
|---|---|
| Callback URL (dev) | `http://localhost:3000/api/auth/callback/google` |
| Env vars | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| Better Auth provider ID | `google` |
| Scopes | `email`, `profile`, `openid` |

---

## Creating the Google OAuth App

### Step 1 — Create a Google Cloud Project

1. Go to [https://console.cloud.google.com](https://console.cloud.google.com)
2. Click the project selector at the top → **"New Project"**
3. Name it `Simple Expenses` → Click **"Create"**

### Step 2 — Enable the Google Identity API

1. In your project, go to **APIs & Services → Library**
2. Search for **"Google Identity"** or **"Google+ API"**
3. Click **"Enable"**

### Step 3 — Configure the OAuth Consent Screen

This is the screen users see when signing in. Fill it in carefully — Google reviews this for production.

1. Go to **APIs & Services → OAuth consent screen**
2. Choose **"External"** (for any Google account user) → **"Create"**
3. Fill in **App information**:
   | Field | Value |
   |---|---|
   | App name | `Simple Expenses` |
   | User support email | `hello@simpleexpenses.ae` |
   | App logo | Upload your logo (optional but recommended) |
   | App domain → Homepage | `https://yourdomain.com` |
   | App domain → Privacy policy | `https://yourdomain.com/privacy` |
   | App domain → Terms of service | `https://yourdomain.com/terms` |
   | Authorized domains | `yourdomain.com` |
   | Developer contact email | your email address |

4. Click **"Save and Continue"**

### Step 4 — Add Scopes

1. On the **Scopes** page, click **"Add or Remove Scopes"**
2. Check these three scopes:
   - `openid`
   - `auth/userinfo.email`
   - `auth/userinfo.profile`
3. Click **"Update"** → **"Save and Continue"**

> **Important:** These are **non-sensitive** scopes. You do **not** need Google verification to use them.

### Step 5 — Add Test Users (while in Testing mode)

While your app is in **Testing** status, only users you add here can sign in.

1. On the **Test users** page, click **"Add Users"**
2. Add the Google email addresses that need access during development/testing
3. Click **"Save and Continue"**

### Step 6 — Create OAuth Credentials

1. Go to **APIs & Services → Credentials**
2. Click **"Create Credentials" → "OAuth client ID"**
3. Choose **"Web application"**
4. Fill in:
   | Field | Value |
   |---|---|
   | Name | `Simple Expenses Web` |
   | Authorized JavaScript origins | `http://localhost:3000` (dev) / `https://yourdomain.com` (prod) |
   | Authorized redirect URIs | `http://localhost:3000/api/auth/callback/google` (dev) |

5. Click **"Create"**
6. Copy the **Client ID** and **Client Secret**

```env
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx
```

---

## Going to Production

### Step 1 — Add Production Redirect URI

In your OAuth client (Credentials page):
1. Edit your OAuth client ID
2. Under **"Authorized redirect URIs"**, add:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```
3. Click **"Save"**

### Step 2 — Publish the App

While in **Testing** mode, only test users can sign in. To allow any Google user:

1. Go to **APIs & Services → OAuth consent screen**
2. Under **"Publishing status"**, click **"Publish App"**
3. A dialog will confirm — click **"Confirm"**

> **For our scopes (email + profile + openid):** Publishing is **immediate** — no Google review required.  
> Google review is only required if you request sensitive or restricted scopes (calendar, Drive, Gmail, etc.).

### What Users See After Publishing

Users signing in will see a standard Google consent screen showing:
- Your app name and logo
- "This app wants to access your Google Account"
- The scopes: name, email address, profile picture

If your app is published but not verified by Google, users may see a warning screen:
> "Google hasn't verified this app"

They can still sign in by clicking **"Continue"**.

---

## Google Verification (Optional)

Google verification removes the "unverified app" warning and is only required if:
- You request **sensitive scopes** (e.g., Calendar, Drive, Gmail)
- You have more than **100 users** and need to remove the warning

For Simple Expenses (email + profile only), verification is **not required**. But if you want the clean consent screen:

1. Go to **OAuth consent screen → "Prepare for verification"**
2. Fill in:
   - Justify why you need each scope
   - Links to privacy policy and terms of service
   - Demo video showing the OAuth flow
   - Screenshot of the consent screen
3. Submit — Google reviews within **3–5 business days**
4. After approval, the "unverified app" warning is removed

---

## How the Flow Works

```
User clicks "Sign in with Google"
  → Better Auth redirects to Google OAuth
  → Google shows consent screen (user sees app name + scopes)
  → User clicks "Continue"
  → Google redirects to /api/auth/callback/google with an auth code
  → Better Auth exchanges the code for tokens (access token + ID token)
  → Better Auth creates or links the account in your database
  → User is redirected to /dashboard
```

---

## Database Fields Written by Google OAuth

Google OAuth writes more fields than GitHub. The `account` table needs:

| Field | Type | Notes |
|---|---|---|
| `accessToken` | `String?` | Short-lived token |
| `idToken` | `String?` | JWT with user info |
| `accessTokenExpiresAt` | `DateTime?` | ~1 hour expiry |
| `refreshTokenExpiresAt` | `DateTime?` | Long-lived |
| `scope` | `String?` | Comma-separated scopes |

All of these are already in `prisma/schema.prisma` as of this implementation.

---

## Environment Variables Summary

```env
# Required for Google OAuth
GOOGLE_CLIENT_ID=57654869100-xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx
```

Add these to your hosting provider's environment settings (Vercel, Railway, etc.) for production.

---

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `unable_to_link_account` | DB field missing (e.g. `accessTokenExpiresAt`) | Add field to schema + `prisma db push` |
| `redirect_uri_mismatch` | Production URL not added to Google Console | Add prod callback URI in Credentials |
| `access_denied` | User is not a test user (Testing mode) | Add them to test users or publish the app |
| `invalid_client` | Wrong Client ID or Secret | Double-check env vars |
