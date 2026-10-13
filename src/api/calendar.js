import apiClient from './client';

export const startCalendlyConnectApi = async () => {
  const response = await apiClient.post('/calendar/connect/');
  return response.data;
};

export const getCalendlyStatusApi = async () => {
  const response = await apiClient.get('/calendar/status/');
  return response.data;
};

export const getCalendlyProfileApi = async () => {
  const response = await apiClient.get('/calendar/profile/');
  return response.data;
};

export const getCalendlyEventTypesApi = async () => {
  const response = await apiClient.get('/calendar/event-types/', {
    params: { active: 'true' },
  });
  return response.data;
};

export const createCalendlyEventTypeApi = async (eventType) => {
  const response = await apiClient.post('/calendar/event-types/', eventType);
  return response.data;
};

export const getCalendlyScheduledEventsApi = async () => {
  const response = await apiClient.get('/calendar/scheduled-events/');
  return response.data;
};

export const updateCalendlyEventTypeApi = async (eventTypeUri, eventType) => {
  const eventTypeId = eventTypeUri.split('/').filter(Boolean).pop();
  const response = await apiClient.patch(
    `/calendar/event-types/${encodeURIComponent(eventTypeId)}/`,
    eventType,
  );
  return response.data;
};

export const deleteCalendlyEventTypeApi = async (eventTypeUri) => {
  const eventTypeId = eventTypeUri.split('/').filter(Boolean).pop();
  const response = await apiClient.delete(
    `/calendar/event-types/${encodeURIComponent(eventTypeId)}/`,
  );
  return response.data;
};

export const cancelScheduledEventApi = async (eventUuid) => {
  const response = await apiClient.post(`/calendar/scheduled-events/${eventUuid}/cancel/`);
  return response.data;
};
