import { useState } from "react";

type Props = {
  onAddSuccess: (newItem: any) => void; // adapte tipagem
  onClose: () => void;
  apiUrl: string; // ex: "/api/items" ou URL completa
  authToken?: string | null;
};

export default function AddItemForm({
  onAddSuccess,
  onClose,
  apiUrl,
  authToken,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!name.trim()) return "Nome obrigatório.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const clientErr = validate();
    if (clientErr) {
      setError(clientErr);
      return;
    }

    setLoading(true);

    try {
      const body = { name: name.trim(), description: description.trim() };
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        // tenta ler corpo de erro JSON
        let msg = `Erro ${res.status}`;
        try {
          const json = await res.json();
          msg = json?.message || JSON.stringify(json);
        } catch {
          /* ignora */
        }
        throw new Error(msg);
      }

      const created = await res.json();
      onAddSuccess(created);
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Nome</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring"
          placeholder="Nome do item"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Descrição</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring"
          placeholder="Descrição (opcional)"
          rows={3}
          disabled={loading}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded px-4 py-2 text-sm hover:bg-gray-100"
          disabled={loading}
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Enviando..." : "Adicionar"}
        </button>
      </div>
    </form>
  );
}
