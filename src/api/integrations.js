import apiClient from './client';

export const getIntegrationsApi = async () => {
  const response = await apiClient.get('/integrations/');
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