const Website = require('../models/Website');
const Scan = require('../models/Scan');
const Bug = require('../models/Bug');

exports.list = async (req, res, next) => {
  try {
    const sites = await Website.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(sites);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, url } = req.body;
    if (!name || !url) return res.status(400).json({ message: 'Name and URL required' });

    try {
      new URL(url);
    } catch {
      return res.status(400).json({ message: 'Invalid URL' });
    }

    const site = await Website.create({ userId: req.userId, name, url });
    res.status(201).json(site);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const site = await Website.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    if (!site) return res.status(404).json({ message: 'Website not found' });

    const scans = await Scan.find({ websiteId: site._id });
    const scanIds = scans.map((s) => s._id);
    await Bug.deleteMany({ scanId: { $in: scanIds } });
    await Scan.deleteMany({ websiteId: site._id });

    res.json({ message: 'Website deleted' });
  } catch (err) {
    next(err);
  }
};