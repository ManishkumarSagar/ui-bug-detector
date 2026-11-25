const mongoose = require('mongoose');

const bugSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scan', required: true },
    title: { type: String, required: true },
    category: { type: String, default: 'Layout' },
    severity: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Low'
    },
    description: { type: String, default: '' },
    suggestion: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Open', 'Resolved', 'Dismissed'],
      default: 'Open'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bug', bugSchema);