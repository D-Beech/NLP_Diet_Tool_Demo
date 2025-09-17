# 🍎 Diet Tracker - Netlify PWA

A Progressive Web App for tracking your daily nutrition with AI-powered food recognition.

## 🚀 Quick Deploy to Netlify

1. **Connect to Netlify:**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Configure Build Settings:**
   - **Build command**: `echo 'PWA build complete - Node.js only'`
   - **Publish directory**: `pwa`
   - **Functions directory**: `netlify/functions`

3. **Deploy:**
   - Click "Deploy site"
   - Get your URL: `https://your-site-name.netlify.app`

## 📁 Project Structure

```
├── netlify.toml              # Netlify configuration
├── package.json              # Node.js configuration
├── .nvmrc                    # Node.js version
├── .netlifyignore            # Files to ignore
├── netlify/
│   └── functions/
│       └── api.js           # Serverless function (API)
└── pwa/
    ├── index.html           # PWA frontend
    ├── main.js              # PWA JavaScript
    ├── style.css            # PWA styles
    ├── manifest.json        # PWA manifest
    └── sw.js               # Service worker
```

## ✨ Features

- 🍎 **Food logging** with nutrition tracking
- 📊 **Real-time totals** and progress
- 📱 **PWA support** (installable on mobile/desktop)
- 🌙 **Dark/light theme** toggle
- 📈 **Progress charts** and analytics
- 🗑️ **Swipe to delete** food items
- 🔄 **Offline support** with service worker

## 🛠️ API Endpoints

- `GET /api/totals` - Get current nutrition totals
- `POST /api/add_food` - Add food item
- `POST /api/delete_food` - Delete food item
- `POST /api/clear` - Clear food log
- `GET /api/progress` - Get progress data

## 🎯 How It Works

1. **Frontend**: PWA built with vanilla JavaScript
2. **Backend**: Netlify Functions (serverless)
3. **Storage**: In-memory (resets on function restart)
4. **Deployment**: Single Netlify deployment

## 🔧 Development

### Local Testing
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Start local development
netlify dev
```

### Manual Deploy
```bash
# Deploy to Netlify
netlify deploy --prod
```

## 📱 PWA Installation

### Desktop
1. Visit your Netlify URL
2. Look for install button in address bar
3. Click to install

### Mobile
1. Visit your Netlify URL
2. Add to home screen (browser menu)
3. App appears on home screen

## 🎉 Success!

Your Diet Tracker is now a fully functional PWA deployed on Netlify with:
- ✅ **One deployment** for everything
- ✅ **Serverless backend** (no server management)
- ✅ **PWA frontend** (installable)
- ✅ **Free hosting** (generous limits)
- ✅ **Global CDN** (fast worldwide)

Start tracking your nutrition today! 🍎📊