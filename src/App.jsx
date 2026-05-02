import { Plus, Search } from 'lucide-react';

import { Button, Card, Input, Select, Spinner, Textarea } from '@/components/ui';

export default function App() {
  return (
    <main style={{ padding: 'var(--space-7)', maxWidth: 800, margin: '0 auto' }}>
      <h1 className="font-h1" style={{ color: 'var(--gold)', marginBottom: 'var(--space-6)' }}>
        UI Components — Set 1
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <section>
          <h2 className="font-h3" style={{ marginBottom: 'var(--space-3)' }}>
            Buttons
          </h2>
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
          <h2 className="font-h3" style={{ marginBottom: 'var(--space-3)' }}>
            Button sizes
          </h2>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </section>

        <Card>
          <h2 className="font-h3" style={{ marginBottom: 'var(--space-4)' }}>
            Form Fields
          </h2>
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
          <h2 className="font-h3" style={{ marginBottom: 'var(--space-3)' }}>
            Card variants
          </h2>
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
    </main>
  );
}
