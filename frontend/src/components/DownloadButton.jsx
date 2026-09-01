import { getDownloadUrl } from '../services/documentsApi';

export default function DownloadButton({ documentId }) {
  return (
    <a href={getDownloadUrl(documentId)} download className="btn-secondary">
      <span aria-hidden="true">⬇</span>
      Baixar
    </a>
  );
}
