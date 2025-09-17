const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    index: true
  },
  patientId: {
    type: String,
    required: true,
    unique: true
  },
  siteId: {
    type: String,
    required: true,
    index: true
  },
  investigatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investigator',
    required: true
  },
  status: {
    type: String,
    enum: ['screened', 'consented', 'randomized', 'failed_screening', 'withdrawn', 'completed'],
    default: 'screened'
  },
  dates: {
    screened: Date,
    consented: Date,
    randomized: Date,
    completed: Date,
    withdrawn: Date
  },
  screening: {
    age: Number,
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    height: Number, // cm
    weight: Number, // kg
    bmi: Number,
    medicalHistory: [String],
    medications: [String],
    exclusionCriteria: [String],
    inclusionCriteria: [String]
  },
  randomization: {
    group: {
      type: String,
      enum: ['treatment', 'control', 'sham']
    },
    randomizationDate: Date,
    randomizationNumber: String
  },
  followUp: {
    visits: [{
      visitNumber: Number,
      visitDate: Date,
      completed: Boolean,
      notes: String,
      data: mongoose.Schema.Types.Mixed
    }],
    adverseEvents: [{
      event: String,
      severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe']
      },
      date: Date,
      resolved: Boolean,
      notes: String
    }]
  },
  notes: [{
    text: String,
    author: String,
    date: Date,
    type: {
      type: String,
      enum: ['general', 'screening', 'randomization', 'followup', 'adverse_event']
    }
  }],
  dataQuality: {
    isComplete: {
      type: Boolean,
      default: false
    },
    missingFields: [String],
    lastReviewed: Date,
    reviewedBy: String
  }
}, {
  timestamps: true
});

// Virtual for patient age
enrollmentSchema.virtual('patientAge').get(function() {
  if (!this.screening.age) return null;
  return this.screening.age;
});

// Virtual for BMI
enrollmentSchema.virtual('calculatedBMI').get(function() {
  if (!this.screening.height || !this.screening.weight) return null;
  const heightInMeters = this.screening.height / 100;
  return (this.screening.weight / (heightInMeters * heightInMeters)).toFixed(1);
});

// Pre-save middleware to calculate BMI
enrollmentSchema.pre('save', function(next) {
  if (this.screening.height && this.screening.weight && !this.screening.bmi) {
    const heightInMeters = this.screening.height / 100;
    this.screening.bmi = this.screening.weight / (heightInMeters * heightInMeters);
  }
  next();
});

// Method to update status
enrollmentSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  if (newStatus === 'screened') this.dates.screened = new Date();
  if (newStatus === 'consented') this.dates.consented = new Date();
  if (newStatus === 'randomized') this.dates.randomized = new Date();
  if (newStatus === 'completed') this.dates.completed = new Date();
  if (newStatus === 'withdrawn') this.dates.withdrawn = new Date();

  return this.save();
};

// Method to add note
enrollmentSchema.methods.addNote = function(text, author, type = 'general') {
  this.notes.push({
    text,
    author,
    date: new Date(),
    type
  });
  return this.save();
};

// Method to add adverse event
enrollmentSchema.methods.addAdverseEvent = function(event, severity, notes = '') {
  this.followUp.adverseEvents.push({
    event,
    severity,
    date: new Date(),
    resolved: false,
    notes
  });
  return this.save();
};

// Static method to get site statistics
enrollmentSchema.statics.getSiteStats = function(tenantId, siteId) {
  return this.aggregate([
    { $match: { tenantId, siteId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Static method to get investigator statistics
enrollmentSchema.statics.getInvestigatorStats = function(tenantId, investigatorId) {
  return this.aggregate([
    { $match: { tenantId, investigatorId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Static method to get trial statistics
enrollmentSchema.statics.getTrialStats = function(tenantId) {
  return this.aggregate([
    { $match: { tenantId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Static method to get enrollment trends
enrollmentSchema.statics.getEnrollmentTrends = function(tenantId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    { $match: { tenantId, createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          status: '$status'
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.date': 1 } }
  ]);
};

module.exports = mongoose.model('Enrollment', enrollmentSchema);
