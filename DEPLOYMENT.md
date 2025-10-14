# Deployment Guide

## 🚀 Deployment Options

### 1. Deploy to Heroku

#### Prerequisites
- Heroku account
- Heroku CLI installed

#### Steps

1. **Create Heroku app**
```bash
heroku create your-app-name
```

2. **Add buildpacks**
```bash
heroku buildpacks:add --index 1 heroku/nodejs
heroku buildpacks:add --index 2 heroku/python
```

3. **Create Procfile**
```bash
echo "web: python app.py" > Procfile
```

4. **Set environment variables**
```bash
heroku config:set SECRET_KEY=your-secret-key
heroku config:set JWT_SECRET_KEY=your-jwt-secret
heroku config:set FLASK_ENV=production
```

5. **Deploy**
```bash
git push heroku main
```

### 2. Deploy to Render

1. **Create render.yaml**
```yaml
services:
  - type: web
    name: ai-interior-design
    env: python
    buildCommand: |
      pip install -r requirements.txt
      npm install
      npm run build
    startCommand: python app.py
    envVars:
      - key: SECRET_KEY
        generateValue: true
      - key: JWT_SECRET_KEY
        generateValue: true
      - key: FLASK_ENV
        value: production
```

2. Connect your GitHub repo to Render
3. Render will auto-deploy on push

### 3. Deploy to Railway

1. **Connect GitHub repo**
2. **Add environment variables** in Railway dashboard
3. **Deploy command**:
```bash
npm install && npm run build && pip install -r requirements.txt && python app.py
```

### 4. Deploy to Vercel (Frontend) + Backend Separately

#### Frontend (Vercel)
```bash
npm run build
vercel --prod
```

#### Backend (PythonAnywhere/Heroku)
Deploy Flask app separately and update API URL in frontend

### 5. Deploy to AWS EC2

1. **SSH into EC2 instance**
```bash
ssh -i your-key.pem ec2-user@your-instance-ip
```

2. **Install dependencies**
```bash
sudo yum update -y
sudo yum install python3 nodejs -y
```

3. **Clone and setup**
```bash
git clone your-repo
cd your-repo
pip3 install -r requirements.txt
npm install
npm run build
```

4. **Run with gunicorn**
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

5. **Setup Nginx** (optional)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 6. Docker Deployment

1. **Create Dockerfile**
```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install Node.js
RUN apt-get update && apt-get install -y nodejs npm

# Copy files
COPY requirements.txt package.json package-lock.json ./
COPY . .

# Install dependencies
RUN pip install -r requirements.txt
RUN npm install
RUN npm run build

EXPOSE 5000

CMD ["python", "app.py"]
```

2. **Build and run**
```bash
docker build -t ai-interior-design .
docker run -p 5000:5000 ai-interior-design
```

### 7. Deploy with PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Build frontend
npm run build

# Start with PM2
pm2 start app.py --interpreter python3
pm2 save
pm2 startup
```

## 🔐 Production Security Checklist

- [ ] Set strong SECRET_KEY and JWT_SECRET_KEY
- [ ] Use HTTPS (SSL certificate)
- [ ] Set FLASK_ENV=production
- [ ] Configure CORS properly
- [ ] Use production database (PostgreSQL/MySQL)
- [ ] Enable database backups
- [ ] Set up error monitoring (Sentry)
- [ ] Configure rate limiting
- [ ] Set up CDN for static files
- [ ] Enable gzip compression
- [ ] Set security headers

## 📊 Environment Variables

```bash
# Required
SECRET_KEY=your-production-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
FLASK_ENV=production

# Database (choose one)
DATABASE_URL=sqlite:///interior_design.db  # Development
DATABASE_URL=postgresql://user:pass@host:5432/dbname  # Production

# Optional
OPENAI_API_KEY=your-openai-key
MAX_CONTENT_LENGTH=16777216
```

## 🗄️ Database Migration

### SQLite to PostgreSQL

1. **Export data**
```bash
sqlite3 interior_design.db .dump > backup.sql
```

2. **Update DATABASE_URL**
```bash
export DATABASE_URL=postgresql://user:pass@host/db
```

3. **Create tables**
```python
from app import app, db
with app.app_context():
    db.create_all()
```

4. **Import data** (manual or using migration tools)

## 📈 Performance Optimization

1. **Enable caching**
```python
from flask_caching import Cache
cache = Cache(app, config={'CACHE_TYPE': 'simple'})
```

2. **Use CDN** for static files

3. **Enable compression**
```python
from flask_compress import Compress
Compress(app)
```

4. **Database indexing**
```python
db.Index('idx_user_email', User.email)
```

5. **Load balancing** with multiple workers

## 🔍 Monitoring

### Setup Sentry for Error Tracking
```bash
pip install sentry-sdk[flask]
```

```python
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[FlaskIntegration()]
)
```

### Setup Application Monitoring
- Use New Relic, Datadog, or similar
- Monitor response times
- Track error rates
- Monitor database performance

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    
    - name: Setup Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.9'
    
    - name: Install dependencies
      run: |
        npm install
        pip install -r requirements.txt
    
    - name: Build frontend
      run: npm run build
    
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "your-app-name"
        heroku_email: "your-email@example.com"
```

## 🆘 Troubleshooting

### Issue: Build fails
- Check Node.js and Python versions
- Verify all dependencies are installed
- Check build logs for specific errors

### Issue: Database connection errors
- Verify DATABASE_URL is correct
- Check database server is running
- Verify network/firewall settings

### Issue: CORS errors
- Update CORS settings in app.py
- Verify frontend URL is allowed

### Issue: 502 Bad Gateway
- Check app is running
- Verify port configuration
- Check server logs

---

For more help, contact support or open an issue on GitHub.

