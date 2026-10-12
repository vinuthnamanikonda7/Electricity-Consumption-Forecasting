import api from './api';

export const predictionService = {
  async calculatePrediction(notes = '') {
    const response = await api.post('/predictions/calculate', { notes });
    return response.data;
  },

  async getPredictionHistory() {
    const response = await api.get('/predictions/history');
    return response.data;
  },

  async deletePrediction(id) {
    const response = await api.delete(`/predictions/${id}`);
    return response.data;
  }
};
