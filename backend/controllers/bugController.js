const Bug = require('../models/Bug');

exports.list = async (req, res, next) => {
  try {
    const bugs = await Bug.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(bugs);
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const bug = await Bug.findOne({ _id: req.params.id, userId: req.userId });
    if (!bug) return res.status(404).json({ message: 'Bug not found' });
    res.json(bug);
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Open', 'Resolved', 'Dismissed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const bug = await Bug.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { status },
      { new: true }
    );
    if (!bug) return res.status(404).json({ message: 'Bug not found' });
    res.json(bug);
  } catch (err) {
    next(err);
  }
};