import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

import { useDebounce } from '@/hooks/useDebounce';
import { buscarCartas } from '@/services/cartas.service';
import { MTGCard } from '@/components/domain';

import './BarraAgregarCarta.css';

export function BarraAgregarCarta({ onAgregar }) {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResultados([]);
      setAbierto(false);
      return;
    }

    let activo = true;
    setCargando(true);

    buscarCartas(debouncedQuery)
      .then((data) => {
        if (!activo) return;
        const lista = Array.isArray(data) ? data : (data?.cartas ?? data?.data ?? []);
        setResultados(lista);
        setAbierto(true);
      })
      .catch(() => {
        if (!activo) return;
        setResultados([]);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => { activo = false; };
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickFuera(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, []);

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape') setAbierto(false);
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  function handleSeleccionar(carta) {
    onAgregar(carta);
    setQuery('');
    setResultados([]);
    setAbierto(false);
  }

  return (
    <div className="barra-agregar" ref={wrapperRef}>
      <div className="barra-agregar__input-wrap">
        <Search size={16} className="barra-agregar__icon" aria-hidden="true" />
        <input
          className="barra-agregar__input"
          type="text"
          placeholder="Buscar carta para agregar..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar carta"
          aria-expanded={abierto}
          aria-autocomplete="list"
          autoComplete="off"
        />
        {cargando && (
          <span className="barra-agregar__spinner" aria-label="Buscando" />
        )}
      </div>

      {abierto && (
        <div className="barra-agregar__dropdown" role="listbox">
          {resultados.length === 0 ? (
            <p className="barra-agregar__sin-resultados">
              Sin resultados para &ldquo;{debouncedQuery}&rdquo;
            </p>
          ) : (
            resultados.map((carta) => (
              <button
                key={carta.id ?? carta.scryfallId}
                className="barra-agregar__resultado"
                type="button"
                role="option"
                onClick={() => handleSeleccionar(carta)}
              >
                <MTGCard carta={carta} variant="inline" />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default BarraAgregarCarta;
