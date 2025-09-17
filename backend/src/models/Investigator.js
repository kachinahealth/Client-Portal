const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const investigatorSchema = new mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['principal_investigator', 'sub_investigator', 'coordinator', 'admin'],
    default: 'principal_investigator'
  },
  site: {
    siteId: {
      type: String,
      required: true
    },
    siteName: {
      type: String,
      required: true
    },
    siteAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    sitePhone: String,
    siteEmail: String
  },
  credentials: {
    medicalLicense: String,
    specialty: String,
    yearsExperience: Number,
    certifications: [String]
  },
  enrollmentStats: {
    totalConsented: {
      type: Number,
      default: 0
    },
    totalRandomized: {
      type: Number,
      default: 0
    },
    totalScreened: {
      type: Number,
      default: 0
    },
    totalFailed: {
      type: Number,
      default: 0
    },
    lastEnrollment: Date
  },
  appUsage: {
    lastLogin: Date,
    totalLogins: {
      type: Number,
      default: 0
    },
    featureUsage: {
      leaderboard: { type: Number, default: 0 },
      news: { type: Number, default: 0 },
      resources: { type: Number, default: 0 },
      messaging: { type: Number, default: 0 }
    },
    preferences: {
      notifications: { type: Boolean, default: true },
      emailUpdates: { type: Boolean, default: true },
      leaderboardVisibility: { type: Boolean, default: true }
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtual for full name
investigatorSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for enrollment rate
investigatorSchema.virtual('enrollmentRate').get(function() {
  if (this.enrollmentStats.totalConsented === 0) return 0;
  return (this.enrollmentStats.totalRandomized / this.enrollmentStats.totalConsented * 100).toFixed(1);
});

// Pre-save middleware to hash password
investigatorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
investigatorSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update enrollment stats
investigatorSchema.methods.updateEnrollmentStats = function(type, count = 1) {
  if (this.enrollmentStats[type] !== undefined) {
    this.enrollmentStats[type] += count;
    this.enrollmentStats.lastEnrollment = new Date();
  }
  return this.save();
};

// Method to track feature usage
investigatorSchema.methods.trackFeatureUsage = function(feature) {
  if (this.appUsage.featureUsage[feature] !== undefined) {
    this.appUsage.featureUsage[feature]++;
  }
  return this.save();
};

// Method to update login analytics
investigatorSchema.methods.updateLoginAnalytics = function() {
  this.appUsage.lastLogin = new Date();
  this.appUsage.totalLogins++;
  return this.save();
};

// Static method to find by tenant
investigatorSchema.statics.findByTenant = function(tenantId) {
  return this.find({ tenantId, status: 'active' });
};

// Static method to find by site
investigatorSchema.statics.findBySite = function(tenantId, siteId) {
  return this.find({ tenantId, 'site.siteId': siteId, status: 'active' });
};

// Static method to get leaderboard data
investigatorSchema.statics.getLeaderboard = function(tenantId, limit = 10) {
  return this.find({ tenantId, status: 'active' })
    .sort({ 'enrollmentStats.totalRandomized': -1 })
    .limit(limit)
    .select('firstName lastName site enrollmentStats');
};

module.exports = mongoose.model('Investigator', investigatorSchema);
