# Vercel Deployment Guide for Express + MongoDB Backend

## ✅ Fixed Issues

Your backend is now configured to work with Vercel's serverless architecture. Here's what was changed:

### 1. **vercel.json Configuration**
- **Changed:** Entry point from `dist/app.js` → `api/index.ts`
- **Why:** Vercel expects serverless functions in the `api/` directory

### 2. **api/index.ts - Serverless Entry Point**
- **Added:** Lazy database connection initialization
- **Added:** Middleware to ensure DB connects before handling requests
- **Why:** Serverless functions are stateless and can't maintain persistent connections

### 3. **src/app.ts - Conditional Server Start**
- **Added:** Check for `VERCEL` environment variable
- **Why:** Prevents calling `app.listen()` in serverless environment (which would fail)

---

## 🚀 Deployment Steps

### Step 1: Push Your Code to GitHub
```bash
git add .
git commit -m "Configure for Vercel deployment"
git push origin master
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New" → "Project"
3. Import your GitHub repository: `AyaaOthman/todo-app-backend`
4. Vercel will auto-detect the settings
5. **IMPORTANT:** Add these environment variables:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Your JWT secret key
   - `NODE_ENV` - Set to `production`

### Step 3: Environment Variables Setup

In Vercel Dashboard → Your Project → Settings → Environment Variables:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/Learning-Todo?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production
```

⚠️ **Important:** Make sure to replace:
- `username:password` with your actual MongoDB credentials
- Your cluster URL with your actual MongoDB Atlas cluster
- JWT_SECRET with a strong random string

### Step 4: Deploy

Click "Deploy" and wait for the build to complete.

---

## 📝 Your API Endpoints (After Deployment)

Your Vercel URL will be something like: `https://your-project.vercel.app`

### Test Endpoints:
- **Root:** `GET https://your-project.vercel.app/`
- **Health:** `GET https://your-project.vercel.app/health`
- **API Docs:** `GET https://your-project.vercel.app/api-docs`
- **Signup:** `POST https://your-project.vercel.app/api/auth/signup`
- **Login:** `POST https://your-project.vercel.app/api/auth/login`

---

## 🐛 Common Issues & Solutions

### Issue 1: "NOT_FOUND" Error
**Cause:** Wrong entry point or missing api folder
**Solution:** ✅ Already fixed - vercel.json points to `api/index.ts`

### Issue 2: "Function Timeout"
**Cause:** Database connection takes too long
**Solution:** 
- Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for Vercel)
- Verify MONGODB_URI is correct
- Ensure your cluster is in a nearby region

### Issue 3: "Module not found" errors
**Cause:** Dependencies not installed
**Solution:** Make sure all dependencies are in `dependencies` (not `devDependencies`)

### Issue 4: Database Connection Fails
**Cause:** Missing or incorrect MONGODB_URI
**Solution:** 
- Verify the environment variable is set in Vercel
- Check MongoDB Atlas network access settings
- Ensure username/password don't contain special characters (URL encode if needed)

---

## 🧠 Understanding Vercel Serverless

### Traditional Server vs. Serverless

#### Traditional (Railway, Render, Heroku):
```javascript
// Starts once, runs forever
app.listen(3000)
```
- Server runs 24/7
- Maintains persistent connections (like DB)
- Single instance handling all requests

#### Serverless (Vercel, AWS Lambda):
```javascript
// Exports handler, Vercel invokes it
export default app
```
- Functions spin up on-demand
- Each request may get a new instance
- No persistent state between requests
- Must reconnect to DB on each cold start

---

## 💡 Why Your Original Setup Failed

### The Problem:
1. **`vercel.json` pointed to `dist/app.js`**
   - Vercel couldn't find it (builds don't work that way)
   - Expected an `api/` folder structure

2. **`app.listen()` was called immediately**
   - Serverless functions don't "listen" on ports
   - They receive requests directly from Vercel's infrastructure
   - Calling `app.listen()` throws an error in serverless

3. **Database connection in app.ts**
   - Connected once at startup
   - Serverless instances are ephemeral
   - Need to check/reconnect on each invocation

