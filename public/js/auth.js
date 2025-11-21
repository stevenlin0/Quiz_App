// auth.js - handles signup & login (works with backend endpoints from earlier messages)
const API = '/api';

document.addEventListener('submit', async (e) => {
  if (e.target.id === 'signupForm') {
    e.preventDefault();
    const form = e.target;
    const payload = {
      username: form.username.value.trim(),
      email: form.email.value.trim(),
      password: form.password.value
    };
    try {
      const res = await fetch(API + '/auth/signup', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      const j = await res.json();
      if (res.ok) {
          localStorage.setItem('token', j.token);
          if (j.username) localStorage.setItem('username', j.username);
        window.location.href = '/quiz.html';
      } else {
        alert(j.error || 'Signup failed');
      }
    } catch (err) { alert('Network error'); }
  }

  if (e.target.id === 'loginForm') {
    e.preventDefault();
    const form = e.target;
    const payload = {
      emailOrUsername: form.emailOrUsername.value.trim(),
      password: form.password.value
    };
    try {
      const res = await fetch(API + '/auth/login', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      const j = await res.json();
      if (res.ok || j.token) {
          localStorage.setItem('token', j.token);
          if (j.username) localStorage.setItem('username', j.username);
        window.location.href = '/profile.html';
      } else {
        alert(j.error || 'Login failed');
      }
    } catch (err) { alert('Network error'); }
  }
});
