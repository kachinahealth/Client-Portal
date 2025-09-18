const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// Add these near the top of the file, right after creating 'app'
app.use(cors());
app.use(express.json());

// Add this test endpoint to verify the server is working
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working' });
});

// Log all incoming requests (add this for debugging)
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Data storage files
// TODO: UPGRADE TO DATABASE BEFORE PRODUCTION DEPLOYMENT
// Current file-based storage is for development/demo only
// For production, implement MongoDB, PostgreSQL, or similar database
// This ensures data persistence, scalability, and proper backup/recovery
const DATA_DIR = path.join(__dirname, 'data');
const COMPANIES_FILE = path.join(DATA_DIR, 'companies.json');
const LOGS_FILE = path.join(__dirname, 'data-changes.log');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Create PDF storage directory
const PDFS_DIR = path.join(DATA_DIR, 'pdfs');
if (!fs.existsSync(PDFS_DIR)) {
    fs.mkdirSync(PDFS_DIR, { recursive: true });
}

// Configure multer for PDF file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const companyId = req.params.companyId;
        const companyPdfDir = path.join(PDFS_DIR, companyId);
        if (!fs.existsSync(companyPdfDir)) {
            fs.mkdirSync(companyPdfDir, { recursive: true });
        }
        cb(null, companyPdfDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const originalName = file.originalname;
        const extension = path.extname(originalName);
        const nameWithoutExt = path.basename(originalName, extension);
        cb(null, `${nameWithoutExt}_${timestamp}${extension}`);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Only allow PDF files
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Initialize data storage
let companies = {};

// Add to your existing data structure
let emailCodes = new Map(); // Store temporary codes

// Add this alongside existing companies data structure
let mobileAuthCodes = new Map(); // Store temporary codes for mobile users

// Email configuration (you'll need to provide real credentials)
let emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-app-specific-password' // Use an app-specific password from Google Account
    }
});

// Create a test account for Ethereal Email
async function createTestEmailAccount() {
    const testAccount = await nodemailer.createTestAccount();
    
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    });

    console.log('📧 Test Email Account Created:');
    console.log('Username:', testAccount.user);
    console.log('Password:', testAccount.pass);
    console.log('Preview URL: https://ethereal.email');

    return transporter;
}

// Initialize email transporter
createTestEmailAccount().then(transporter => {
    emailTransporter = transporter;  // Now this assignment will work
    console.log('✅ Email system ready');
});

// Update the sendApprovalEmail function
async function sendApprovalEmail(user) {
    try {
        const info = await emailTransporter.sendMail({
            from: '"KachinaHealth" <stride@kachinahealth.com>',
            to: user.email,
            subject: 'Your STRIDE Trial App Access is Approved',
            html: `
                <h2>Welcome to the STRIDE Trial App</h2>
                <p>Dear ${user.firstName} ${user.lastName},</p>
                <p>Your registration has been approved. You can now log in to the STRIDE Trial mobile app using your email address:</p>
                <p><strong>${user.email}</strong></p>
                <p>When you open the app, click "Sign In" and enter this email address. You'll receive a one-time code to complete your login.</p>
                <br>
                <p>Best regards,</p>
                <p>The STRIDE Trial Team</p>
            `
        });

        console.log('📨 Approval email sent! Preview URL:', nodemailer.getTestMessageUrl(info));
        return nodemailer.getTestMessageUrl(info);
    } catch (error) {
        console.error('Failed to send approval email:', error);
        throw error;
    }
}

// Load data from file or create default data
function loadData() {
    try {
        if (fs.existsSync(COMPANIES_FILE)) {
            const data = fs.readFileSync(COMPANIES_FILE, 'utf8');
            companies = JSON.parse(data);
            console.log('✅ Data loaded from file successfully');
        } else {
            // Create default data structure
            companies = {
                cerevasc: {
                    name: 'CereVasc',
                    primaryColor: '#1976d2',
                    users: [],
                    news: [],
                    pdfs: [],
                    trainingMaterials: [],
                    studyProtocols: [],
                    hospitals: [
                        {
                            id: 'h1',
                            name: 'Massachusetts General Hospital',
                            location: 'Boston, MA',
                            principalInvestigator: 'Dr. Sarah Johnson',
                            consentedPatients: 45,
                            randomizedPatients: 32,
                            consentRate: 8.2
                        },
                        {
                            id: 'h2',
                            name: 'Johns Hopkins Hospital',
                            location: 'Baltimore, MD',
                            principalInvestigator: 'Dr. Michael Chen',
                            consentedPatients: 38,
                            randomizedPatients: 28,
                            consentRate: 7.1
                        },
                        {
                            id: 'h3',
                            name: 'Cleveland Clinic',
                            location: 'Cleveland, OH',
                            principalInvestigator: 'Dr. Emily Rodriguez',
                            consentedPatients: 32,
                            randomizedPatients: 24,
                            consentRate: 6.8
                        }
                    ],
                    settings: {
                        notifications: true,
                        autoApproval: false
                    },
                    credentials: {
                        username: 'cerevasc_admin',
                        password: 'CereVasc2024!'
                    },
                    logoUrl: 'http://127.0.0.1:3000/logos/cerevasc-logo.png'
                },
                medtronic: {
                    name: 'Medtronic',
                    primaryColor: '#d32f2f',
                    users: [],
                    news: [],
                    pdfs: [],
                    trainingMaterials: [],
                    studyProtocols: [],
                    hospitals: [],
                    settings: {
                        notifications: true,
                        autoApproval: true
                    },
                    credentials: {
                        username: 'medtronic_admin',
                        password: 'Medtronic2024!'
                    },
                    logoUrl: 'http://127.0.0.1:3000/logos/medtronic-logo.svg'
                }
            };
            saveData();
            console.log('✅ Default data created and saved');
        }
    } catch (error) {
        console.error('❌ Error loading data:', error);
        // Fallback to default data
        companies = {};
        loadData(); // This will create default data
    }
}

