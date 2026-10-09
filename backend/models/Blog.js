const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 160 },
  excerpt: { type: String, default: '', trim: true, maxlength: 500 },
  contentHtml: { type: String, required: true, default: '' },
  featuredImage: { type: String, default: '' },
  imageAlt: { type: String, default: '', maxlength: 250 },
  category: { type: String, default: 'Fabric Knowledge', trim: true, maxlength: 80 },
  authorName: { type: String, default: 'Bhavya Fabrics', trim: true, maxlength: 120 },
  metaTitle: { type: String, default: '', trim: true, maxlength: 70 },
  metaDescription: { type: String, default: '', trim: true, maxlength: 200 },
  canonicalUrl: { type: String, default: '', trim: true },
  schemaMarkup: { type: mongoose.Schema.Types.Mixed, default: null },
  status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
  publishedAt: { type: Date, default: null },
}, { timestamps: true });

blogSchema.index({ status: 1, publishedAt: -1 });
module.exports = mongoose.models.Blog || mongoose.model('Blog', blogSchema);
