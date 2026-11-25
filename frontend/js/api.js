const API_BASE = window.location.origin.includes('127.0.0.1:5000') ||
  window.location.origin.includes('localhost:5000')
  ? ''
  : 'http://localhost:5000';

function getToken() {
  return localStorage.getItem('vision_token') || '';
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = 'login.html';
  }
}

function redirectIfLoggedIn() {
  if (getToken()) {
    window.location.href = 'index.html';
  }
}

function logout() {
  localStorage.removeItem('vision_token');
  localStorage.removeItem('vision_user');
  window.location.href = 'login.html';
}

async function apiRequest(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };

  if (token) headers.Authorization = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(API_BASE + path, { ...options, headers });

  if (res.status === 401) {
    logout();
    throw new Error('Session expired. Please log in again.');
  }

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

function showToast(message, type = 'success') {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast show ${type === 'error' ? 'error' : ''}`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}