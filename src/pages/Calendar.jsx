import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  AlertCircle,
  CalendarDays,
  Check,
  Clock,
  Copy,
  Edit2,
  ExternalLink,
  Loader2,
  MapPin,
  Plus,
  PlusCircle,
  Phone,
  RefreshCw,
  Trash2,
  Video,
  X,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  createCalendlyEventTypeApi,
  deleteCalendlyEventTypeApi,
  cancelScheduledEventApi,
  getCalendlyEventTypesApi,
  getCalendlyProfileApi,
  getCalendlyScheduledEventsApi,
  getCalendlyStatusApi,
  startCalendlyConnectApi,
  updateCalendlyEventTypeApi,
} from '../api/calendar';

const LOCATION_TYPES = [
  { value: 'ask_invitee', label: 'Ask invitee' },
  { value: 'physical', label: 'In person' },
  { value: 'custom', label: 'Custom location or link' },
  { value: 'zoom_conference', label: 'Zoom' },
  { value: 'google_conference', label: 'Google Meet' },
  { value: 'gotomeeting_conference', label: 'GoTo Meeting' },
  { value: 'microsoft_teams_conference', label: 'Microsoft Teams' },
  { value: 'webex_conference', label: 'Webex' },
  { value: 'inbound_call', label: 'Inbound phone call' },
  { value: 'outbound_call', label: 'Phone call' },
];

const emptyForm = {
  name: '',
  duration: '30',
  description: '',
  locationKind: 'ask_invitee',
  locationValue: '',
  originalLocations: [],
};

const locationValueField = (kind) => {
  if (kind === 'physical' || kind === 'custom') return 'location';
  if (kind === 'inbound_call' || kind === 'outbound_call') return 'phone_number';
  return null;
};

const eventLocationsFromForm = (form) => {
  const location = { kind: form.locationKind };
  const valueField = locationValueField(form.locationKind);
  const originalAdditionalInfo = form.originalLocations[0]?.additional_info;
  if (originalAdditionalInfo) location.additional_info = originalAdditionalInfo;
  if (valueField && form.locationValue.trim()) {
    location[valueField] = form.locationValue.trim();
  }
  return [location, ...form.originalLocations.slice(1)];
};

const locationLabel = (location) => {
  if (!location) return 'Not specified';
  const label = LOCATION_TYPES.find((option) => option.value === location.kind)?.label
    || location.kind?.replaceAll('_', ' ')
    || 'Not specified';
  const detail = location.location || location.phone_number || location.additional_info;
  return detail ? `${label} · ${detail}` : label;
};

const eventHost = (event, fallback) => event.profile?.name || fallback || 'Connected Calendly user';

