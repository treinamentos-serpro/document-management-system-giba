const documents = new Map();

function create(document) {
  if (!document || !document.id) {
    throw new Error('Documento inválido para persistência.');
  }

  const record = { ...document };
  documents.set(record.id, record);
  return { ...record };
}

function findById(id) {
  const document = documents.get(id);
  return document ? { ...document } : null;
}

function list({ owner } = {}) {
  const allDocuments = Array.from(documents.values()).map((document) => ({ ...document }));

  if (!owner) {
    return allDocuments;
  }

  return allDocuments.filter((document) => document.owner === owner);
}

function reset() {
  documents.clear();
}

module.exports = {
  create,
  findById,
  list,
  reset,
};
