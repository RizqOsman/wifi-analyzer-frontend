import axios from './axios';

export const wifiAPI = {
  // Mengambil daftar campaigns
  getCampaigns: async () => {
    const response = await axios.get('/campaigns/campaign-list');
    return response.data;
  },

  // Mengambil daftar networks berdasarkan campaign ID
  getNetworks: async (campaignId = null) => {
    const params = campaignId ? { campaign_id: campaignId } : {};
    const response = await axios.get('/wifi/networks', { params });
    return response.data;
  },

  // Mengambil detail satu network
  getNetwork: async (id) => {
    const response = await axios.get(`/wifi/networks/${id}`);
    return response.data;
  },

  // Inspect detail network
  inspect: async (id) => {
    const response = await axios.get(`/wifi/wifi/inspect/${id}`);
    return response.data;
  },

  // Launch attack pada network
  attack: async (id) => {
    const response = await axios.get(`/wifi/wifi/attack/${id}`);
    return response.data;
  },

  // Stop attack process
  stop: async (id) => {
    const response = await axios.get(`/wifi/wifi/stop/${id}`);
    return response.data;
  },
};
