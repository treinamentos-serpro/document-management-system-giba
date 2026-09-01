import { useState } from 'react';
import { uploadDocument } from '../services/documentsApi';

export default function UploadComponent({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [owner, setOwner] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file || !owner.trim()) {
      setError('Selecione um arquivo e informe o dono do documento.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const document = await uploadDocument({ file, owner: owner.trim() });
      setFile(null);
      setOwner('');
      event.target.reset();
      onUploaded(document);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Enviar documento</h2>

      <div>
        <label htmlFor="owner" className="form-label">
          Dono
        </label>
        <input
          id="owner"
          type="text"
          value={owner}
          onChange={(event) => setOwner(event.target.value)}
          placeholder="Nome do dono do documento"
          className="form-input"
        />
      </div>

      <div>
        <label htmlFor="file" className="form-label">
          Arquivo
        </label>
        <input
          id="file"
          type="file"
          onChange={(event) => setFile(event.target.files[0] || null)}
          className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
        />
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary">
        {isSubmitting ? 'Enviando...' : 'Enviar'}
      </button>

      {error && (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}
    </form>
  );
}
