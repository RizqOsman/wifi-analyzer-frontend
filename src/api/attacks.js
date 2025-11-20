import axios from './axios';

export const attacksAPI = {
  getAll: async () => {
    const response = await axios.get('/attacks/attacks');
    return response.data;
  },

  getActive: async () => {
    const response = await axios.get('/attacks/attacks/active');
    return response.data;
  },

  getHistory: async () => {
    const response = await axios.get('/attacks/attacks/history');
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`/attacks/attacks/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axios.post('/attacks/attacks', data);
    return response.data;
  },

  stop: async (id) => {
    const response = await axios.put(`/attacks/attacks/${id}/stop`);
    return response.data;
  },
};
