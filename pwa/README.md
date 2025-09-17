# Diet Tracker PWA

A Progressive Web App (PWA) for tracking nutrition and diet. This is the frontend-only version that communicates with a separate Flask backend API.

## Features

- 🍎 Add food entries using natural language
- 📊 View daily nutrition totals
- 📈 Track progress over time
- 🌙 Dark/Light theme toggle
- 📱 Mobile-optimized interface
- 🔄 Offline support (with service worker)
- 📲 Installable as a PWA

## Quick Start

### 1. Start the Backend API

First, make sure the Flask backend is running:

```bash
cd /path/to/diet_tracker_trash
source venv/bin/activate
python app.py
```

The backend will run on `http://localhost:5000`

### 2. Serve the PWA

In a new terminal, navigate to the PWA directory and start the static server:

```bash
cd pwa
python serve.py
```

The PWA will be available at `http://localhost:8080`

### 3. Access the App

Open your browser and go to `http://localhost:8080`

## Configuration

### Backend URL

To change the backend API URL, edit the `API_BASE_URL` constant in `main.js`:

```javascript
const API_BASE_URL = 'http://your-backend-url:5000';
```

### Static Hosting

This PWA can be hosted on any static hosting service:

- **Netlify**: Drag and drop the `pwa` folder
- **Vercel**: Deploy the `pwa` folder
- **GitHub Pages**: Push to a repository and enable Pages
- **Firebase Hosting**: Use `firebase deploy`
- **AWS S3**: Upload files to an S3 bucket with static hosting

## File Structure

```
pwa/
├── index.html          # Main HTML file
├── style.css           # Styles
├── main.js             # JavaScript application
├── manifest.json       # PWA manifest
├── sw.js              # Service worker for offline support
├── serve.py           # Local development server
└── README.md          # This file
```

## PWA Features

### Installation

The app can be installed on:
- **Desktop**: Chrome, Edge, Safari
- **Mobile**: Android (Chrome), iOS (Safari)

Look for the install prompt or use the browser's "Add to Home Screen" option.

### Offline Support

The service worker caches the app files for offline use. When offline:
- The app interface will still work
- Cached data will be displayed
- New data will be queued until connection is restored

### Responsive Design

The app is optimized for:
- Mobile phones (primary)
- Tablets
- Desktop browsers

## Development

### Local Development

1. Start the Flask backend: `python app.py`
2. Start the PWA server: `python serve.py`
3. Open `http://localhost:8080`

### Making Changes

- **HTML**: Edit `index.html`
- **Styles**: Edit `style.css`
- **JavaScript**: Edit `main.js`
- **PWA Config**: Edit `manifest.json`

After making changes, refresh the browser. The service worker will automatically update.

## API Endpoints

The PWA communicates with these backend endpoints:

- `GET /api/totals` - Get current daily totals
- `POST /api/add_food` - Add food entries
- `POST /api/delete_food` - Delete food entry
- `POST /api/clear` - Clear all food entries
- `GET /api/progress` - Get progress data

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11.1+
- Edge 79+

## Troubleshooting

### CORS Issues

If you get CORS errors, make sure:
1. The Flask backend has CORS enabled (already configured)
2. The backend is running on the correct port
3. The API_BASE_URL in main.js matches the backend URL

### Service Worker Issues

If the PWA doesn't work offline:
1. Check browser console for service worker errors
2. Clear browser cache and reload
3. Check that `sw.js` is accessible

### Installation Issues

If the install prompt doesn't appear:
1. Make sure you're using HTTPS (or localhost)
2. Check that `manifest.json` is valid
3. Ensure all required manifest fields are present

## License

This project is part of the Diet Tracker application.
