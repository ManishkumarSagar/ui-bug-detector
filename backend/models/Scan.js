const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    websiteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Website', required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    viewport: {
      width: { type: Number, default: 1366 },
      height: { type: Number, default: 768 }
    },
    browser: { type: String, default: 'chromium' },
    referenceImage: String,
    actualImage: String,
    differenceImage: String,
    diffPixels: { type: Number, default: 0 },
    totalPixels: { type: Number, default: 0 },
    error: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('Scan', scanSchema);