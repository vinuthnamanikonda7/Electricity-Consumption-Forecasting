import api from './api';

export const consumptionService = {
  async getReadings(params = {}) {
    const response = await api.get('/consumption', { params });
    return response.data;
  },

  async getReadingById(id) {
    const response = await api.get(`/consumption/${id}`);
    return response.data;
  },

  async createReading(readingData) {
    const response = await api.post('/consumption', readingData);
    return response.data;
  },

  async updateReading(id, readingData) {
    const response = await api.put(`/consumption/${id}`, readingData);
    return response.data;
  },

  async deleteReading(id) {
    const response = await api.delete(`/consumption/${id}`);
    return response.data;
  },

  async seedDemoReadings() {
    const response = await api.post('/consumption/seed-demo');
    return response.data;
  }
};
