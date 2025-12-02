import { useEffect, useState } from "react";
import Modal from "./Modal";
import AddItemForm from "./AddItemForm";

type Item = { id: number | string; name: string; description?: string };

export default function ItemsManager() {
  const apiUrl = "/api/${}"; // adapte (p.ex. `${import.meta.env.VITE_API_URL}/items`)
  const [items, setItems] = useState<Item[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [errorList, setErrorList] = useState<string | null>(null);

  useEffect(() => {
    const fetchList = async () => {
      setLoadingList(true);
      setErrorList(null);
      try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error(`Falha ao buscar: ${res.status}`);
        const json = await res.json();
        setItems(json);
      } catch (err: any) {
        setErrorList(err.message || "Erro ao carregar itens");
      } finally {
        setLoadingList(false);
      }
    };

    fetchList();
  }, [apiUrl]);

  const handleAddSuccess = (newItem: Item) => {
    // Atualização segura: adiciona no estado
    setItems((s) => [newItem, ...s]);
    // Alternativa: você pode refetchar a lista do backend aqui
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Itens</h3>
        <button
          onClick={() => setIsOpen(true)}
          className="rounded bg-green-600 px-3 py-1 text-white"
        >
          + Adicionar
        </button>
      </div>

      <div className="mt-4">
        {loadingList ? (
          <p>Carregando...</p>
        ) : errorList ? (
          <p className="text-red-600">{errorList}</p>
        ) : items.length === 0 ? (
          <p>Nenhum item encontrado</p>
        ) : (
          <ul className="space-y-2">
            {items.map((it) => (
              <li key={it.id} className="rounded border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{it.name}</div>
                    {it.description && (
                      <div className="text-sm text-gray-600">
                        {it.description}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">#{it.id}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        isOpen={isOpen}
        title="Adicionar Item"
        onClose={() => setIsOpen(false)}
      >
        <AddItemForm
          apiUrl={apiUrl}
          onAddSuccess={handleAddSuccess}
          onClose={() => setIsOpen(false)}
        />
      </Modal>
    </div>
  );
}
