# User Profile Update Form & Dashboard

A full-stack web application for managing user profiles, built with React, Node.js/Express, and MongoDB.

## Pages & Functionalities

### 1. Dashboard
- View all users as cards (profile photo, username)
- Modify user profile (opens the multi-step form prefilled)
- Delete user (soft delete, removes from dashboard and frees up username)
- Responsive grid layout for user cards

### 2. Multi-step User Profile Form
- Step 1: Personal Info
  - Profile photo upload (JPG/PNG, max 2MB) with live preview
  - Username (unique, 4-20 chars, no spaces, availability check)
  - Password update (current/new password, strength meter, validation, if password update then previous password required)
  - Date of Birth (no future dates)
  - Gender (with "Other" textbox if selected)
- Step 2: Professional Details
  - Profession (Student, Developer, Entrepreneur)
  - Company Name (required if Entrepreneur)
  - Address Line 1
- Step 3: Preferences
  - Country/State/City (dependent dropdowns, fetched from DB)
  - Subscription plan (Basic, Pro, Enterprise)
  - Newsletter (checkbox, default checked)
- Step-by-step navigation with validation at each step
- Summary review before final submit
- All data saved to MongoDB

## Features

- **Multi-step User Profile Form**
  - Profile photo upload with live preview (JPG/PNG, max 2MB)
  - Username availability check (unique, 4-20 chars, no spaces)
  - Password update with strength meter and validation
  - Dynamic fields (e.g., "Other" gender, "Entrepreneur" profession)
  - Date of Birth (no future dates)
  - Country/State/City dropdowns (dependent, fetched from DB)
  - Subscription plan (radio) and newsletter (checkbox)
  - Step-by-step navigation with validation at each step
  - Summary review before final submit
  - All data saved to MongoDB

- **Dashboard**
  - Displays all users as cards (profile photo, username)
  - Modify and Delete (soft delete) actions
  - Deleted users are not shown and their usernames become available

## Tech Stack

- **Frontend:** React, Tailwind CSS, Axios, react-hot-toast
- **Backend:** Node.js, Express, MongoDB, Mongoose, Multer (for file uploads)

## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Atlas or local MongoDB instance

### Backend
1. Navigate to the `backend` folder:
   ```powershell
   cd backend
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Configure your `.env` file (see `.env.example` for reference):
   - Set `MONGO_URI` to your MongoDB connection string
   - Set `PORT` (default: 3008)
4. (Optional) Seed country/state/city data:
   - Uncomment and run the seeding function in `app.js` once, then comment it again.
5. Start the backend server:
   ```powershell
   npm start
   ```

### Frontend
1. Navigate to the `frontend` folder:
   ```powershell
   cd frontend
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Configure `.env`:
   - Set `VITE_API_BASE_URL` to your backend URL (e.g., `http://localhost:3008`)
4. Start the frontend dev server:
   ```powershell
   npm run dev
   ```
5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Folder Structure

- `backend/` - Express server, API, models, controllers
- `frontend/` - React app, components, styles

## Customization
- Add more countries/states/cities in `backend/app/helper/addDataCountry.js`
- Adjust validation or form steps in `frontend/src/components/UserProfileForm.jsx`

## License

MIT License

---

**Developed by Aman**