const CalendlyMark = () => (
  <div className="calendly-mark" aria-label="Calendly">
    <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
      <path
        d="M19.655 14.262c.281 0 .557.023.828.064 0 .005-.005.01-.005.014-.105.267-.234.534-.381.786l-1.219 2.106c-1.112 1.936-3.177 3.127-5.411 3.127h-2.432c-2.23 0-4.294-1.191-5.412-3.127l-1.218-2.106a6.251 6.251 0 0 1 0-6.252l1.218-2.106C6.736 4.832 8.8 3.641 11.035 3.641h2.432c2.23 0 4.294 1.191 5.411 3.127l1.219 2.106c.147.252.271.519.381.786 0 .004.005.009.005.014-.267.041-.543.064-.828.064-1.816 0-2.501-.607-3.291-1.306-.764-.676-1.711-1.517-3.44-1.517h-1.029c-1.251 0-2.387.455-3.2 1.278-.796.805-1.233 1.904-1.233 3.099v1.411c0 1.196.437 2.295 1.233 3.099.813.823 1.949 1.278 3.2 1.278h1.034c1.729 0 2.676-.841 3.439-1.517.791-.703 1.471-1.306 3.287-1.301Zm.005-3.237c.399 0 .794-.036 1.179-.11-.002-.004-.002-.01-.002-.014-.073-.414-.193-.823-.349-1.218.731-.12 1.407-.396 1.986-.819 0-.004-.005-.013-.005-.018-.331-1.085-.832-2.101-1.489-3.03-.649-.915-1.435-1.719-2.331-2.395-1.867-1.398-4.088-2.138-6.428-2.138-1.448 0-2.855.28-4.175.841-1.273.543-2.423 1.315-3.407 2.299S2.878 6.552 2.341 7.83c-.557 1.324-.842 2.726-.842 4.175 0 1.448.281 2.855.842 4.174.542 1.274 1.314 2.423 2.298 3.407s2.129 1.761 3.407 2.299c1.324.556 2.727.841 4.175.841 2.34 0 4.561-.74 6.428-2.137a10.815 10.815 0 0 0 2.331-2.396c.652-.929 1.158-1.949 1.489-3.03 0-.004.005-.014.005-.018-.579-.423-1.255-.699-1.986-.819.161-.395.276-.804.349-1.218.005-.009.005-.014.005-.023.869.166 1.692.506 2.404 1.035.685.505.552 1.075.446 1.416C22.184 20.437 17.619 24 12.221 24c-6.625 0-12-5.375-12-12s5.37-12 12-12c5.398 0 9.963 3.563 11.471 8.464.106.341.239.915-.446 1.421-.717.529-1.535.873-2.404 1.034.128.716.128 1.45 0 2.166-.387-.074-.782-.11-1.182-.11-4.184 0-3.968 2.823-6.736 2.823h-1.029c-1.899 0-3.15-1.357-3.15-3.095v-1.411c0-1.738 1.251-3.094 3.15-3.094h1.034c2.768 0 2.552 2.823 6.731 2.827Z"
        fill="#006bff"
      />
    </svg>
  </div>
);

