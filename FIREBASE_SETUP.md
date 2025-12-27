# Firebase Setup Instructions

## Prerequisites
- A Firebase account (https://firebase.google.com/)
- Node.js installed on your system

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name your project (e.g., "prestige-car-rental")
4. Follow the setup wizard

## Step 2: Enable Firestore Database

1. In your Firebase project, go to **Build > Firestore Database**
2. Click "Create database"
3. Start in **production mode** or **test mode** (test mode for development)
4. Choose a location closest to your users (e.g., "asia-south1" for Jordan)

## Step 3: Enable Firebase Authentication

1. Go to **Build > Authentication**
2. Click "Get started"
3. Enable **Email/Password** authentication:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"

## Step 4: Create an Admin User

1. In **Authentication**, go to the "Users" tab
2. Click "Add user"
3. Enter email: `admin@prestigerental.com` (or your preferred email)
4. Enter password: `admin123` (or your preferred password)
5. Click "Add user"

## Step 5: Get Firebase Config Credentials

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the **Web** icon (`</>`)
4. Register your app with a nickname (e.g., "Prestige Rental Web")
5. Copy the `firebaseConfig` object

## Step 6: Configure Environment Variables

1. Open the `.env` file in your project root
2. Replace the placeholder values with your actual Firebase config:

```env
VITE_FIREBASE_API_KEY=your_actual_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_actual_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
VITE_FIREBASE_APP_ID=your_actual_app_id
```

## Step 7: Install Dependencies

```bash
npm install
```

## Step 8: Run the Application

```bash
npm run dev
```

## Step 9: Login

- Use the email and password you created in Step 4
- If Firebase is not configured, it will fall back to `admin` / `admin`

## Firestore Collections Structure

The app automatically creates three collections:

### `cars`
- Stores all car data
- Each document ID matches the car ID

### `rentals`
- Stores active rentals
- Auto-synced when rentals are created or extended

### `history`
- Stores completed rentals
- Auto-synced when rentals are returned

## Security Rules (Optional but Recommended)

In Firestore Database > Rules, add these security rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

This ensures only authenticated users can access the data.

## Troubleshooting

### Firebase not working?
- Check browser console for errors
- Verify `.env` file has correct values
- Ensure Firebase services are enabled in Console
- The app will automatically fall back to LocalStorage

### Login not working?
- Verify the user was created in Firebase Authentication
- Check that Email/Password provider is enabled
- If Firebase fails, hardcoded `admin`/`admin` still works as fallback

## Features

✅ Firebase Authentication (Email/Password)
✅ Firestore real-time database
✅ LocalStorage fallback (automatic)
✅ Environment variable configuration
✅ Same UI/UX (no changes)
✅ Same data structures
✅ All CRUD operations synced to Firestore
