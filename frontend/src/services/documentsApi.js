// Cliente HTTP para a API de documentos, consumida via prefixo /api (proxy do Vite).

const API_BASE = '/api';

async function parseJsonResponse(response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = (data && data.error && data.error.message) || 'Erro ao comunicar com o servidor.';
    throw new Error(message);
  }

  return data;
}

export async function uploadDocument({ file, owner }) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('owner', owner);

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });

  return parseJsonResponse(response);
}

export async function fetchDocuments(owner) {
  const query = owner ? `?owner=${encodeURIComponent(owner)}` : '';
  const response = await fetch(`${API_BASE}/documents${query}`);
  const data = await parseJsonResponse(response);
  return data.documents;
}

export function getDownloadUrl(documentId) {
  return `${API_BASE}/documents/${documentId}/download`;
}
