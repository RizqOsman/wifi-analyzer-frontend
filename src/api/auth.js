import axios from './axios';

export const authAPI = {
  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await axios.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  logout: async () => {
    const response = await axios.get('/auth/logout');
    return response.data;
  },

  changePassword: async (data) => {
    const response = await axios.post('/auth/change-password', data);
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await axios.post('/auth/update-profile', data);
    return response.data;
  },
};
