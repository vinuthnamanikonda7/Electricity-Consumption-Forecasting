import api from './api';

export const forecastService = {
  async generateForecast(payload = { horizon_days: 7, window_size: 7 }) {
    const response = await api.post('/forecast', payload);
    return response.data;
  },

  async getForecasts(params = {}) {
    const response = await api.get('/forecast', { params });
    return response.data;
  },

  async getForecastById(id) {
    const response = await api.get(`/forecast/${id}`);
    return response.data;
  },

  async deleteForecast(id) {
    const response = await api.delete(`/forecast/${id}`);
    return response.data;
  },

  async clearAllForecasts() {
    const response = await api.delete('/forecast');
    return response.data;
  }
};
