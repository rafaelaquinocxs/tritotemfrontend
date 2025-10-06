// Serviço de API para comunicação com o backend Tritotem
class ApiService {
  constructor() {
    // Configurar URL base baseada no ambiente
    this.baseURL = import.meta.env.VITE_API_URL || 
                   (import.meta.env.DEV ? 'http://localhost:3001' : 'https://tritotem-cc0a461d6f3e.herokuapp.com');
    
    this.token = localStorage.getItem('tritotem_token');
    
    console.log('[API] Inicializado com URL:', this.baseURL);
  }

  // Configurar token de autenticação
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('tritotem_token', token);
    } else {
      localStorage.removeItem('tritotem_token');
    }
  }

  // Obter token atual
  getToken() {
    return this.token || localStorage.getItem('tritotem_token');
  }

  // Método genérico para fazer requisições
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Adicionar token de autenticação se disponível
    const token = this.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      console.log(`[API] ${config.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      
      // Verificar se a resposta é JSON
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        
        if (isJson) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } else {
          errorMessage = await response.text() || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      // Retornar dados JSON se disponível
      if (isJson) {
        return await response.json();
      }
      
      return response;
    } catch (error) {
      console.error(`[API] Erro em ${endpoint}:`, error);
      throw error;
    }
  }

  // Métodos de conveniência
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Upload de arquivos
  async upload(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Adicionar dados adicionais
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    const token = this.getToken();
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return this.request(endpoint, {
      method: 'POST',
      headers,
      body: formData,
    });
  }

  // === MÉTODOS DE AUTENTICAÇÃO ===
  
  async login(email, password) {
    const response = await this.post('/api/auth/login', { email, password });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async initAdmin(name, email, password) {
    const response = await this.post('/api/auth/init', { name, email, password });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async getMe() {
    return this.get('/api/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // === MÉTODOS DE DISPOSITIVOS (TVs) ===
  
  async getDevices() {
    return this.get('/api/devices');
  }

  async createDevice(deviceData) {
    return this.post('/api/devices', deviceData);
  }

  async getDevice(id) {
    return this.get(`/api/devices/${id}`);
  }

  async updateDevice(id, deviceData) {
    return this.put(`/api/devices/${id}`, deviceData);
  }

  async deleteDevice(id) {
    return this.delete(`/api/devices/${id}`);
  }

  async sendHeartbeat(id, data = {}) {
    return this.post(`/api/devices/${id}/heartbeat`, data);
  }

  async broadcastAssignPlaylist(playlistId) {
    return this.post('/api/devices/broadcast-assign', { playlistId });
  }

  // === MÉTODOS DE MÍDIA ===
  
  async getMedia(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/media?${queryString}` : '/api/media';
    return this.get(endpoint);
  }

  async uploadMedia(file, name, tags = []) {
    return this.upload('/api/media', file, { 
      name, 
      tags: Array.isArray(tags) ? tags.join(',') : tags 
    });
  }

  async getMediaById(id) {
    return this.get(`/api/media/${id}`);
  }

  async updateMedia(id, mediaData) {
    return this.put(`/api/media/${id}`, mediaData);
  }

  async deleteMedia(id) {
    return this.delete(`/api/media/${id}`);
  }

  // Obter URL de streaming para mídia
  getStreamUrl(filename) {
    return `${this.baseURL}/stream/${filename}`;
  }

  // === MÉTODOS DE PLAYLISTS ===
  
  async getPlaylists() {
    return this.get('/api/playlists');
  }

  async createPlaylist(playlistData) {
    return this.post('/api/playlists', playlistData);
  }

  async getPlaylist(id) {
    return this.get(`/api/playlists/${id}`);
  }

  async updatePlaylist(id, playlistData) {
    return this.put(`/api/playlists/${id}`, playlistData);
  }

  async deletePlaylist(id) {
    return this.delete(`/api/playlists/${id}`);
  }

  // === MÉTODOS DO DASHBOARD ===
  
  async getDashboardStats() {
    return this.get('/api/dashboard/stats');
  }

  // === MÉTODOS DO PLAYER ===
  
  async getPlayerData(deviceToken) {
    return this.get(`/api/player/${deviceToken}`);
  }

  // Obter URL do player para TV
  getPlayerUrl(deviceToken) {
    return `${this.baseURL}/player/${deviceToken}`;
  }

  // === MÉTODOS DE HEALTH CHECK ===
  
  async healthCheck() {
    return this.get('/health');
  }

  async ping() {
    return this.get('/');
  }
}

// Criar instância singleton
const apiService = new ApiService();

export default apiService;

// Exportar também a classe para casos especiais
export { ApiService };
