# 🗄️ KachinaHealth Database Documentation (LIVE PRODUCTION)

**⚠️ PRODUCTION ENVIRONMENT - This database is currently LIVE and serving production traffic**

## Overview

This directory contains the Supabase PostgreSQL database schema and setup files for the KachinaHealth client portal. The database is currently LIVE in production, serving the Render-deployed application with full Row Level Security and enterprise-grade performance.

## 📁 Directory Structure

```
database/
├── README.md                              # This documentation
├── migrations/                            # SQL migration files
│   ├── complete-schema-migration.sql      # Core database schema
│   ├── rls-policies-migration.sql         # Row Level Security policies
│   ├── seed-data.sql                      # Sample data for testing
│   ├── storage-setup.sql                  # Supabase Storage setup
│   └── [other migration files...]         # Additional schema updates
└── setup/
    └── complete-database-setup.sql        # All-in-one setup script
```

## 🚀 Production Database Status

**STATUS**: ✅ **LIVE AND OPERATIONAL**
- **Platform**: Supabase PostgreSQL
- **RLS**: Enabled on all tables
- **Performance**: Optimized indexes and queries
- **Backup**: Automated Supabase backups
- **Monitoring**: Real-time performance metrics

### Local Development Setup (NOT for Production)
For local development testing only:
1. **Create local Supabase project**
2. **Run**: `database/setup/complete-database-setup.sql`
3. **Verify**: Check tables in local Database section

### ⚠️ Production Database Guidelines
- **NO SCHEMA CHANGES** without thorough testing
- **MAINTAIN RLS POLICIES** for data security
- **MONITOR PERFORMANCE** regularly
- **REGULAR BACKUPS** through Supabase dashboard
- **AUDIT LOGS** for compliance requirements

## 📊 Database Schema

### Core Tables

**Users** (`users`)
- User accounts with authentication
- Role-based access (admin, manager, user)
- Profile information and hospital assignments

**News & Updates** (`news_items`)
- Announcements and updates for users
- Categorized content with metadata

**Hospitals** (`hospitals`)
- Hospital enrollment data and statistics
- Randomized patient counts for leaderboard

**Training Materials** (`training_materials`)
- Educational content and resources
- File attachments with metadata

**Study Protocols** (`study_protocols`)
- Protocol documents and guidelines
- File management with descriptions

**PDF Documents** (`pdf_documents`)
- PDF file storage and management
- Metadata tracking

**Analytics** (`user_analytics`)
- User behavior tracking
- Dashboard usage statistics

**Settings** (`app_settings`)
- Application configuration
- Dynamic settings management

## 🔒 Security Features

### Database Security
- **Row Level Security (RLS)** enabled on all tables
- **User-based access** policies for data protection
- **Role-based permissions** (admin, manager, user)
- **Audit trails** with creator tracking
- **Automatic timestamps** (created_at, updated_at)

### API Security
- **JWT token authentication** for all endpoints
- **CORS configuration** for production domains
- **Input validation** and error handling
- **Secure file uploads** with type/size restrictions

### Supabase Storage
- **Private buckets** for sensitive documents
- **Signed URL access** for secure file downloads
- **File type validation** (PDF, images, documents)
- **Size limits** and upload restrictions

## 👥 User Roles

### Admin
- Full system access and user management
- Content creation and editing
- Analytics and reporting access
- System configuration

### Manager
- Hospital management and user oversight
- Content moderation capabilities
- Reporting access

### User
- Dashboard access and training materials
- Protocol viewing and limited data submission
- Hospital enrollment tracking

## 🛠️ Maintenance

### Adding New Features
1. Create timestamped migration files: `YYYY-MM-DD-description.sql`
2. Update RLS policies for new tables if needed
3. Test in development environment first
4. Document changes in commit messages

### Backup Strategy
- Supabase handles automated backups
- Export important data before major schema changes
- Test restores in staging environment

## 📝 Notes

- All tables include automatic `created_at` and `updated_at` timestamps
- Foreign key relationships maintain data integrity
- RLS policies ensure users can only access authorized data
- File uploads are handled through Supabase Storage with signed URLs
