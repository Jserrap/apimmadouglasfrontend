import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../lib/api';
import LutadorCard from '../components/LutadorCard';
import type { JSX } from 'react/jsx-runtime';

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
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nome: '', pais: '', categoria: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = () => {
    setLoading(true);
    apiGet<Lutador[]>('/lutadores')
      .then((res) => {
        // normaliza envelope { data: [...] } se for o caso
        const normalized = (res && (res as any).data) ? (res as any).data : res;
        setData(normalized);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Erro ao buscar lutadores');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiPost('/lutadores', formData);
      setShowForm(false);
      setFormData({ nome: '', pais: '', categoria: '' });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Erro ao criar lutador');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Lutadores</h1>
          <p className="text-neutral-400">Gerencie os lutadores cadastrados</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          + Adicionar Lutador
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-black">Adicionar Lutador</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-black">Nome</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-black">País</label>
                <input
                  type="text"
                  required
                  value={formData.pais}
                  onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-black">Categoria</label>
                <input
                  type="text"
                  required
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                  placeholder="Ex: Peso Pena, Peso Médio, etc."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 text-black"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
                >
                  {submitting ? 'Criando...' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-80 bg-neutral-800 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

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
              // hook: aqui você pode abrir modal ou navegar para /lutadores/:id/edit
              console.log('editar', id);
              // ex: navigate(`/lutadores/${id}/edit`)
            }}
            onDelete={(id) => {
              // hook: chamar API de delete e atualizar lista
              if (!confirm('Confirmar exclusão do lutador?')) return;
              // exemplo rápido: remova localmente (melhor implementar DELETE no backend)
              setData((prev) => prev ? prev.filter(item => item.id !== id) : prev);
            }}
          />
        ))}
      </div>

      {(!data || data.length === 0) && <div className="text-neutral-400 mt-6">Nenhum lutador encontrado.</div>}
    </div>
  );
}
