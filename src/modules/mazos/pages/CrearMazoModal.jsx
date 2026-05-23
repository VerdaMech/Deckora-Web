import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Modal, Input, Select, Textarea, Alert, Spinner } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { traducirError } from '@/utils/errors';
import { FORMATOS, FORMATO_LABELS } from '@/utils/constants';
import { crearMazo } from '@/services/mazos.service';

import './CrearMazoModal.css';

const FORMATO_OPTIONS = Object.entries(FORMATOS).map(([, value]) => ({
  value,
  label: FORMATO_LABELS[value] ?? value,
}));

export function CrearMazoModal({ show, onHide, onCreado }) {
  const navigate = useNavigate();
  const { mostrarExito, mostrarError } = useToast();
  const [form, setForm] = useState({
    nombre: '',
    formato: FORMATOS.COMMANDER,
    descripcion: '',
    publico: false,
  });
  const [errores, setErrores] = useState({});
  const [errorGlobal, setErrorGlobal] = useState(null);
  const [guardando, setGuardando] = useState(false);

  function handleChange(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: null }));
  }

  function validar() {
    const errs = {};
    if (!form.nombre.trim()) {
      errs.nombre = 'El nombre es obligatorio';
    } else if (form.nombre.trim().length > 80) {
      errs.nombre = 'El nombre no puede superar 80 caracteres';
    }
    return errs;
  }

  async function crear() {
    const errs = validar();
    if (Object.keys(errs).length) {
      setErrores(errs);
      return;
    }

    setGuardando(true);
    setErrorGlobal(null);
    try {
      const mazo = await crearMazo({
        nombre: form.nombre.trim(),
        formato: form.formato,
        descripcion: form.descripcion.trim() || undefined,
        publico: form.publico,
      });
      const mazoId = mazo.id ?? mazo.mazo?.id;
      mostrarExito('Mazo creado', `"${form.nombre.trim()}" está listo para armar.`);
      onCreado?.();
      navigate(`/mazos/${mazoId}`);
    } catch (err) {
      mostrarError('No se pudo crear el mazo', traducirError(err));
      setErrorGlobal(traducirError(err));
    } finally {
      setGuardando(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await crear();
  }

  function handleHide() {
    if (guardando) return;
    setForm({ nombre: '', formato: FORMATOS.COMMANDER, descripcion: '', publico: false });
    setErrores({});
    setErrorGlobal(null);
    onHide();
  }

  return (
    <Modal
      show={show}
      onHide={handleHide}
      title="Crear mazo"
      size="md"
      footer={
        <div className="crear-mazo-modal__footer">
          <button
            className="btn btn--secondary btn--md"
            type="button"
            onClick={handleHide}
            disabled={guardando}
          >
            Cancelar
          </button>
          <button
            className="btn btn--primary btn--md"
            type="submit"
            form="form-crear-mazo"
            disabled={guardando}
          >
            {guardando ? <Spinner size="sm" /> : null}
            Crear mazo
          </button>
        </div>
      }
    >
      {errorGlobal && (
        <Alert variant="danger" className="crear-mazo-modal__error">
          {errorGlobal}
        </Alert>
      )}

      <form id="form-crear-mazo" onSubmit={handleSubmit} className="crear-mazo-modal__form" noValidate>
        <Input
          label="Nombre"
          required
          value={form.nombre}
          onChange={(e) => handleChange('nombre', e.target.value)}
          error={errores.nombre}
          maxLength={80}
          placeholder="Mi mazo Commander"
          autoFocus
        />

        <Select
          label="Formato"
          required
          value={form.formato}
          onChange={(e) => handleChange('formato', e.target.value)}
          options={FORMATO_OPTIONS}
        />

        <Textarea
          label="Descripción"
          value={form.descripcion}
          onChange={(e) => handleChange('descripcion', e.target.value)}
          placeholder="Descripción opcional del mazo..."
          rows={3}
        />

        <label className="crear-mazo-modal__publico-label">
          <input
            type="checkbox"
            className="crear-mazo-modal__publico-check"
            checked={form.publico}
            onChange={(e) => handleChange('publico', e.target.checked)}
          />
          <div>
            <span className="crear-mazo-modal__publico-title">Mazo público</span>
            <span className="crear-mazo-modal__publico-desc">
              Otros jugadores podrán ver este mazo en tu perfil
            </span>
          </div>
        </label>
      </form>
    </Modal>
  );
}

export default CrearMazoModal;
