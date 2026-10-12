import api from './api';

export const recommendationService = {
  async getRecommendations() {
    const response = await api.get('/recommendations');
    return response.data;
  },

  async toggleApplyRecommendation(id) {
    const response = await api.put(`/recommendations/${id}/apply`);
    return response.data;
  }
};
