  import apiClient from './client';

export const getAudienceApi = async (params = {}) => {
  const response = await apiClient.get('/audience/', { params });
  return response.data;
};

export const createAudienceRecordApi = async (data) => {
  const response = await apiClient.post('/audience/', data);
  return response.data;
};

export const updateAudienceRecordApi = async (id, data) => {
  const response = await apiClient.patch(`/audience/${id}/`, data);
  return response.data;
};

export const deleteAudienceRecordApi = async (id) => {
  await apiClient.delete(`/audience/${id}/`);
};
