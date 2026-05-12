import '@/styles/components/ErrorChunk.css';

export default function ErrorChunk() {
  return (
    <div className="error-chunk" role="alert">
      <p className="error-chunk__mensaje">
        No se pudo cargar este módulo. ¿Tu conexión está bien?
      </p>
      <button
        className="btn btn--secondary btn--sm"
        onClick={() => window.location.reload()}
      >
        Reintentar
      </button>
    </div>
  );
}
