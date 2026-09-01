const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const documentsRepository = require('../repositories/documents.repository');

const STORAGE_DIR = process.env.DMS_STORAGE_DIR || path.join(__dirname, '..', '..', 'storage');

function ensureStorageDir() {
  try {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  } catch (error) {
    const storageError = new Error('Não foi possível preparar o diretório de armazenamento local.');
    storageError.code = 'STORAGE_ERROR';
    throw storageError;
  }
}

function sanitizeFileName(value) {
  const originalName = String(value || 'arquivo');
  return path.basename(originalName).replace(/[^a-zA-Z0-9_.-]/g, '_');
}

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

  ensureStorageDir();

  const id = crypto.randomUUID();
  const originalName = sanitizeFileName(file.originalname);
  const resolvedStoredPath = file.path ? String(file.path) : path.join(STORAGE_DIR, `${Date.now()}-${crypto.randomUUID()}-${originalName}`);
  const storedName = path.basename(resolvedStoredPath);

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

  if (!fs.existsSync(document.storedPath)) {
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
  STORAGE_DIR,
};
