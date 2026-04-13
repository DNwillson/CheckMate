const API_BASE = process.env.REACT_APP_API_URL || '';

const TOKEN_KEY = 'checkmate_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const { skipAuth, headers: hdr, ...rest } = options;
  const headers = { 'Content-Type': 'application/json', ...(hdr || {}) };
  if (!skipAuth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...rest, headers });
  if (res.status === 204) return null;
  const text = await res.text();
  if (!res.ok) {
    if (res.status === 401 && !skipAuth) clearToken();
    let body = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = null;
    }
    const msg = (body && body.error) || text || res.statusText;
    const err = new Error(msg);
    err.status = res.status;
    err.body = body || {};
    throw err;
  }
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const api = {
  health: () => request('/api/health', { skipAuth: true }),

  register: async (body) => {
    const data = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
      skipAuth: true,
    });
    if (data?.token) setToken(data.token);
    return data;
  },

  login: async (body) => {
    const data = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
      skipAuth: true,
    });
    if (data?.token) setToken(data.token);
    return data;
  },

  logout: () => clearToken(),

  getMe: () => request('/api/me'),
  putMe: (payload) => request('/api/me', { method: 'PUT', body: JSON.stringify(payload) }),
  putPassword: (payload) =>
    request('/api/me/password', { method: 'PUT', body: JSON.stringify(payload) }),
  deleteAccount: () => request('/api/me', { method: 'DELETE' }),

  getScenarios: () => request('/api/scenarios'),
  createScenario: (payload) => request('/api/scenarios', { method: 'POST', body: JSON.stringify(payload) }),
  updateScenario: (id, payload) =>
    request(`/api/scenarios/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteScenario: (id) =>
    request(`/api/scenarios/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  getFriends: () => request('/api/friends'),
  deleteFriend: (id) =>
    request(`/api/friends/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  lookupUser: (username) =>
    request(`/api/users/lookup?username=${encodeURIComponent(username)}`),
  createFriendRequest: (body) =>
    request('/api/friends/requests', { method: 'POST', body: JSON.stringify(body) }),
  listFriendRequests: (direction = 'incoming') =>
    request(`/api/friends/requests?direction=${encodeURIComponent(direction)}`),
  acceptFriendRequest: (id) =>
    request(`/api/friends/requests/${encodeURIComponent(id)}/accept`, { method: 'POST', body: '{}' }),
  declineFriendRequest: (id) =>
    request(`/api/friends/requests/${encodeURIComponent(id)}/decline`, { method: 'POST', body: '{}' }),

  shareScenario: (scenarioId, username) =>
    request(`/api/scenarios/${encodeURIComponent(scenarioId)}/share`, {
      method: 'POST',
      body: JSON.stringify({ username }),
    }),
  unshareScenario: (scenarioId, username) =>
    request(
      `/api/scenarios/${encodeURIComponent(scenarioId)}/share?username=${encodeURIComponent(username)}`,
      { method: 'DELETE' },
    ),
  getHistory: () => request('/api/history'),
  addHistory: (payload) => request('/api/history', { method: 'POST', body: JSON.stringify(payload) }),
  deleteHistoryRecord: (id) =>
    request(`/api/history/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  clearHistory: () => request('/api/history', { method: 'DELETE' }),
  getPreferences: () => request('/api/preferences'),
  putPreferences: (payload) => request('/api/preferences', { method: 'PUT', body: JSON.stringify(payload) }),

  assistantReply: (payload) =>
    request('/api/assistant/reply', { method: 'POST', body: JSON.stringify(payload) }),

  assistantStatus: () => request('/api/assistant/status'),

  /** @param {Record<string, string|number|undefined>} [params] e.g. { lat, lon, label } or { city } */
  getWeather: (params) => {
    const q = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v).trim() !== '') q.set(k, String(v));
      });
    }
    const s = q.toString();
    return request(`/api/weather${s ? `?${s}` : ''}`);
  },

  getWeatherDetail: (params) => {
    const q = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v).trim() !== '') q.set(k, String(v));
      });
    }
    const s = q.toString();
    return request(`/api/weather/detail${s ? `?${s}` : ''}`);
  },
};
