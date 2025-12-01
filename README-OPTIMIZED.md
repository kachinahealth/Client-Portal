# KachinaHealth Client Portal - Optimized Development Guide

This optimized setup provides seamless development for both local and Vercel deployment environments.

## 🚀 Quick Start Options

### Option 1: Optimized Local Development (Recommended)
```bash
# Install all dependencies
npm run install:all

# Start both frontend and backend concurrently
npm run dev
```

### Option 2: Docker Development (Cross-platform)
```bash
# Start with Docker Compose
npm run docker:dev

# Or build and run manually
npm run docker:build
npm run docker:dev
```

### Option 3: Vercel Deployment
```bash
# Deploy to Vercel
npm run build
vercel --prod
```

## 📁 Project Structure

```
kachina-health-client-portal/
├── backend/                          # Express.js API server
│   ├── server.js                     # Main server with all endpoints
│   ├── Dockerfile                    # Backend containerization
│   └── package.json                  # Backend dependencies
├── main-app/admin-dashboard/
│   ├── pages/                        # Next.js pages and API routes
│   │   ├── api/                      # Next.js API routes (Vercel)
│   │   └── index.tsx                 # Login page
│   ├── config.js                     # Environment configuration
│   ├── next.config.js                # Next.js configuration
│   ├── vercel.json                   # Vercel deployment config
│   ├── Dockerfile                    # Frontend containerization
│   └── package.json                  # Frontend dependencies
├── docker-compose.yml                # Docker orchestration
├── package.json                      # Root development scripts
└── README-OPTIMIZED.md               # This file
```

## 🔧 Development Scripts

### Root Level Scripts
```bash
npm run install:all          # Install all dependencies
npm run dev                   # Start frontend + backend concurrently
npm run dev:frontend         # Start only frontend (Next.js)
npm run dev:backend          # Start only backend (Express.js)
npm run build                # Build for production
npm run docker:dev           # Start with Docker
npm run docker:build         # Build Docker images
npm run lint                 # Lint all code
```

### Frontend Scripts (Next.js)
```bash
cd main-app/admin-dashboard
npm run dev:local            # Development with backend proxy
npm run dev:vercel            # Development for Vercel deployment
npm run build:analyze         # Build with bundle analyzer
npm run type-check            # TypeScript type checking
```

### Backend Scripts (Express.js)
```bash
cd backend
npm run dev                   # Development with auto-restart
npm run start                 # Production start
```

## 🌍 Environment Configuration

### Local Development
Create `.env.local` in the admin-dashboard directory:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
BACKEND_URL=http://localhost:5000
ALLOWED_ORIGINS=http://localhost:3000
JWT_SECRET=your-jwt-secret
```

### Vercel Deployment
Set environment variables in Vercel dashboard or use CLI:
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add ALLOWED_ORIGINS
```

### Docker Development
Environment variables are loaded from `.env` file in project root.

## 🐳 Docker Development

### Prerequisites
- Docker Desktop installed
- Docker Compose available

### Quick Start
```bash
# Start all services
npm run docker:dev

# View logs
docker-compose logs -f

# Stop services
npm run docker:down
```

### Services
- **frontend**: Next.js app on port 3000
- **backend**: Express.js API on port 5000
- **postgres** (optional): Local database on port 5432

## 🚀 Deployment Options

### Vercel Deployment (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd main-app/admin-dashboard
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Manual Server Deployment
```bash
# Backend deployment
cd backend
npm run build  # If needed
npm start

# Frontend deployment
cd ../main-app/admin-dashboard
npm run build
npm start
```

## 🔍 API Architecture

### Local Development
- Frontend proxies API calls to Express backend
- Full server-side functionality available
- All endpoints work as expected

### Vercel Deployment
- API routes handled by Next.js serverless functions
- Core authentication routes converted to Next.js API routes
- Other routes can be migrated gradually

## 🛠️ Troubleshooting

### Common Issues

**Port conflicts:**
```bash
# Kill process on port
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Dependency issues:**
```bash
# Clean install
npm run clean
npm run install:all
```

**Docker issues:**
```bash
# Reset Docker
npm run docker:down
docker system prune -a
npm run docker:dev
```

### Environment Variables
- Ensure all required env vars are set
- Check Vercel dashboard for production vars
- Use `.env.local` for local development

## 📊 Performance Optimizations

### Frontend (Next.js)
- ✅ Image optimization
- ✅ Code splitting
- ✅ Bundle analysis available
- ✅ Optimized webpack configuration

### Backend (Express.js)
- ✅ Compression middleware
- ✅ Rate limiting
- ✅ Security headers (Helmet)
- ✅ Request logging (Morgan)

### Vercel
- ✅ Serverless function optimization
- ✅ Static asset caching
- ✅ API route optimization

## 🔒 Security Features

- JWT authentication
- Supabase RLS policies
- CORS configuration
- Rate limiting
- Security headers
- Input validation

## 🎯 Development Workflow

1. **Local Development**: Use `npm run dev` for full-stack development
2. **Testing**: Test both local and Vercel deployments
3. **Deployment**: Deploy to Vercel with optimized configuration
4. **Monitoring**: Use Vercel analytics and Supabase logs

## 📝 Migration Notes

- Core auth routes converted to Next.js API routes
- Backend remains available for complex operations
- Gradual migration path to full serverless architecture
- Docker support for consistent development environments

---

**Ready for optimized development!** 🎉
