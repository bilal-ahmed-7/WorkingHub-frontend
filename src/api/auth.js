import apiClient from './client';

export const registerOwnerApi = async (data) => {
  const response = await apiClient.post('/accounts/register/', data);
  return response.data;
};

export const loginApi = async (credentials) => {
  const response = await apiClient.post('/accounts/login/', credentials);
  return response.data;
};

export const getProfileApi = async () => {
  const response = await apiClient.get('/accounts/me/');
  return response.data;
};

export const updateProfileApi = async (data) => {
  const response = await apiClient.patch('/accounts/me/', data);
  return response.data;
};

export const changePasswordApi = async (data) => {
  const response = await apiClient.post('/accounts/change-password/', data);
  return response.data;
};

export const logoutApi = async (refreshToken) => {
  try {
    await apiClient.post('/accounts/logout/', { refresh: refreshToken });
  } catch (err) {
    console.error('Logout request failed:', err);
  }
};
