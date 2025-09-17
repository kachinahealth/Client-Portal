# 🏢 KachinaHealth - Multi-Tenant Clinical Trial Management Platform

## Overview

KachinaHealth is a **Software-as-a-Service (SaaS)** platform that provides medical device companies with a comprehensive clinical trial management system. Each company gets their own isolated environment with custom branding, user management, and analytics.

## 🏗️ Architecture

### Multi-Tenant SaaS Model
- **KachinaHealth.com** - Main company website with client login portal
- **Client Dashboards** - Each medical device company gets unique credentials
- **Tenant-Specific Backends** - Isolated data and API endpoints per company
- **Custom Mobile Apps** - Each client's investigators use company-specific apps

### System Components
```
┌─────────────────────────────────────────────────────────────┐
│                    KachinaHealth.com                       │
│              (Client Login Portal)                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                Multi-Tenant Backend                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  CereVasc   │  │ Medtronic   │  │   Other     │        │
│  │   Tenant    │  │   Tenant    │  │  Companies  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Mobile Apps (Investigators)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ CereVasc    │  │ Medtronic   │  │   Other     │        │
│  │   App       │  │    App      │  │    Apps     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd STRIDE-Trial-App
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install admin dashboard dependencies**
   ```bash
   cd ../admin-dashboard
   npm install
   ```

### Running the System

1. **Start the multi-tenant backend server**
   ```bash
   cd backend
   node multi-tenant-server.js
   ```
   
   The server will start on port 3000 with demo companies:
   - **CereVasc** (company ID: `cerevasc`)
   - **Medtronic** (company ID: `medtronic`)

2. **Start the admin dashboard**
   ```bash
   cd admin-dashboard
   npm run dev
   ```
   
   The dashboard will be available at `http://localhost:3001`

## 🔐 Authentication & Access

### Demo Credentials
- **Username**: `admin`
- **Password**: `password`
- **Company IDs**: `cerevasc`, `medtronic`

### Client Login Flow
1. Go to `KachinaHealth.com` (or `localhost:3001`)
2. Enter your company ID, username, and password
3. Access your company-specific dashboard

## 📱 Mobile App Integration

### Registration Endpoint
```
POST /api/auth/register
{
  "companyId": "cerevasc",
  "email": "investigator@hospital.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Smith",
  "site": "Memorial Hospital",
  "role": "investigator"
}
```

### Login Endpoint
```
POST /api/auth/login
{
  "companyId": "cerevasc",
  "email": "investigator@hospital.com",
  "password": "password123"
}
```

### News & Updates
```
GET /api/company/cerevasc/news
```

## 🎯 Client Dashboard Features

### 1. User Management
- **View all investigator registrations**
- **Approve/reject new users**
- **Track user status and activity**
- **Export user data**

### 2. News & Updates
- **Create and publish news items**
- **Manage training materials**
- **Push notifications to investigators**
- **Content version control**

### 3. Analytics & Reporting
- **Real-time enrollment metrics**
- **Site performance tracking**
- **Investigator engagement analytics**
- **Custom report generation**

### 4. Company Settings
- **Custom branding (colors, logos)**
- **Notification preferences**
- **Security settings**
- **API access management**

## 🏢 Multi-Tenant Benefits

### For KachinaHealth (Your Company)
- **Recurring Revenue**: Monthly/annual subscription fees
- **Scalability**: Easy to add new medical device companies
- **Data Isolation**: Each client's data is completely separate
- **Customization**: Each client gets branded experience

### For Medical Device Companies
- **Professional Platform**: Enterprise-grade clinical trial management
- **Custom Branding**: Their company name, colors, and branding
- **Data Security**: HIPAA-compliant, isolated data storage
- **Mobile-First**: Modern apps for investigators

### For Investigators
- **Easy Registration**: Simple signup process
- **Real-Time Updates**: Instant access to news and materials
- **Mobile Access**: Use on any device, anywhere
- **Professional Experience**: Company-branded interface

## 🔧 Technical Implementation

### Backend Architecture
- **Express.js** server with multi-tenant routing
- **Company ID** in URL path for data isolation
- **Middleware** for authentication and authorization
- **In-memory storage** (demo) → **MongoDB** (production)

### Frontend Dashboard
- **Next.js** with TypeScript
- **Material-UI** for professional design
- **Responsive layout** for all devices
- **Real-time updates** via API calls

### Mobile App Integration
- **RESTful API** endpoints
- **Company-specific** data filtering
- **Push notifications** for updates
- **Offline capability** (future enhancement)

## 🚀 Production Deployment

### 1. Domain Setup
- **KachinaHealth.com** - Main company website
- **SSL certificates** for security
- **CDN** for global performance

### 2. Database
- **MongoDB Atlas** for cloud database
- **Multi-tenant** collections with company ID prefixes
- **Backup and recovery** procedures

### 3. Hosting
- **Vercel** for admin dashboard
- **AWS/Google Cloud** for backend API
- **Load balancing** for scalability

### 4. Security
- **JWT tokens** for authentication
- **Rate limiting** to prevent abuse
- **Data encryption** at rest and in transit
- **Regular security audits**

## 💰 Business Model

### Pricing Structure
- **Starter Plan**: $X/month for small trials
- **Professional Plan**: $Y/month for medium trials
- **Enterprise Plan**: $Z/month for large trials
- **Custom pricing** for special requirements

### Revenue Streams
- **Monthly subscriptions** from medical device companies
- **Setup fees** for new client onboarding
- **Training and support** services
- **Custom development** for special features

## 🔮 Future Enhancements

### Phase 2 Features
- **Advanced analytics** with charts and graphs
- **Document management** system
- **Email marketing** integration
- **Multi-language** support

### Phase 3 Features
- **AI-powered insights** and recommendations
- **Predictive analytics** for trial success
- **Integration** with EDC systems
- **Mobile app** for company administrators

## 📞 Support & Contact

- **Email**: support@kachinahealth.com
- **Documentation**: [docs.kachinahealth.com](https://docs.kachinahealth.com)
- **Sales**: sales@kachinahealth.com

## 📄 License

This project is proprietary software owned by KachinaHealth. All rights reserved.

---

**Built with ❤️ by the KachinaHealth Team**