const Calendly = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingActive, setChangingActive] = useState('');
  const [profile, setProfile] = useState(null);
  const [eventTypes, setEventTypes] = useState([]);
  const [scheduledEvents, setScheduledEvents] = useState([]);
  const [showScheduledEvents, setShowScheduledEvents] = useState(false);
  const [copiedLink, setCopiedLink] = useState('');
  const [search, setSearch] = useState('');
  const [scheduledStatusFilter, setScheduledStatusFilter] = useState('all');
  const [error, setError] = useState(searchParams.get('error') || '');
  const [success, setSuccess] = useState(
    searchParams.get('connected') === 'true' ? 'Calendly connected successfully.' : '',
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [cancelingEvent, setCancelingEvent] = useState(null);
  const [isCanceling, setIsCanceling] = useState(false);

  const loadCalendlyData = useCallback(async () => {
    setDataLoading(true);
    setError('');
    try {
      const [profileResult, eventTypeResult, scheduledResult] = await Promise.allSettled([
        getCalendlyProfileApi(),
        getCalendlyEventTypesApi(),
        getCalendlyScheduledEventsApi(),
      ]);
      if (eventTypeResult.status === 'rejected') {
        throw eventTypeResult.reason;
      }
      setEventTypes(eventTypeResult.value.event_types || []);
      if (profileResult.status === 'fulfilled') {
        setProfile(profileResult.value);
      } else {
        setProfile(null);
      }
      if (scheduledResult.status === 'fulfilled') {
        setScheduledEvents(scheduledResult.value.events || []);
      } else {
        setScheduledEvents([]);
        setError(
          scheduledResult.reason.response?.data?.detail
          || 'Event types loaded, but scheduled events could not be fetched.',
        );
      }
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to load Calendly event types.');
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!document.getElementById('calendly-widget-css')) {
      const stylesheet = document.createElement('link');
      stylesheet.id = 'calendly-widget-css';
      stylesheet.href = 'https://assets.calendly.com/assets/external/widget.css';
      stylesheet.rel = 'stylesheet';
      document.head.appendChild(stylesheet);
    }
    if (!document.getElementById('calendly-widget-js')) {
      const script = document.createElement('script');
      script.id = 'calendly-widget-js';
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const checkConnection = async () => {
      try {
        const result = await getCalendlyStatusApi();
        if (!active) return;
        setConnected(result.connected);
        if (result.connected) await loadCalendlyData();
      } catch {
        if (active) setError('Unable to check your Calendly connection.');
      } finally {
        if (active) setLoading(false);
      }
    };
    checkConnection();
    return () => {
      active = false;
    };
  }, [loadCalendlyData]);

  const visibleEventTypes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return eventTypes.filter((event) => {
      if (!normalizedSearch) return true;
      return `${event.name || ''} ${event.description_plain || ''}`
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [eventTypes, search]);

  const connect = async () => {
    setConnecting(true);
    setError('');
    try {
      const { connect_url: connectUrl } = await startCalendlyConnectApi();
      window.location.assign(connectUrl);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to start Calendly connection.');
      setConnecting(false);
    }
  };

  const handleCopy = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(url);
      window.setTimeout(() => setCopiedLink(''), 2500);
    } catch {
      setError('Unable to copy the booking link. Please copy it from Calendly.');
    }
  };

  const openScheduler = (url) => {
    if (window.Calendly && typeof window.Calendly.initPopupWidget === 'function') {
      window.Calendly.initPopupWidget({ url });
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelingEvent?.uuid) return;
    setIsCanceling(true);
    setError('');
    try {
      await cancelScheduledEventApi(cancelingEvent.uuid);
      setCancelingEvent(null);
      setSuccess('Meeting canceled successfully.');
      await loadCalendlyData();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Failed to cancel meeting.');
    } finally {
      setIsCanceling(false);
    }
  };

  const filteredScheduledEvents = scheduledEvents.filter((event) => {
    if (scheduledStatusFilter === 'active') return event.status === 'active';
    if (scheduledStatusFilter === 'canceled') return event.status === 'canceled';
    return true;
  });

  const getLocationBadge = (locations) => {
    if (!locations?.length) return null;
    const type = locations[0].kind || locations[0].type || '';
    if (type.includes('google') || type.includes('zoom') || type.includes('teams') || type.includes('webex')) {
      return <span className="calendar-manager-type"><Video size={12} /> Video call</span>;
    }
    if (type.includes('phone') || type.includes('call')) {
      return <span className="calendar-manager-type"><Phone size={12} /> Phone call</span>;
    }
    return <span className="calendar-manager-type"><MapPin size={12} /> In person</span>;
  };

  const openCreateForm = () => {
    setEditingEvent(null);
    setForm({ ...emptyForm });
    setError('');
    setFormOpen(true);
  };

  const openEditForm = (event) => {
    const locations = Array.isArray(event.locations) ? event.locations : [];
    const firstLocation = locations[0] || {};
    const valueField = locationValueField(firstLocation.kind);
    setEditingEvent(event);
    setForm({
      name: event.name || '',
      duration: String(event.duration || 30),
      description: event.description_plain || '',
      locationKind: firstLocation.kind || 'ask_invitee',
      locationValue: valueField ? firstLocation[valueField] || '' : '',
      originalLocations: locations,
    });
    setError('');
    setFormOpen(true);
  };

  const saveEventType = async (submitEvent) => {
    submitEvent.preventDefault();
    const duration = Number(form.duration);
    if (!Number.isInteger(duration) || duration < 1 || duration > 720) {
      setError('Duration must be a whole number between 1 and 720 minutes.');
      return;
    }
    const valueField = locationValueField(form.locationKind);
    if (valueField && !form.locationValue.trim()) {
      setError(form.locationKind === 'inbound_call' || form.locationKind === 'outbound_call'
        ? 'Enter the phone number for this event type.'
        : 'Enter a location for this event type.');
      return;
    }

    const payload = {};
    if (!editingEvent || form.name.trim() !== editingEvent.name) {
      payload.name = form.name.trim();
    }
    if (!editingEvent || duration !== editingEvent.duration) {
      payload.duration = duration;
    }
    if (!editingEvent || form.description !== (editingEvent.description_plain || '')) {
      payload.description = form.description;
    }
    const originalLocation = editingEvent?.locations?.[0] || {};
    const originalValueField = locationValueField(originalLocation.kind);
    const currentLocationValue = originalValueField
      ? originalLocation[originalValueField] || ''
      : '';
    if (
      !editingEvent
      || form.locationKind !== (originalLocation.kind || 'ask_invitee')
      || form.locationValue.trim() !== currentLocationValue
    ) {
      payload.locations = eventLocationsFromForm(form);
    }
    if (editingEvent && Object.keys(payload).length === 0) {
      setSuccess('No event type changes to save.');
      setFormOpen(false);
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (editingEvent) {
        await updateCalendlyEventTypeApi(editingEvent.uri, payload);
        setSuccess('Event type updated in Calendly.');
      } else {
        await createCalendlyEventTypeApi(payload);
        setSuccess('Event type created in Calendly.');
      }
      setFormOpen(false);
      await loadCalendlyData();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to save the Calendly event type.');
    } finally {
      setSaving(false);
    }
  };

  const deleteEventType = async (event) => {
    if (!window.confirm(
      `Delete "${event.name}" from active Calendly event types? This deactivates it and preserves existing scheduled events.`,
    )) return;
    setChangingActive(event.uri);
    setError('');
    try {
      await deleteCalendlyEventTypeApi(event.uri);
      setSuccess('Event type deleted from active Calendly event types.');
      await loadCalendlyData();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to delete this event type.');
    } finally {
      setChangingActive('');
    }
  };

  const soloEvent = (event) => event.kind === 'solo';
  const hostName = profile?.name || 'Connected Calendly user';
  const durationOptions = Array.isArray(editingEvent?.duration_options)
    ? editingEvent.duration_options.filter(Number.isInteger)
    : [];

  if (loading) {
    return (
      <div className="calendar-page calendar-status-loading">
        <Loader2 size={30} className="spin-animation" aria-label="Loading Calendly connection" />
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="calendar-page">
        <section className="calendar-product-card">
          <Link className="calendar-back-link" to="/dashboard" aria-label="Back to dashboard">
            <ArrowLeft size={23} />
          </Link>
          <div className="calendar-product-heading">
            <CalendlyMark />
            <div className="calendar-product-details">
              <h1>Calendly</h1>
              <div className="calendar-product-meta">
                <span>Event types</span>
                <span aria-hidden="true">·</span>
                <span>Published by WorkHub</span>
              </div>
              <button
                className="calendar-connect-button"
                type="button"
                onClick={connect}
                disabled={connecting}
              >
                {connecting
                  ? <><Loader2 size={16} className="spin-animation" />Redirecting...</>
                  : <><CalendarDays size={16} />Connect Calendly</>}
              </button>
            </div>
          </div>
          {error && <div className="alert alert-error calendar-alert">{error}</div>}
          <p className="calendar-product-description">
            Calendly helps you book meetings without the back-and-forth. Connect your account
            to manage event types, create booking links, view attendee sessions, and cancel
            activities directly from WorkHub.
          </p>
          <div className="calendar-product-info">
            <div>
              <h2>Manage event types</h2>
              <p>Changes are saved to your Calendly account.</p>
            </div>
            <div>
              <h2>More info</h2>
              <a href="https://calendly.com" target="_blank" rel="noreferrer">
                calendly.com <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="calendar-page calendar-manager">
      <div className="calendar-header-card">
        <div className="calendar-header-left">
          <Link className="calendar-back-link" to="/dashboard" aria-label="Back to dashboard">
            <ArrowLeft size={22} />
          </Link>
          <CalendlyMark />
          <div className="calendar-header-title">
            <h1>
              Calendly Scheduling Hub
              <span className="calendar-status-badge"><Check size={12} />Connected</span>
            </h1>
            <div className="calendar-manager-account">
              {profile?.name || 'Connected Calendly account'}
              {profile?.email ? ` · ${profile.email}` : ''}
            </div>
          </div>
        </div>
        <div className="calendar-header-actions">
        {profile?.scheduling_url && (
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleCopy(profile.scheduling_url)}
            >
              {copiedLink === profile.scheduling_url ? <Check size={15} /> : <Copy size={15} />}
              {copiedLink === profile.scheduling_url ? 'Copied' : 'Copy booking page'}
            </button>
            <a
              href={profile.scheduling_url}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
            >
              View Calendly page <ExternalLink size={14} />
            </a>
          </>
        )}
        <button
            type="button"
            className="btn btn-secondary"
            onClick={loadCalendlyData}
            disabled={dataLoading}
          >
            {dataLoading
              ? <Loader2 size={15} className="spin-animation" />
              : <RefreshCw size={15} />}
            Refresh
          </button>
        </div>
      </div>

      {success && (
        <div className="alert alert-success calendar-manager-alert" role="status">
          <span>{success}</span>
          <button type="button" onClick={() => setSuccess('')} aria-label="Dismiss message">
            <X size={16} />
          </button>
        </div>
      )}
      {error && <div className="alert alert-error calendar-manager-alert" role="alert">{error}</div>}

      <nav className="calendar-tabs" aria-label="Calendly sections">
        <button
          type="button"
          className={`calendar-tab-btn ${!showScheduledEvents ? 'active' : ''}`}
          onClick={() => setShowScheduledEvents(false)}
        >
          <CalendarDays size={16} /> Event types ({eventTypes.length})
        </button>
        <button
          type="button"
          className={`calendar-tab-btn ${showScheduledEvents ? 'active' : ''}`}
          onClick={() => setShowScheduledEvents(true)}
        >
          <Clock size={16} /> Scheduled activities ({scheduledEvents.length})
        </button>
      </nav>

      {!showScheduledEvents && <section className="calendar-manager-panel">
        <div className="calendar-manager-toolbar">
          <div>
            <h2>Event types</h2>
            <p>{eventTypes.length} event types</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={openCreateForm}>
            <Plus size={17} /> Create event type
          </button>
        </div>

        <div className="calendar-manager-filters">
          <input
            aria-label="Search event types"
            type="search"
            placeholder="Search event types"
            value={search}
            onChange={(changeEvent) => setSearch(changeEvent.target.value)}
          />
        </div>

        {dataLoading ? (
          <div className="calendar-manager-empty">
            <Loader2 size={25} className="spin-animation" />
            <p>Loading event types from Calendly...</p>
          </div>
        ) : visibleEventTypes.length ? (
          <div className="calendar-manager-grid">
            {visibleEventTypes.map((event) => (
              <article className="calendar-manager-card" key={event.uri}>
                <div className="calendar-manager-card-top">
                  <span className="calendar-manager-type">
                    {event.kind === 'solo' ? 'One-on-one' : event.kind || 'Event'}
                  </span>
                </div>
                <h3>{event.name || 'Untitled event type'}</h3>
                <p className="calendar-manager-description">
                  {event.description_plain || 'No description provided.'}
                </p>
                <dl className="calendar-manager-details">
                  <div><dt><Clock size={14} />Duration</dt><dd>{event.duration} minutes</dd></div>
                  <div><dt>Location</dt><dd>{locationLabel(event.locations?.[0])}</dd></div>
                  <div><dt>Host</dt><dd>{eventHost(event, hostName)}</dd></div>
                </dl>
                {getLocationBadge(event.locations)}
                {!soloEvent(event) && (
                  <p className="calendar-manager-limitation">
                    Calendly only allows this integration to create or edit one-on-one event types.
                  </p>
                )}
                <div className="calendar-manager-card-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => openEditForm(event)}
                    disabled={!soloEvent(event)}
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger-outline"
                    onClick={() => deleteEventType(event)}
                    disabled={!soloEvent(event) || changingActive === event.uri}
                  >
                    {changingActive === event.uri
                      ? <Loader2 size={14} className="spin-animation" />
                      : <Trash2 size={14} />}
                    Delete
                  </button>
                </div>
                {event.scheduling_url && (
                  <div className="calendar-manager-book-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => openScheduler(event.scheduling_url)}
                    >
                      <PlusCircle size={14} /> Schedule meeting
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleCopy(event.scheduling_url)}
                      title="Copy booking link"
                      aria-label={`Copy booking link for ${event.name}`}
                    >
                      {copiedLink === event.scheduling_url ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="calendar-manager-empty">
            <CalendarDays size={30} />
            <h3>{search ? 'No matching event types' : 'No event types found'}</h3>
            <p>
              {search
                ? 'Try another search term.'
                : 'Create an event type here and it will be added to your Calendly account.'}
            </p>
          </div>
        )}
      </section>}

      {showScheduledEvents && (
        <section className="calendar-manager-panel">
          <div className="calendar-manager-toolbar">
            <div>
              <h2>Scheduled activities</h2>
              <p>Bookings made through Calendly.</p>
            </div>
            <div className="calendar-manager-filter-buttons" role="group" aria-label="Filter scheduled activities">
              {[
                ['all', 'All'],
                ['active', 'Active'],
                ['canceled', 'Canceled'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={scheduledStatusFilter === value ? 'active' : ''}
                  onClick={() => setScheduledStatusFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {dataLoading ? (
            <div className="calendar-manager-empty">
              <Loader2 size={24} className="spin-animation" />
              <p>Loading scheduled activities...</p>
            </div>
          ) : filteredScheduledEvents.length ? (
            <div className="calendar-scheduled-list">
              {filteredScheduledEvents.map((event) => (
                <article key={event.uri} className="calendar-scheduled-card">
                  <div>
                    <span className={`calendar-manager-state ${event.status === 'active' ? 'is-active' : 'is-inactive'}`}>
                      {event.status}
                    </span>
                    <h3>{event.name}</h3>
                    <p>
                      {event.start_time ? new Date(event.start_time).toLocaleString() : 'Time not available'}
                      {event.end_time ? ` – ${new Date(event.end_time).toLocaleTimeString()}` : ''}
                    </p>
                    {event.invitees?.map((invitee, index) => (
                      <p key={invitee.email || invitee.name || index}>
                        {invitee.name || 'Invitee'}{invitee.email ? ` · ${invitee.email}` : ''}
                      </p>
                    ))}
                    {event.location?.location && <p>{event.location.location}</p>}
                  </div>
                  {event.status === 'active'
                    && event.start_time
                    && Date.parse(event.start_time) > Date.now() && (
                    <button
                      type="button"
                      className="btn btn-danger-outline"
                      onClick={() => setCancelingEvent(event)}
                    >
                      <Trash2 size={14} /> Cancel meeting
                    </button>
                  )}
                  {event.status === 'active'
                    && event.start_time
                    && Date.parse(event.start_time) <= Date.now() && (
                    <p className="calendar-manager-muted">
                      Past meetings cannot be canceled from Calendly.
                    </p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="calendar-manager-empty">
              <Clock size={28} />
              <h3>No scheduled activities</h3>
              <p>Bookings made through Calendly will appear here.</p>
            </div>
          )}
        </section>
      )}

      {formOpen && (
        <div className="calendar-manager-modal-backdrop" role="presentation">
          <section
            className="calendar-manager-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="calendar-event-form-title"
          >
            <div className="calendar-manager-modal-heading">
              <div>
                <h2 id="calendar-event-form-title">
                  {editingEvent ? 'Edit event type' : 'Create event type'}
                </h2>
                <p>Changes are applied directly to Calendly.</p>
              </div>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                disabled={saving}
                aria-label="Close form"
              >
                <X size={19} />
              </button>
            </div>
            <form onSubmit={saveEventType}>
              <label>
                Event type
                <input type="text" value="One-on-one" readOnly />
                <small>Calendly's API currently supports creating and editing one-on-one event types.</small>
              </label>
              <label>
                Event name
                <input
                  autoFocus
                  type="text"
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={(changeEvent) => setForm({ ...form, name: changeEvent.target.value })}
                  placeholder="e.g. Introductory call"
                />
              </label>
              <label>
                Duration (minutes)
                {durationOptions.length ? (
                  <select
                    required
                    value={form.duration}
                    onChange={(changeEvent) => setForm({ ...form, duration: changeEvent.target.value })}
                  >
                    {durationOptions.map((duration) => (
                      <option key={duration} value={duration}>{duration}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    required
                    min="1"
                    max="720"
                    step="1"
                    value={form.duration}
                    onChange={(changeEvent) => setForm({ ...form, duration: changeEvent.target.value })}
                  />
                )}
              </label>
              <label>
                Location
                <select
                  value={form.locationKind}
                  onChange={(changeEvent) => setForm({
                    ...form,
                    locationKind: changeEvent.target.value,
                    locationValue: '',
                  })}
                >
                  {LOCATION_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              {locationValueField(form.locationKind) && (
                <label>
                  {form.locationKind === 'inbound_call' || form.locationKind === 'outbound_call'
                    ? 'Phone number'
                    : 'Location details'}
                  <input
                    type={form.locationKind === 'inbound_call' || form.locationKind === 'outbound_call'
                      ? 'tel'
                      : 'text'}
                    required
                    value={form.locationValue}
                    onChange={(changeEvent) => setForm({ ...form, locationValue: changeEvent.target.value })}
                    placeholder={form.locationKind === 'inbound_call' || form.locationKind === 'outbound_call'
                      ? '+1 555 123 4567'
                      : 'Address or meeting link'}
                  />
                </label>
              )}
              <label>
                Host
                <input type="text" value={hostName} readOnly />
                <small>The connected Calendly account is the event type host.</small>
              </label>
              <label>
                Description
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(changeEvent) => setForm({ ...form, description: changeEvent.target.value })}
                  placeholder="Describe the event or topic"
                />
              </label>
              {error && <div className="alert alert-error" role="alert">{error}</div>}
              <div className="calendar-manager-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setFormOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving
                    ? <><Loader2 size={15} className="spin-animation" />Saving...</>
                    : editingEvent ? 'Save changes' : 'Create event type'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {cancelingEvent && (
        <div className="calendar-manager-modal-backdrop" role="presentation">
          <section
            className="calendar-manager-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="calendar-cancel-title"
          >
            <div className="calendar-manager-modal-heading">
              <div>
                <h2 id="calendar-cancel-title">Cancel scheduled meeting?</h2>
                <p>
                  Cancel {cancelingEvent.name}? Calendly will notify the invitee by email.
                </p>
              </div>
              <AlertCircle size={22} color="#dc2626" />
            </div>
            <div className="calendar-manager-modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCancelingEvent(null)}
                disabled={isCanceling}
              >
                Keep meeting
              </button>
              <button
                type="button"
                className="btn btn-danger-outline"
                onClick={handleConfirmCancel}
                disabled={isCanceling}
              >
                {isCanceling
                  ? <Loader2 size={14} className="spin-animation" />
                  : <Trash2 size={14} />}
                Confirm cancellation
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Calendly;
