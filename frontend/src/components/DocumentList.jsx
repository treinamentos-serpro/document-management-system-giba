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
    return (
      <p className="rounded-md border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
        Nenhum documento enviado ainda.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold text-slate-700">
              Nome
            </th>
            <th scope="col" className="px-4 py-3 font-semibold text-slate-700">
              Dono
            </th>
            <th scope="col" className="px-4 py-3 font-semibold text-slate-700">
              Tamanho
            </th>
            <th scope="col" className="px-4 py-3 font-semibold text-slate-700">
              Enviado em
            </th>
            <th scope="col" className="px-4 py-3 font-semibold text-slate-700">
              Ação
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {documents.map((document, index) => (
            <tr
              key={document.id}
              className={`hover:bg-slate-50 ${index % 2 === 1 ? 'bg-slate-50/50' : ''}`}
            >
              <td className="px-4 py-3 text-slate-900">{document.originalName}</td>
              <td className="px-4 py-3 text-slate-600">{document.owner}</td>
              <td className="px-4 py-3 text-slate-600">{formatSize(document.size)}</td>
              <td className="px-4 py-3 text-slate-600">{formatDate(document.uploadedAt)}</td>
              <td className="px-4 py-3">
                <DownloadButton documentId={document.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
