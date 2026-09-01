import { useCallback, useEffect, useState } from 'react';
import UploadComponent from './components/UploadComponent';
import DocumentList from './components/DocumentList';
import { fetchDocuments } from './services/documentsApi';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');

  const loadDocuments = useCallback(async () => {
    try {
      const loadedDocuments = await fetchDocuments();
      setDocuments(loadedDocuments);
      setError('');
    } catch (loadError) {
      setError(loadError.message);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>Document Management System</h1>
      <UploadComponent onUploaded={loadDocuments} />
      <h2>Documentos</h2>
      {error && <p role="alert">{error}</p>}
      <DocumentList documents={documents} />
    </main>
  );
}
