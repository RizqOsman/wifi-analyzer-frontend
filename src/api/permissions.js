import axios from './axios';

export const permissionsAPI = {
  getAll: async () => {
    console.log('[permissionsAPI] Route: GET /permissions/permissions');
    const response = await axios.get('/permissions/permissions');
    return response.data;
  },

  create: async (data) => {
    console.log('[permissionsAPI] Route: POST /permissions/permission/create', data);
    const response = await axios.post('/permissions/permission/create', data);
    return response.data;
  },

  getById: async (id) => {
    console.log(`[permissionsAPI] Route: GET /permissions/permission/${id}`);
    const response = await axios.get(`/permissions/permission/${id}`);
    return response.data;
  },

  delete: async (id) => {
    console.log(`[permissionsAPI] Route: GET /permissions/permission/delete/${id}`);
    const response = await axios.get(`/permissions/permission/delete/${id}`);
    return response.data;
  },
};
