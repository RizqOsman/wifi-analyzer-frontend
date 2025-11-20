import axios from './axios';

export const usersAPI = {
  getAll: async () => {
    const response = await axios.get('/users/users');
    return response.data;
  },

  create: async (data) => {
    const response = await axios.post('/users/user/create', data);
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`/users/user/${id}`);
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.get(`/users/user/delete/${id}`);
    return response.data;
  },

  changeRole: async (id, roleIds) => {
    const response = await axios.post(`/users/user/change-role/${id}`, roleIds);
    return response.data;
  },
};
