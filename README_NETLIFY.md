# 🍎 Diet Tracker - Netlify Deployment

## Quick Deploy to Netlify

### 1. Connect to Netlify
1. Go to [Netlify](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Configure build settings:
   - **Build command**: `echo 'No build needed'`
   - **Publish directory**: `pwa`
   - **Functions directory**: `netlify/functions`

### 2. Deploy
- Click "Deploy site"
- Wait for deployment (1-2 minutes)
- Get your URL: `https://your-site-name.netlify.app`

## What's Included

- ✅ **PWA Frontend** (installable app)
- ✅ **Serverless API** (Netlify Functions)
- ✅ **No Python required** (pure Node.js)
- ✅ **Free hosting** (generous limits)

## File Structure

```
├── netlify.toml              # Netlify configuration
├── package.json              # Node.js configuration
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

## API Endpoints

- `GET /api/totals` - Get current totals
- `POST /api/add_food` - Add food item
- `POST /api/delete_food` - Delete food item
- `POST /api/clear` - Clear food log
- `GET /api/progress` - Get progress data

## Features

- 🍎 **Food logging** with nutrition tracking
- 📊 **Real-time totals** and progress
- 📱 **PWA support** (installable)
- 🌙 **Dark/light theme**
- 📈 **Progress charts** and analytics
- 🗑️ **Swipe to delete** food items

## Troubleshooting

### Build Fails
- Check that `publish` directory is set to `pwa`
- Verify `netlify/functions/api.js` exists
- Ensure `package.json` is in root directory

### API Not Working
- Check function logs in Netlify dashboard
- Verify redirects in `netlify.toml`
- Test API endpoints directly

### PWA Not Loading
- Check that all files are in `pwa/` directory
- Verify `manifest.json` and `sw.js` exist
- Check browser console for errors

## Development

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

## Support

If you encounter issues:
1. Check Netlify build logs
2. Verify file structure matches above
3. Test API endpoints individually
4. Check browser console for errors

Your Diet Tracker is ready for Netlify! 🚀
