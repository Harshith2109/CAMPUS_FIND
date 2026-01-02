# CampusFind: Smart Lost & Found Management System

**Course**: MIT415DL - Design Thinking Lab (Full Stack MERN Lab)  
**Semester**: 1  
**Project Type**: Academic Full Stack MERN Application

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Sample Credentials](#sample-credentials)
- [Screenshots](#screenshots)
- [Design Thinking Process](#design-thinking-process)
- [Contributors](#contributors)
- [License](#license)

## 🎯 Overview

CampusFind is a centralized web-based Lost & Found Management System designed for college campuses. The system allows students, staff, and administrators to report lost and found items, automatically match items based on metadata, manage claims securely, and track the complete lifecycle of items from reporting to return.

### Problem Statement
Campus communities face challenges with lost items due to:
- No centralized system for reporting and searching
- Manual processes that are inefficient and non-scalable
- Poor communication between finders and losers
- Low recovery rates (typically ~30%)

### Solution
CampusFind provides:
- ✅ Centralized digital platform for lost & found
- ✅ Intelligent auto-matching algorithm
- ✅ Secure claim verification workflow
- ✅ Real-time notifications (email + in-app)
- ✅ Role-based access control
- ✅ Admin dashboard for moderation

## ✨ Features

### For Users (Students/Faculty)
- 🔐 User registration and authentication
- 📝 Report lost items with photos and detailed descriptions
- 🔍 Report found items
- 🔎 Search and filter items by category, location, date
- 🎯 Automatic matching of lost and found items
- 📧 Email and in-app notifications for matches
- 📋 Submit claims with proof of ownership
- 📊 Track claim status
- 👤 User profile management

### For Staff
- All user features
- ✅ Verify and approve/reject claims
- 📈 View claim statistics

### For Administrators
- All staff features
- 👥 User management (view, edit roles, delete)
- 🛡️ Item moderation (archive, delete)
- 📊 Comprehensive dashboard with analytics
- 📜 Activity logs
- 📈 System statistics

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **React Query (TanStack Query)** - Server state management
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Bcrypt.js** - Password hashing
- **Multer** - File upload handling
- **Nodemailer** - Email notifications
- **Morgan** - HTTP request logger

### Development Tools
- **Nodemon** - Auto-restart server
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  React + Tailwind CSS + React Router + React Query          │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
┌──────────────────────▼──────────────────────────────────────┐
│                  Application Layer                           │
│  Express.js + JWT Auth + Controllers + Services             │
│  - Auto-matching Algorithm                                   │
│  - Email Notification Service                                │
│  - File Upload Service                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │ Mongoose ODM
┌──────────────────────▼──────────────────────────────────────┐
│                     Data Layer                               │
│  MongoDB (Users, Items, Claims, Notifications)              │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
  - OR MongoDB Atlas account (cloud database)
- **npm** or **yarn** package manager
- **Git** (optional, for cloning)

## 🚀 Installation

### 1. Clone or Download the Project

```bash
cd "C:\DT LAB\CampusFind"
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
# Edit .env and configure:
# - MONGODB_URI (your MongoDB connection string)
# - JWT_SECRET (any random string)
# - EMAIL_USER and EMAIL_PASSWORD (for notifications)
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
```

## ▶️ Running the Application

### Start MongoDB (if running locally)

```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongod
```

### Start Backend Server

```bash
# From backend directory
cd backend

# Run in development mode
npm run dev

# OR run in production mode
npm start
```

Backend will run on: `http://localhost:5000`

### Start Frontend Development Server

```bash
# From frontend directory
cd frontend

# Start Vite dev server
npm run dev
```

Frontend will run on: `http://localhost:5173`

### Seed Sample Data (Optional)

```bash
# From backend directory
npm run seed
```

This will populate the database with:
- 5 sample users (admin, staff, 3 regular users)
- 12 sample items (lost and found)
- Sample claims and notifications

## 📚 API Documentation

See [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) for complete API reference.

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected routes require JWT token in header:
```
Authorization: Bearer <token>
```

### Key Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Login user | Public |
| GET | `/auth/profile` | Get user profile | Private |
| GET | `/items` | Get all items | Public |
| POST | `/items` | Create item | Private |
| GET | `/items/:id` | Get item details | Public |
| GET | `/items/:id/matches` | Get matched items | Public |
| POST | `/claims` | Submit claim | Private |
| PATCH | `/claims/:id` | Update claim status | Staff/Admin |
| GET | `/notifications` | Get notifications | Private |
| GET | `/admin/stats` | Get dashboard stats | Admin |

## 🗄️ Database Schema

See [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) for detailed schema documentation.

### Collections

**Users**
- Authentication and profile information
- Role-based access (user, staff, admin)

**Items**
- Lost and found item details
- Images, location, date, category
- Matched items array
- Claim requests array

**Claims**
- Claim submissions with proof
- Verification workflow
- Status tracking

**Notifications**
- In-app notifications
- Match alerts, claim updates

## 📁 Project Structure

```
CampusFind/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth, upload, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── services/        # Business logic (matching, email, notifications)
│   ├── utils/           # Helper functions
│   ├── uploads/         # Uploaded images
│   ├── seeders/         # Database seeders
│   ├── .env             # Environment variables
│   ├── server.js        # Entry point
│   └── package.json
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── context/     # React context
│   │   ├── hooks/       # Custom hooks
│   │   ├── utils/       # Helper functions
│   │   ├── App.jsx      # Main app component
│   │   ├── main.jsx     # Entry point
│   │   └── index.css    # Global styles
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
├── docs/
│   ├── DESIGN_THINKING.md
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_SCHEMA.md
│   ├── PROJECT_REPORT.md
│   └── diagrams/
│       └── SYSTEM_DESIGN.md
└── README.md
```

## 🔑 Sample Credentials

After running the seed script, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@campusfind.com | admin123 |
| Staff | staff@campusfind.com | staff123 |
| User | priya@student.com | user123 |
| User | rahul@student.com | user123 |
| User | anita@student.com | user123 |

## 📸 Screenshots

*(Screenshots would be added after running the application)*

## 🎨 Design Thinking Process

This project follows the 5-stage Design Thinking methodology:

1. **Empathize** - User research with students, faculty, and security staff
2. **Define** - Problem statement and user needs identification
3. **Ideate** - Feature brainstorming and prioritization
4. **Prototype** - Wireframes, database design, and API planning
5. **Test** - User testing and iterative improvements

See [docs/DESIGN_THINKING.md](docs/DESIGN_THINKING.md) for detailed documentation.

## 🎯 Key Features Implemented

### Auto-Matching Algorithm
- Matches lost and found items based on:
  - Category (required)
  - Date proximity (within 14 days)
  - Location similarity
  - Color and brand matching
  - Description keyword analysis
- Scoring system (0-100) with quality labels (High/Medium/Low)

### Notification System
- In-app notifications
- Email notifications via Nodemailer
- Notifications for:
  - Item matches found
  - New claim requests
  - Claim status updates

### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation
- File upload restrictions

## 🚧 Future Enhancements

- Mobile native apps (iOS/Android)
- Real-time notifications with WebSockets
- AI-based image recognition for matching
- QR code generation for items
- Integration with campus ID system
- Multi-language support
- SMS notifications

## 👥 Contributors

- [Your Name] - Full Stack Developer

## 📄 License

This project is created for academic purposes as part of the Design Thinking Lab course.

## 📞 Support

For issues or questions:
- Create an issue in the repository
- Contact: [your-email@example.com]

---

**Made with ❤️ for Design Thinking Lab (MIT415DL)**
