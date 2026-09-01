---
description: Aplica Tailwind CSS 3 no frontend do DMS e moderniza a interface de upload, listagem e download.
name: melhorar-ui-tailwind
argument-hint: tema visual desejado (ex. claro e minimalista)
agent: ui-tailwind
---

# Melhorar a UI com Tailwind CSS 3

Modernize o visual do frontend do Document Management System usando **Tailwind CSS 3**,
com um tema **${input:tema:tema visual desejado (ex. claro e minimalista)}**.

## Estado atual

- `frontend/src/App.jsx`: layout com estilo inline, título, upload, mensagem de erro e lista.
- `frontend/src/components/UploadComponent.jsx`: formulário de envio de documento.
- `frontend/src/components/DocumentList.jsx`: tabela sem estilo com nome, dono, tamanho, data e ação.
- `frontend/src/components/DownloadButton.jsx`: botão de download.
- Ainda não existe CSS global nem Tailwind configurado.

## Tarefas

1. Instalar e configurar Tailwind CSS 3 no projeto Vite (`tailwindcss@^3`, `postcss`, `autoprefixer`,
   `tailwind.config.js`, `postcss.config.js`, `src/index.css` importado em `src/main.jsx`).
2. Reestilizar `App.jsx` com cabeçalho, container centralizado e seções bem separadas.
3. Reestilizar `UploadComponent.jsx` com área de seleção de arquivo, campo de dono e botão primário,
   incluindo estados de carregando, sucesso e erro.
4. Reestilizar `DocumentList.jsx` como tabela responsiva com cabeçalho destacado, zebra striping,
   hover nas linhas e estado vazio amigável.
5. Reestilizar `DownloadButton.jsx` como botão secundário com ícone textual e foco visível.
6. Exibir mensagens de erro como alerta estilizado, mantendo `role="alert"`.

## Critérios de aceite

- Nenhum estilo inline remanescente nos componentes.
- Layout responsivo (mobile e desktop) e acessível por teclado.
- Upload, listagem e download continuam funcionando exatamente como antes.
- `npm run build` no `frontend/` executa sem erros.
- Textos ao usuário em português.
