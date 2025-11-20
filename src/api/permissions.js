import axios from './axios';

export const permissionsAPI = {
  getAll: async () => {
    const response = await axios.get('/permissions/permissions');
    return response.data;
  },

  create: async (data) => {
    const response = await axios.post('/permissions/permission/create', data);
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`/permissions/permission/${id}`);
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.get(`/permissions/permission/delete/${id}`);
    return response.data;
  },
};
