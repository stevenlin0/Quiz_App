// authCheck.js - Check if user is logged in, redirect to login if not
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    // No token found, redirect to login
    window.location.href = '/login.html';
  }
  return token;
}

// Call this at the top of pages that require authentication
checkAuth();
