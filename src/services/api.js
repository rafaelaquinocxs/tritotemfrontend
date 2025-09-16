
// ✅ URL corrigida para o Heroku
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});
class ApiService {
  async request(endpoint, options = {}) {
    const cleanEndpoint = endpoint.replace(/^\/+/, '');
    const url = `${API_BASE_URL}/${cleanEndpoint}`;
    
    console.log('🔍 Fazendo requisição para:', url); // Debug
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        console.error('❌ Resposta não OK:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('❌ API request failed:', error);
      throw error;
    }
  }

  async getDevices() {
    console.log('📱 Buscando devices...');
    return this.request('/devices');
  }

  async createDevice(deviceData) {
    console.log('📱 Criando device:', deviceData);
    return this.request('/devices', {
      method: 'POST',
      body: JSON.stringify(deviceData),
    });
  }

  async updateDevice(deviceId, deviceData) {
    console.log('📱 Atualizando device:', deviceId, deviceData);
    return this.request(`/devices/${deviceId}`, {
      method: 'PUT',
      body: JSON.stringify(deviceData),
    });
  }

  async deleteDevice(deviceId) {
    console.log('📱 Deletando device:', deviceId);
    return this.request(`/devices/${deviceId}`, {
      method: 'DELETE',
    });
  }

  async broadcastAssignPlaylist(playlistId) {
    console.log('📡 Broadcast assign playlist:', playlistId);
    return this.request('/devices/broadcast-assign', {
      method: 'POST',
      body: JSON.stringify({ playlistId }),
    });
  }

  async getMedias() {
    console.log('🎥 Buscando medias...');
    return this.request('/media');
  }

  async uploadMedia(formData) {
    console.log('📤 Upload de media...');
    return this.request('/media', {
      method: 'POST',
      headers: {},
      body: formData,
    });
  }

  async deleteMedia(mediaId) {
    console.log('🗑️ Deletando media:', mediaId);
    return this.request(`/media/${mediaId}`, {
      method: 'DELETE',
    });
  }

  async getPlaylists() {
    console.log('📋 Buscando playlists...');
    return this.request('/playlists');
  }

  async createPlaylist(playlistData) {
    console.log('📋 Criando playlist:', playlistData);
    return this.request('/playlists', {
      method: 'POST',
      body: JSON.stringify(playlistData),
    });
  }

  async updatePlaylist(playlistId, playlistData) {
    console.log('📋 Atualizando playlist:', playlistId, playlistData);
    return this.request(`/playlists/${playlistId}`, {
      method: 'PUT',
      body: JSON.stringify(playlistData),
    });
  }

  async deletePlaylist(playlistId) {
    console.log('🗑️ Deletando playlist:', playlistId);
    return this.request(`/playlists/${playlistId}`, {
      method: 'DELETE',
    });
  }

  async getDashboardStats() {
    console.log('📊 Buscando estatísticas do dashboard...');
    try {
      const [devices, medias, playlists] = await Promise.all([
        this.getDevices(),
        this.getMedias(),
        this.getPlaylists(),
      ]);

      const onlineDevices = devices.filter(device => device.status === 'online').length;
      const totalFileSize = medias.reduce((total, media) => total + (media.fileSize || 0), 0);
      const totalDuration = medias.reduce((total, media) => total + (media.durationSec || 0), 0);

      const stats = {
        totalDevices: devices.length,
        onlineDevices,
        totalPlaylists: playlists.length,
        totalMedia: medias.length,
        totalFileSize,
        totalDuration,
      };

      console.log('📊 Estatísticas calculadas:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      throw error;
    }
  }
}

export default new ApiService();
