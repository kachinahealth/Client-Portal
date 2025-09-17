const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  tenantId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['press_release', 'fda_update', 'publication', 'trial_update', 'general', 'training'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  media: {
    images: [{
      url: String,
      altText: String,
      caption: String
    }],
    videos: [{
      url: String,
      title: String,
      duration: Number
    }],
    documents: [{
      url: String,
      title: String,
      fileType: String,
      fileSize: Number
    }]
  },
  publishing: {
    isPublished: {
      type: Boolean,
      default: false
    },
    publishedAt: Date,
    publishedBy: String,
    scheduledFor: Date,
    expiresAt: Date
  },
  targeting: {
    sites: [String], // Specific sites to target
    roles: [String], // Specific roles to target
    investigators: [String], // Specific investigator IDs
    isGlobal: {
      type: Boolean,
      default: true
    }
  },
  engagement: {
    views: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    comments: [{
      investigatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Investigator'
      },
      text: String,
      date: Date
    }]
  },
  seo: {
    keywords: [String],
    metaDescription: String,
    slug: String
  },
  tags: [String],
  author: {
    name: String,
    email: String,
    role: String
  }
}, {
  timestamps: true
});

// Virtual for read time (estimated)
newsSchema.virtual('readTime').get(function() {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(' ').length;
  return Math.ceil(wordCount / wordsPerMinute);
});

// Virtual for engagement rate
newsSchema.virtual('engagementRate').get(function() {
  if (this.engagement.views === 0) return 0;
  return ((this.engagement.likes + this.engagement.shares) / this.engagement.views * 100).toFixed(1);
});

// Pre-save middleware to generate summary
newsSchema.pre('save', function(next) {
  if (!this.summary && this.content) {
    this.summary = this.content.substring(0, 150) + '...';
  }
  next();
});

// Method to track view
newsSchema.methods.trackView = function() {
  this.engagement.views++;
  return this.save();
};

// Method to track share
newsSchema.methods.trackShare = function() {
  this.engagement.shares++;
  return this.save();
};

// Method to add comment
newsSchema.methods.addComment = function(investigatorId, text) {
  this.engagement.comments.push({
    investigatorId,
    text,
    date: new Date()
  });
  return this.save();
};

// Method to publish
newsSchema.methods.publish = function(publishedBy) {
  this.publishing.isPublished = true;
  this.publishing.publishedAt = new Date();
  this.publishing.publishedBy = publishedBy;
  return this.save();
};

// Static method to get published news
newsSchema.statics.getPublished = function(tenantId, limit = 10) {
  return this.find({
    tenantId,
    'publishing.isPublished': true,
    $or: [
      { 'publishing.expiresAt': { $exists: false } },
      { 'publishing.expiresAt': { $gt: new Date() } }
    ]
  })
  .sort({ 'publishing.publishedAt': -1 })
  .limit(limit);
};

// Static method to get news by category
newsSchema.statics.getByCategory = function(tenantId, category, limit = 10) {
  return this.find({
    tenantId,
    category,
    'publishing.isPublished': true
  })
  .sort({ 'publishing.publishedAt': -1 })
  .limit(limit);
};

// Static method to get trending news
newsSchema.statics.getTrending = function(tenantId, limit = 5) {
  return this.find({
    tenantId,
    'publishing.isPublished': true
  })
  .sort({ 'engagement.views': -1 })
  .limit(limit);
};

module.exports = mongoose.model('News', newsSchema);
