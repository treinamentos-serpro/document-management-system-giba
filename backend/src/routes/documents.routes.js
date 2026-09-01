const express = require('express');
const multer = require('multer');
const documentsController = require('../controllers/documents.controller');
const storageService = require('../services/storage.service');

const router = express.Router();
storageService.ensureStorageDir();

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, storageService.STORAGE_DIR);
  },
  filename: (req, file, callback) => {
    callback(null, storageService.createStoredFileName(file.originalname));
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
