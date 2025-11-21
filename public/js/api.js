// api.js - small wrapper around fetch that attaches Authorization header and handles 401
window.apiFetch = async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  options = options || {};
  options.headers = options.headers || {};
  if (token) options.headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(path, options);
  if (res.status === 401) {
    // clear local auth and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/login.html';
    return;
  }
  return res;
};
