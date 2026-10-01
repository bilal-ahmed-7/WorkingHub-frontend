import apiClient from './client';

export const getIntegrationsApi = async (params = {}) => {
  const response = await apiClient.get('/integrations/', { params });
  return response.data;
};

export const createIntegrationApi = async (data) => {
  const response = await apiClient.post('/integrations/', data);
  return response.data;
};

export const updateIntegrationApi = async (id, data) => {
  const response = await apiClient.patch(`/integrations/${id}/`, data);
  return response.data;
};

export const deleteIntegrationApi = async (id) => {
  const response = await apiClient.delete(`/integrations/${id}/`);
  return response.data;
};

export const getPublicIntegrationApi = async (publicId) => {
  const response = await apiClient.get(`/integrations/public/${publicId}/`);
  return response.data;
};

export const submitIntegrationApi = async (publicId, data) => {
  const response = await apiClient.post(`/integrations/public/${publicId}/submit/`, data);
  return response.data;
};

export const getIntegrationLogsApi = async (id, params = {}) => {
  const response = await apiClient.get(`/integrations/${id}/logs/`, { params });
  return response.data;
};