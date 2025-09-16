import { useAuth } from '../contexts/AuthContext';

export function useApi() {
  const { token, logout } = useAuth();
  
  // ✅ URL base SEM barra no final - CORRIGIDO
  const API_BASE = import.meta.env.VITE_API_URL || 'https://tritotem-cc0a461d6f3e.herokuapp.com/api';
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://tritotem-cc0a461d6f3e.herokuapp.com';

  const makeRequest = async (endpoint, options = {}) => {
    // ✅ Garantir que endpoint comece com / mas não tenha // duplo
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_BASE}${cleanEndpoint}`;
    
    console.log('🔍 Fazendo requisição para:', url); // Debug
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        logout();
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      console.error('Erro na requisição:', error);
      throw error;
    }
  };

  const api = {
    get: (endpoint) => makeRequest(endpoint, { method: 'GET' }),
    
    post: (endpoint, data) => makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
    put: (endpoint, data) => makeRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
    del: (endpoint) => makeRequest(endpoint, { method: 'DELETE' }),
    
    upload: async (endpoint, formData) => {
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const url = `${API_BASE}${cleanEndpoint}`;
      
      console.log('🔍 Fazendo upload para:', url); // Debug
      
      const config = {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      };

      try {
        const response = await fetch(url, config);
        
        if (response.status === 401) {
          logout();
          throw new Error('Sessão expirada. Faça login novamente.');
        }
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Erro no upload:', error);
        throw error;
      }
    },

    // ✅ Função para obter URL completa do player
    getPlayerUrl: (deviceToken) => {
      return `${API_BASE_URL}/player/${deviceToken}`;
    },

    // ✅ Função para obter URL de stream de mídia
    getStreamUrl: (filename) => {
      return `${API_BASE_URL}/stream/${filename}`;
    },

    // ✅ Função para obter URL de upload
    getUploadUrl: (filename) => {
      return `${API_BASE_URL}/uploads/${filename}`;
    }
  };

  return api;
}