// Save data to file
function saveData() {
    try {
        fs.writeFileSync(COMPANIES_FILE, JSON.stringify(companies, null, 2));
        console.log('💾 Data saved to file successfully');
        
        // Log the change
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] Data saved to ${COMPANIES_FILE}\n`;
        fs.appendFileSync(LOGS_FILE, logEntry);
    } catch (error) {
        console.error('❌ Error saving data:', error);
    }
}

// Load data on startup
loadData();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (logos) with debugging
const logosPath = path.join(__dirname, '../admin-dashboard/logos');
console.log('Serving logos from:', logosPath);
app.use('/logos', express.static(logosPath));

// Add a specific route to test logo access
app.get('/test-logo/:filename', (req, res) => {
    const filename = req.params.filename;
    const logoPath = path.join(logosPath, filename);
    console.log('Testing logo access for:', filename);
    console.log('Full path:', logoPath);
    
    if (require('fs').existsSync(logoPath)) {
        console.log('Logo file exists');
        res.sendFile(logoPath);
    } else {
        console.log('Logo file not found');
        res.status(404).json({ error: 'Logo not found', path: logoPath });
    }
});

// Serve admin dashboard files
app.use('/admin-dashboard', express.static(path.join(__dirname, '../admin-dashboard')));

// Authentication middleware (simplified for demo)
const authenticateClient = (req, res, next) => {
  const { companyId, username, password } = req.body;
  
  // In production, this would check against a database
  if (companies[companyId] && 
      username === companies[companyId].credentials.username && 
      password === companies[companyId].credentials.password) {
    req.companyId = companyId;
    next();
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

// Health check
app.get('/health', (req, res) => {
  try {
    console.log('Health check request received');
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      message: 'Multi-tenant server running!'
    });
    console.log('Health check response sent');
  } catch (error) {
    console.error('Error in health check:', error);
    res.status(500).json({ error: error.message });
  }
});

// Logo health check
app.get('/logos-health', (req, res) => {
  const fs = require('fs');
  const logosDir = path.join(__dirname, '../admin-dashboard/logos');
  
  try {
    const files = fs.readdirSync(logosDir);
    const logoFiles = files.filter(file => file.endsWith('.png') || file.endsWith('.svg'));
    
    res.json({
      status: 'OK',
      logosPath: logosDir,
      availableLogos: logoFiles,
      cerevascLogoExists: fs.existsSync(path.join(logosDir, 'cerevasc-logo.png')),
      cerevascLogoPath: path.join(logosDir, 'cerevasc-logo.png')
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
      logosPath: logosDir
    });
  }
});

// Client login endpoint
app.post('/api/auth/client-login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Find company by credentials (in production, this would check against a database)
  let foundCompany = null;
  let companyId = null;
  
  for (const [id, company] of Object.entries(companies)) {
    if (username === company.credentials.username && password === company.credentials.password) {
      foundCompany = company;
      companyId = id;
      break;
    }
  }
  
  if (!foundCompany) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  console.log('Login successful for company:', foundCompany.name);
  console.log('Company logo URL:', foundCompany.logoUrl);
  
  res.json({
    success: true,
    message: 'Login successful',
    company: {
      id: companyId,
      name: foundCompany.name,
      primaryColor: foundCompany.primaryColor,
      logoUrl: foundCompany.logoUrl
    }
  });
});

// Get company dashboard data
app.get('/api/company/:companyId/dashboard', (req, res) => {
  const { companyId } = req.params;
  
  if (!companies[companyId]) {
    return res.status(404).json({ error: 'Company not found' });
  }
  
  const company = companies[companyId];
  const stats = {
    totalUsers: company.users.length,
    pendingApprovals: company.users.filter(u => u.status === 'pending').length,
    activeUsers: company.users.filter(u => u.status === 'approved').length,
    newsItems: company.news.length
  };
  
  res.json({
    company: {
      id: companyId,
      name: company.name,
      primaryColor: company.primaryColor
    },
    stats,
    users: company.users,
    news: company.news
  });
});

// User registration endpoint (from mobile app)
app.post('/api/auth/register', (req, res) => {
  const { companyId, email, password, firstName, lastName, site, role } = req.body;
  
  if (!companyId || !companies[companyId]) {
    return res.status(400).json({ error: 'Invalid company ID' });
  }
  
  // Check if user already exists
  const existingUser = companies[companyId].users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  // Create new user
  const newUser = {
    id: Date.now().toString(),
    email,
    firstName,
    lastName,
    site,
    role,
    status: 'pending',
    registrationDate: new Date().toISOString().split('T')[0],
    password: password // In production, hash this password
  };
  
  companies[companyId].users.push(newUser);
  
  // Save data to file
  saveData();
  
  console.log(`📝 New user registration for ${companyId}:`, {
    email,
    firstName,
    lastName,
    site
  });
  
  res.json({
    success: true,
    message: 'User registered successfully. Awaiting approval.',
    user: {
      id: newUser.id,
      email: newUser.email,
      status: newUser.status
    }
  });
});

// Add this new endpoint for mobile registration
app.post('/api/auth/mobile/register', async (req, res) => {
    const { firstName, lastName, email, site, role } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !site || !role) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if email already exists in any company
    for (const company of Object.values(companies)) {
        if (company.users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
            return res.status(400).json({ error: 'Email already registered' });
        }
    }

    // Create new user object
    const newUser = {
        id: `u${Date.now()}`,
        firstName,
        lastName,
        email,
        site,
        role,
        status: 'pending',
        createdAt: new Date().toISOString(),
        analytics: {
            lastAppOpen: null,
            totalAppOpens: 0,
            tabViews: {
                leaderboard: 0,
                news: 0,
                resources: 0,
                messaging: 0
            }
        }
    };

    // For demo, add to CereVasc company
    if (!companies.cerevasc.users) {
        companies.cerevasc.users = [];
    }
    companies.cerevasc.users.push(newUser);

    // Save to file
    try {
        saveData();
        
        // Send response
        res.json({
            success: true,
            message: 'Registration successful. Pending admin approval.'
        });

    } catch (error) {
        console.error('Failed to save registration:', error);
        res.status(500).json({ error: 'Failed to complete registration' });
    }
});

// Add the mobile login endpoint
app.post('/api/auth/mobile/request-code', async (req, res) => {
    console.log('Received code request for:', req.body);
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email across all companies
    let userCompany = null;
    let foundUser = null;
    
    for (const [companyId, company] of Object.entries(companies)) {
        const user = company.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
            userCompany = companyId;
            foundUser = user;
            break;
        }
    }

    if (!foundUser) {
        return res.status(404).json({ error: 'User not found' });
    }

    if (foundUser.status !== 'approved') {
        return res.status(403).json({ error: 'Account pending approval' });
    }

    try {
        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store code temporarily
        if (!global.loginCodes) global.loginCodes = new Map();
        global.loginCodes.set(email, {
            code,
            expires: Date.now() + 5 * 60 * 1000, // 5 minutes
            attempts: 0
        });

        // Send email with code
        const info = await emailTransporter.sendMail({
            from: '"KachinaHealth" <stride@kachinahealth.com>',
            to: email,
            subject: 'Your STRIDE Trial App Login Code',
            html: `
                <h2>STRIDE Trial App Login Code</h2>
                <p>Your login code is: <strong>${code}</strong></p>
                <p>This code will expire in 5 minutes.</p>
            `
        });

        console.log('Login code email preview:', nodemailer.getTestMessageUrl(info));
        
        res.json({ 
            success: true, 
            message: 'Login code sent',
            emailPreview: nodemailer.getTestMessageUrl(info)
        });
    } catch (error) {
        console.error('Error sending login code:', error);
        res.status(500).json({ error: 'Failed to send login code' });
    }
});

// Add this endpoint for verifying the login code
app.post('/api/auth/mobile/verify-code', (req, res) => {
    console.log('Verifying code:', req.body); // Debug log
    const { email, code } = req.body;
    
    if (!email || !code) {
        return res.status(400).json({ error: 'Email and code are required' });
    }

    if (!global.loginCodes || !global.loginCodes.has(email)) {
        return res.status(400).json({ error: 'No code requested or code expired' });
    }

    const codeData = global.loginCodes.get(email);
    
    // Check expiration
    if (Date.now() > codeData.expires) {
        global.loginCodes.delete(email);
        return res.status(400).json({ error: 'Code expired' });
    }

    // Check code
    if (codeData.code !== code) {
        codeData.attempts++;
        if (codeData.attempts >= 3) {
            global.loginCodes.delete(email);
            return res.status(400).json({ error: 'Too many attempts. Please request a new code.' });
        }
        return res.status(400).json({ error: 'Invalid code' });
    }

    // Find user data
    let userData = null;
    let userCompany = null;
    
    for (const [companyId, company] of Object.entries(companies)) {
        const user = company.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
            userData = user;
            userCompany = companyId;
            break;
        }
    }

    // Clean up used code
    global.loginCodes.delete(email);

    // Return success with user data
    res.json({
        success: true,
        user: {
            id: userData.id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            companyId: userCompany
        }
    });
});

// User login endpoint (from mobile app)
app.post('/api/auth/login', (req, res) => {
  const { companyId, email, password } = req.body;
  
  if (!companyId || !companies[companyId]) {
    return res.status(400).json({ error: 'Invalid company ID' });
  }
  
  const user = companies[companyId].users.find(u => u.email === email);
  
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  if (user.status !== 'approved') {
    return res.status(403).json({ error: 'Account pending approval' });
  }
  
  console.log(`🔑 User login for ${companyId}:`, { email });
  
  res.json({
    success: true,
    message: 'Login successful',
    token: 'demo-jwt-token',
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      site: user.site,
      role: user.role,
      status: user.status
    }
  });
});

// Approve/reject user (from admin dashboard)
app.post('/api/company/:companyId/users/:userId/approve', async (req, res) => {
    const { companyId, userId } = req.params;
    
    if (!companies[companyId]) {
        return res.status(404).json({ error: 'Company not found' });
    }

    const user = companies[companyId].users.find(u => u.id === userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    try {
        // Update user status
        user.status = 'approved';
        user.approvedAt = new Date().toISOString();
        
        // Send approval email and get preview URL
        const previewUrl = await sendApprovalEmail(user);
        
        // Save changes
        saveData();
        
        res.json({ 
            success: true, 
            message: 'User approved and notified',
            emailPreviewUrl: previewUrl // Include preview URL in response
        });
    } catch (error) {
        console.error('Error in user approval:', error);
        res.status(500).json({ error: 'Failed to approve user' });
    }
});

// Add news item (from admin dashboard)
app.post('/api/company/:companyId/news', (req, res) => {
  const { companyId } = req.params;
  const { title, content } = req.body;
  
  if (!companies[companyId]) {
    return res.status(404).json({ error: 'Company not found' });
  }
  
  const newsItem = {
    id: Date.now().toString(),
    title,
    content,
    date: new Date().toISOString().split('T')[0],
    published: false
  };
  
  companies[companyId].news.push(newsItem);
  
  // Save data to file
  saveData();
  
  console.log(`📰 News added for ${companyId}:`, { title });
  
  res.json({
    success: true,
    message: 'News item added successfully',
    news: newsItem
  });
});

// Update news item (from admin dashboard)
app.put('/api/company/:companyId/news/:newsId', (req, res) => {
  const { companyId, newsId } = req.params;
  const { title, content } = req.body;
  
  if (!companies[companyId]) {
    return res.status(404).json({ error: 'Company not found' });
  }
  
  const newsIndex = companies[companyId].news.findIndex(n => n.id === newsId);
  
  if (newsIndex === -1) {
    return res.status(404).json({ error: 'News item not found' });
  }
  
  // Update the news item
  companies[companyId].news[newsIndex] = {
    ...companies[companyId].news[newsIndex],
    title,
    content,
    updatedDate: new Date().toISOString().split('T')[0]
  };
  
  // Save data to file
  saveData();
  
  console.log(`📰 News updated for ${companyId}:`, { newsId, title });
  
  res.json({
    success: true,
    message: 'News item updated successfully',
    news: companies[companyId].news[newsIndex]
  });
});

// Delete news item (from admin dashboard)
app.delete('/api/company/:companyId/news/:newsId', (req, res) => {
  const { companyId, newsId } = req.params;
  
  if (!companies[companyId]) {
    return res.status(404).json({ error: 'Company not found' });
  }
  
  const newsIndex = companies[companyId].news.findIndex(n => n.id === newsId);
  
  if (newsIndex === -1) {
    return res.status(404).json({ error: 'News item not found' });
  }
  
  companies[companyId].news.splice(newsIndex, 1);
  
  // Save data to file
  saveData();
  
  console.log(`📰 News deleted for ${companyId}:`, { newsId });
  
  res.json({
    success: true,
    message: 'News item deleted successfully'
  });
});

// Get news for mobile app
app.get('/api/company/:companyId/news', (req, res) => {
  const { companyId } = req.params;
  
  if (!companies[companyId]) {
    return res.status(404).json({ error: 'Company not found' });
  }
  
  const publishedNews = companies[companyId].news.filter(n => n.published);
  
  res.json({
    success: true,
    news: publishedNews
  });
});

// Mobile app endpoints for PDF documents
app.get('/api/company/:companyId/mobile/pdfs', (req, res) => {
  const { companyId } = req.params;
  
  if (!companies[companyId]) {
    return res.status(404).json({ error: 'Company not found' });
  }
  
  res.json({
    success: true,
    pdfs: companies[companyId].pdfs
  });
});

// Mobile app endpoint for enrollment leaderboard
app.get('/api/company/:companyId/mobile/leaderboard', (req, res) => {
  const { companyId } = req.params;
  
  if (!companies[companyId]) {
    return res.status(404).json({ error: 'Company not found' });
  }
  
  const hospitals = companies[companyId].hospitals || [];
  const totalConsented = hospitals.reduce((sum, h) => sum + h.consentedPatients, 0);
  const totalRandomized = hospitals.reduce((sum, h) => sum + h.randomizedPatients, 0);
  
  // Sort hospitals by consented patients for competitive ranking
  const sortedHospitals = hospitals.sort((a, b) => b.consentedPatients - a.consentedPatients);
  
  res.json({
    success: true,
    hospitals: sortedHospitals,
    totalConsented,
    totalRandomized,
    lastUpdated: new Date().toISOString()
  });
});

// Update company settings
app.put('/api/company/:companyId/settings', (req, res) => {
  const { companyId } = req.params;
  const { settings } = req.body;
  
  if (!companies[companyId]) {
    return res.status(404).json({ error: 'Company not found' });
  }
  
  companies[companyId].settings = { ...companies[companyId].settings, ...settings };
  
  res.json({
    success: true,
    message: 'Settings updated successfully',
    settings: companies[companyId].settings
  });
});

// Get company settings
app.get('/api/company/:companyId/settings', (req, res) => {
  const { companyId } = req.params;
  
  if (!companies[companyId]) {
    return res.status(404).json({ error: 'Company not found' });
  }
  
  res.json({
    success: true,
    settings: companies[companyId].settings
  });
});

// PDF Document Management
app.post('/api/company/:companyId/pdfs', upload.single('pdfFile'), (req, res) => {
  const { companyId } = req.params;
  
  if (!companies[companyId]) {
    return res.status(404).json({ error: 'Company not found' });
  }
  
  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file uploaded' });
  }
  
  const { title, description, category } = req.body;
  
  const pdfDoc = {
    id: Date.now().toString(),
    title,
    description,
    category,
    filename: req.file.filename,
    originalName: req.file.originalname,
    filepath: req.file.path,
    size: (req.file.size / (1024 * 1024)).toFixed(2) + ' MB',
    uploadDate: new Date().toISOString().split('T')[0]
  };
  
  companies[companyId].pdfs.push(pdfDoc);
  
  // Save data to file
  saveData();
  
  console.log(`📄 PDF added for ${companyId}:`, { title, category, filename: req.file.filename });
  
  res.json({
    success: true,
    message: 'PDF document uploaded successfully',
    pdf: pdfDoc
  });
});

app.get('/api/company/:companyId/pdfs', (req, res) => {
  const { companyId } = req.params;
  
  if (!companies[companyId]) {
    return res.status(404).json({ error: 'Company not found' });
  }
  
  res.json({
    success: true,
    pdfs: companies[companyId].pdfs
  });
});

app.delete('/api/company/:companyId/pdfs/:pdfId', (req, res) => {
  const { companyId, pdfId } = req.params;
  
  if (!companies[companyId]) {
    return res.status(404).json({ error: 'Company not found' });
  }
  
  const pdfIndex = companies[companyId].pdfs.findIndex(p => p.id === pdfId);
  
  if (pdfIndex === -1) {
    return res.status(404).json({ error: 'PDF document not found' });
  }
  
  // Delete the actual file from storage
  const pdfDoc = companies[companyId].pdfs[pdfIndex];
  if (pdfDoc.filepath && fs.existsSync(pdfDoc.filepath)) {
    try {
      fs.unlinkSync(pdfDoc.filepath);
      console.log(`🗑️ PDF file deleted: ${pdfDoc.filepath}`);
    } catch (error) {
      console.error('Error deleting PDF file:', error);
    }
  }
  
  companies[companyId].pdfs.splice(pdfIndex, 1);
  
  // Save data to file
  saveData();
  
  console.log(`🗑️ PDF deleted for ${companyId}:`, pdfId);
  
  res.json({
    success: true,
    message: 'PDF document deleted successfully'
  });
});

// PDF File Serving Endpoint
app.get('/api/company/:companyId/pdfs/:pdfId/file', (req, res) => {
    const { companyId, pdfId } = req.params;
    
    if (!companies[companyId]) {
        return res.status(404).json({ error: 'Company not found' });
    }

    const pdf = companies[companyId].pdfs.find(p => p.id === pdfId);
    if (!pdf) {
        return res.status(404).json({ error: 'PDF not found' });
    }

    const filePath = pdf.filepath;
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'PDF file not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${pdf.filename}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
});

// Training Materials Management
app.get('/api/company/:companyId/training-materials', (req, res) => {
  const { companyId } = req.params;
  
  if (!companies[companyId]) {
    return res.status(404).json({ error: 'Company not found' });
  }
  
  res.json({
    success: true,
    trainingMaterials: companies[companyId].trainingMaterials || []
  });
});

app.post('/api/company/:companyId/training-materials', (req, res) => {
  const { companyId } = req.params;
  
  if (!companies[companyId]) {
    return res.status(404).json({ error: 'Company not found' });
  }
  
  const { title, description, type, content, category } = req.body;
  
  if (!title || !type) {
    return res.status(400).json({ error: 'Title and type are required' });
  }
  
  const trainingMaterial = {
    id: Date.now().toString(),
    title,
    description: description || '',
    type, // 'video', 'pdf', 'text'
    content: content || '', // For text content or file URL
    category: category || 'General',
    uploadDate: new Date().toISOString().split('T')[0],
    createdBy: 'Admin' // In production, use actual user info
  };
  
  if (!companies[companyId].trainingMaterials) {
    companies[companyId].trainingMaterials = [];
  }
  
  companies[companyId].trainingMaterials.push(trainingMaterial);
  
  // Save data to file
  saveData();
  
  console.log(`📚 Training material added for ${companyId}:`, { title, type });
  
  res.json({
    success: true,
    message: 'Training material added successfully',
    trainingMaterial
  });
});

app.delete('/api/company/:companyId/training-materials/:materialId', (req, res) => {
  const { companyId, materialId } = req.params;
  
  if (!companies[companyId]) {
    return res.status(404).json({ error: 'Company not found' });
  }
  
  const materialIndex = companies[companyId].trainingMaterials.findIndex(m => m.id === materialId);
  
  if (materialIndex === -1) {
    return res.status(404).json({ error: 'Training material not found' });
  }
  
  companies[companyId].trainingMaterials.splice(materialIndex, 1);
  
  // Save data to file
  saveData();
  
  res.json({
    success: true,
    message: 'Training material deleted successfully'
  });
});

// Study Protocol Management
app.get('/api/company/:companyId/study-protocols', (req, res) => {
  const { companyId } = req.params;
  
  if (!companies[companyId]) {
    return res.status(404).json({ error: 'Company not found' });
  }
  
  res.json({
    success: true,
    studyProtocols: companies[companyId].studyProtocols || []
  });
});

app.post('/api/company/:companyId/study-protocols', (req, res) => {
  const { companyId } = req.params;
  
  if (!companies[companyId]) {
    return res.status(404).json({ error: 'Company not found' });
  }
  
  const { title, description, type, content, version } = req.body;
  
  if (!title || !type) {
    return res.status(400).json({ error: 'Title and type are required' });
  }
  
  const studyProtocol = {
    id: Date.now().toString(),
    title,
    description: description || '',
    type, // 'pdf', 'text'
    content: content || '', // For text content or file URL
    version: version || '1.0',
    uploadDate: new Date().toISOString().split('T')[0],
    createdBy: 'Admin' // In production, use actual user info
  };
  
  if (!companies[companyId].studyProtocols) {
    companies[companyId].studyProtocols = [];
  }
  
  companies[companyId].studyProtocols.push(studyProtocol);
  
  // Save data to file
  saveData();
  
  console.log(`📋 Study protocol added for ${companyId}:`, { title, type });
  
  res.json({
    success: true,
    message: 'Study protocol added successfully',
    studyProtocol
  });
});

app.delete('/api/company/:companyId/study-protocols/:protocolId', (req, res) => {
  const { companyId, protocolId } = req.params;
  
  if (!companies[companyId]) {
    return res.status(404).json({ error: 'Company not found' });
  }
  
  const protocolIndex = companies[companyId].studyProtocols.findIndex(p => p.id === protocolId);
  
  if (protocolIndex === -1) {
    return res.status(404).json({ error: 'Study protocol not found' });
  }
  
  companies[companyId].studyProtocols.splice(protocolIndex, 1);
  
  // Save data to file
  saveData();
  
  res.json({
    success: true,
    message: 'Study protocol deleted successfully'
  });
});

// Enrollment Leaderboard Management
app.get('/api/company/:companyId/leaderboard', (req, res) => {
  const { companyId } = req.params;
  
  if (!companies[companyId]) {
    return res.status(404).json({ error: 'Company not found' });
  }
  
  const hospitals = companies[companyId].hospitals || [];
  const totalConsented = hospitals.reduce((sum, h) => sum + h.consentedPatients, 0);
  const totalRandomized = hospitals.reduce((sum, h) => sum + h.randomizedPatients, 0);
  
  res.json({
    success: true,
    hospitals,
    summary: {
      totalConsented,
      totalRandomized,
      totalHospitals: hospitals.length
    }
  });
});

// Get all hospitals for a company
app.get('/api/company/:companyId/hospitals', (req, res) => {
  const { companyId } = req.params;
  
  if (!companies[companyId]) {
    return res.status(404).json({ error: 'Company not found' });
  }
  
  res.json({
    success: true,
    hospitals: companies[companyId].hospitals || []
  });
});

app.post('/api/company/:companyId/hospitals', (req, res) => {
  const { companyId } = req.params;
  const { name, location, principalInvestigator, consentedPatients, randomizedPatients, consentRate } = req.body;
  
  if (!companies[companyId]) {
    return res.status(404).json({ error: 'Company not found' });
  }
  
  if (!name || !location) {
    return res.status(400).json({ error: 'Hospital name and location are required' });
  }
  
  const hospital = {
    id: Date.now().toString(),
    name,
    location,
    principalInvestigator: principalInvestigator || '',
    consentedPatients: parseInt(consentedPatients) || 0,
    randomizedPatients: parseInt(randomizedPatients) || 0,
    consentRate: parseFloat(consentRate) || 0
  };
  
  companies[companyId].hospitals.push(hospital);
  
  // Save data to file
  saveData();
  
  console.log(`🏥 Hospital added for ${companyId}:`, { name, location });
  
  res.json({
    success: true,
    message: 'Hospital added successfully',
    hospital
  });
});

app.put('/api/company/:companyId/hospitals/:hospitalId', (req, res) => {
  const { companyId, hospitalId } = req.params;
  const { name, location, principalInvestigator, consentedPatients, randomizedPatients, consentRate } = req.body;
  
  if (!companies[companyId]) {
    return res.status(404).json({ error: 'Company not found' });
  }
  
  const hospitalIndex = companies[companyId].hospitals.findIndex(h => h.id === hospitalId);
  
  if (hospitalIndex === -1) {
    return res.status(404).json({ error: 'Hospital not found' });
  }
  
  companies[companyId].hospitals[hospitalIndex] = {
    ...companies[companyId].hospitals[hospitalIndex],
    name,
    location,
    principalInvestigator: principalInvestigator || '',
    consentedPatients: parseInt(consentedPatients) || 0,
    randomizedPatients: parseInt(randomizedPatients) || 0,
    consentRate: parseFloat(consentRate) || 0
  };
  
  // Save data to file
  saveData();
  
  console.log(`🏥 Hospital updated for ${companyId}:`, { name, location });
  
  res.json({
    success: true,
    message: 'Hospital updated successfully',
    hospital: companies[companyId].hospitals[hospitalIndex]
  });
});

app.delete('/api/company/:companyId/hospitals/:hospitalId', (req, res) => {
  const { companyId, hospitalId } = req.params;
  
  if (!companies[companyId]) {
    return res.status(404).json({ error: 'Company not found' });
  }
  
  const hospitalIndex = companies[companyId].hospitals.findIndex(h => h.id === hospitalId);
  
  if (hospitalIndex === -1) {
    return res.status(404).json({ error: 'Hospital not found' });
  }
  
  const deletedHospital = companies[companyId].hospitals.splice(hospitalIndex, 1)[0];
  
  // Save data to file
  saveData();
  
  console.log(`🗑️ Hospital deleted for ${companyId}:`, deletedHospital.name);
  
  res.json({
    success: true,
    message: 'Hospital deleted successfully'
  });
});

// Data backup endpoint
app.get('/api/backup', (req, res) => {
  try {
    const backupData = {
      timestamp: new Date().toISOString(),
      companies: companies,
      totalHospitals: Object.values(companies).reduce((sum, company) => sum + (company.hospitals?.length || 0), 0),
      totalUsers: Object.values(companies).reduce((sum, company) => sum + (company.users?.length || 0), 0),
      totalPDFs: Object.values(companies).reduce((sum, company) => sum + (company.pdfs?.length || 0), 0)
    };
    
    res.json({
      success: true,
      message: 'Data backup generated successfully',
      backup: backupData
    });
  } catch (error) {
    console.error('Backup generation error:', error);
    res.status(500).json({ error: 'Failed to generate backup' });
  }
});

// Emergency data export endpoint (for existing data before restart)
app.get('/api/emergency-export', (req, res) => {
  try {
    // Create a backup file immediately
    const backupData = {
      timestamp: new Date().toISOString(),
      note: 'EMERGENCY EXPORT - Save this data before restarting server',
      companies: companies
    };
    
    // Save to a special emergency file
    const emergencyFile = path.join(__dirname, 'emergency-backup.json');
    fs.writeFileSync(emergencyFile, JSON.stringify(backupData, null, 2));
    
    console.log('🚨 Emergency backup created:', emergencyFile);
    
    res.json({
      success: true,
      message: 'Emergency backup created successfully!',
      backupFile: emergencyFile,
      data: backupData,
      instructions: [
        '1. Copy the data below',
        '2. Restart your server',
        '3. The new system will load with default data',
        '4. Use the data below to restore your hospitals'
      ]
    });
  } catch (error) {
    console.error('Emergency export error:', error);
    res.status(500).json({ error: 'Failed to create emergency backup' });
  }
});

// Data restore endpoint (use after restarting with new system)
app.post('/api/restore-data', (req, res) => {
  try {
    const { companies: restoredCompanies } = req.body;
    
    if (!restoredCompanies || typeof restoredCompanies !== 'object') {
      return res.status(400).json({ error: 'Invalid data format' });
    }
    
    // Merge restored data with existing data
    Object.keys(restoredCompanies).forEach(companyId => {
      if (restoredCompanies[companyId]) {
        // Preserve existing data structure but update with restored data
        if (!companies[companyId]) {
          companies[companyId] = {};
        }
        
        // Merge hospitals (preserve existing IDs if possible)
        if (restoredCompanies[companyId].hospitals) {
          companies[companyId].hospitals = restoredCompanies[companyId].hospitals;
        }
        
        // Merge other data
        if (restoredCompanies[companyId].users) {
          companies[companyId].users = restoredCompanies[companyId].users;
        }
        
        if (restoredCompanies[companyId].pdfs) {
          companies[companyId].pdfs = restoredCompanies[companyId].pdfs;
        }
        
        if (restoredCompanies[companyId].news) {
          companies[companyId].news = restoredCompanies[companyId].news;
        }
        
        // Preserve company settings
        if (restoredCompanies[companyId].name) {
          companies[companyId].name = restoredCompanies[companyId].name;
        }
        
        if (restoredCompanies[companyId].primaryColor) {
          companies[companyId].primaryColor = restoredCompanies[companyId].primaryColor;
        }
        
        if (restoredCompanies[companyId].credentials) {
          companies[companyId].credentials = restoredCompanies[companyId].credentials;
        }
        
        if (restoredCompanies[companyId].logoUrl) {
          companies[companyId].logoUrl = restoredCompanies[companyId].logoUrl;
        }
      }
    });
    
    // Save the merged data
    saveData();
    
    res.json({
      success: true,
      message: 'Data restored successfully!',
      restoredCompanies: Object.keys(restoredCompanies),
      totalHospitals: Object.values(companies).reduce((sum, company) => sum + (company.hospitals?.length || 0), 0)
    });
    
  } catch (error) {
    console.error('Data restore error:', error);
    res.status(500).json({ error: 'Failed to restore data' });
  }
});

// Test endpoint for debugging
app.get('/test', (req, res) => {
  res.json({
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    companies: Object.keys(companies),
    endpoints: [
      'GET /health',
      'GET /logos-health',
      'GET /test',
      'GET /api/backup',
      'POST /api/auth/client-login',
      'GET /api/company/:companyId/dashboard',
      'GET /api/company/:companyId/leaderboard',
      'GET /api/company/:companyId/hospitals',
      'POST /api/company/:companyId/hospitals',
      'PUT /api/company/:companyId/hospitals/:hospitalId',
      'DELETE /api/company/:companyId/hospitals/:hospitalId'
    ]
  });
});

// Start server
app.listen(PORT, (err) => {
  if (err) {
    console.error('Error starting server:', err);
    return;
  }
  console.log(`🚀 Multi-tenant server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Client login: http://localhost:${PORT}/api/auth/client-login`);
  console.log(`📱 Mobile app endpoints: http://localhost:${PORT}/api/auth/register`);
  console.log('\n🏢 Available companies:');
  Object.keys(companies).forEach(id => {
    console.log(`   - ${id}: ${companies[id].name}`);
  });
  console.log('\n👤 Demo credentials:');
  Object.keys(companies).forEach(id => {
    const company = companies[id];
    console.log(`   ${company.name}: username: ${company.credentials.username}, password: ${company.credentials.password}`);
  });
  console.log('\nPress Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  process.exit(0);
});
