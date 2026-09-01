import DownloadButton from './DownloadButton';

function formatSize(bytes) {
  if (!bytes) {
    return '0 KB';
  }

  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleString('pt-BR');
}

export default function DocumentList({ documents }) {
  if (!documents.length) {
    return <p>Nenhum documento enviado ainda.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Dono</th>
          <th>Tamanho</th>
          <th>Enviado em</th>
          <th>Ação</th>
        </tr>
      </thead>
      <tbody>
        {documents.map((document) => (
          <tr key={document.id}>
            <td>{document.originalName}</td>
            <td>{document.owner}</td>
            <td>{formatSize(document.size)}</td>
            <td>{formatDate(document.uploadedAt)}</td>
            <td>
              <DownloadButton documentId={document.id} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
