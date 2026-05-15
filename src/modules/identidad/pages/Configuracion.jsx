import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Tabs } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import CuentaTab from '../components/CuentaTab';
import ConfiguracionTiendaTab from '../components/ConfiguracionTiendaTab';
import ConfiguracionOrganizadorTab from '../components/ConfiguracionOrganizadorTab';

export default function Configuracion() {
  const { rol } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('cuenta');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') === 'tienda' && rol === 'tienda') {
      setActiveTab('tienda');
    }
  }, [location.search, rol]);

  return (
    <div className="config-page">
      <h1 className="config-page__title">Configuración</h1>
      <Tabs activeKey={activeTab} onSelect={setActiveTab}>
        <Tabs.Tab eventKey="cuenta" label="Cuenta">
          <CuentaTab />
        </Tabs.Tab>
        {rol === 'organizador' && (
          <Tabs.Tab eventKey="organizador" label="Mi organización">
            <ConfiguracionOrganizadorTab />
          </Tabs.Tab>
        )}
        {rol === 'tienda' && (
          <Tabs.Tab eventKey="tienda" label="Configuración de tienda">
            <ConfiguracionTiendaTab />
          </Tabs.Tab>
        )}
      </Tabs>
    </div>
  );
}
