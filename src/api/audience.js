import apiClient from './client';

export const getAudienceApi = async (params = {}) => {
  const response = await apiClient.get('/audience/', { params });
  return response.data;
};
