const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const Website = require('../models/Website');
const Scan = require('../models/Scan');
const Bug = require('../models/Bug');

const { captureScreenshot, ensureBaseline } = require('../services/capture');
const { compareImages } = require('../services/compare');
const { highlightDifferences } = require('../services/highlight');
const { analyzeVisualDiff } = require('../services/visionAI');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

exports.list = async (req, res, next) => {
  try {
    const scans = await Scan.find({ userId: req.userId })
      .populate('websiteId', 'name url')
      .sort({ createdAt: -1 });
    res.json(scans);
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid scan id' });
    }

    const scan = await Scan.findOne({
      _id: req.params.id,
      userId: req.userId
    }).populate('websiteId', 'name url');

    if (!scan) return res.status(404).json({ message: 'Scan not found' });

    const bugs = await Bug.find({ scanId: scan._id });

    res.json({
      ...scan.toObject(),
      referenceImage: `${baseUrl(req)}/uploads/${scan.referenceImage}`,
      actualImage: `${baseUrl(req)}/uploads/${scan.actualImage}`,
      differenceImage: `${baseUrl(req)}/uploads/${scan.differenceImage}`,
      bugs
    });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { websiteId, viewport = {}, browser = 'chromium' } = req.body;

    const website = await Website.findOne({ _id: websiteId, userId: req.userId });
    if (!website) return res.status(404).json({ message: 'Website not found' });

    const id = crypto.randomBytes(8).toString('hex');
    const refFile = `ref-${id}.png`;
    const actFile = `act-${id}.png`;
    const diffRawFile = `diff-raw-${id}.png`;
    const diffFile = `diff-${id}.png`;

    const refPath = path.join(UPLOAD_DIR, refFile);
    const actPath = path.join(UPLOAD_DIR, actFile);
    const diffRawPath = path.join(UPLOAD_DIR, diffRawFile);
    const diffPath = path.join(UPLOAD_DIR, diffFile);

    const scan = await Scan.create({
      userId: req.userId,
      websiteId: website._id,
      status: 'processing',
      viewport: {
        width: Number(viewport.width) || 1366,
        height: Number(viewport.height) || 768
      },
      browser
    });

    try {
      await captureScreenshot(website.url, actPath, {
        width: scan.viewport.width,
        height: scan.viewport.height,
        browserName: browser
      });

      const isFirst = ensureBaseline(refPath, actPath);
      if (isFirst) {
        fs.copyFileSync(actPath, diffPath);
        scan.status = 'completed';
        scan.referenceImage = refFile;
        scan.actualImage = actFile;
        scan.differenceImage = diffFile;
        scan.diffPixels = 0;
        scan.totalPixels = scan.viewport.width * scan.viewport.height;
        await scan.save();
        return res.status(201).json({
          ...scan.toObject(),
          bugs: [],
          message: 'Baseline created'
        });
      }

      const stats = compareImages(refPath, actPath, diffRawPath);
      await highlightDifferences(diffRawPath, diffPath);

      const issues = await analyzeVisualDiff({
        refPath,
        actPath,
        diffPath,
        diffPercent: stats.diffPercent
      });

      const bugDocs = issues.length
        ? await Bug.insertMany(
            issues.map((i) => ({
              userId: req.userId,
              scanId: scan._id,
              title: i.title || 'Visual issue',
              category: i.category || 'Layout',
              severity: ['Critical', 'High', 'Medium', 'Low'].includes(i.severity)
                ? i.severity
                : 'Low',
              description: i.description || '',
              suggestion: i.suggestion || ''
            }))
          )
        : [];

      scan.status = 'completed';
      scan.referenceImage = refFile;
      scan.actualImage = actFile;
      scan.differenceImage = diffFile;
      scan.diffPixels = stats.diffPixels;
      scan.totalPixels = stats.totalPixels;
      await scan.save();

      res.status(201).json({
        ...scan.toObject(),
        referenceImage: `${baseUrl(req)}/uploads/${refFile}`,
        actualImage: `${baseUrl(req)}/uploads/${actFile}`,
        differenceImage: `${baseUrl(req)}/uploads/${diffFile}`,
        bugs: bugDocs
      });
    } catch (err) {
      scan.status = 'failed';
      scan.error = err.message;
      await scan.save();
      return res.status(500).json({ message: err.message });
    }
  } catch (err) {
    next(err);
  }
};

function baseUrl(req) {
  return `${req.protocol}://${req.get('host')}`;
}