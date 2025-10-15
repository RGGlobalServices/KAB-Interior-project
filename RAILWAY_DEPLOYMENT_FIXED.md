# 🚂 Railway Deployment Guide - FIXED Gunicorn Issue

This guide fixes the "gunicorn: command not found" error and provides working Railway deployment commands.

---

## 🔧 Fixed Configuration Files

### **1. Updated `railway.json`**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build && pip install -r requirements.txt"
  },
  "deploy": {
    "startCommand": "gunicorn app:app --bind 0.0.0.0:$PORT --workers 4",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### **2. Updated `Procfile`**
```
web: gunicorn app:app --bind 0.0.0.0:$PORT --workers 4
```

---

## 🚀 Railway Deployment Commands

### **Build Command:**
```bash
npm install && npm run build && pip install -r requirements.txt
```

### **Start Command:**
```bash
gunicorn app:app --bind 0.0.0.0:$PORT --workers 4
```

---

## 📋 Step-by-Step Railway Deployment

### **Step 1: Connect to Railway**
1. Go to **https://railway.app**
2. Click **"Start a New Project"**
3. Choose **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub
5. Select your repository: **`ai-interior-design-flask`**

### **Step 2: Add PostgreSQL Database**
1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will automatically:
   - Create a PostgreSQL database
   - Set the `DATABASE_URL` environment variable
   - Connect it to your application

### **Step 3: Configure Environment Variables**
Click on your app service, go to **"Variables"** tab, and add:

```bash
# Required Variables
SECRET_KEY=your-super-secret-key-at-least-32-chars-long
JWT_SECRET_KEY=your-jwt-secret-key-at-least-32-chars-long
FLASK_ENV=production

# Optional - For AI Q&A Features
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_OPENAI_API_KEY
```

**🔐 Generate secure keys:**
```python
# Run this in Python to generate secure keys:
import secrets
print(secrets.token_hex(32))  # Run twice for both keys
```

### **Step 4: Configure Build Settings**
In your Railway service settings:

1. Go to **"Settings"** → **"Build"**
2. Set **Build Command**: `npm install && npm run build && pip install -r requirements.txt`
3. Set **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 4`

### **Step 5: Deploy!**
1. Railway will automatically detect your updated `railway.json` and `Procfile`
2. The build process will:
   - Install Node.js dependencies
   - Build the React frontend
   - Install Python dependencies (including gunicorn)
   - Start the Flask application with gunicorn
3. Wait 3-5 minutes for deployment to complete
4. Click **"View Logs"** to monitor progress

### **Step 6: Get Your Public URL**
1. Go to **"Settings"** tab
2. Click **"Generate Domain"** under **"Public Networking"**
3. Copy your URL: `https://your-app-name.up.railway.app`
4. Open it in your browser! 🎉

---

## ✅ Verify Deployment

### **Test the Health Endpoint**
```bash
curl https://your-app-name.up.railway.app/api/health
```

Should return:
```json
{
  "status": "ok",
  "environment": "production"
}
```

### **Test Login**
1. Go to your Railway URL
2. Try logging in with:
   - Email: `demo@example.com`
   - Password: `demo123`

---

## 🐛 Troubleshooting the Gunicorn Error

### **If you still get "gunicorn: command not found":**

1. **Check Build Logs:**
   - Go to Railway Dashboard → Your Service → Deployments
   - Click on the latest deployment
   - Check if `pip install -r requirements.txt` completed successfully

2. **Verify requirements.txt:**
   ```bash
   # Make sure gunicorn is in requirements.txt
   grep gunicorn requirements.txt
   ```

3. **Alternative Start Command:**
   If gunicorn still doesn't work, try this start command:
   ```bash
   python -m gunicorn app:app --bind 0.0.0.0:$PORT --workers 4
   ```

4. **Fallback to Flask Development Server:**
   As a last resort, you can use Flask's development server:
   ```bash
   python app.py
   ```
   (Not recommended for production, but will work for testing)

### **Common Build Issues:**

1. **Node.js not found:**
   - Railway should auto-detect Node.js from package.json
   - If not, add `NODE_VERSION=18` environment variable

2. **Python dependencies fail:**
   - Check if all packages in requirements.txt are compatible
   - Some packages might need system dependencies

3. **Build timeout:**
   - Railway has build time limits
   - Optimize your build process
   - Consider using .railwayignore for unnecessary files

---

## 🔧 Alternative Railway Configuration

If the above doesn't work, try this alternative approach:

### **Option 1: Use Railway's Auto-Detection**
Remove `railway.json` and let Railway auto-detect:
1. Delete `railway.json`
2. Keep `Procfile` with: `web: gunicorn app:app --bind 0.0.0.0:$PORT --workers 4`
3. Railway will auto-detect Python and Node.js

### **Option 2: Manual Build Configuration**
In Railway dashboard:
1. Go to **Settings** → **Build**
2. Set **Build Command**: `npm install && npm run build && pip install -r requirements.txt`
3. Set **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 4`

### **Option 3: Use Python Only (No Frontend Build)**
If you want to serve static files differently:
1. Set **Build Command**: `pip install -r requirements.txt`
2. Set **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 4`
3. Make sure your `dist` folder is committed to git

---

## 📊 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | Auto-set | 5000 | Railway assigns this automatically |
| `DATABASE_URL` | Auto-set | sqlite | Railway PostgreSQL connection string |
| `SECRET_KEY` | **Yes** | None | Flask session encryption key |
| `JWT_SECRET_KEY` | **Yes** | None | JWT token signing key |
| `FLASK_ENV` | Recommended | development | Set to `production` |
| `OPENAI_API_KEY` | Optional | None | For AI Q&A features |
| `NODE_VERSION` | Optional | Auto | Node.js version (try 18 if issues) |
| `PYTHON_VERSION` | Optional | Auto | Python version (try 3.11 if issues) |

---

## 🎯 Quick Fix Commands

If you're still having issues, try these commands in Railway:

### **Build Command:**
```bash
npm install && npm run build && pip install --upgrade pip && pip install -r requirements.txt
```

### **Start Command:**
```bash
python -m gunicorn app:app --bind 0.0.0.0:$PORT --workers 4
```

### **Alternative Start Command:**
```bash
gunicorn --bind 0.0.0.0:$PORT --workers 4 app:app
```

---

## ✅ Success Indicators

You'll know the deployment is working when you see these logs:

```
✓ Installing Node.js dependencies...
✓ Building React frontend...
✓ Installing Python dependencies...
✓ Starting gunicorn with 4 workers...
✓ Demo user created: demo@example.com / demo123
✓ Gunicorn listening at: http://0.0.0.0:PORT
```

---

## 🆘 Still Having Issues?

1. **Check Railway Logs:**
   - Go to your service → Deployments → Latest deployment
   - Look for error messages in the build or runtime logs

2. **Try Different Approaches:**
   - Use the alternative configurations above
   - Try different start commands
   - Check if all dependencies are compatible

3. **Contact Support:**
   - Railway Discord: https://discord.gg/railway
   - Railway Docs: https://docs.railway.app

---

## 🎉 You're Live!

Once deployed successfully, your app will be available at:
```
https://your-app-name.up.railway.app
```

**Happy Deploying! 🚂**
