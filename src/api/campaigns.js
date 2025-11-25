import axios from './axios';

export const campaignsAPI = {
  getList: async () => {
    console.log('[campaignsAPI] Route: GET /campaigns/campaign-list');
    const response = await axios.get('/campaigns/campaign-list');
    return response.data;
  },

  create: async (data) => {
    console.log('[campaignsAPI] Route: POST /campaigns/campaign', data);
    const response = await axios.post('/campaigns/campaign', data);
    return response.data;
  },

  start: async (id) => {
    console.log(`[campaignsAPI] Route: GET /campaigns/campaign-start/${id}`);
    const response = await axios.get(`/campaigns/campaign-start/${id}`);
    return response.data;
  },

  stop: async () => {
    console.log('[campaignsAPI] Route: GET /campaigns/campaign-stop');
    const response = await axios.get('/campaigns/campaign-stop');
    return response.data;
  },

  delete: async (id) => {
    console.log(`[campaignsAPI] Route: DELETE /campaigns/campaign-delete/${id}`);
    const response = await axios.delete(`/campaigns/campaign-delete/${id}`);
    return response.data;
  },

  select: async (id) => {
    console.log(`[campaignsAPI] Route: GET /campaigns/campaign/select/${id}`);
    const response = await axios.get(`/campaigns/campaign/select/${id}`);
    return response.data;
  },

  getData: async (id) => {
    console.log(`[campaignsAPI] Route: GET /campaigns/campaign/data/${id}`);
    const response = await axios.get(`/campaigns/campaign/data/${id}`);
    return response.data;
  },

  getName: async (id) => {
    console.log(`[campaignsAPI] Route: GET /campaigns/campaign/name/${id}`);
    const response = await axios.get(`/campaigns/campaign/name/${id}`);
    return response.data;
  },

  setAlert: async (id) => {
    console.log(`[campaignsAPI] Route: GET /campaigns/set-alert/${id}`);
    const response = await axios.get(`/campaigns/set-alert/${id}`);
    return response.data;
  },

  setAlertNotSecure: async (id) => {
    console.log(`[campaignsAPI] Route: GET /campaigns/set-alert-notsecure/${id}`);
    const response = await axios.get(`/campaigns/set-alert-notsecure/${id}`);
    return response.data;
  },

  // Menambahkan endpoint yang hilang sesuai API contract
  exportPdf: async (id) => {
    console.log(`[campaignsAPI] Route: GET /campaigns/export-pdf/${id}`);
    const response = await axios.get(`/campaigns/export-pdf/${id}`);
    return response.data;
  },

  exportXlsx: async (id) => {
    console.log(`[campaignsAPI] Route: GET /campaigns/export-xlxs/${id}`);
    const response = await axios.get(`/campaigns/export-xlxs/${id}`);
    return response.data;
  },

  getRogueAp: async () => {
    console.log('[campaignsAPI] Route: GET /campaigns/rogueap');
    const response = await axios.get('/campaigns/rogueap');
    return response.data;
  }
};