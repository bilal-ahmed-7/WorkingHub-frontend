import apiClient from './client';

export const getAudienceApi = async () => {
  const response = await apiClient.get('/audience/');
  return response.data;
};

export const createAudienceApi = async (data) => {
  const response = await apiClient.post('/audience/', data);
  return response.data;
};

export const updateAudienceApi = async (audienceId, data) => {
  const response = await apiClient.patch(`/audience/${audienceId}/`, data);
  return response.data;
};

export const deleteAudienceApi = async (audienceId) => {
  const response = await apiClient.delete(`/audience/${audienceId}/`);
  return response.data;
};
