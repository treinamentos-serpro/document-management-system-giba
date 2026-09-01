const crypto = require('node:crypto');
const documentsRepository = require('../repositories/documents.repository');
const storageService = require('./storage.service');

function toPublicDocument(document) {
  if (!document) {
    return null;
  }

  const { storedName, storedPath, ...publicDocument } = document;
  return publicDocument;
}

function createDocument({ file, owner }) {
  if (!file) {
    const validationError = new Error('O arquivo enviado é obrigatório.');
    validationError.code = 'VALIDATION_ERROR';
    throw validationError;
  }

  const normalizedOwner = String(owner || '').trim();
  if (!normalizedOwner) {
    const validationError = new Error('O campo owner é obrigatório.');
    validationError.code = 'VALIDATION_ERROR';
    throw validationError;
  }

  const id = crypto.randomUUID();
  const originalName = storageService.sanitizeFileName(file.originalname);
  const resolvedStoredPath = String(file.path);
  const storedName = String(file.filename || storageService.createStoredFileName(originalName));

  const document = {
    id,
    originalName,
    storedName,
    mimeType: file.mimetype || 'application/octet-stream',
    size: Number(file.size) || 0,
    uploadedAt: new Date().toISOString(),
    owner: normalizedOwner,
    storedPath: resolvedStoredPath,
  };

  return toPublicDocument(documentsRepository.create(document));
}

function listDocuments(owner) {
  const normalizedOwner = owner ? String(owner).trim() : undefined;
  return documentsRepository.list(normalizedOwner ? { owner: normalizedOwner } : undefined).map(toPublicDocument);
}

function getDocumentById(id) {
  return documentsRepository.findById(id);
}

function getDocumentForDownload(id) {
  const document = documentsRepository.findById(id);

  if (!document) {
    const notFoundError = new Error('Documento não encontrado.');
    notFoundError.code = 'DOCUMENT_NOT_FOUND';
    throw notFoundError;
  }

  if (!storageService.fileExists(document.storedPath)) {
    const unavailableError = new Error('O arquivo físico não está disponível.');
    unavailableError.code = 'FILE_UNAVAILABLE';
    throw unavailableError;
  }

  return document;
}

module.exports = {
  createDocument,
  listDocuments,
  getDocumentById,
  getDocumentForDownload,
};
