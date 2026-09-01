# Especificação - Document Management System

## 1. Objetivo

Permitir que usuários enviem, consultem e baixem documentos, com arquivos gravados localmente e metadados mantidos em memória durante a execução da aplicação.

## 2. Escopo

### Dentro do escopo

- Upload de um arquivo por requisição.
- Registro de metadados do documento, incluindo o identificador simples do usuário dono.
- Listagem de todos os documentos registrados, com filtro opcional por dono.
- Download de um documento pelo identificador.
- Armazenamento físico local em `backend/storage`.
- Interface React que consome a API por meio do prefixo `/api` durante o desenvolvimento.

### Fora do escopo

- Autenticação, sessão e autorização de usuários.
- Banco de dados ou persistência dos metadados após reinicialização do processo.
- Armazenamento externo, em nuvem ou serviço de terceiros.
- Versionamento, edição, exclusão ou compartilhamento de documentos.
- Busca textual, pré-visualização, antivírus e classificação de documentos.
- Upload de múltiplos arquivos na mesma requisição.

## 3. Atores e premissas

| Ator | Responsabilidade |
| --- | --- |
| Usuário | Informa seu identificador simples, envia arquivos, lista documentos e solicita downloads. |
| Aplicação cliente | Envia requisições HTTP ao backend usando o prefixo `/api`. |
| Backend DMS | Valida entradas, grava arquivos localmente, mantém metadados em memória e entrega downloads. |

- `owner` é um identificador textual simples, fornecido pelo cliente no upload. Ele identifica o dono nos metadados, mas não constitui autenticação nem controle de acesso.
- Como não há autenticação nesta fase, qualquer cliente pode listar sem filtro e baixar um documento cujo identificador conheça.
- O diretório de armazenamento deve existir ou ser criado na inicialização/configuração do backend antes de receber uploads.

## 4. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O sistema deve aceitar o envio de um único arquivo em `multipart/form-data`. |
| RF-02 | O sistema deve exigir o campo textual `owner` no upload e associá-lo ao documento criado. |
| RF-03 | O sistema deve gerar um identificador único para cada documento e um nome físico interno que não sobrescreva arquivos existentes. |
| RF-04 | O sistema deve registrar em memória os metadados do arquivo somente após seu armazenamento local ser concluído. |
| RF-05 | O sistema deve retornar os metadados do documento criado após um upload válido. |
| RF-06 | O sistema deve listar os metadados de todos os documentos registrados durante a execução atual. |
| RF-07 | O sistema deve permitir filtrar a listagem pelo campo `owner`. |
| RF-08 | O sistema deve disponibilizar o conteúdo do arquivo para download pelo `id`, preservando o nome original sugerido ao navegador. |
| RF-09 | O sistema deve informar erro quando não houver arquivo no upload, o dono estiver ausente, o identificador não existir ou o arquivo físico não estiver disponível. |

### Fluxo de upload

1. O cliente envia `POST /api/upload` com o arquivo no campo `file` e o campo textual `owner`.
2. A rota encaminha a requisição ao adaptador Multer configurado com `diskStorage` local.
3. O controller valida a presença do arquivo e de `owner` não vazio.
4. O serviço cria os metadados e solicita ao repositório em memória o seu registro.
5. O backend responde com `201 Created` e os metadados do documento.

### Fluxo de listagem

1. O cliente envia `GET /api/documents`, opcionalmente com `?owner=<identificador>`.
2. O backend consulta o repositório em memória.
3. Sem filtro, retorna todos os metadados; com `owner`, retorna somente os documentos cujo dono seja exatamente o valor informado.
4. O backend responde com `200 OK` e uma lista, inclusive quando estiver vazia.

### Fluxo de download

1. O cliente envia `GET /api/documents/:id/download`.
2. O backend localiza os metadados pelo `id` e verifica a disponibilidade do arquivo local associado.
3. Em caso de sucesso, transmite o arquivo com o tipo MIME armazenado e `Content-Disposition: attachment` usando `originalName`.
4. Se os metadados não existirem, retorna `404`; se existirem mas o arquivo físico estiver indisponível, retorna `500`.

