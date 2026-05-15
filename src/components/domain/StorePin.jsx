import '@/styles/components/StorePin.css';

export function StorePin({ activo = false }) {
  return <div className={`store-pin${activo ? ' store-pin--active' : ''}`} />;
}
