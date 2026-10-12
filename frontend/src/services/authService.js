import api from './api';

export const authService = {
  async sendOtp(email, purpose = 'login') {
    const response = await api.post('/auth/send-otp', { email, purpose });
    return response.data;
  },

  async verifyOtp(email, otp_code) {
    const response = await api.post('/auth/verify-otp', { email, otp_code });
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async loginWithPassword(identifier, password, portal = null) {
    const response = await api.post('/auth/login-password', {
      email: identifier,
      loginId: identifier,
      password,
      portal
    });
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  }
};