## 5. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Os arquivos devem ser gravados exclusivamente no filesystem local, em `backend/storage`, com `multer` e `diskStorage`. |
| RNF-02 | Os metadados devem ser mantidos em memória e devem ser perdidos quando o processo do backend for reiniciado. |
| RNF-03 | Configurações de ambiente, como `PORT` e o diretório de armazenamento, devem ser obtidas por variáveis de ambiente, com valores padrão locais adequados. |
| RNF-04 | O nome físico do arquivo não deve ser derivado diretamente do nome original; deve ser único e seguro contra colisões e travessia de diretórios. |
| RNF-05 | Erros HTTP devem usar um formato JSON consistente, exceto nas respostas binárias de download bem-sucedido. |
| RNF-06 | Falhas de validação, gravação e leitura devem ser tratadas nos limites HTTP/filesystem, sem encerrar o processo do servidor. |
| RNF-07 | O backend deve permanecer em JavaScript CommonJS com Express; o frontend deve permanecer em React com Vite e ESM. |
| RNF-08 | Testes do backend devem usar o runner nativo `node:test` e não depender de serviços externos. |

## 6. Modelo de dados

### DocumentMetadata

| Campo | Tipo | Obrigatório | Origem | Descrição e regra |
| --- | --- | --- | --- | --- |
| `id` | string | Sim | Serviço | Identificador único e imutável do documento. |
| `originalName` | string | Sim | Arquivo enviado | Nome original informado pelo cliente, usado na listagem e no cabeçalho de download. |
| `storedName` | string | Sim | Multer/serviço | Nome físico interno, único e sem componentes de caminho fornecidos pelo cliente. Não deve ser exposto como identificador de download. |
| `mimeType` | string | Sim | Arquivo enviado | Tipo MIME informado pelo upload e usado como tipo de conteúdo do download. |
| `size` | number | Sim | Arquivo enviado | Tamanho do arquivo em bytes; deve ser maior ou igual a zero. |
| `uploadedAt` | string | Sim | Serviço | Data e hora de criação em ISO 8601. |
| `owner` | string | Sim | Campo textual do upload | Identificador simples do usuário dono; não pode ser vazio após remoção de espaços nas extremidades. |

### Regras de persistência

- O repositório de metadados mantém uma coleção em memória indexada por `id` durante a vida do processo.
- O arquivo físico é salvo em `backend/storage` usando `storedName`.
- Um reinício do backend limpa a coleção de metadados; arquivos eventualmente remanescentes em disco não devem ser listados nem baixados sem metadados correspondentes.
- O serviço deve tratar a criação dos metadados como concluída apenas após o upload ter sido gravado com sucesso.

## 7. Contratos de API

### Convenções gerais

