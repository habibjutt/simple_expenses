# GitHub OAuth — Setup & Production Guide

## What Was Configured (Local Dev)

| Setting | Value |
|---|---|
| Callback URL (dev) | `http://localhost:3000/api/auth/callback/github` |
| Env vars | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` |
| Better Auth provider ID | `github` |

---

## Creating the GitHub OAuth App

1. Go to **GitHub → Settings → Developer settings → OAuth Apps**
   `https://github.com/settings/developers`

2. Click **"New OAuth App"**

3. Fill in the form:
   | Field | Value |
   |---|---|
   | Application name | `Fixpenses` |
   | Homepage URL | `https://yourdomain.com` |
   | Application description | *(optional)* |
   | Authorization callback URL | `https://yourdomain.com/api/auth/callback/github` |

4. Click **"Register application"**

5. On the next screen, click **"Generate a new client secret"**

6. Copy both values into your production environment:
   ```env
   GITHUB_CLIENT_ID=your_client_id_here
   GITHUB_CLIENT_SECRET=your_client_secret_here
   ```

---

## Going to Production

### Callback URL
Update the **Authorization callback URL** in your GitHub OAuth App settings to your production domain:
```
https://yourdomain.com/api/auth/callback/github
```

You can also add multiple callback URLs — GitHub allows one URL per OAuth App. If you need both dev and prod, create **two separate OAuth Apps** (one for dev, one for prod).

### No Approval Process Required
GitHub OAuth Apps do **not** require any review or approval from GitHub. Once you create the app and add the credentials to your environment, it works immediately for all GitHub users.

### Rate Limits to Be Aware Of
- Unauthenticated requests: **60/hour**
- Authenticated user requests: **5,000/hour**
- For a personal expense tracker, these limits are never a concern.

### Optional: Verify Your App Domain
If you want the green "Verified" badge on the GitHub OAuth consent screen:
1. Go to your OAuth App settings
2. Under **"Homepage URL"**, make sure it matches your domain
3. GitHub will show your domain name to users on the authorization screen — no formal verification step is needed

---

## How the Flow Works

```
User clicks "Sign in with GitHub"
  → Better Auth redirects to GitHub OAuth
  → GitHub shows authorization screen (user sees your app name + requested scopes)
  → User clicks "Authorize Fixpenses"
  → GitHub redirects to /api/auth/callback/github with an auth code
  → Better Auth exchanges the code for an access token
  → Better Auth creates or links the account in your database
  → User is redirected to /dashboard
```

### Scopes Requested
Better Auth requests `read:user` and `user:email` — the minimum needed to get the user's name and email address.

---

## Environment Variables Summary

```env
# Required for GitHub OAuth
GITHUB_CLIENT_ID=Ov23...
GITHUB_CLIENT_SECRET=abc123...
```

Add these to your hosting provider's environment settings (Vercel, Railway, etc.) for production.
