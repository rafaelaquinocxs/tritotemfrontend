const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Se a resposta não tem conteúdo, retorna null
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Devices endpoints
  async getDevices() {
    return this.request('/devices');
  }

  async createDevice(deviceData) {
    return this.request('/devices', {
      method: 'POST',
      body: JSON.stringify(deviceData),
    });
  }

  async updateDevice(deviceId, deviceData) {
    return this.request(`/devices/${deviceId}`, {
      method: 'PUT',
      body: JSON.stringify(deviceData),
    });
  }

  async deleteDevice(deviceId) {
    return this.request(`/devices/${deviceId}`, {
      method: 'DELETE',
    });
  }

  async broadcastAssignPlaylist(playlistId) {
    return this.request('/devices/broadcast-assign', {
      method: 'POST',
      body: JSON.stringify({ playlistId }),
    });
  }

  // Media endpoints
  async getMedias() {
    return this.request('/media');
  }

  async uploadMedia(formData) {
    return this.request('/media', {
      method: 'POST',
      headers: {}, // Remove Content-Type para FormData
      body: formData,
    });
  }

  async deleteMedia(mediaId) {
    return this.request(`/media/${mediaId}`, {
      method: 'DELETE',
    });
  }

  // Playlists endpoints
  async getPlaylists() {
    return this.request('/playlists');
  }

  async createPlaylist(playlistData) {
    return this.request('/playlists', {
      method: 'POST',
      body: JSON.stringify(playlistData),
    });
  }

  async updatePlaylist(playlistId, playlistData) {
    return this.request(`/playlists/${playlistId}`, {
      method: 'PUT',
      body: JSON.stringify(playlistData),
    });
  }

  async deletePlaylist(playlistId) {
    return this.request(`/playlists/${playlistId}`, {
      method: 'DELETE',
    });
  }

  // Dashboard stats
  async getDashboardStats() {
    const [devices, medias, playlists] = await Promise.all([
      this.getDevices(),
      this.getMedias(),
      this.getPlaylists(),
    ]);

    const onlineDevices = devices.filter(device => device.status === 'online').length;
    const totalFileSize = medias.reduce((total, media) => total + (media.fileSize || 0), 0);
    const totalDuration = medias.reduce((total, media) => total + (media.durationSec || 0), 0);

    return {
      totalDevices: devices.length,
      onlineDevices,
      totalPlaylists: playlists.length,
      totalMedia: medias.length,
      totalFileSize,
      totalDuration,
    };
  }
}

export default new ApiService();

