import { useEffect, useState } from 'react';
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

export default function Lutadores(): JSX.Element {
  const [data, setData] = useState<Lutador[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    // CORRECT: Remove "/api" from here, add only endpoint name!
    apiGet<Lutador[]>('lutadores')
      .then((res) => {
        if (!mounted) return;
        const normalized = (res && (res as any).data) ? (res as any).data : res;
        setData(normalized);
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Erro ao buscar lutadores');
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Lutadores</h1>
            <p className="text-neutral-400">Gerencie os lutadores cadastrados</p>
          </div>
          <button className="px-4 py-2 bg-red-600 text-white rounded-md">+ Adicionar Lutador</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-80 bg-neutral-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Lutadores</h1>
          <p className="text-neutral-400">Gerencie os lutadores cadastrados</p>
        </div>
        <button className="px-4 py-2 bg-red-600 text-white rounded-md">+ Adicionar Lutador</button>
      </div>

      {error && <div className="text-red-500 mb-4">Erro: {error}</div>}

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
            onEdit={(id) => {
              console.log('editar', id);
            }}
            onDelete={(id) => {
              if (!confirm('Confirmar exclusão do lutador?')) return;
              // delete logic
            }}
          />
        ))}
      </div>
    </div>
  );
}
