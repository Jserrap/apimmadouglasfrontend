// src/pages/Lutadores.tsx
import React, { useEffect, useState } from 'react';
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

  // modal / form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [nome, setNome] = useState('');
  const [apelido, setApelido] = useState('');
  const [pais, setPais] = useState('');
  const [categoria, setCategoria] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiGet<Lutador[]>('/lutadores')
      .then((res) => {
        if (!mounted) return;
        const normalized = (res && (res as any).data) ? (res as any).data : res;
        setData(normalized);
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || 'Erro ao buscar lutadores');
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  // expose quick test helper for console if you need
  ;(window as any).__lut_call = (cmd: string, arg?: any) => {
    console.log('DEBUG __lut_call', cmd, arg);
    if (cmd === 'openAdd') return setShowAddModal(true);
    if (cmd === 'create' && arg) {
      return handleCreateLocal(arg as Partial<Lutador>);
    }
    return null;
  };

  function resetForm() {
    setNome('');
    setApelido('');
    setPais('');
    setCategoria('');
  }

  function handleOpenAdd() {
    console.log('Abrindo modal adicionar lutador');
    resetForm();
    setShowAddModal(true);
  }

  // cria localmente (fallback/mode offline)
  function handleCreateLocal(payload: Partial<Lutador>) {
    const novo: Lutador = {
      id: Date.now().toString(),
      nome: payload.nome ?? nome ?? 'Sem nome',
      apelido: payload.apelido ?? apelido ?? '',
      pais: payload.pais ?? pais ?? '',
      categoria: payload.categoria ?? categoria ?? '',
      cartel: payload.cartel ?? '',
      avatar: payload.avatar ?? null,
    };
    setData((prev) => (prev ? [novo, ...prev] : [novo]));
    setShowAddModal(false);
    resetForm();
    console.log('Lutador criado localmente:', novo);
  }

  // CHAMADA REAL: POST /lutadores
  async function handleCreate() {
    if (!nome.trim()) {
      alert('Preencha o nome do lutador.');
      return;
    }

    setSubmitting(true);
    try {
      // Faz POST /lutadores com corpo JSON
      const res = await apiPost('/lutadores', {
        nome,
        apelido,
        pais,
        categoria,
      });

      // Normaliza resposta (algumas APIs retornam { data: item } ou o item direto)
      const novo = (res && (res as any).data) ? (res as any).data : res;

      // Se a API não retornar o objeto do lutador, caimos no fallback local
      if (!novo || !('id' in (novo as any))) {
        console.warn('API POST /lutadores não retornou objeto válido. Criando localmente como fallback.');
        handleCreateLocal({ nome, apelido, pais, categoria });
      } else {
        setData((prev) => (prev ? [novo as Lutador, ...prev] : [novo as Lutador]));
        setShowAddModal(false);
        resetForm();
        console.log('Lutador criado via API:', novo);
      }
    } catch (err: any) {
      console.error('Erro ao criar lutador via API:', err);
      // tentar fallback local opcional (comente se não quiser)
      // handleCreateLocal({ nome, apelido, pais, categoria });

      alert('Erro ao criar lutador: ' + (err?.message ?? 'erro desconhecido'));
    } finally {
      setSubmitting(false);
    }
  }

  // Placeholders simples para loading (botão com handler e type)
  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Lutadores</h1>
            <p className="text-neutral-400">Gerencie os lutadores cadastrados</p>
          </div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-red-600 text-white rounded-md"
          >
            + Adicionar Lutador
          </button>
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
        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-red-600 text-white rounded-md"
        >
          + Adicionar Lutador
        </button>
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
              setData((prev) => prev ? prev.filter(item => item.id !== id) : prev);
            }}
          />
        ))}
      </div>

      {(!data || data.length === 0) && (
        <div className="text-neutral-400 mt-6">Nenhum lutador encontrado.</div>
      )}

      {/* Modal adicionar lutador */}
      {showAddModal && (
        <div
          onMouseDown={() => setShowAddModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              width: 560,
              maxWidth: '94%',
              background: '#0b0b0b',
              color: '#fff',
              padding: 20,
              borderRadius: 8,
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <h2 className="text-xl font-semibold mb-4">Adicionar Lutador</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <div className="text-sm text-neutral-300 mb-1">Nome</div>
                <input
                  autoFocus
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-neutral-800 text-white"
                />
              </label>

              <label className="block">
                <div className="text-sm text-neutral-300 mb-1">Apelido</div>
                <input
                  value={apelido}
                  onChange={(e) => setApelido(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-neutral-800 text-white"
                />
              </label>

              <label className="block">
                <div className="text-sm text-neutral-300 mb-1">País</div>
                <input
                  value={pais}
                  onChange={(e) => setPais(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-neutral-800 text-white"
                />
              </label>

              <label className="block">
                <div className="text-sm text-neutral-300 mb-1">Categoria</div>
                <input
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-neutral-800 text-white"
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-md bg-neutral-700 text-white"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreate}
                className="px-4 py-2 rounded-md bg-red-600 text-white"
                disabled={submitting}
              >
                {submitting ? 'Salvando...' : 'Criar Lutador'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
