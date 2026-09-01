const { test, beforeEach } = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');
const documentsRepository = require('../src/repositories/documents.repository');

async function startServer() {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();

  return {
    server,
    baseUrl: `http://127.0.0.1:${port}`,
  };
}

beforeEach(() => {
  documentsRepository.reset();
});

test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('deve fazer upload, listar e baixar um documento', async () => {
  const { server, baseUrl } = await startServer();

  try {
    const uploadResponse = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      body: (() => {
        const formData = new FormData();
        formData.append('owner', 'usuario-123');
        formData.append('file', new Blob(['conteudo do arquivo'], { type: 'text/plain' }), 'relatorio.txt');
        return formData;
      })(),
    });

    assert.strictEqual(uploadResponse.status, 201, 'upload deve retornar 201');
    const uploadedDocument = await uploadResponse.json();
    assert.strictEqual(uploadedDocument.owner, 'usuario-123');
    assert.strictEqual(uploadedDocument.originalName, 'relatorio.txt');
    assert.ok(uploadedDocument.id, 'deve existir um id');

    const listResponse = await fetch(`${baseUrl}/documents?owner=usuario-123`);
    assert.strictEqual(listResponse.status, 200, 'listagem deve retornar 200');
    const listData = await listResponse.json();
    assert.strictEqual(listData.documents.length, 1, 'deve listar um documento');
    assert.strictEqual(listData.documents[0].id, uploadedDocument.id);

    const downloadResponse = await fetch(`${baseUrl}/documents/${uploadedDocument.id}/download`);
    assert.strictEqual(downloadResponse.status, 200, 'download deve retornar 200');
    const content = await downloadResponse.text();
    assert.strictEqual(content, 'conteudo do arquivo');
    assert.match(downloadResponse.headers.get('content-type'), /text\/plain/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('deve rejeitar upload sem arquivo ou owner', async () => {
  const { server, baseUrl } = await startServer();

  try {
    const response = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      body: (() => {
        const formData = new FormData();
        formData.append('owner', '   ');
        return formData;
      })(),
    });

    assert.strictEqual(response.status, 400, 'upload inválido deve retornar 400');
    const payload = await response.json();
    assert.strictEqual(payload.error.code, 'VALIDATION_ERROR');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('deve listar todos os documentos e filtrar por dono', async () => {
  const { server, baseUrl } = await startServer();

  try {
    for (const owner of ['usuario-123', 'usuario-456']) {
      const formData = new FormData();
      formData.append('owner', owner);
      formData.append('file', new Blob([owner], { type: 'text/plain' }), `${owner}.txt`);

      const uploadResponse = await fetch(`${baseUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      assert.strictEqual(uploadResponse.status, 201, 'upload deve retornar 201');
    }

    const listResponse = await fetch(`${baseUrl}/documents`);
    const listData = await listResponse.json();
    assert.strictEqual(listResponse.status, 200, 'listagem deve retornar 200');
    assert.strictEqual(listData.documents.length, 2, 'deve listar todos os documentos');

    const filteredResponse = await fetch(`${baseUrl}/documents?owner=usuario-123`);
    const filteredData = await filteredResponse.json();
    assert.strictEqual(filteredResponse.status, 200, 'listagem filtrada deve retornar 200');
    assert.deepStrictEqual(filteredData.documents.map((document) => document.owner), ['usuario-123']);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('deve baixar o arquivo com o nome original no cabeçalho', async () => {
  const { server, baseUrl } = await startServer();

  try {
    const formData = new FormData();
    formData.append('owner', 'usuario-123');
    formData.append('file', new Blob(['conteudo'], { type: 'text/plain' }), 'arquivo.txt');

    const uploadResponse = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      body: formData,
    });
    const uploadedDocument = await uploadResponse.json();

    const downloadResponse = await fetch(`${baseUrl}/documents/${uploadedDocument.id}/download`);
    assert.strictEqual(downloadResponse.status, 200, 'download deve retornar 200');
    assert.match(downloadResponse.headers.get('content-disposition'), /attachment; filename="arquivo.txt"/);
    assert.strictEqual(await downloadResponse.text(), 'conteudo');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('deve retornar 404 ao buscar download de documento inexistente', async () => {
  const { server, baseUrl } = await startServer();

  try {
    const response = await fetch(`${baseUrl}/documents/nao-existe/download`);
    assert.strictEqual(response.status, 404, 'documento inexistente deve retornar 404');
    const payload = await response.json();
    assert.strictEqual(payload.error.code, 'DOCUMENT_NOT_FOUND');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
