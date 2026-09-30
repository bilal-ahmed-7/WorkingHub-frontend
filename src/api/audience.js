import apiClient from './client';

export const getAudienceApi = async () => {
  const response = await apiClient.get('/audience/');
  return response.data;
};
