#!/bin/bash

echo "🚀 Diet Tracker PWA Deployment Script"
echo "====================================="

# Check if we're in the PWA directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: Please run this script from the pwa directory"
    exit 1
fi

echo "📁 Current directory: $(pwd)"
echo "📋 Files to deploy:"
ls -la

echo ""
echo "🌐 Choose your deployment method:"
echo "1. Netlify (Drag & Drop) - https://netlify.com"
echo "2. Vercel (Drag & Drop) - https://vercel.com"
echo "3. GitHub Pages (Git) - https://pages.github.com"
echo "4. Surge.sh (CLI) - https://surge.sh"
echo "5. Firebase Hosting (CLI) - https://firebase.google.com"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🎯 Netlify Deployment:"
        echo "1. Go to https://netlify.com"
        echo "2. Sign up/login with GitHub or Google"
        echo "3. Drag this entire folder to the deploy area"
        echo "4. Your PWA will be live with HTTPS!"
        echo ""
        echo "📁 Drag this folder: $(pwd)"
        ;;
    2)
        echo "🎯 Vercel Deployment:"
        echo "1. Go to https://vercel.com"
        echo "2. Sign up/login with GitHub"
        echo "3. Click 'New Project' and drag this folder"
        echo "4. Your PWA will be live with HTTPS!"
        echo ""
        echo "📁 Drag this folder: $(pwd)"
        ;;
    3)
        echo "🎯 GitHub Pages Deployment:"
        echo "1. Create a new GitHub repository"
        echo "2. Upload all files from this folder"
        echo "3. Go to Settings → Pages"
        echo "4. Select source branch and save"
        echo "5. Your PWA will be live with HTTPS!"
        ;;
    4)
        echo "🎯 Surge.sh Deployment:"
        if command -v surge &> /dev/null; then
            echo "✅ Surge CLI found, deploying..."
            surge
        else
            echo "❌ Surge CLI not found. Install with: npm install -g surge"
            echo "Then run: surge"
        fi
        ;;
    5)
        echo "🎯 Firebase Hosting Deployment:"
        if command -v firebase &> /dev/null; then
            echo "✅ Firebase CLI found, deploying..."
            firebase deploy
        else
            echo "❌ Firebase CLI not found. Install with: npm install -g firebase-tools"
            echo "Then run: firebase init hosting && firebase deploy"
        fi
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment instructions complete!"
echo "💡 Remember to update the API_BASE_URL in main.js to point to your backend"
