const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const multer = require('multer');
const documentsController = require('../controllers/documents.controller');

const router = express.Router();
const storageDir = process.env.DMS_STORAGE_DIR || path.join(__dirname, '..', '..', 'storage');

fs.mkdirSync(storageDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, storageDir);
  },
  filename: (req, file, callback) => {
    const safeName = path.basename(file.originalname || 'upload').replace(/[^a-zA-Z0-9_.-]/g, '_');
    callback(null, `${Date.now()}-${crypto.randomUUID()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: {
    files: 1,
  },
});

router.post('/upload', upload.single('file'), documentsController.upload);
router.get('/documents', documentsController.listDocuments);
router.get('/documents/:id/download', documentsController.downloadDocument);

module.exports = router;
