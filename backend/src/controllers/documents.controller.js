const documentsService = require('../services/documents.service');

function sendJsonError(res, status, code, message) {
  return res.status(status).json({
    error: {
      code,
      message,
    },
  });
}

function upload(req, res) {
  try {
    const document = documentsService.createDocument({
      file: req.file,
      owner: req.body && req.body.owner,
    });

    return res.status(201).json(document);
  } catch (error) {
    if (error.code === 'VALIDATION_ERROR') {
      return sendJsonError(res, 400, 'VALIDATION_ERROR', error.message);
    }

    if (error.code === 'STORAGE_ERROR') {
      return sendJsonError(res, 500, 'STORAGE_ERROR', 'Não foi possível gravar o documento no armazenamento local.');
    }

    return sendJsonError(res, 500, 'STORAGE_ERROR', 'Erro inesperado ao processar o upload.');
  }
}

function listDocuments(req, res) {
  try {
    const owner = req.query && req.query.owner ? String(req.query.owner).trim() : undefined;
    const documents = documentsService.listDocuments(owner);

    return res.status(200).json({ documents });
  } catch (error) {
    return sendJsonError(res, 500, 'STORAGE_ERROR', 'Não foi possível listar os documentos.');
  }
}

function downloadDocument(req, res) {
  try {
    const document = documentsService.getDocumentForDownload(req.params.id);

    res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${String(document.originalName || 'documento').replace(/"/g, '\\"')}"`);

    return res.sendFile(document.storedPath);
  } catch (error) {
    if (error.code === 'DOCUMENT_NOT_FOUND') {
      return sendJsonError(res, 404, 'DOCUMENT_NOT_FOUND', 'Documento não encontrado.');
    }

    if (error.code === 'FILE_UNAVAILABLE') {
      return sendJsonError(res, 500, 'FILE_UNAVAILABLE', 'O arquivo físico não está disponível.');
    }

    return sendJsonError(res, 500, 'FILE_UNAVAILABLE', 'Erro inesperado ao baixar o documento.');
  }
}

module.exports = {
  upload,
  listDocuments,
  downloadDocument,
};
