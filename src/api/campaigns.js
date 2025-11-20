import axios from './axios';

export const campaignsAPI = {
  getList: async () => {
    const response = await axios.get('/campaigns/campaign-list');
    return response.data;
  },

  create: async (data) => {
    const response = await axios.post('/campaigns/campaign', data);
    return response.data;
  },

  start: async (id) => {
    const response = await axios.get(`/campaigns/campaign-start/${id}`);
    return response.data;
  },

  stop: async () => {
    const response = await axios.get('/campaigns/campaign-stop');
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`/campaigns/campaign-delete/${id}`);
    return response.data;
  },

  select: async (id) => {
    const response = await axios.get(`/campaigns/campaign/select/${id}`);
    return response.data;
  },

  getData: async (id) => {
    const response = await axios.get(`/campaigns/campaign/data/${id}`);
    return response.data;
  },

  getName: async (id) => {
    const response = await axios.get(`/campaigns/campaign/name/${id}`);
    return response.data;
  },

  setAlert: async (id) => {
    const response = await axios.get(`/campaigns/set-alert/${id}`);
    return response.data;
  },

  setAlertNotSecure: async (id) => {
    const response = await axios.get(`/campaigns/set-alert-notsecure/${id}`);
    return response.data;
  },

  // Menambahkan endpoint yang hilang sesuai API contract
  exportPdf: async (id) => {
    const response = await axios.get(`/campaigns/export-pdf/${id}`);
    return response.data;
  },

  exportXlsx: async (id) => {
    const response = await axios.get(`/campaigns/export-xlxs/${id}`);
    return response.data;
  },

  getRogueAp: async () => {
    const response = await axios.get('/campaigns/rogueap');
    return response.data;
  }
};