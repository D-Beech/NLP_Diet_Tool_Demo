# 🚀 AWS Amplify Deployment Guide

## Overview
Your Flask app now serves the PWA from the root (`/`) and provides API endpoints. The PWA calls the Flask backend using relative URLs.

## 📁 Updated Structure
```
diet_tracker_trash/
├── app.py                 # Flask app (serves PWA + API)
├── requirements.txt       # Python dependencies
├── amplify.yml           # AWS Amplify build config
├── Procfile              # Heroku deployment
├── runtime.txt           # Python version
├── pwa/                  # PWA files
│   ├── index.html        # PWA main file
│   ├── main.js           # PWA JavaScript (calls Flask API)
│   ├── style.css         # PWA styles
│   ├── manifest.json     # PWA manifest
│   └── sw.js            # Service worker
└── templates/            # Original Flask templates (unused)
```

## 🔧 How It Works

1. **Root URL (`/`)**: Serves the PWA `index.html`
2. **Static Files**: Serves PWA assets (CSS, JS, manifest, etc.)
3. **API Endpoints**: All `/api/*` routes work as before
4. **PWA**: Calls Flask API using relative URLs

## 🌐 AWS Amplify Deployment

### Step 1: Prepare Repository
1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add PWA integration with Flask backend"
   git push origin main
   ```

### Step 2: Deploy to AWS Amplify
1. **Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)**
2. **Click "New App" → "Host web app"**
3. **Connect GitHub** and select your repository
4. **Configure build settings**:
   - Build spec: Use `amplify.yml` (already created)
   - Environment: Python 3.10
5. **Deploy!**

### Step 3: Environment Variables
In Amplify Console → App Settings → Environment Variables:
- `OPENAI_API_KEY`: Your OpenAI API key
- Any other environment variables

## 🎯 What You Get

- **Single URL**: `https://your-app.amplifyapp.com`
- **PWA**: Accessible at root URL
- **API**: All endpoints work at `/api/*`
- **HTTPS**: Automatic SSL certificate
- **CDN**: Global content delivery
- **Custom Domain**: Add your own domain

## 🔄 Alternative Deployments

### Heroku
```bash
# Install Heroku CLI
# Login and create app
heroku create your-diet-tracker
heroku config:set OPENAI_API_KEY=your_key
git push heroku main
```

### Railway
1. Connect GitHub repository
2. Railway auto-detects Python app
3. Set environment variables
4. Deploy automatically

### Render
1. Connect GitHub repository
2. Select "Web Service"
3. Set environment variables
4. Deploy

## 🧪 Testing Your Deployment

### Local Testing
```bash
# Start Flask app
python app.py

# Test PWA
curl http://localhost:5000

# Test API
curl http://localhost:5000/api/totals
```

### Production Testing
1. **PWA**: Visit your deployed URL
2. **API**: Test `https://your-app.amplifyapp.com/api/totals`
3. **Installation**: Try installing the PWA on mobile/desktop

## 📱 PWA Features

Once deployed, your app will have:
- ✅ **Installable** on mobile and desktop
- ✅ **Offline support** with service worker
- ✅ **Responsive design**
- ✅ **App-like experience**
- ✅ **HTTPS** (required for PWA)

## 🔧 Configuration Files

### `amplify.yml`
```yaml
version: 1
backend:
  phases:
    build:
      commands:
        - pip install -r requirements.txt
frontend:
  phases:
    preBuild:
      commands:
        - echo "Preparing PWA files..."
    build:
      commands:
        - echo "Building Flask app with PWA integration..."
  artifacts:
    baseDirectory: .
    files:
      - '**/*'
```

### `Procfile` (for Heroku)
```
web: python app.py
```

### `runtime.txt` (Python version)
```
python-3.10.0
```

## 🎉 You're Ready!

Your Flask app now serves both:
1. **PWA Frontend** at the root URL
2. **API Backend** at `/api/*` endpoints

Deploy to AWS Amplify, Heroku, Railway, or Render for a complete production setup!
