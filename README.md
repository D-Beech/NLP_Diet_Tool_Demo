# Flask Boilerplate

A simple Flask boilerplate with basic structure and API endpoints.

## Features

- Basic Flask app with templates
- Static files (CSS/JS)
- API endpoints for testing
- Clean, responsive design

## Quick Start

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the app:**
   ```bash
   python app.py
   ```

3. **Open in browser:**
   ```
   http://localhost:5000
   ```

## Project Structure

```
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── templates/          # HTML templates
│   └── index.html
└── static/            # Static files
    ├── css/
    │   └── style.css
    └── js/
        └── main.js
```

## API Endpoints

- `GET /` - Home page
- `GET /api/hello` - Hello API endpoint
- `GET /api/data` - Data API (GET)
- `POST /api/data` - Data API (POST)

## Development

The app runs in debug mode by default. Make changes to any file and the server will automatically reload.

