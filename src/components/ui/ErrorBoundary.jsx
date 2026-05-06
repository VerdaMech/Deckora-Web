import { Component } from 'react';
import { AlertOctagon } from 'lucide-react';
import '@/styles/components/ErrorBoundary.css';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const { error } = this.state;
    const isDev = import.meta.env.DEV;

    return (
      <div className="error-boundary" role="alert">
        <AlertOctagon className="error-boundary__icono" size={64} aria-hidden="true" />
        <h1 className="error-boundary__titulo">Algo se rompió en el salón</h1>
        <p className="error-boundary__mensaje">
          Encontramos un error inesperado. Puedes intentar recargar la página o volver al inicio.
        </p>
        <div className="error-boundary__acciones">
          <button
            className="btn btn--primary btn--md"
            onClick={() => window.location.reload()}
          >
            Recargar
          </button>
          <button
            className="btn btn--secondary btn--md"
            onClick={() => { window.location.href = '/'; }}
          >
            Volver al inicio
          </button>
        </div>
        {isDev && error && (
          <details className="error-boundary__detalle">
            <summary>Detalles del error (solo en dev)</summary>
            <pre>{error.message}{'\n\n'}{error.stack}</pre>
          </details>
        )}
      </div>
    );
  }
}
