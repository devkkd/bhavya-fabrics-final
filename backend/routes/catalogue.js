const express = require('express');
const multer = require('multer');
const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const adminAuth = require('../middleware/adminAuth');
const customerAuth = require('../middleware/customerAuth');
const Catalogue = require('../models/Catalogue');
const { r2Client, R2_BUCKET } = require('../config/r2');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  const isPdf = file.mimetype === 'application/pdf' && file.originalname.toLowerCase().endsWith('.pdf');
  cb(isPdf ? null : new Error('Only PDF catalogue files are allowed'), isPdf);
}});
router.get('/active', async (req, res, next) => {
  try { const item = await Catalogue.findOne({ isActive: true }).sort({ createdAt: -1 }).select('title fileName createdAt');
    res.json({ success: true, data: item || null });
  } catch (e) { next(e); }
});
router.get('/download', customerAuth, async (req, res, next) => {
  try {
    const item = await Catalogue.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!item) return res.status(404).json({ success: false, message: 'Catalogue is not available yet.' });
    const object = await r2Client.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: item.key }));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${String(item.fileName).replace(/[\r\n"\\]/g, '')}"`);
    res.setHeader('Cache-Control', 'private, no-store');
    if (object.ContentLength) res.setHeader('Content-Length', object.ContentLength);
    object.Body.pipe(res);
  } catch (e) { next(e); }
});
router.get('/admin', adminAuth, async (req, res, next) => {
  try { res.json({ success: true, data: await Catalogue.find().sort({ createdAt: -1 }).limit(30) }); } catch (e) { next(e); }
});
router.post('/admin', adminAuth, upload.single('catalogue'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Choose a PDF catalogue.' });
    const key = `catalogues/${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
    await r2Client.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: req.file.buffer, ContentType: 'application/pdf', ContentLength: req.file.size }));
    await Catalogue.updateMany({ isActive: true }, { $set: { isActive: false } });
    const item = await Catalogue.create({ title: (req.body.title || 'Bulk Fabric Catalogue').slice(0, 120), key, fileName: req.file.originalname.replace(/[\r\n"\\]/g, ''), isActive: true, uploadedBy: req.admin?.email || 'admin' });
    res.status(201).json({ success: true, data: item, message: 'Catalogue uploaded and activated.' });
  } catch (e) { next(e); }
});
router.patch('/admin/:id/activate', adminAuth, async (req, res, next) => {
  try { const item = await Catalogue.findById(req.params.id); if (!item) return res.status(404).json({ success: false, message: 'Catalogue not found.' }); await Catalogue.updateMany({}, { $set: { isActive: false } }); item.isActive = true; await item.save(); res.json({ success: true, data: item }); } catch (e) { next(e); }
});
module.exports = router;
