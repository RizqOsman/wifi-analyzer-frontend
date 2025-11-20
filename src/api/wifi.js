import axios from './axios';

export const wifiAPI = {
  getNetworks: async (campaignId = null) => {
    const params = campaignId ? { campaign_id: campaignId } : {};
    const response = await axios.get('/wifi/networks', { params });
    return response.data;
  },

  getNetwork: async (id) => {
    const response = await axios.get(`/wifi/networks/${id}`);
    return response.data;
  },

  inspect: async (id) => {
    const response = await axios.get(`/wifi/wifi/inspect/${id}`);
    return response.data;
  },

  attack: async (id) => {
    const response = await axios.get(`/wifi/wifi/attack/${id}`);
    return response.data;
  },

  stop: async (id) => {
    const response = await axios.get(`/wifi/wifi/stop/${id}`);
    return response.data;
  },
};
