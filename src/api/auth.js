import axios from './axios';

export const authAPI = {
  login: async (username, password) => {
    console.log('[authAPI] Route: POST /auth/login', { username });
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
    console.log('[authAPI] Route: GET /auth/logout');
    const response = await axios.get('/auth/logout');
    return response.data;
  },

  changePassword: async (data) => {
    console.log('[authAPI] Route: POST /auth/change-password');
    const response = await axios.post('/auth/change-password', data);
    return response.data;
  },

  updateProfile: async (data) => {
    console.log('[authAPI] Route: POST /auth/update-profile', data);
    const response = await axios.post('/auth/update-profile', data);
    return response.data;
  },
};
