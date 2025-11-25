import axios from './axios';

export const wifiAPI = {
  // Mengambil daftar campaigns
  getCampaigns: async () => {
    console.log('[wifiAPI] Route: GET /campaigns/campaign-list');
    const response = await axios.get('/campaigns/campaign-list');
    return response.data;
  },

  // Mengambil daftar networks berdasarkan campaign ID
  getNetworks: async (campaignId = null) => {
    console.log(`[wifiAPI] Route: GET /wifi/networks${campaignId ? `?campaign_id=${campaignId}` : ''}`);
    const params = campaignId ? { campaign_id: campaignId } : {};
    const response = await axios.get('/wifi/networks', { params });
    return response.data;
  },

  // Mengambil detail satu network
  getNetwork: async (id) => {
    console.log(`[wifiAPI] Route: GET /wifi/networks/${id}`);
    const response = await axios.get(`/wifi/networks/${id}`);
    return response.data;
  },

  // Inspect detail network
  inspect: async (id) => {
    console.log(`[wifiAPI] Route: GET /wifi/wifi/inspect/${id}`);
    const response = await axios.get(`/wifi/wifi/inspect/${id}`);
    return response.data;
  },

  // Launch attack pada network
  attack: async (id) => {
    console.log(`[wifiAPI] Route: GET /wifi/wifi/attack/${id}`);
    const response = await axios.get(`/wifi/wifi/attack/${id}`);
    return response.data;
  },

  // Stop attack process
  stop: async (id) => {
    console.log(`[wifiAPI] Route: GET /wifi/wifi/stop/${id}`);
    const response = await axios.get(`/wifi/wifi/stop/${id}`);
    return response.data;
  },
};
