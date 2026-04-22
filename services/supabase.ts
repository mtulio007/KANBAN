import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Chaves para salvar no LocalStorage (caso o usuário mude na tela de config)
const STORAGE_KEY_URL = 'kanban_supabase_url';
const STORAGE_KEY_KEY = 'kanban_supabase_key';

// Valores Padrão
// Deixamos vazios para forçar o usuário a inserir suas próprias credenciais na tela de setup.
const DEFAULT_URL = '';
const DEFAULT_KEY = '';

const getUrl = () => {
  // Tenta pegar do process.env se disponível (builds), senão localStorage, senão default
  if (typeof process !== 'undefined' && process.env && process.env.SUPABASE_URL) {
      return process.env.SUPABASE_URL;
  }
  return localStorage.getItem(STORAGE_KEY_URL) || DEFAULT_URL;
};

const getKey = () => {
  if (typeof process !== 'undefined' && process.env && process.env.SUPABASE_KEY) {
      return process.env.SUPABASE_KEY;
  }
  return localStorage.getItem(STORAGE_KEY_KEY) || DEFAULT_KEY;
};

const url = getUrl();
const key = getKey();

let client: SupabaseClient | null = null;

// Inicializa o cliente se houver URL e Key
if (url && key) {
  try {
    client = createClient(url, key);
  } catch (e) {
    console.error("Erro ao inicializar Supabase:", e);
  }
}

export const supabase = client;

export const isConfigured = (): boolean => {
  return !!client;
};

export const configureSupabase = (newUrl: string, newKey: string) => {
  if (!newUrl || !newKey) return;
  localStorage.setItem(STORAGE_KEY_URL, newUrl);
  localStorage.setItem(STORAGE_KEY_KEY, newKey);
  window.location.reload();
};

export const clearConfig = () => {
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_KEY);
  window.location.reload();
};
