const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

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

function createStoredFileName(originalName) {
  return `${Date.now()}-${crypto.randomUUID()}-${sanitizeFileName(originalName)}`;
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

module.exports = {
  STORAGE_DIR,
  ensureStorageDir,
  sanitizeFileName,
  createStoredFileName,
  fileExists,
};