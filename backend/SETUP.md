# CampusFind Setup Guide

## Quick Setup Instructions

### 1. Prerequisites
Ensure you have:
- Node.js installed
- MongoDB running locally on port 27017
- `.env` file in the backend folder with proper configuration

### 2. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 3. Setup Database Users

Two options are available:

#### Option A: Quick Setup (Recommended for Development)
This creates admin users as defined in your `.env` file:

```bash
cd backend
node setup.js
```

**Users Created:**
- Admins: As configured in `ADMIN_ACCOUNTS` in `.env`

#### Option B: Full Seeding (Fresh Database)
This clears all existing data and seeds sample items, claims, and notifications:

```bash
cd backend
npm run seed
```

### 4. Start the Application

**Start Backend Server:**
```bash
cd backend
npm run dev
```
Server runs on: `http://localhost:5000`

**Start Frontend (in another terminal):**
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:5173`

### 5. Access the Application

Open your browser and go to: `http://localhost:5173`

Login with any of the credentials:
- Admin: `harshithhs.sit25@rvce.edu.in` / `admin123`
- User: `priya@rvce.edu.in` / `user123`

## File Structure

```
backend/
├── setup.js              ← ✨ NEW: Quick user setup (use this)
├── seeders/seed.js       ← Full database seeding
├── server.js             ← Main server entry point
├── config/
│   └── db.js             ← Database connection
├── models/               ← Database schemas
├── controllers/          ← Route handlers
├── routes/               ← API endpoints
├── middleware/           ← Custom middleware
└── services/             ← Business logic

frontend/
├── src/
│   ├── pages/            ← Page components
│   ├── components/       ← Reusable components
│   ├── services/         ← API calls
│   └── context/          ← React context
└── vite.config.js        ← Build configuration
```

## Configuring Admins

Edit your `.env` file to configure admin accounts using the `ADMIN_ACCOUNTS` variable. 

```bash
ADMIN_ACCOUNTS='[
  {"email": "admin1@rvce.edu.in", "password": "password123"},
  {"email": "admin2@rvce.edu.in", "password": "anotherpassword"}
]'
```

Then run the setup script to create or update these users:
```bash
node setup.js
```

## Available Roles

| Role | Description |
|------|-------------|
| **user** | Regular student/faculty member |
| **staff** | Staff member with verification rights |
| **admin** | Full administrative access |

## MongoDB Connection

**Database Name:** `campusfind`  
**Connection URL:** `mongodb://localhost:27017/campusfind`

Data is stored locally on your machine in MongoDB's default data directory.

## Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running: Check Services or run `mongod`
- Verify connection URI in `.env` file

### Users Already Exist
- The `setup.js` script skips existing users (checked by email)
- Use `seed.js` to clear and reseed the database

### Port Already in Use
- Backend (5000): `netstat -ano | findstr :5000`
- Frontend (5173): Change port in `vite.config.js`

---

**Last Updated:** February 4, 2026
