import axios from './axios';

export const rolesAPI = {
  getAll: async () => {
    console.log('[rolesAPI] Route: GET /roles/roles');
    const response = await axios.get('/roles/roles');
    return response.data;
  },

  create: async (data) => {
    console.log('[rolesAPI] Route: POST /roles/role/create', data);
    const response = await axios.post('/roles/role/create', data);
    return response.data;
  },

  getById: async (id) => {
    console.log(`[rolesAPI] Route: GET /roles/role/${id}`);
    const response = await axios.get(`/roles/role/${id}`);
    return response.data;
  },

  delete: async (id) => {
    console.log(`[rolesAPI] Route: GET /roles/role/delete/${id}`);
    const response = await axios.get(`/roles/role/delete/${id}`);
    return response.data;
  },

  changePermission: async (id, permissionIds) => {
    console.log(`[rolesAPI] Route: POST /roles/role/change-permission/${id}`, permissionIds);
    const response = await axios.post(`/roles/role/change-permission/${id}`, permissionIds);
    return response.data;
  },
};
