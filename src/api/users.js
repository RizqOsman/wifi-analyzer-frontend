import axios from './axios';

export const usersAPI = {
  getAll: async () => {
    console.log('[usersAPI] Route: GET /users/users');
    const response = await axios.get('/users/users');
    return response.data;
  },

  create: async (data) => {
    console.log('[usersAPI] Route: POST /users/user/create', data);
    const response = await axios.post('/users/user/create', data);
    return response.data;
  },

  getById: async (id) => {
    console.log(`[usersAPI] Route: GET /users/user/${id}`);
    const response = await axios.get(`/users/user/${id}`);
    return response.data;
  },

  delete: async (id) => {
    console.log(`[usersAPI] Route: GET /users/user/delete/${id}`);
    const response = await axios.get(`/users/user/delete/${id}`);
    return response.data;
  },

  changeRole: async (id, roleIds) => {
    console.log(`[usersAPI] Route: POST /users/user/change-role/${id}`, roleIds);
    const response = await axios.post(`/users/user/change-role/${id}`, roleIds);
    return response.data;
  },
};
