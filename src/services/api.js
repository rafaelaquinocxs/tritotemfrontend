const API_BASE_URL = 'https://tritotem-cc0a461d6f3e.herokuapp.com/api';

const request = async (endpoint, method = 'GET', body = null, headers = {}) => {
  try {
    const cleanEndpoint = `/${endpoint}`.replace(/\/{2,}/g, '/');
    const url = `${API_BASE_URL}${cleanEndpoint}`;

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro na requisição: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro na API:', error.message);
    throw error;
  }
};

// ====================== USUÁRIOS ======================

export const getUsers = () => request('/users');

export const getUserById = (id) => request(`/users/${id}`);

export const createUser = (userData) =>
  request('/users', 'POST', userData);

export const updateUser = (id, userData) =>
  request(`/users/${id}`, 'PUT', userData);

export const deleteUser = (id) =>
  request(`/users/${id}`, 'DELETE');

// ====================== DISPOSITIVOS ======================

export const getDevices = () => request('/devices');

export const getDeviceById = (id) =>
  request(`/devices/${id}`);

export const createDevice = (deviceData) =>
  request('/devices', 'POST', deviceData);

export const updateDevice = (id, deviceData) =>
  request(`/devices/${id}`, 'PUT', deviceData);

export const deleteDevice = (id) =>
  request(`/devices/${id}`, 'DELETE');

// ====================== MÍDIAS ======================

export const getMedias = () => request('/medias');

export const getMediaById = (id) =>
  request(`/medias/${id}`);

export const createMedia = (mediaData) =>
  request('/medias', 'POST', mediaData);

export const updateMedia = (id, mediaData) =>
  request(`/medias/${id}`, 'PUT', mediaData);

export const deleteMedia = (id) =>
  request(`/medias/${id}`, 'DELETE');

// ====================== TELAS ======================

export const getScreens = () => request('/screens');

export const getScreenById = (id) =>
  request(`/screens/${id}`);

export const createScreen = (screenData) =>
  request('/screens', 'POST', screenData);

export const updateScreen = (id, screenData) =>
  request(`/screens/${id}`, 'PUT', screenData);

export const deleteScreen = (id) =>
  request(`/screens/${id}`, 'DELETE');

// ====================== AUTENTICAÇÃO ======================

export const login = (credentials) =>
  request('/auth/login', 'POST', credentials);

export const register = (userData) =>
  request('/auth/register', 'POST', userData);
