# Primetrade - Scalable Web App with Authentication & Dashboard

A modern, full-stack web application built with Next.js, Node.js, Express, and MongoDB. Features comprehensive authentication, user management, and task management with a beautiful, responsive dashboard.

## 🚀 Features

### Frontend (Next.js + TypeScript)
- **Responsive Design**: Built with TailwindCSS for mobile-first responsive design
- **Authentication Pages**: Login/Register with form validation and password strength checking
- **Protected Routes**: Route protection with authentication context
- **Dashboard**: Interactive dashboard with statistics and recent tasks
- **Task Management**: Full CRUD operations with search, filter, and sorting
- **Profile Management**: User profile editing and password change functionality
- **Modern UI**: Clean, professional interface with loading states and animations

### Backend (Node.js + Express)
- **JWT Authentication**: Secure token-based authentication with refresh capabilities
- **Password Security**: bcrypt hashing with salt rounds
- **Input Validation**: Comprehensive server-side validation using express-validator
- **Rate Limiting**: Protection against brute force attacks
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Database Models**: Mongoose schemas with validation and indexing
- **Security Headers**: Helmet.js for security headers
- **CORS Configuration**: Proper CORS setup for cross-origin requests

### Database (MongoDB)
- **User Management**: User profiles with roles and authentication
- **Task Management**: Tasks with status, priority, tags, and due dates
- **Indexing**: Optimized database queries with proper indexing
- **Validation**: Schema-level validation and constraints

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with SSR/SSG capabilities
- **TypeScript** - Type safety and better developer experience
- **TailwindCSS** - Utility-first CSS framework
- **React Hook Form** - Form handling with validation
- **React Query** - Server state management and caching
- **Axios** - HTTP client with interceptors
- **React Hot Toast** - Toast notifications
- **Lucide React** - Beautiful icons
- **js-cookie** - Cookie management

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/primetrade-app.git
cd primetrade-app
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (frontend + backend)
npm run install:all
```

### 3. Environment Setup

#### Backend Environment (.env)
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/primetrade
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
NODE_ENV=development
```

#### Frontend Environment (.env.local)
Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Database Setup
Make sure MongoDB is running on your system. The application will automatically create the necessary collections and indexes.

### 5. Start the Application
```bash
# Development mode (runs both frontend and backend)
npm run dev

# Or run separately:
npm run dev:backend  # Backend only (port 5000)
npm run dev:frontend # Frontend only (port 3000)
```

### 6. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- API Health Check: http://localhost:5000/api/health

## 🔐 Authentication

### Demo Credentials
For testing purposes, you can create an account or use these demo credentials:
- **Email**: demo@primetrade.com
- **Password**: Demo123!

### Security Features
- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: 7-day expiration with secure headers
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configured for specific origins
- **Security Headers**: Helmet.js for additional security

## 📱 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt-token-here",
  "user": {
    "_id": "user-id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST /api/auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### GET /api/auth/me
Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

### Task Management Endpoints

#### GET /api/tasks
Get user's tasks with optional filtering and pagination.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `status` - Filter by status (pending, in-progress, completed, cancelled)
- `priority` - Filter by priority (low, medium, high, urgent)
- `search` - Search in title, description, and tags
- `sortBy` - Sort field (createdAt, updatedAt, dueDate, title, priority)
- `sortOrder` - Sort direction (asc, desc)

#### POST /api/tasks
Create a new task.

**Request Body:**
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "priority": "high",
  "dueDate": "2024-12-31T23:59:59.000Z",
  "tags": ["documentation", "project"]
}
```

#### PUT /api/tasks/:id
Update an existing task.

#### DELETE /api/tasks/:id
Delete a task.

#### GET /api/tasks/stats/overview
Get task statistics for the current user.

## 🏗 Project Structure

```
primetrade-app/
├── backend/
│   ├── middleware/
│   │   ├── auth.js              # Authentication middleware
│   │   └── errorHandler.js      # Error handling middleware
│   ├── models/
│   │   ├── User.js              # User model with validation
│   │   └── Task.js              # Task model with validation
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── users.js             # User management routes
│   │   └── tasks.js             # Task management routes
│   ├── utils/
│   │   └── generateToken.js     # JWT token generation
│   ├── server.js                # Express server setup
│   └── package.json
├── frontend/
│   ├── components/
│   │   ├── Layout/
│   │   │   └── DashboardLayout.tsx  # Dashboard layout component
│   │   └── ProtectedRoute.tsx       # Route protection component
│   ├── contexts/
│   │   └── AuthContext.tsx          # Authentication context
│   ├── lib/
│   │   ├── auth.ts                  # Authentication utilities
│   │   └── tasks.ts                 # Task management utilities
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── login.tsx            # Login page
│   │   │   └── register.tsx         # Registration page
│   │   ├── dashboard/
│   │   │   ├── index.tsx            # Dashboard home
│   │   │   ├── tasks.tsx            # Task management
│   │   │   └── profile.tsx          # User profile
│   │   ├── _app.tsx                 # App configuration
│   │   ├── _document.tsx            # Document configuration
│   │   └── index.tsx                # Landing page
│   ├── styles/
│   │   └── globals.css              # Global styles with Tailwind
│   └── package.json
└── package.json                     # Root package.json
```

## 🚀 Production Deployment

### Environment Variables for Production

#### Backend
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/primetrade
JWT_SECRET=very-long-random-secret-key-for-production
JWT_EXPIRE=7d
```

#### Frontend
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

### Build Commands
```bash
# Build frontend for production
cd frontend && npm run build

# Start production server
npm start
```

### Deployment Platforms
- **Frontend**: Vercel, Netlify, or any static hosting
- **Backend**: Railway, Heroku, DigitalOcean, AWS
- **Database**: MongoDB Atlas (recommended)

## 📈 Scaling Considerations

### Frontend Scaling
1. **Code Splitting**: Next.js automatic code splitting
2. **Image Optimization**: Next.js Image component
3. **Caching**: React Query for client-side caching
4. **CDN**: Static assets via CDN
5. **SSR/SSG**: Server-side rendering for better SEO

### Backend Scaling
1. **Database Indexing**: Optimized queries with proper indexes
2. **Connection Pooling**: MongoDB connection pooling
3. **Rate Limiting**: Protection against abuse
4. **Caching**: Redis for session and data caching
5. **Load Balancing**: Multiple server instances
6. **Microservices**: Split into smaller services

### Database Scaling
1. **Indexing Strategy**: Compound indexes for complex queries
2. **Data Partitioning**: Horizontal scaling with sharding
3. **Read Replicas**: Separate read/write operations
4. **Data Archiving**: Move old data to separate collections

### Security Enhancements
1. **HTTPS**: SSL/TLS certificates
2. **Content Security Policy**: CSP headers
3. **Input Sanitization**: Additional validation layers
4. **Audit Logging**: Track user actions
5. **Two-Factor Authentication**: Additional security layer

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Test Coverage
- Unit tests for utility functions
- Integration tests for API endpoints
- Component tests for React components
- End-to-end tests for user flows

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Primetrade Team**
- Website: https://primetrade-phi.vercel.app/
- Email: shwetankpal582@gmail.com

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- MongoDB team for the flexible database
- TailwindCSS team for the utility-first CSS framework
- All open-source contributors who made this project possible

---

**Built with ❤️ for demonstration of scalable web application architecture**

