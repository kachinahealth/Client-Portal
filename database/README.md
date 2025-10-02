# KachinaHealth Database Setup

Complete SQL schema and migration system for the KachinaHealth client portal database with Supabase integration.

## 📁 Directory Structure

```
database/
├── README.md                    # This file
├── .gitignore                   # Prevent secrets from being committed
├── setup/
│   └── complete-database-setup.sql    # Complete database schema
└── migrations/
    └── create-clinical-trials-table.sql  # Additional table migrations
```

## 🚀 Quick Start

### For New Projects
1. **Open Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Run**: `database/setup/complete-database-setup.sql`
4. **Verify**: Check that all tables and sample data were created

### For Existing Projects
- Check `migrations/` for any additional tables needed
- Run individual migration files as needed

## 📊 Database Schema

### Core Tables
- `users` - User accounts and authentication
- `news_items` - News and announcements
- `hospitals` - Enrollment leaderboard data
- `training_materials` - Training content (PDF/Text/Video)
- `study_protocols` - Protocol documents
- `clinical_trials` - Clinical trial data
- `pdf_documents` - PDF file management
- `user_analytics` - User behavior tracking
- `app_settings` - Application configuration

### Legacy Tables
- `clients` - Basic client management (backward compatibility)

## 🔒 Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Authenticated user policies** for all operations
- **Audit trails** with `created_by` tracking
- **Automatic timestamps** with `updated_at` triggers

## 🛠️ Maintenance

### Adding New Tables
1. Create migration file in `migrations/`
2. Include RLS policies and triggers
3. Update this README

### Updating Schema
1. **Backup existing data** first
2. Test changes in development environment
3. Update RLS policies for new/changed tables
4. Document changes in migration files

## 🔍 Troubleshooting

### Common Issues
- **Table not created**: Check Supabase permissions
- **RLS errors**: Verify authentication setup
- **Foreign key errors**: Ensure referenced tables exist

### Sample Data
The setup includes:
- Admin user: `admin@kachinahealth.com`
- Sample users for testing
- Welcome news items
- Sample hospitals with enrollment data

## 📝 File Cleanup

This directory consolidates multiple SQL files that were previously scattered in the root directory. The following files were moved/removed:

**Moved to `database/setup/`**
- `database-setup.sql` → `complete-database-setup.sql`

**Moved to `database/migrations/`**
- `create-clinical-trials-table.sql`

**Removed (redundant/temporary)**
- `check-training-materials.sql`
- `create-users-table.sql`
- `fix-insert-policies.sql`
- `fix-training-materials-policies.sql`
- `news-table-setup.sql`
- `rebuild-training-tables.sql`
- `update-users-role-constraint.sql`
- `update-users-table-rls.sql`
- `verify-training-policies.sql`

## 🔄 Migration Strategy

For future updates:
1. Create timestamped migration files: `YYYY-MM-DD-description.sql`
2. Include both `UP` and `DOWN` migrations when possible
3. Update this README with new migration details

---

**Note**: This schema supports all dashboard features and is optimized for the KachinaHealth client portal.
