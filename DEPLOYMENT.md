# Deployment Guide - Todo App Backend

This guide covers deploying your Todo App backend to various cloud platforms.

## 📋 Pre-Deployment Checklist

- [ ] MongoDB Atlas cluster is set up and running
- [ ] Environment variables are documented
- [ ] Code is committed to Git repository
- [ ] Build script works locally (`npm run build`)
- [ ] Start script works locally (`npm start`)

## 🚀 Deployment Options

### Option 1: Railway (Recommended - Easiest)

**Pros:** Free tier, automatic deployments, easy setup, built-in MongoDB support

#### Steps:

1. **Sign up**: Go to [railway.app](https://railway.app) and sign up with GitHub

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Environment Variables**:
   - Go to your project → Variables tab
   - Add these variables:
     ```
     MONGODB_URI=your_mongodb_atlas_connection_string
     JWT_SECRET=your_secure_random_string
     NODE_ENV=production
     PORT=3000 (Railway sets this automatically, but include it)
     ```

4. **Configure Build Settings**:
   - Railway auto-detects Node.js projects
   - Build Command: `npm run build`
   - Start Command: `npm start`

5. **Deploy**:
   - Railway automatically deploys on every push to main branch
   - Get your app URL from the project dashboard

**Cost:** Free tier available, then pay-as-you-go

---

### Option 2: Render

**Pros:** Free tier, easy setup, automatic SSL

#### Steps:

1. **Sign up**: Go to [render.com](https://render.com) and sign up

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

3. **Configure Service**:
   - **Name**: `todo-app-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or choose paid for better performance)

4. **Add Environment Variables**:
   - Scroll to "Environment Variables"
   - Add:
     ```
     MONGODB_URI=your_mongodb_atlas_connection_string
     JWT_SECRET=your_secure_random_string
     NODE_ENV=production
     ```

5. **Deploy**:
   - Click "Create Web Service"
   - Render will build and deploy automatically
   - Your app will be available at `https://your-app-name.onrender.com`

**Note:** Free tier services spin down after 15 minutes of inactivity (cold start ~30 seconds)

**Cost:** Free tier available, paid plans start at $7/month

---

### Option 3: Heroku

**Pros:** Popular, well-documented, add-ons ecosystem

#### Steps:

1. **Install Heroku CLI**:
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   # Or use: npm install -g heroku
   ```

2. **Login to Heroku**:
   ```bash
   heroku login
   ```

3. **Create Heroku App**:
   ```bash
   heroku create your-app-name
   ```

4. **Create Procfile** (already created in project):
   ```
   web: node dist/app.js
   ```

5. **Set Environment Variables**:
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_atlas_connection_string
   heroku config:set JWT_SECRET=your_secure_random_string
   heroku config:set NODE_ENV=production
   ```

6. **Configure Buildpack** (if needed):
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

7. **Deploy**:
   ```bash
   git push heroku main
   # or
   git push heroku master
   ```

8. **Open Your App**:
   ```bash
   heroku open
   ```

**Note:** Heroku removed free tier, paid plans start at $5/month

**Cost:** Paid plans start at $5/month

---

### Option 4: Fly.io

**Pros:** Great free tier, global edge deployment, Docker-based

#### Steps:

1. **Install Fly CLI**:
   ```bash
   # Windows: https://fly.io/docs/getting-started/installing-flyctl/
   # Or: powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

2. **Login**:
   ```bash
   fly auth login
   ```

3. **Create Fly App**:
   ```bash
   fly launch
   ```
   - Follow prompts
   - Don't deploy yet (we'll configure first)

4. **Configure Environment Variables**:
   ```bash
   fly secrets set MONGODB_URI=your_mongodb_atlas_connection_string
   fly secrets set JWT_SECRET=your_secure_random_string
   fly secrets set NODE_ENV=production
   ```

5. **Deploy**:
   ```bash
   fly deploy
   ```

**Cost:** Free tier includes 3 shared VMs, then pay-as-you-go

---

### Option 5: DigitalOcean App Platform

**Pros:** Simple, good performance, integrated with DigitalOcean

#### Steps:

1. **Sign up**: Go to [digitalocean.com](https://www.digitalocean.com)

2. **Create App**:
   - Go to App Platform
   - Click "Create App"
   - Connect GitHub repository

3. **Configure**:
   - **Type**: Web Service
   - **Build Command**: `npm run build`
   - **Run Command**: `npm start`
   - **Environment**: Node.js

4. **Add Environment Variables**:
   - Add all required variables in the app settings

5. **Deploy**:
   - Click "Create Resources"
   - App will build and deploy

**Cost:** Basic plan starts at $5/month

---

## 🔧 Required Configuration

### Environment Variables

Make sure these are set in your deployment platform:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/todo-app?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-random-string-min-32-characters
NODE_ENV=production
PORT=3000 (usually set automatically by platform)
```

### Generate Secure JWT Secret

```bash
# Generate a random string (32+ characters recommended)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Update CORS (if needed)

If your frontend is on a different domain, update `src/app.ts`:

```typescript
app.use(cors({
  origin: ['https://your-frontend-domain.com', 'http://localhost:4200'],
  credentials: true
}));
```

---

## 📝 Post-Deployment Steps

### 1. Test Your API

```bash
# Health check
curl https://your-app-url.com/health

# Test signup
curl -X POST https://your-app-url.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test"}'
```

### 2. Access Swagger Documentation

Visit: `https://your-app-url.com/api-docs`

### 3. Update Frontend

Update your frontend API base URL to point to the deployed backend.

### 4. Monitor Logs

Most platforms provide log viewing:
- **Railway**: Project → Deployments → View Logs
- **Render**: Service → Logs tab
- **Heroku**: `heroku logs --tail`
- **Fly.io**: `fly logs`

---

## 🔒 Security Checklist

- [ ] JWT_SECRET is a strong random string (32+ characters)
- [ ] MongoDB Atlas IP whitelist includes your deployment platform IPs
- [ ] CORS is configured for your frontend domain only
- [ ] Environment variables are set (not hardcoded)
- [ ] `.env` file is in `.gitignore` (already done)
- [ ] MongoDB connection string doesn't expose credentials in logs

---

## 🐛 Troubleshooting

### Build Fails

- Check Node.js version compatibility
- Ensure all dependencies are in `dependencies` (not `devDependencies`)
- Check build logs for specific errors

### Connection Timeout

- Verify MongoDB Atlas IP whitelist includes deployment platform
- Check if MongoDB Atlas cluster is running
- Verify connection string is correct

### Environment Variables Not Working

- Restart the service after adding variables
- Check variable names match exactly (case-sensitive)
- Verify variables are set in the correct environment

### App Crashes on Start

- Check logs for error messages
- Verify `dist/app.js` exists (build completed)
- Ensure PORT is set correctly
- Check MongoDB connection

---

## 📊 Platform Comparison

| Platform | Free Tier | Ease of Use | Auto Deploy | Best For |
|---------|----------|-------------|-------------|----------|
| Railway | ✅ Yes | ⭐⭐⭐⭐⭐ | ✅ Yes | Quick deployment |
| Render | ✅ Yes | ⭐⭐⭐⭐ | ✅ Yes | Simple apps |
| Heroku | ❌ No | ⭐⭐⭐⭐ | ✅ Yes | Established apps |
| Fly.io | ✅ Yes | ⭐⭐⭐ | ✅ Yes | Global distribution |
| DigitalOcean | ❌ No | ⭐⭐⭐⭐ | ✅ Yes | Production apps |

---

## 🎯 Recommended: Railway

For this project, **Railway** is recommended because:
- Free tier available
- Easiest setup
- Automatic deployments from GitHub
- Built-in environment variable management
- Good documentation
- No credit card required for free tier

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [Heroku Node.js Guide](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Fly.io Documentation](https://fly.io/docs)

---

Happy Deploying! 🚀

