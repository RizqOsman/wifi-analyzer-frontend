import axios from './axios';

export const rolesAPI = {
  getAll: async () => {
    const response = await axios.get('/roles/roles');
    return response.data;
  },

  create: async (data) => {
    const response = await axios.post('/roles/role/create', data);
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`/roles/role/${id}`);
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.get(`/roles/role/delete/${id}`);
    return response.data;
  },

  changePermission: async (id, permissionIds) => {
    const response = await axios.post(`/roles/role/change-permission/${id}`, permissionIds);
    return response.data;
  },
};
