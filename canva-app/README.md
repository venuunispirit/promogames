# PromoGames Canva App

This app allows users to send designs directly from Canva to PromoGames.

## Setup Instructions

### Step 1: Install Dependencies

```bash
cd canva-app
npm install
```

### Step 2: Start Development Server

```bash
npm run dev
```

The app will run at `http://localhost:8080`

### Step 3: Configure in Canva Developer Console

1. Go to https://www.canva.com/developers/
2. Open your app
3. Go to **Settings**
4. Set **Development URL** to: `http://localhost:8080`
5. Go to **Intents** → **Content Publisher** → Click **Set up**

### Step 4: Test the App

1. Open any Canva design
2. Click the "More" button (three dots) in the toolbar
3. Find "PromoGames" app
4. Select design type (background, logo, etc.)
5. Click "Publish"
6. Check your PromoGames dashboard

## How It Works

1. User designs in Canva
2. Clicks "Publish" in the PromoGames app
3. Image is sent directly to PromoGames backend
4. Shows in the game builder's Visuals tab

## File Structure

```
canva-app/
├── src/
│   ├── index.ts                 # Entry point
│   ├── intents/
│   │   └── content_publisher.ts # Main Canva integration
│   ├── preview_ui.tsx           # Preview UI in Canva
│   └── setting_ui.tsx           # Settings UI in Canva
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Environment Variables

The app uses these environment variables (set in your PromoGames backend .env):

```
CANVA_CLIENT_ID=your_client_id
CANVA_CLIENT_SECRET=your_client_secret
CANVA_REDIRECT_URI=http://localhost:8000/api/canva/callback
```

## Production Deployment

When ready for production:

1. Build the app: `npm run build`
2. Host the `dist` folder on your server
3. Update the Canva Developer Console with your production URL
4. Submit the app for review
