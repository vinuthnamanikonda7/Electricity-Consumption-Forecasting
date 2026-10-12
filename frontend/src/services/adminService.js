import api from './api';

export const adminService = {
  async getMetrics() {
    const response = await api.get('/admin/metrics');
    return response.data;
  },

  async getAllUsers(search = '') {
    const response = await api.get('/admin/users', { params: { search } });
    return response.data;
  },

  async updateUser(id, userData) {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  async deleteUser(id) {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  async getSystemReports() {
    const response = await api.get('/admin/reports');
    return response.data;
  },

  async triggerBackup() {
    const response = await api.post('/admin/backup');
    return response.data;
  },

  async getContactMessages() {
    const response = await api.get('/admin/messages');
    return response.data;
  },

  async updateMessageStatus(id, status) {
    const response = await api.put(`/admin/messages/${id}`, { status });
    return response.data;
  },

  async deleteContactMessage(id) {
    const response = await api.delete(`/admin/messages/${id}`);
    return response.data;
  },

  async getAdminLogs() {
    const response = await api.get('/admin/logs');
    return response.data;
  }
};
