import { useState } from 'react';
import { Plus, Search, Inbox } from 'lucide-react';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import {
  Button, Card, Input, Select, Spinner, Textarea,
  Modal, Badge, EmptyState, Tabs, Alert, Tooltip, Skeleton,
} from '@/components/ui';

function AuthPanel() {
  const { user, rol, loading, error, login, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const [authError, setAuthError] = useState(null);

  async function handleLogin() {
    setBusy(true);
    setAuthError(null);
    try {
      await login('jugador@deckora.test', 'deckora123');
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    setBusy(true);
    await logout();
    setBusy(false);
  }

  return (
    <Card variant="feature" style={{ marginBottom: 'var(--space-6)' }}>
      <h2 className="font-h4" style={{ color: 'var(--gold)', marginBottom: 'var(--space-3)' }}>
        Panel de Auth (temporal — se elimina en Commit 6)
      </h2>
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Spinner size="sm" />
          <span className="font-small" style={{ color: 'var(--text-muted)' }}>Verificando sesión...</span>
        </div>
      ) : user ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <Alert variant="success">
            Logueado como <strong>{user.email ?? user.nombre_usuario}</strong> (rol: {rol ?? 'cargando...'})
          </Alert>
          <Button variant="ghost" onClick={handleLogout} loading={busy}>Cerrar sesión</Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <p className="font-small" style={{ color: 'var(--text-muted)' }}>Sin sesión activa.</p>
          {authError && <Alert variant="danger">{authError}</Alert>}
          {error && <Alert variant="warning">Error al obtener perfil: {error}</Alert>}
          <Button variant="primary" onClick={handleLogin} loading={busy}>
            Login (jugador@deckora.test)
          </Button>
        </div>
      )}
    </Card>
  );
}

