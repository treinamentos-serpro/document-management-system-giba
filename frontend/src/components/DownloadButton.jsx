import { getDownloadUrl } from '../services/documentsApi';

export default function DownloadButton({ documentId }) {
  return (
    <a href={getDownloadUrl(documentId)} download>
      Baixar
    </a>
  );
}
