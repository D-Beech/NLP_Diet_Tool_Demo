# 🚀 Two-Service Deployment Guide

## Overview
Deploy your PWA to AWS Amplify (frontend) and your Flask backend to Heroku/Railway (API).

## 📋 Prerequisites
- GitHub repository with your code
- Heroku account (free tier available)
- AWS account (free tier available)

## 🔧 Step 1: Deploy Flask Backend to Heroku

### 1.1 Prepare Backend
Your Flask app is already configured with:
- ✅ `Procfile` (for Heroku)
- ✅ `runtime.txt` (Python version)
- ✅ `requirements.txt` (dependencies)
- ✅ CORS enabled

### 1.2 Deploy to Heroku
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create new app
heroku create your-diet-tracker-api

# Set environment variables
heroku config:set OPENAI_API_KEY=your_openai_key_here

# Deploy
git add .
git commit -m "Deploy Flask backend"
git push heroku main

# Get your backend URL
heroku apps:info
# Note the URL: https://your-diet-tracker-api.herokuapp.com
```

### 1.3 Test Backend
```bash
# Test API endpoints
curl https://your-diet-tracker-api.herokuapp.com/api/totals
curl https://your-diet-tracker-api.herokuapp.com/api/progress
```

## 🌐 Step 2: Deploy PWA to AWS Amplify

### 2.1 Update PWA Configuration
1. **Update API URL** in `pwa/main.production.js`:
   ```javascript
   const API_BASE_URL = 'https://your-diet-tracker-api.herokuapp.com';
   ```

2. **Rename for production**:
   ```bash
   cd pwa
   cp main.production.js main.js
   ```

### 2.2 Deploy to Amplify
1. **Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)**
2. **Click "New App" → "Host web app"**
3. **Connect GitHub** and select your repository
4. **Configure build settings**:
   - Build spec: Use `pwa/amplify.yml`
   - Base directory: `pwa`
5. **Deploy!**

### 2.3 Get PWA URL
After deployment, you'll get:
- **PWA URL**: `https://main.d1234567890.amplifyapp.com`
- **Custom Domain**: Add your own domain if desired

## 🔄 Step 3: Update PWA with Backend URL

### 3.1 Update main.js
```javascript
// Change this line in pwa/main.js
const API_BASE_URL = 'https://your-diet-tracker-api.herokuapp.com';
```

### 3.2 Redeploy
```bash
# Commit changes
git add .
git commit -m "Update PWA with production backend URL"
git push origin main

# Amplify will auto-deploy
```

## 🎯 Step 4: Test Everything

### 4.1 Test PWA
1. **Visit your Amplify URL**
2. **Try adding food**: "apple", "chicken breast"
3. **Check totals**: Should update in real-time
4. **Test all screens**: Add, Totals, Log, Progress

### 4.2 Test PWA Features
1. **Install PWA**: Look for install button
2. **Offline mode**: Works with cached data
3. **Theme toggle**: Dark/light mode
4. **Mobile responsive**: Test on phone

## 📱 Final Architecture

```
User Device
    ↓
AWS Amplify (PWA Frontend)
    ↓ HTTPS API calls
Heroku (Flask Backend)
    ↓
OpenAI API
```

## 🔧 Configuration Files

### `pwa/amplify.yml` (Amplify Build Config)
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - echo "Preparing PWA for deployment..."
    build:
      commands:
        - echo "Building PWA..."
    postBuild:
      commands:
        - echo "PWA build completed successfully"
  artifacts:
    baseDirectory: .
    files:
      - '**/*'
```

### `Procfile` (Heroku Backend)
```
web: python app.py
```

### `runtime.txt` (Python Version)
```
python-3.10.0
```

## 🎉 What You Get

### PWA Features (Amplify)
- ✅ **HTTPS** (automatic SSL)
- ✅ **CDN** (global content delivery)
- ✅ **Installable** on mobile/desktop
- ✅ **Offline support** with service worker
- ✅ **Custom domain** support

### Backend Features (Heroku)
- ✅ **HTTPS API** endpoints
- ✅ **Auto-scaling** (free tier)
- ✅ **Environment variables** for secrets
- ✅ **Git-based deployment**

## 🔍 Troubleshooting

### PWA Not Loading
1. Check Amplify build logs
2. Verify `pwa/amplify.yml` configuration
3. Ensure all files are in `pwa/` directory

### API Calls Failing
1. Check backend URL in `main.js`
2. Verify Heroku app is running
3. Check CORS configuration
4. Test API endpoints directly

### CORS Issues
1. Ensure Flask has CORS enabled
2. Check API_BASE_URL is correct
3. Verify HTTPS URLs

## 💰 Cost Breakdown

### Free Tiers
- **AWS Amplify**: 1000 build minutes/month
- **Heroku**: 550-1000 dyno hours/month
- **Total**: $0/month for small usage

### Paid Tiers (if needed)
- **Amplify**: $0.01 per build minute after free tier
- **Heroku**: $7/month for always-on dyno

## 🚀 Next Steps

1. **Custom Domain**: Add your own domain to Amplify
2. **Monitoring**: Set up error tracking
3. **Analytics**: Add usage analytics
4. **Features**: Add more PWA features

Your Diet Tracker is now live with a professional two-service architecture! 🎉