function SandboxContent() {
  const [showModal, setShowModal] = useState(false);

  return (
    <main style={{ padding: 'var(--space-7)', maxWidth: 900, margin: '0 auto' }}>
      <AuthPanel />

      {/* ─── Set 1 ─── */}
      <h1 className="font-h1" style={{ color: 'var(--gold)', marginBottom: 'var(--space-6)' }}>
        UI Components — Set 1
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <section>
          <h2 className="font-h3" style={{ marginBottom: 'var(--space-3)' }}>Buttons</h2>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <Button variant="primary" icon={Plus}>Crear</Button>
            <Button variant="primary-clip" icon={Search}>Buscar</Button>
            <Button variant="ghost">Cancelar</Button>
            <Button variant="secondary">Secundario</Button>
            <Button variant="danger">Eliminar</Button>
            <Button variant="primary" loading>Guardando</Button>
            <Button variant="primary" disabled>Deshabilitado</Button>
          </div>
        </section>

        <section>
          <h2 className="font-h3" style={{ marginBottom: 'var(--space-3)' }}>Button sizes</h2>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </section>

        <Card>
          <h2 className="font-h3" style={{ marginBottom: 'var(--space-4)' }}>Form Fields</h2>
          <Input label="Email" type="email" placeholder="tu@correo.com" required />
          <Input label="Con error" error="Este campo es requerido" placeholder="..." />
          <Input label="Con helper" helperText="Ingresa tu nombre de usuario" placeholder="mi_usuario" />
          <Select
            label="Formato"
            options={[
              { value: 'COMMANDER', label: 'Commander' },
              { value: 'STANDARD', label: 'Standard' },
              { value: 'MODERN', label: 'Modern' },
            ]}
          />
          <Textarea label="Descripción" placeholder="Contanos sobre tu mazo..." />
        </Card>

        <section>
          <h2 className="font-h3" style={{ marginBottom: 'var(--space-3)' }}>Card variants</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            <Card variant="default"><p className="font-small">Default</p></Card>
            <Card variant="elevated"><p className="font-small">Elevated</p></Card>
            <Card variant="interactive"><p className="font-small">Interactive (hover me)</p></Card>
            <Card variant="feature"><p className="font-small">Feature</p></Card>
          </div>
        </section>

        <Card variant="elevated" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
          <span className="font-small" style={{ color: 'var(--text-muted)' }}>Spinners</span>
        </Card>
      </div>

      {/* ─── Set 2 ─── */}
      <h1 className="font-h1" style={{ color: 'var(--gold)', margin: 'var(--space-8) 0 var(--space-6)' }}>
        UI Components — Set 2
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

        <section>
          <h2 className="font-h3" style={{ marginBottom: 'var(--space-3)' }}>Modal</h2>
          <Button variant="primary" onClick={() => setShowModal(true)}>Abrir modal</Button>
          <Modal
            show={showModal}
            onHide={() => setShowModal(false)}
            title="Ejemplo de modal"
            footer={
              <>
                <Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
                <Button variant="primary" onClick={() => setShowModal(false)}>Confirmar</Button>
              </>
            }
          >
            <p className="font-body">Contenido del modal. Usa backdrop blur y estilos de Deckora.</p>
          </Modal>
        </section>

        <section>
          <h2 className="font-h3" style={{ marginBottom: 'var(--space-3)' }}>Badges</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'center' }}>
            <Badge variant="format" value="COMMANDER" />
            <Badge variant="format" value="STANDARD" />
            <Badge variant="estado" value="pendiente" />
            <Badge variant="estado" value="en_curso" />
            <Badge variant="estado" value="finalizado" />
            <Badge variant="estado" value="cancelado" />
            <Badge variant="rol" value="jugador" />
            <Badge variant="rol" value="organizador" />
            <Badge variant="rol" value="tienda" />
            <Badge variant="resultado" value="ganador" />
            <Badge variant="resultado" value="perdedor" />
            <Badge variant="resultado" value="empate" />
            <Badge variant="resultado" value="pendiente" />
          </div>
        </section>

        <Card>
          <h2 className="font-h3" style={{ marginBottom: 'var(--space-3)' }}>Empty State</h2>
          <EmptyState
            icon={Inbox}
            title="No hay mazos aún"
            description="Creá tu primer mazo para empezar a jugar torneos Commander."
            action={<Button variant="primary" icon={Plus}>Crear mazo</Button>}
          />
        </Card>

        <Card>
          <h2 className="font-h3" style={{ marginBottom: 'var(--space-3)' }}>Tabs</h2>
          <Tabs>
            <Tabs.Tab eventKey="mazos" label="Mis mazos">
              <p className="font-body" style={{ color: 'var(--text-muted)' }}>Contenido de Mis mazos</p>
            </Tabs.Tab>
            <Tabs.Tab eventKey="colecciones" label="Mi colección">
              <p className="font-body" style={{ color: 'var(--text-muted)' }}>Contenido de Mi colección</p>
            </Tabs.Tab>
            <Tabs.Tab eventKey="torneos" label="Inscripciones">
              <p className="font-body" style={{ color: 'var(--text-muted)' }}>Contenido de Inscripciones</p>
            </Tabs.Tab>
          </Tabs>
        </Card>

        <section>
          <h2 className="font-h3" style={{ marginBottom: 'var(--space-3)' }}>Alerts</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <Alert variant="success">Mazo guardado correctamente.</Alert>
            <Alert variant="warning">Este mazo tiene menos de 100 cartas.</Alert>
            <Alert variant="danger">No se pudo conectar al servidor. Intentá de nuevo.</Alert>
            <Alert variant="info">Los cambios se guardan automáticamente.</Alert>
          </div>
        </section>

        <section>
          <h2 className="font-h3" style={{ marginBottom: 'var(--space-3)' }}>Tooltip</h2>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
            <Tooltip content="Formato Commander: 100 cartas, un comandante legendario">
              <span className="font-small" style={{ color: 'var(--gold)', borderBottom: '1px dashed var(--gold)', cursor: 'help' }}>
                ¿Qué es Commander?
              </span>
            </Tooltip>
            <Tooltip content="Eliminar este mazo permanentemente" placement="right">
              <Button variant="danger" size="sm">Eliminar</Button>
            </Tooltip>
          </div>
        </section>

        <section>
          <h2 className="font-h3" style={{ marginBottom: 'var(--space-3)' }}>Skeletons</h2>
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <Skeleton height="1.5rem" width="40%" />
              <Skeleton height="1rem" />
              <Skeleton height="1rem" width="80%" />
              <Skeleton height="1rem" width="60%" />
              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <Skeleton height={80} width={80} radius="var(--radius-md)" />
                <Skeleton height={80} width={80} radius="var(--radius-md)" />
                <Skeleton height={80} width={80} radius="var(--radius-md)" />
              </div>
            </div>
          </Card>
        </section>

      </div>
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SandboxContent />
    </AuthProvider>
  );
}
