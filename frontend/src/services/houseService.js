import api from './api';

export const houseService = {
  async getHouseData() {
    const response = await api.get('/house');
    return response.data;
  },

  async saveHouseDetails(details) {
    const response = await api.post('/house', details);
    return response.data;
  },

  async addAppliance(applianceData) {
    const response = await api.post('/house/appliances', applianceData);
    return response.data;
  },

  async updateAppliance(id, applianceData) {
    const response = await api.put(`/house/appliances/${id}`, applianceData);
    return response.data;
  },

  async deleteAppliance(id) {
    const response = await api.delete(`/house/appliances/${id}`);
    return response.data;
  }
};
