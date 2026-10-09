const mongoose = require('mongoose');
const catalogueSchema = new mongoose.Schema({
  title: { type: String, default: 'Bulk Fabric Catalogue', trim: true },
  key: { type: String, required: true },
  fileName: { type: String, required: true },
  contentType: { type: String, default: 'application/pdf' },
  isActive: { type: Boolean, default: true },
  uploadedBy: { type: String, default: 'admin' },
}, { timestamps: true });
catalogueSchema.index({ isActive: 1, createdAt: -1 });
module.exports = mongoose.models.Catalogue || mongoose.model('Catalogue', catalogueSchema);
