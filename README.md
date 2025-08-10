# Whangarei Tunes 🎵

> A full-stack music learning platform for the traditional folk music community

[![Live Site](https://img.shields.io/badge/Live%20Site-whangareitunes.com-blue)](https://whangareitunes.com)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/)

![React Tunes Homepage](client/src/assets/images/homepage-screenshot.png)

## Overview

Whangarei Tunes is a modern web application designed to support the traditional music community. It serves as a digital hub for learning folk tunes from various traditions including Celtic, Nordic, Eastern European and North American music, facilitating both individual learning and group sessions.

**🔗 Live Site:** [whangareitunes.com](https://whangareitunes.com)

## 🛠️ Tech Stack

### Frontend

- **React 18.3.1** - Modern UI library with hooks
- **React Router Dom** - Client-side routing
- **Vite** - Fast build tool and development server
- **CSS3** - Custom styling with responsive design
- **Radix UI** - Accessible component primitives

### Backend

- **Node.js** - Server runtime
- **Express.js** - Web application framework
- **MongoDB** - Document database with Mongoose ODM
- **JWT** - Secure authentication
- **bcryptjs** - Password hashing

### External Services

- **SendGrid** - Email services for password reset
- **Spotify API** - Music streaming integration
- **YouTube API** - Video content embedding

### DevOps & Deployment

- **Netlify** - Frontend hosting with CI/CD
- **Render** - Backend API hosting
- **MongoDB Atlas** - Cloud database
- **GitHub Actions** - Automated testing and deployment

## Key Features

### 🎼 Music Library Management

- **Tune Repository**: Comprehensive collection of traditional tunes with sheet music
- **Multiple Versions**: Support for different arrangements and skill levels
- **Chord Charts**: Guitar chord diagrams and progressions
<!-- - **Print Functionality**: High-quality sheet music printing -->

### 🔐 User Authentication & Authorization

- **Secure Registration/Login**: JWT-based authentication system
- **Extended Sessions**: Optional 30-day login persistence
- **Password Reset**: Email-based password recovery with SendGrid
- **Role-based Access**: User and admin role management

### 🎵 Interactive Features

- **Spotify Integration**: Embedded playlists and track players
- **YouTube Integration**: Video tutorials and performances
- **Tune of the Week**: Featured content for session classes
- **External Links**: Integration with NZ Irish Sessions and The Session

### 📱 Responsive Design

- **Mobile-First**: Optimized for all device sizes
- **Performance**: Image loading optimization and lazy loading
- **Accessibility**: ARIA labels and semantic HTML

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- SendGrid account (for email services)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/react-tunes.git
   cd react-tunes
   ```

2. **Install dependencies**

   ```bash
   # Install root dependencies
   npm install

   # Install client dependencies
   cd client && npm install

   # Install server dependencies
   cd ../server && npm install
   ```

3. **Environment Setup**

   Create `.env.development` in the server directory:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/react-tunes
   JWT_SECRET=your-super-secret-jwt-key
   SENDGRID_API_KEY=your-sendgrid-api-key
   FROM_EMAIL=noreply@yourdomain.com
   FRONTEND_URL=http://localhost:5173
   ```

   Create `.env` in the client directory:

   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. **Start the development servers**

   ```bash
   # From root directory - starts both client and server
   npm start
   ```

   Or run separately:

   ```bash
   # Server (from server directory)
   npm run dev

   # Client (from client directory)
   npm run dev
   ```

## 🧪 Testing

The project includes comprehensive test suites for both frontend and backend:

### Frontend Testing

```bash
cd client
npm test           # Run tests once
npm run test:watch # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Backend Testing

```bash
cd server
npm test # Run server tests with MongoDB memory server
```

**Test Coverage Includes:**

- Component rendering and interaction
- Authentication flows
- API endpoint testing
- Password reset functionality
- Image loading and error handling

## 📁 Project Structure

```
react-tunes/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   ├── assets/        # Static assets
│   │   └── __tests__/     # Test files
│   ├── public/            # Public assets
│   └── package.json
├── server/                # Express backend
│   ├── routes/           # API routes
│   ├── models/           # Mongoose models
│   ├── utils/            # Server utilities
│   ├── config/           # Database configuration
│   ├── data/             # JSON data files
│   └── package.json
├── .github/workflows/    # GitHub Actions CI/CD
└── netlify.toml         # Netlify deployment config
```

## 🔄 API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset completion

### Music Content

- `GET /api/tuneList` - Retrieve all tunes
- `GET /api/tune/:id` - Get specific tune details
- `GET /api/chords/:id` - Get chord information for tune

### Static Assets

- `/images/*` - Sheet music and chord diagrams

## 🌐 Deployment

### Frontend (Netlify)

The frontend is automatically deployed to Netlify on push to main branch:

- **Build Command**: `cd client && npm install && npm run build`
- **Publish Directory**: `client/dist`
- **Environment Variables**: Set `VITE_API_URL` in Netlify dashboard

### Backend (Render)

The backend is deployed on Render with automatic deployments:

- **Build Command**: `cd server && npm install`
- **Start Command**: `cd server && npm start`
- **Environment Variables**: Configure all production environment variables

## 📄 License & Code Usage

This project is licensed under the ISC License and serves as a personal portfolio project and to serve the folk music community.

**You're welcome to:**

- ✅ Use this code as inspiration for your own projects
- ✅ Fork and adapt it for your own music communities
- ✅ Study the implementation for learning purposes
- ✅ Modify and distribute under the ISC License terms

**Please note:**

- This project serves a specific community with curated content
- Contributions and pull requests are not actively sought
- For implementation questions, feel free to use the repository issues

## 📈 Performance Optimizations

- **Image Optimization**: Lazy loading and preloading strategies
- **Code Splitting**: Dynamic imports for route-based splitting
- **Caching**: Browser caching for static assets
- **Database**: Indexed queries and connection pooling
- **CDN**: Static asset delivery optimization

## 🔐 Security Features

- **Authentication**: Secure JWT implementation
- **Password Security**: bcrypt hashing with salt rounds
- **CORS Configuration**: Restricted origin policy
- **Input Validation**: Server-side request validation
- **SQL Injection Prevention**: MongoDB parameterized queries

## 👥 Community

This application serves the local Whangarei folk music community, supporting:

- **Monday Session Classes** - Weekly learning sessions
- **Sunday Tunes** - Fortnightly public gatherings in Whangarei
- **Individual Practice** - Personal repertoire building

## 📞 Contact

For questions about the application or the Whangarei folk and tradtional music community, please visit our [Facebook Group](https://www.facebook.com/groups/whangareifolkrootstraditionalmusic).

---

**Built with ❤️ for the traditional music community**
