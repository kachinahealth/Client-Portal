# 🚀 KachinaHealth Client Portal Backend (LIVE PRODUCTION)

**⚠️ PRODUCTION ENVIRONMENT - This backend is currently LIVE and deployed on Render**

Production-ready Express.js backend for the KachinaHealth client management portal with Supabase authentication and comprehensive dashboard API support. Built for enterprise scalability, security, and reliability.

## 🏭 Production Features

- ✅ **PRODUCTION-READY**: Enterprise-grade Express.js backend
- ✅ **JWT AUTHENTICATION**: Secure token-based auth with Supabase
- ✅ **COMPLETE DASHBOARD API**: 8 fully functional management tabs
- ✅ **COMPREHENSIVE CRUD**: Full user management operations
- ✅ **CONTENT MANAGEMENT**: News, training materials, study protocols
- ✅ **CLINICAL TRIALS**: Complete trial management system
- ✅ **HOSPITAL TRACKING**: Enrollment leaderboard with real-time updates
- ✅ **ANALYTICS**: User behavior tracking and statistics
- ✅ **FILE HANDLING**: PDF document upload and management
- ✅ **PROTECTED ROUTES**: Authentication middleware on all endpoints
- ✅ **ERROR HANDLING**: Graceful degradation and comprehensive logging
- ✅ **SCALABILITY**: Optimized for high-performance production use

## 🛠️ Local Development Setup (NOT FOR PRODUCTION)

**⚠️ IMPORTANT**: This backend is already LIVE in production on Render. These setup instructions are for LOCAL DEVELOPMENT ONLY.

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Local Supabase project (for testing)

### Local Setup Steps

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your LOCAL Supabase credentials (NOT production)
   ```

### Production Environment (Already Configured)
This backend is currently running in production with the following configuration:
- **Platform**: Render Web Service
- **Environment Variables**: Set in Render dashboard (secure)
- **Database**: Supabase PostgreSQL with RLS
- **Monitoring**: Comprehensive error logging and health checks

3. **Database Setup:**
   Run the SQL commands in `../database-setup.sql` in your Supabase SQL editor.

4. **Start the server:**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## 🚀 Render Deployment

### Backend Environment Variables (REQUIRED)

When deploying to Render, you **MUST** set these environment variables in your Render service settings:

| Variable | Description | Where to find it |
|----------|-------------|------------------|
| `SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous/public key | Supabase Dashboard → Settings → API → anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (for admin ops) | Supabase Dashboard → Settings → API → service_role secret |
| `JWT_SECRET` | Secret key for JWT signing | Generate a secure random string (32+ characters) |
| `NODE_ENV` | Set to `production` | `production` |

### Frontend Configuration (CRITICAL)

After deploying your backend to Render, you **MUST** update the frontend with your backend URL:

1. Open `frontend/admin-dashboard/public/index.html`
2. Open `frontend/admin-dashboard/public/clienthome.html`
3. Find this line at the top of each file:
   ```javascript
   const RENDER_BACKEND_URL = 'https://YOUR-BACKEND-SERVICE.onrender.com';
   ```
4. Replace `YOUR-BACKEND-SERVICE` with your actual Render backend service name

### Debugging Connection Issues

Use these endpoints to debug connectivity:

- **Health Check**: `GET /health` - Shows environment variable status and database connectivity
- **Debug Connection**: `GET /api/debug/connection` - Detailed connectivity diagnostics

Example:
```bash
curl https://your-backend.onrender.com/health
curl https://your-backend.onrender.com/api/debug/connection
```

### Common Issues

1. **"Database service unavailable"**: Missing Supabase environment variables in Render
2. **"Connection error" on login**: Frontend `RENDER_BACKEND_URL` not configured
3. **"Invalid credentials"**: User doesn't exist in Supabase Auth or wrong password
4. **CORS errors**: Backend is not running or URL is incorrect

## Complete API Endpoints

### 🔐 Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/user/profile` - Get user profile

### 📊 Dashboard
- `GET /api/dashboard` - Get dashboard statistics (total users, pending approvals, etc.)

### 👥 User Management
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### 📰 News & Updates
- `GET /api/news` - Get all news items
- `POST /api/news` - Create news item
- `PUT /api/news/:id` - Update news item
- `DELETE /api/news/:id` - Delete news item

### 🏥 Hospitals/Leaderboard
- `GET /api/hospitals` - Get all hospitals (sorted by randomized patients)
- `GET /api/hospitals/:id` - Get single hospital
- `POST /api/hospitals` - Create hospital
- `PUT /api/hospitals/:id` - Update hospital
- `DELETE /api/hospitals/:id` - Delete hospital

### 📚 Training Materials
- `GET /api/training-materials` - Get all training materials
- `POST /api/training-materials` - Create training material
- `DELETE /api/training-materials/:id` - Delete training material

### 📋 Study Protocols
- `GET /api/study-protocols` - Get all study protocols
- `POST /api/study-protocols` - Create study protocol
- `DELETE /api/study-protocols/:id` - Delete study protocol

### 📄 PDF Documents
- `GET /api/pdfs` - Get all PDF documents
- `POST /api/pdfs` - Upload PDF document
- `DELETE /api/pdfs/:id` - Delete PDF document

### 📈 Analytics
- `GET /api/analytics` - Get user analytics data
- `POST /api/analytics/track` - Track user activity (tab views, app opens)

### ⚙️ Settings
- `GET /api/settings` - Get app settings
- `PUT /api/settings/:key` - Update setting

### 🛠️ System
- `GET /` - API information and status
- `GET /health` - Health check endpoint

## Database Schema

The backend works with the complete database schema defined in `database-setup.sql`, which includes:

- `users` - User management
- `news_items` - News & updates
- `hospitals` - Enrollment leaderboard
- `training_materials` - Training content
- `study_protocols` - Protocol documents
- `pdf_documents` - PDF file management
- `user_analytics` - User behavior tracking
- `app_settings` - Application configuration
- `clients` - Legacy client management (for backward compatibility)

All tables include:
- UUID primary keys with auto-generation
- Automatic `created_at` and `updated_at` timestamps
- Row Level Security (RLS) policies
- Proper foreign key relationships
- Audit trails with `created_by` fields

## Security Features

- **JWT Authentication**: Secure token-based authentication on all management endpoints
- **Supabase RLS**: Database-level security policies for all tables
- **Input Validation**: Server-side validation on all API inputs
- **CORS Protection**: Configured for cross-origin requests
- **Session Management**: Proper token verification and cleanup
- **Audit Trails**: All changes tracked with user attribution

## Development Notes

- **Clean Codebase**: Removed 80+ console.log statements for production readiness
- **Optimized Dependencies**: Minimal package footprint
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Performance**: Efficient database queries with proper indexing
- **Scalability**: RESTful API design ready for expansion

## Testing

The API can be tested using tools like:
- Postman
- Thunder Client (VS Code extension)
- curl commands
- The frontend dashboard's Debug tab

All endpoints return consistent JSON responses with `success`, `message`, and data fields.
