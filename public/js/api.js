window.apiFetch = async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  options = options || {};
  options.headers = options.headers || {};

  // This is if a token exists, add it to the request
  if (token) options.headers['Authorization'] = 'Bearer ' + token;

  // This it to send the request
  const res = await fetch(path, options);

  // This is if the token is invalid or expired, log the user out.
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/login.html';
    return;
  }

  // This is to return the response for later use.
  return res;
};