### The Solution:
1. **Entry point in `api/index.ts`**
   - Vercel recognizes this folder structure
   - Each file in `api/` becomes a serverless function

2. **Conditional server start**
   - Checks if `VERCEL` env var exists
   - Only calls `app.listen()` for local/traditional deployments
   - Exports app directly for Vercel

3. **Lazy database initialization**
   - Connects on first request
   - Reuses connection if instance is warm
   - Handles cold starts gracefully

---

## 📚 Key Concepts

### 1. Cold Starts vs. Warm Starts
- **Cold Start:** New instance, needs to load code + connect DB (slower)
- **Warm Start:** Instance reused, connection may still be alive (faster)
- **Your code handles both:** Checks if DB is connected before each request

### 2. Statelessness
- Each request may hit a different instance
- Can't store data in memory between requests
- Must use external storage (MongoDB) for persistence

### 3. Entry Points
- **Traditional:** Single entry point (`src/app.ts`)
- **Vercel:** Multiple possible entry points (`api/*.ts`)
- **Your setup:** Single serverless function handling all routes

---

## ⚠️ Warning Signs for Future

Watch out for these patterns that indicate serverless issues:

### ❌ Red Flags:
```javascript
// Global state that persists
let userCache = {};

// Server-specific code
app.listen(3000);

// Long-running processes
setInterval(() => {...}, 1000);

// File system writes (read-only in serverless)
fs.writeFile('./data.json', ...);
```

### ✅ Best Practices:
```javascript
// Use database for state
await User.findOne({...});

// Export app without listen
export default app;

// Use scheduled tasks (Vercel Cron)
// Defined in vercel.json

// Use temporary storage
const tmpFile = path.join('/tmp', 'file.txt');
```

---

## 🔄 Alternative Approaches

### Option 1: Serverless (Current - Recommended for Vercel)
**Pros:**
- ✅ Auto-scaling
- ✅ Pay per use
- ✅ Zero maintenance
- ✅ Built-in CDN

**Cons:**
- ❌ Cold starts (slight latency)
- ❌ Execution time limits (10s on free plan)
- ❌ Not ideal for WebSockets/long-polling

**Best For:** REST APIs, CRUD operations, stateless backends

### Option 2: Traditional Server (Railway/Render)
**Pros:**
- ✅ Always warm (no cold starts)
- ✅ Persistent connections
- ✅ WebSocket support
- ✅ Long-running processes

**Cons:**
- ❌ Fixed capacity
- ❌ Pay even when idle
- ❌ Manual scaling

**Best For:** Real-time apps, background jobs, high-traffic APIs

### Option 3: Hybrid Approach
**Setup:**
- Vercel for API endpoints
- Railway for background jobs/WebSockets
- Shared MongoDB database

**Best For:** Complex apps with varied requirements

---

## 🎯 Next Steps

1. **Deploy to Vercel**
   - Follow steps above
   - Test all endpoints

2. **Monitor Performance**
   - Check Vercel dashboard for errors
   - Monitor cold start times
   - Watch MongoDB connection metrics

3. **Optimize if Needed**
   - Add database connection pooling
   - Implement caching (Redis)
   - Use Vercel Edge Functions for static responses

4. **Update Your Angular Frontend**
   - Change API base URL to your Vercel URL
   - Update CORS settings if needed
   - Test authentication flow

---

## 🆘 Still Having Issues?

### Check These:
1. Vercel build logs (in deployment details)
2. Function logs (Vercel dashboard → Logs)
3. MongoDB Atlas logs (check for auth failures)
4. Network access settings in MongoDB Atlas

### Common Error Messages:
- `"NOT_FOUND"` → Entry point issue (should be fixed now)
- `"FUNCTION_INVOCATION_TIMEOUT"` → DB connection timeout
- `"MODULE_NOT_FOUND"` → Missing dependency in package.json
- `"BUILD_FAILED"` → TypeScript compilation error

---

## 📖 Additional Resources

- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [MongoDB Atlas IP Whitelist](https://docs.atlas.mongodb.com/security/ip-access-list/)
- [Express in Serverless](https://vercel.com/guides/using-express-with-vercel)

---

**Last Updated:** December 18, 2025
**Status:** ✅ Ready for Deployment

