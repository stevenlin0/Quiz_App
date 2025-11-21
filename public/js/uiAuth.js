// uiAuth.js - update nav UI when user is logged in and wire logout buttons
(function(){
  function setup() {
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    if (!username || !token) {
      // wire any existing logout button to clear storage anyway
      document.querySelectorAll('#logoutBtn, #navLogout').forEach(el=>{
        el.addEventListener('click', ()=>{
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          window.location.href = '/login.html';
        });
      });
      return;
    }

    // Replace login/signup buttons with username + logout
    const loginLinks = document.querySelectorAll('a[href="/login.html"]');
    const signupLinks = document.querySelectorAll('a[href="/signup.html"]');

    function makeUserControls() {
      const wrapper = document.createElement('div');
      wrapper.className = 'd-flex gap-2 align-items-center flex-wrap';
      const profileLink = document.createElement('a');
      profileLink.href = '/profile.html';
      profileLink.className = 'btn btn-primary btn-sm rounded-pill px-3 me-2';
      profileLink.textContent = 'Profile';
      const leaderboardLink = document.createElement('a');
      leaderboardLink.href = '/leaderboard.html';
      leaderboardLink.className = 'btn btn-primary btn-sm rounded-pill px-3 me-2';
      leaderboardLink.textContent = 'Leaderboard';
      const nameEl = document.createElement('span');
      nameEl.className = 'text-dark fw-semibold';
      nameEl.style.fontStyle = 'italic';
      nameEl.textContent = "Welcome " + username;
      const logout = document.createElement('a');
      logout.href = '#';
      logout.id = 'navLogout';
      logout.className = 'btn btn-outline-danger rounded-pill px-3';
      logout.textContent = 'LOG OUT';
      logout.addEventListener('click', (e)=>{
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = '/login.html';
      });
      wrapper.appendChild(nameEl);
      wrapper.appendChild(profileLink);
      wrapper.appendChild(leaderboardLink);
      wrapper.appendChild(logout);
      return wrapper;
    }

    const userControl = makeUserControls();

    // Replace first occurrence in nav areas
    if (loginLinks.length || signupLinks.length) {
      // try to find a container that holds them
      const container = (loginLinks[0] || signupLinks[0])?.parentElement;
      if (container) {
        // remove all login/signup anchors in that container
        Array.from(container.querySelectorAll('a[href="/login.html"], a[href="/signup.html"]')).forEach(n => n.remove());
        container.appendChild(userControl);
      }
    }

    // If pages already had a logout button with id logoutBtn, wire it
    document.querySelectorAll('#logoutBtn').forEach(el=>{
      el.addEventListener('click', ()=>{
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = '/login.html';
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
