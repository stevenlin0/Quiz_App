const data = JSON.parse(sessionStorage.getItem('latestScore') || 'null');
if (!data) {
  document.getElementById('resultScore').textContent = 'No recent quiz found';
} else {
  document.getElementById('resultScore').textContent = `You scored ${data.score} / ${data.total}`;
  const details = document.getElementById('resultDetails');
  data.answers.forEach((a, i) => {
    const el = document.createElement('div');
    el.className = 'mb-3';
    el.innerHTML = `<div><strong>Q ${i+1}:</strong> ${a.question || ''}</div>
      <div>Your answer: <span class="${a.selected === a.correct ? 'text-success' : 'text-danger'}">${a.selected}</span></div>
      <div class="text-muted small">Correct: ${a.correct}</div><hr/>`;
    details.appendChild(el);
  });
}
