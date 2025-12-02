export const getApiUrl = (): string => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.MODE === 'production') return 'https://apimmadouglasbackend.onrender.com/api';
  return 'http://localhost:3000/api'; // Add /api for dev too!
};

export async function apiGet<T>(path: string): Promise<T> {
  // Remove leading slash to prevent double-slash issues
  const cleanedPath = path.startsWith('/') ? path.slice(1) : path;
  const url = `${getApiUrl()}/${cleanedPath}`;
  const res = await fetch(url, { credentials: 'include', headers: { 'Content-Type': 'application/json' }});
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ${res.status} ao acessar ${url}`);
  }
  return res.json() as Promise<T>;
}
