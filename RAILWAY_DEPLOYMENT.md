# 🚂 Railway Deployment Guide - AI Interior Design Platform

Complete step-by-step guide to deploy your Flask application on Railway.

---

## 📋 Prerequisites

Before you begin, make sure you have:
- ✅ GitHub account with your code pushed
- ✅ Railway account (sign up at https://railway.app)
- ✅ OpenAI API key (optional, for AI Q&A features)

---

## 🚀 Quick Deployment (5 Minutes)

### **Step 1: Connect to Railway**

1. Go to **https://railway.app**
2. Click **"Start a New Project"**
3. Choose **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub
5. Select your repository: **`AI-Interior-Design`**

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

### **Step 4: Deploy!**

1. Railway will automatically detect your `Procfile` and `railway.json`
2. It will install dependencies from `requirements.txt`
3. The build process starts automatically
4. Wait 2-3 minutes for deployment to complete
5. Click **"View Logs"** to monitor progress

### **Step 5: Get Your Public URL**

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

## 🔧 Configuration Details

### **Files Created for Railway**

1. **`Procfile`** - Tells Railway how to run your app
   ```
   web: gunicorn app:app
   ```

2. **`railway.json`** - Railway-specific configuration
   - Specifies Python runtime
   - Configures gunicorn with 4 workers
   - Sets restart policy

3. **`runtime.txt`** - Specifies Python version
   ```
   python-3.11.6
   ```

4. **`requirements.txt`** - Updated with production dependencies
   - Added `gunicorn` for production server
   - Added `psycopg2-binary` for PostgreSQL

### **App Configuration Changes**

Your `app.py` now handles:
- ✅ Railway's `PORT` environment variable
- ✅ PostgreSQL URL conversion (`postgres://` → `postgresql://`)
- ✅ Production vs development mode detection
- ✅ Secure defaults for secret keys

---

## 🗄️ Database Management

### **Access Database**
Railway provides a PostgreSQL database with automatic:
- Backups
- SSL connections
- High availability

### **View Database**
1. Click on the **PostgreSQL** service in Railway
2. Go to **"Data"** tab to browse tables
3. Or use **"Connect"** tab to get connection strings

### **Run Migrations**
If you need to run database commands:
```bash
# Railway CLI (optional)
railway run python
>>> from app import app, db
>>> with app.app_context():
...     db.create_all()
```

---

## 📂 File Uploads

### **Important: Railway Uses Ephemeral Storage**

Railway's file system is **ephemeral**, meaning uploaded files will be lost on restart.

### **Solutions:**

#### **Option 1: Use Railway Volumes (Recommended)**
1. Go to your service settings
2. Add a volume mount: `/app/static/uploads`
3. This persists files across deployments

#### **Option 2: Use Cloud Storage (Best for Production)**
Integrate with:
- **AWS S3**
- **Cloudinary**
- **Google Cloud Storage**
- **Azure Blob Storage**

Example with Cloudinary:
```python
# Update routes/projects.py to use Cloudinary
import cloudinary
import cloudinary.uploader

# Upload file
result = cloudinary.uploader.upload(file)
file_url = result['secure_url']
```

---

## 🔐 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | Auto-set | 5000 | Railway assigns this automatically |
| `DATABASE_URL` | Auto-set | sqlite | Railway PostgreSQL connection string |
| `SECRET_KEY` | **Yes** | None | Flask session encryption key |
| `JWT_SECRET_KEY` | **Yes** | None | JWT token signing key |
| `FLASK_ENV` | Recommended | development | Set to `production` |
| `OPENAI_API_KEY` | Optional | None | For AI Q&A features |
| `MAX_CONTENT_LENGTH` | Optional | 52428800 | Max upload size (50MB) |

---

## 📊 Monitoring & Logs

### **View Real-Time Logs**
1. Click on your app service
2. Go to **"Observability"** → **"Logs"**
3. Watch deployment and runtime logs

### **Common Log Messages**
```
✓ Demo user created: demo@example.com / demo123
✓ Running on http://0.0.0.0:PORT
✓ Gunicorn listening at: http://0.0.0.0:PORT
```

### **Metrics Available**
- CPU usage
- Memory usage
- Request counts
- Response times

---

## ⚙️ Scaling & Performance

### **Vertical Scaling**
Railway automatically handles scaling based on your plan:
- **Hobby Plan**: Shared resources
- **Pro Plan**: Dedicated resources
- **Team Plan**: More resources + team features

### **Horizontal Scaling**
To add more instances:
1. Go to **"Settings"** → **"Scaling"**
2. Increase number of replicas
3. Railway load balances automatically

### **Optimize Performance**
```python
# In railway.json, adjust workers:
"startCommand": "gunicorn app:app --bind 0.0.0.0:$PORT --workers 8"
```

**Workers formula:** `(2 × CPU cores) + 1`

---

## 🐛 Troubleshooting

### **Application Won't Start**

**Check Logs:**
```
Railway Dashboard → Your Service → Observability → Logs
```

**Common Issues:**

1. **Missing Environment Variables**
   ```
   Error: SECRET_KEY not set
   ```
   **Fix:** Add `SECRET_KEY` in Variables tab

2. **Database Connection Failed**
   ```
   Error: could not connect to server
   ```
   **Fix:** Ensure PostgreSQL service is running and linked

3. **Module Not Found**
   ```
   ModuleNotFoundError: No module named 'gunicorn'
   ```
   **Fix:** Check `requirements.txt` includes all dependencies

### **500 Internal Server Error**

1. Check application logs for Python errors
2. Verify all environment variables are set
3. Check database connection
4. Ensure PostgreSQL service is healthy

### **Database Not Persisting Data**

1. Confirm PostgreSQL service is added
2. Check `DATABASE_URL` is set correctly
3. Verify tables are created (check logs for `db.create_all()`)

### **File Uploads Not Working**

1. Add a Railway Volume for persistent storage
2. Or implement cloud storage (S3, Cloudinary)
3. Check `UPLOAD_FOLDER` environment variable

### **Slow Performance**

1. Check Railway plan limits
2. Increase number of gunicorn workers
3. Add caching (Redis)
4. Optimize database queries

---

## 💰 Pricing

### **Railway Plans**

| Plan | Price | Resources | Best For |
|------|-------|-----------|----------|
| **Trial** | Free | $5 credit | Testing |
| **Hobby** | $5/month | Shared | Personal projects |
| **Pro** | $20/month | Dedicated | Production apps |

**What you need:**
- Flask App service: ~$5-10/month
- PostgreSQL: ~$5/month
- **Total: ~$10-15/month** for a production app

---

## 🔄 CI/CD & Auto Deployment

Railway automatically deploys when you push to GitHub:

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```

2. **Railway automatically:**
   - Detects the push
   - Rebuilds the application
   - Runs tests (if configured)
   - Deploys the new version
   - Zero-downtime deployment

### **Configure Auto-Deploy**
1. Go to **"Settings"** → **"Deployment"**
2. Enable **"Auto Deploy"**
3. Choose branch: **`main`**

---

## 🌐 Custom Domain

### **Add Your Own Domain**

1. Go to **"Settings"** → **"Public Networking"**
2. Click **"Custom Domain"**
3. Enter your domain: `app.yourdomain.com`
4. Add CNAME record to your DNS:
   ```
   CNAME: app.yourdomain.com → your-app.up.railway.app
   ```
5. Railway automatically provisions SSL certificate

---

## 🔒 Security Best Practices

### **Environment Variables**
- ✅ Never commit `.env` files
- ✅ Use Railway's Variables tab
- ✅ Generate strong secret keys (32+ characters)
- ✅ Rotate keys periodically

### **Database**
- ✅ Railway PostgreSQL uses SSL by default
- ✅ Automatic backups enabled
- ✅ No public exposure (internal network only)

### **API Keys**
- ✅ Store OpenAI API key in environment variables
- ✅ Monitor usage at https://platform.openai.com
- ✅ Set spending limits in OpenAI dashboard

### **CORS Configuration**
Update `extensions.py` for production:
```python
cors = CORS(resources={
    r"/api/*": {
        "origins": ["https://your-domain.com"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```

---

## 📈 Next Steps

After successful deployment:

### **1. Test All Features**
- ✅ User registration and login
- ✅ Project creation
- ✅ File uploads
- ✅ PDF annotations
- ✅ AI Q&A (if OpenAI API key set)
- ✅ Team discussions

### **2. Configure Monitoring**
- Set up error tracking (Sentry)
- Enable uptime monitoring
- Configure alerts

### **3. Optimize for Production**
- Add Redis for caching
- Implement CDN for static files
- Add rate limiting
- Set up backup strategy

### **4. Documentation**
- Update README with your Railway URL
- Document API endpoints
- Create user guide

---

## 🆘 Support Resources

### **Railway Documentation**
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Status: https://status.railway.app

### **Your Application**
- Repository: https://github.com/RGGlobalServices/AI-Interior-Design
- Issues: https://github.com/RGGlobalServices/AI-Interior-Design/issues

### **Common Commands**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to project
railway link

# View logs
railway logs

# Run command in Railway environment
railway run python manage.py

# Open dashboard
railway open
```

---

## ✅ Deployment Checklist

Before going live, verify:

- [ ] PostgreSQL database added and connected
- [ ] All environment variables set
- [ ] SECRET_KEY and JWT_SECRET_KEY are strong and unique
- [ ] FLASK_ENV set to "production"
- [ ] OpenAI API key added (if using AI features)
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Health check endpoint working
- [ ] Demo user can login
- [ ] File uploads working (with volume or cloud storage)
- [ ] Logs show no errors
- [ ] All features tested in production
- [ ] Backup strategy in place

---

## 🎉 You're Live!

Your AI Interior Design Platform is now running on Railway!

**Share your app:**
```
https://your-app-name.up.railway.app
```

**Monitor your app:**
```
Railway Dashboard → Your Project → Observability
```

**Scale your app:**
```
Railway Dashboard → Settings → Scaling
```

---

**Need help?** Check the logs, consult Railway docs, or open an issue on GitHub!

**Happy Deploying! 🚀**

