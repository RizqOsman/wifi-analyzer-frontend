import axios from './axios';

export const attacksAPI = {
  getAll: async () => {
    console.log('[attacksAPI] Route: GET /attacks/attacks');
    const response = await axios.get('/attacks/attacks');
    return response.data;
  },

  getActive: async () => {
    console.log('[attacksAPI] Route: GET /attacks/attacks/active');
    const response = await axios.get('/attacks/attacks/active');
    return response.data;
  },

  getHistory: async () => {
    console.log('[attacksAPI] Route: GET /attacks/attacks/history');
    const response = await axios.get('/attacks/attacks/history');
    return response.data;
  },

  getById: async (id) => {
    console.log(`[attacksAPI] Route: GET /attacks/attacks/${id}`);
    const response = await axios.get(`/attacks/attacks/${id}`);
    return response.data;
  },

  create: async (data) => {
    console.log('[attacksAPI] Route: POST /attacks/attacks', data);
    const response = await axios.post('/attacks/attacks', data);
    return response.data;
  },

  stop: async (id) => {
    console.log(`[attacksAPI] Route: PUT /attacks/attacks/${id}/stop`);
    const response = await axios.put(`/attacks/attacks/${id}/stop`);
    return response.data;
  },
};
