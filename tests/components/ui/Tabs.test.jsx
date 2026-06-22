import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Tabs from '@/components/ui/Tabs';

function renderTabs(props = {}) {
  return render(
    <Tabs {...props}>
      <Tabs.Tab eventKey="uno" label="Uno">Contenido uno</Tabs.Tab>
      <Tabs.Tab eventKey="dos" label="Dos">Contenido dos</Tabs.Tab>
    </Tabs>,
  );
}

describe('Tabs', () => {
  it('muestra por defecto el contenido de la primera pestaña', () => {
    renderTabs();
    expect(screen.getByText('Contenido uno')).toBeInTheDocument();
    expect(screen.queryByText('Contenido dos')).not.toBeInTheDocument();
  });

  it('cambia de pestaña al hacer click (modo no controlado)', async () => {
    renderTabs();
    await userEvent.click(screen.getByRole('tab', { name: 'Dos' }));
    expect(screen.getByText('Contenido dos')).toBeInTheDocument();
  });

  it('en modo controlado respeta activeKey y notifica onSelect', async () => {
    const onSelect = vi.fn();
    renderTabs({ activeKey: 'uno', onSelect });
    await userEvent.click(screen.getByRole('tab', { name: 'Dos' }));
    expect(onSelect).toHaveBeenCalledWith('dos');
    // sigue mostrando "uno" porque está controlado desde afuera
    expect(screen.getByText('Contenido uno')).toBeInTheDocument();
  });

  it('marca aria-selected en la pestaña activa', () => {
    renderTabs();
    expect(screen.getByRole('tab', { name: 'Uno' })).toHaveAttribute('aria-selected', 'true');
  });
});
