const mongoose = require('mongoose');
const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  role: { type: String, default: '', trim: true, maxlength: 180 },
  quote: { type: String, required: true, trim: true, maxlength: 2000 },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  isPublished: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });
module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);
