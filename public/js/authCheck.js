// This is to check if the user is logged in.
function checkAuth() {
  const token = localStorage.getItem('token');

  // This is if no token, send the user to the login page.
  if (!token) {
    window.location.href = '/login.html';
  }

  // This is to return the token.
  return token;
}

// This is to run the check right away.
checkAuth();
