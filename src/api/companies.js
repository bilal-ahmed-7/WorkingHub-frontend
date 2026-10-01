import apiClient from './client';

export const getCompanyDetailsApi = async () => {
  const response = await apiClient.get('/companies/me/');
  return response.data;
};

export const updateCompanyDetailsApi = async (data) => {
  const response = await apiClient.patch('/companies/me/', data);
  return response.data;
};

export const getDashboardStatsApi = async () => {
  const response = await apiClient.get('/companies/dashboard-stats/');
  return response.data;
};

export const getCompanyWorkersApi = async (params = {}) => {
  const response = await apiClient.get('/companies/workers/', { params });
  return response.data;
};

export const deleteCompanyWorkerApi = async (workerId) => {
  const response = await apiClient.delete(`/companies/workers/${workerId}/`);
  return response.data;
};

export const setCompanyWorkerActiveApi = async (workerId, isActive) => {
  const response = await apiClient.patch(`/companies/workers/${workerId}/status/`, {
    is_active: isActive,
  });
  return response.data;
};
