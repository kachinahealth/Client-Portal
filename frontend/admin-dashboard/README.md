# 🎨 KachinaHealth Client Portal Frontend (LIVE PRODUCTION)

**⚠️ PRODUCTION ENVIRONMENT - This frontend is currently LIVE and deployed on Render**

Production-ready Next.js frontend for the KachinaHealth client management portal with a comprehensive dashboard featuring multiple management tabs. Built for enterprise performance and user experience.

## 🏭 Production Features

- ✅ **PRODUCTION-READY**: Enterprise-grade Next.js frontend
- ✅ **SUPABASE AUTHENTICATION**: Secure login with JWT token management
- ✅ **COMPLETE DASHBOARD**: 8 fully functional management tabs
- ✅ **REAL-TIME UPDATES**: Live data synchronization across all tabs
- ✅ **USER MANAGEMENT**: Comprehensive user CRUD operations
- ✅ **CONTENT MANAGEMENT**: News, training materials, study protocols, clinical trials
- ✅ **HOSPITAL TRACKING**: Live enrollment leaderboard with rankings
- ✅ **ANALYTICS**: User behavior tracking and reporting
- ✅ **RESPONSIVE DESIGN**: Works on all devices and screen sizes
- ✅ **ERROR HANDLING**: User-friendly error messages and loading states
- ✅ **ACCESSIBILITY**: WCAG compliant interface design
- ✅ **PERFORMANCE**: Optimized for fast loading and smooth interactions

## 🛠️ Local Development Setup (NOT FOR PRODUCTION)

**⚠️ IMPORTANT**: This frontend is already LIVE in production on Render. These setup instructions are for LOCAL DEVELOPMENT ONLY.

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend API running (local or production)

### Local Setup Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Access the application:**
   - **Login Page**: `http://localhost:3000`
   - **Dashboard**: `http://localhost:3000/clienthome.html`

## Project Structure

```
admin-dashboard/
├── pages/
│   └── index.tsx                 # Login page with Material-UI
├── public/
│   ├── clienthome.html           # Complete dashboard with all tabs
│   ├── logos/                    # Company logos and assets
├── package.json                  # Next.js dependencies
├── next.config.js               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

## Key Files

### `pages/index.tsx`
- Next.js login page with Material-UI components
- JWT token storage and management
- Automatic redirect to dashboard on successful login

### `public/clienthome.html`
- Complete dashboard with 8 management tabs
- Vanilla JavaScript with modern ES6+ features
- Real-time API integration
- Responsive design with gradient backgrounds
- Comprehensive error handling

## Dashboard Tabs

1. **User Management** - Add/edit/delete users, manage roles and approval status
2. **News & Updates** - Create news items and manage PDF documents
3. **Enrollment Leaderboard** - Track hospital progress and patient enrollment
4. **Training Materials** - Upload and manage training content
5. **Study Protocol** - Document management for study protocols
6. **Analytics** - User behavior tracking and statistics
7. **Settings** - Application configuration
8. **Debug** - API testing and data export/import tools

## API Integration

The frontend communicates with the backend API (`http://localhost:5000`) for:

- **Authentication**: Login, logout, token verification
- **Data Management**: CRUD operations for all dashboard content
- **Analytics**: User activity tracking
- **Settings**: Application configuration

All API calls include proper JWT authentication headers and error handling.

## Styling

- **Material-UI**: Login page components
- **Custom CSS**: Dashboard with gradient backgrounds and professional styling
- **Responsive Design**: Works on desktop and mobile devices
- **Consistent Theme**: Professional healthcare application appearance

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Environment

- **Framework**: Next.js 14+
- **Language**: TypeScript (pages), JavaScript (dashboard)
- **Styling**: Material-UI + Custom CSS
- **State Management**: Local storage for tokens, direct API calls

### Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+

## Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy the `.next` folder** to your hosting provider
3. **Serve the `public` folder** as static assets
4. **Configure environment variables** for production

## Contributing

- Follow the existing code style
- Add proper error handling
- Test API integrations
- Update documentation for new features

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Material-UI Documentation](https://mui.com/)
- [Supabase Documentation](https://supabase.com/docs)
