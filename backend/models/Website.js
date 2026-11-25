const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Website', websiteSchema);