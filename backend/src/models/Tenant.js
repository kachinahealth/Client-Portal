const mongoose = require('mongoose');
const tenantSchema = new mongoose.Schema({ tenantId: { type: String, required: true, unique: true }, companyName: { type: String, required: true }, trialId: { type: String, required: true }, trialName: { type: String, required: true }, status: { type: String, default: 'active' } });
module.exports = mongoose.model('Tenant', tenantSchema);
