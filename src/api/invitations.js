import apiClient from './client';

export const getInvitationsApi = async () => {
  const response = await apiClient.get('/invitations/');
  return response.data;
};

export const sendInvitationApi = async (email, frontendUrl = '') => {
  const response = await apiClient.post('/invitations/send/', {
    email,
    frontend_url: frontendUrl || window.location.origin,
  });
  return response.data;
};

export const revokeInvitationApi = async (token) => {
  const response = await apiClient.delete(`/invitations/revoke/${token}/`);
  return response.data;
};

export const validateInvitationTokenApi = async (token) => {
  const response = await apiClient.get(`/invitations/validate/${token}/`);
  return response.data;
};

export const acceptInvitationApi = async (data) => {
  const response = await apiClient.post('/invitations/accept/', data);
  return response.data;
};
