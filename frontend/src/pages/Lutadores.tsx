import React, { useEffect, useState } from 'react';
import { apiGet } from '../lib/api';
import LutadorCard from '../components/LutadorCard';

type Lutador = {
  id: number | string;
  nome?: string;
  apelido?: string;
  pais?: string;
  categoria?: string;
  cartel?: string;
  avatar?: string | null;
  [k: string]: any;
};

export default function Lutadores(): React.ReactElement {
  const [data, setData] = useState<Lutador[] | null>(null);
  const [loading, setLoading] = useState(true);
  // REMOVED: error state

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiGet<Lutador[]>('lutadores')
      .then((res) => {
        if (!mounted) return;
        const normalized = (res && (res as any).data) ? (res as any).data : res;
        setData(normalized);
        // REMOVED: setError
      })
      .catch(() => {
        if (!mounted) return;
        // Optionally: handle error logic here, but don't need state variable if not showing error
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div>
        {/* ...loading UI... */}
      </div>
    );
  }

  return (
    <div>
      {/* ...other UI... */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(data || []).map((l) => (
          <LutadorCard
            key={l.id}
            id={l.id}
            nome={l.nome}
            apelido={l.apelido}
            pais={l.pais}
            categoria={l.categoria}
            cartel={l.cartel}
            avatarUrl={l.avatar ?? null}
            onEdit={() => {
              // If you want to use id here, add as parameter and use
            }}
            onDelete={() => {
              if (!confirm('Confirmar exclusão do lutador?')) return;
              // delete logic
            }}
          />
        ))}
      </div>
    </div>
  );
}
