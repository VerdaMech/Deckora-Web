import { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';

import { Input, Button, Textarea } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';
import { traducirError } from '@/utils/errors';
import { apiGet, apiPut } from '@/services/api';

export default function ConfiguracionOrganizadorTab() {
  const { user } = useAuth();
  const { mostrarExito, mostrarError } = useToast();
  const [descripcion, setDescripcion] = useState('');
  const [sitioWeb, setSitioWeb] = useState('');
  const [loading, setLoading] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    apiGet('/organizadores/me')
      .then((data) => {
        setDescripcion(data?.descripcion ?? '');
        setSitioWeb(data?.sitio_web ?? '');
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [user?.id]);

  async function handleGuardar(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await apiPut('/organizadores/me', {
        descripcion: descripcion.trim() || undefined,
        sitio_web: sitioWeb.trim() || undefined,
      });
      mostrarExito('Perfil actualizado', 'Los datos de tu organización se guardaron correctamente.');
    } catch (err) {
      mostrarError('No se pudo guardar', traducirError(err));
    } finally {
      setLoading(false);
    }
  }

  if (cargando) return null;

  return (
    <div className="config-section">
      <h2 className="config-section__title">Mi organización</h2>
      <form onSubmit={handleGuardar} className="config-form">
        <Textarea
          label="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Describe quiénes son y qué tipo de torneos organizan..."
          rows={4}
        />
        <Input
          label="Sitio web"
          type="url"
          value={sitioWeb}
          onChange={(e) => setSitioWeb(e.target.value)}
          placeholder="https://ejemplo.com"
          icon={Globe}
        />
        <Button type="submit" variant="primary" loading={loading}>
          Guardar
        </Button>
      </form>
    </div>
  );
}
