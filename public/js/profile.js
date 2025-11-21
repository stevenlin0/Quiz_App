// profile.js - gets /api/user/profile using token, shows play history
const profileContent = document.getElementById('profileContent');

document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = '/';
});

async function loadProfile(){
  const res = await apiFetch('/api/user/profile');
  if (!res) return; // redirected on 401
  if (!res.ok) {
    profileContent.innerHTML = '<p class="text-danger">Could not load profile. Try logging in again.</p>';
    return;
  }
  const j = await res.json();
  const user = j.user;
  document.getElementById('profileName').textContent = `${user.username} — Profile`;
  let html = `<p class="text-muted">Email: ${user.email}</p>`;
  if (user.scores && user.scores.length) {
    html += '<h5 class="mt-3">Play history</h5><ul class="list-group">';
    user.scores.slice().reverse().forEach(s => {
      html += `<li class="list-group-item d-flex justify-content-between align-items-center">
        <div>${new Date(s.quizDate).toLocaleString()} — ${s.score}/${s.totalQuestions}</div>
      </li>`;
    });
    html += '</ul>';
  } else {
    html += '<p class="text-muted">No games played yet.</p>';
  }
  profileContent.innerHTML = html;
}
loadProfile();