- O backend expõe as rotas sem prefixo: `/upload` e `/documents`.
- O frontend usa `/api` nas chamadas: o proxy do Vite remove esse prefixo e encaminha para `http://localhost:3000` no desenvolvimento.
- Respostas JSON usam `Content-Type: application/json`.
- Erros JSON seguem o formato:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Mensagem descritiva em português"
  }
}
```

### POST /upload

**Finalidade:** recebe um arquivo e cria seus metadados.

**Requisição:**

- `Content-Type`: `multipart/form-data`.
- Campo `file`: arquivo obrigatório, único.
- Campo `owner`: texto obrigatório e não vazio.

**Resposta de sucesso - `201 Created`:**

```json
{
  "id": "c4d9c65b-5f23-4a43-b7d1-c72d5fd77268",
  "originalName": "relatorio.pdf",
  "mimeType": "application/pdf",
  "size": 24576,
  "uploadedAt": "2026-09-01T14:30:00.000Z",
  "owner": "usuario-123"
}
```

`storedName` é interno e não integra a resposta pública.

**Erros:**

| Status | Código | Quando ocorre |
| --- | --- | --- |
| `400 Bad Request` | `VALIDATION_ERROR` | O campo `file` não foi enviado ou `owner` está ausente/vazio. |
| `500 Internal Server Error` | `STORAGE_ERROR` | O arquivo não pôde ser gravado no armazenamento local. |

### GET /documents

**Finalidade:** retorna metadados dos documentos da execução atual.

**Parâmetros de query:**

| Parâmetro | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| `owner` | string | Não | Quando informado, filtra por igualdade exata com o dono armazenado. |

**Resposta de sucesso - `200 OK`:**

```json
{
  "documents": [
    {
      "id": "c4d9c65b-5f23-4a43-b7d1-c72d5fd77268",
      "originalName": "relatorio.pdf",
      "mimeType": "application/pdf",
      "size": 24576,
      "uploadedAt": "2026-09-01T14:30:00.000Z",
      "owner": "usuario-123"
    }
  ]
}
```

Uma coleção vazia deve responder `{ "documents": [] }` com `200 OK`.

### GET /documents/:id/download

**Finalidade:** transfere o arquivo associado ao identificador informado.

**Parâmetros de rota:**

| Parâmetro | Tipo | Regra |
| --- | --- | --- |
| `id` | string | Deve corresponder a um metadado existente na execução atual. |

**Resposta de sucesso - `200 OK`:**

- Corpo binário do arquivo.
- `Content-Type`: valor de `mimeType` registrado.
- `Content-Disposition`: `attachment` com o nome de arquivo baseado em `originalName`.

**Erros:**

| Status | Código | Quando ocorre |
| --- | --- | --- |
| `404 Not Found` | `DOCUMENT_NOT_FOUND` | Não há metadados para o `id` informado. |
| `500 Internal Server Error` | `FILE_UNAVAILABLE` | Os metadados existem, mas o arquivo local não pode ser lido ou não existe. |

## 8. Decisões arquiteturais

### Backend

O backend deve adotar Clean Architecture simples, respeitando estritamente a direção de dependências abaixo:

```text
routes -> controllers -> services -> repositories
```

| Camada | Responsabilidades |
| --- | --- |
| `routes/` | Define os endpoints, associa o middleware Multer ao upload e delega aos controllers. Não contém regra de negócio. |
| `controllers/` | Extrai e valida entrada HTTP básica, chama os serviços e converte resultados e erros em respostas HTTP. |
| `services/` | Implementa regras de negócio: cria identificadores, coordena upload/metadados, lista documentos, localiza arquivos e aplica regras de falha. |
| `repositories/` | Mantém metadados em memória e oferece operações de criação, busca por id e listagem/filtro. Não conhece HTTP. |

- A configuração de `multer.diskStorage` pertence à borda de entrada HTTP e aponta para o diretório local configurado.
- O controller não deve acessar diretamente a coleção em memória nem montar caminhos de arquivos.
- O repositório não deve importar Express, Multer ou objetos de requisição/resposta.
- O serviço deve receber dependências necessárias de forma explícita, mantendo a lógica testável sem servidor HTTP.

### Frontend

- `services/` centraliza chamadas `fetch` para `/api/upload`, `/api/documents` e `/api/documents/:id/download`.
- `components/` concentra controles reutilizáveis de upload, listagem e download.
- `pages/` organiza a tela de gestão de documentos e compõe os componentes.
- A interface deve apresentar mensagens de sucesso e erro em português, sem duplicar regras de negócio do backend.

## 9. Plano de execução

1. **Fundação e configuração**: definir as variáveis `PORT` e de diretório de armazenamento, preparar a criação de `backend/storage` e configurar Multer com `diskStorage` e nome físico seguro. Verificar que um upload pode alcançar o diretório local sem serviço externo.
2. **Repositório de metadados**: implementar a coleção em memória e suas operações de registrar, buscar por `id` e listar com filtro opcional de `owner`. Cobrir coleção vazia, busca inexistente e filtro.
3. **Serviços de documentos**: implementar a criação de metadados, listagem e preparação de download usando o repositório. Cobrir unicidade de identificador, validações de domínio e arquivo físico indisponível.
4. **Controllers e rotas**: expor os três contratos HTTP, conectar Multer apenas ao upload e padronizar respostas e erros. Validar manualmente códigos `201`, `200`, `400`, `404` e `500` previstos.
5. **Testes de backend**: ampliar os testes `node:test` para upload válido/inválido, listagem total/filtrada, download válido, documento inexistente e arquivo ausente. Manter os testes isolados de serviços externos.
6. **Frontend**: criar o serviço HTTP e os componentes/página para upload, lista e download, usando exclusivamente o prefixo `/api`. Verificar estados de carregamento, lista vazia, sucesso e mensagens de erro em português.
7. **Integração e revisão**: executar backend e frontend localmente, validar o proxy do Vite, o ciclo completo upload-listagem-download e a limpeza de metadados após reinício. Revisar que não foram introduzidos armazenamento externo, banco de dados ou funcionalidades fora do escopo.