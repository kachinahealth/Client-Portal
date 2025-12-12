# 🔄 Migration Guide: Monolithic to Modular Backend

## ⚠️ Important Notice

Your application is **LIVE IN PRODUCTION**. This migration guide is for **future development** and **local testing only**. Do NOT apply these changes to your production deployment without thorough testing.

## 🎯 Migration Overview

### Current State (server.js)
- **File Size**: 4,690 lines
- **Structure**: Monolithic single file
- **Maintainability**: Difficult
- **Testability**: Hard
- **Scalability**: Limited

### Target State (server-refactored.js + modules)
- **File Size**: ~200 lines main server + modular files
- **Structure**: Clean separation of concerns
- **Maintainability**: Easy
- **Testability**: Unit testable
- **Scalability**: Enterprise-ready

## 🚀 Step-by-Step Migration

### Phase 1: Setup (Safe - No Production Impact)

1. **Create Directory Structure**:
   ```bash
   cd backend
   mkdir -p routes controllers middleware services utils config
   ```

2. **Copy Current Environment**:
   ```bash
   cp .env .env.backup  # Backup current env
   ```

3. **Install Dependencies** (if needed):
   ```bash
   npm install  # Should already be installed
   ```

### Phase 2: Test New Architecture Locally

1. **Start with New Server**:
   ```bash
   # Terminal 1: Test new modular server
   npm run dev -- server-refactored.js

   # Terminal 2: Test original server on different port
   PORT=5001 npm run dev -- server.js
   ```

2. **Test API Endpoints**:
   ```bash
   # Test new server
   curl http://localhost:5000/health

   # Test old server (for comparison)
   curl http://localhost:5001/health
   ```

3. **Verify All Routes Work**:
   - Authentication: `/api/auth/login`
   - Users: `/api/users`
   - Clinical Trials: `/api/clinical-trials`
   - User Profile: `/api/user/profile`

### Phase 3: Production Deployment (CAUTION!)

**⚠️ ONLY DO THIS AFTER THOROUGH TESTING**

1. **Update package.json**:
   ```json
   {
     "scripts": {
       "start": "node server-refactored.js",
       "dev": "nodemon server-refactored.js"
     }
   }
   ```

2. **Deploy to Render**:
   - Push changes to GitHub
   - Render will automatically redeploy
   - Monitor logs for any issues
   - Have rollback plan ready

3. **Post-Deployment Verification**:
   - Test all frontend functionality
   - Check API response times
   - Monitor error logs
   - Verify authentication still works

## 🛠️ Troubleshooting

### If New Server Doesn't Start
```bash
# Check for syntax errors
node -c server-refactored.js

# Check environment variables
node -e "console.log(require('./config'))"
```

### If API Calls Fail
```bash
# Check health endpoint
curl http://localhost:5000/health

# Check debug endpoint
curl http://localhost:5000/api/debug/connection
```

### If Database Connections Fail
- Verify `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` are set
- Check Supabase project is accessible
- Verify RLS policies allow your operations

## 🔄 Rollback Plan

If issues occur after deployment:

1. **Immediate Rollback**:
   ```bash
   # Revert package.json scripts
   git checkout HEAD~1 -- package.json

   # Force redeploy on Render
   # (Render should auto-redeploy on push)
   ```

2. **Alternative**: Keep both servers temporarily:
   ```javascript
   // In server-refactored.js, temporarily fall back to old logic
   if (process.env.USE_LEGACY === 'true') {
     require('./server.js'); // Fallback
   }
   ```

## 📊 Benefits After Migration

### Developer Experience
- ✅ **Faster Development**: Add features without touching main server
- ✅ **Easier Testing**: Unit test individual modules
- ✅ **Better Debugging**: Isolated concerns make issues easier to find
- ✅ **Code Reviews**: Smaller, focused changes

### Production Benefits
- ✅ **Better Performance**: Modular loading, better memory usage
- ✅ **Easier Scaling**: Add load balancers, microservices later
- ✅ **Better Monitoring**: Granular logging and metrics
- ✅ **Easier Maintenance**: Update features without affecting others

### Code Quality
- ✅ **Maintainability**: Clear structure, easy to understand
- ✅ **Reliability**: Better error handling and testing
- ✅ **Security**: Centralized auth, validation, and security
- ✅ **Standards**: Follows Node.js/Express best practices

## 🎯 Migration Checklist

### Pre-Migration
- [ ] Backup current server.js
- [ ] Backup environment variables
- [ ] Test current functionality locally
- [ ] Review new architecture documentation

### During Migration
- [ ] Create modular structure
- [ ] Extract routes to separate files
- [ ] Test each module individually
- [ ] Verify all API endpoints work
- [ ] Test authentication and authorization

### Post-Migration
- [ ] Update deployment scripts
- [ ] Deploy to staging/test environment
- [ ] Run comprehensive tests
- [ ] Monitor performance metrics
- [ ] Train team on new structure

### Production Deployment
- [ ] Schedule deployment during low-traffic period
- [ ] Have rollback plan ready
- [ ] Monitor for 24-48 hours post-deployment
- [ ] Document any issues and fixes

## 🤝 Support

If you encounter issues during migration:

1. **Check Logs**: Both server logs and browser console
2. **Compare Behavior**: Test old vs new server side-by-side
3. **Review Architecture**: Read `ARCHITECTURE.md` for guidance
4. **Test Incrementally**: Migrate one feature at a time

**Remember: Your production application takes priority. Only migrate when you have time for thorough testing and monitoring.**
