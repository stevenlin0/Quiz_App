const API = '/api';
let questions = [];
let current = 0;
let selected = null;
let answers = [];
let questionCount = 10;

function decodeHtmlEntities(str) {
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}

async function fetchQuestions(amount=10, source='opentdb', category='') {
  if (source === 'opentdb') {
    try {
      let url = `https://opentdb.com/api.php?amount=${encodeURIComponent(amount)}`;
      if (category) url += `&category=${encodeURIComponent(category)}`;
      const r = await fetch(url);
      if (!r.ok) throw new Error('OpenTDB fetch failed');
      const j = await r.json();
      if (!j || !Array.isArray(j.results)) throw new Error('Invalid OpenTDB response');

      const mapped = j.results.map((item, idx) => {
        const questionText = decodeHtmlEntities(item.question || '');
        const correct = decodeHtmlEntities(item.correct_answer || '');
        const incorrect = (item.incorrect_answers || []).map(a => decodeHtmlEntities(a));
        let choices = [];

        if (item.type === 'boolean') {
          choices = ['True', 'False'];
        } else {
          choices = [...incorrect, correct];
          for (let i = choices.length - 1; i > 0; i--) {
            const r = Math.floor(Math.random() * (i + 1));
            [choices[i], choices[r]] = [choices[r], choices[i]];
          }
        }

        return {
          id: `otdb-${Date.now()}-${idx}-${Math.random().toString(36).slice(2,8)}`,
          question: questionText,
          choices,
          correctAnswer: correct,
          source: 'opentdb',
          type: item.type,
          difficulty: item.difficulty,
          category: item.category
        };
      });
      return mapped;
    } catch (err) {
      console.warn('OpenTDB fetch failed, falling back:', err);
    }
  }

  const resp = await apiFetch(`${API}/quiz/start?source=${source}&amount=${amount}`);
  if (!resp) return [];
  return resp.ok ? (await resp.json()).questions : [];
}

function renderQuestion() {
  const q = questions[current];
  document.getElementById('qIndex').textContent = current+1;
  document.getElementById('qTotal').textContent = questions.length;
  const percent = Math.round((current/questions.length)*100);
  document.getElementById('progBar').style.width = percent + '%';
  document.getElementById('questionText').innerHTML = q ? q.question : 'No question';

  const choices = document.getElementById('choices');
  choices.innerHTML = '';

  (q.choices || []).forEach(c => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn';
    btn.textContent = c;
    btn.onclick = () => {
      Array.from(choices.children).forEach(ch => ch.classList.remove('selected'));
      btn.classList.add('selected');
      selected = c;
    };
    choices.appendChild(btn);
  });
}

async function start(amount = questionCount, category = '') {
  questionCount = amount;
  questions = await fetchQuestions(amount, 'opentdb', category);
  if (!questions.length) {
    document.getElementById('questionText').textContent = 'Could not load questions.';
    return;
  }
  current = 0;
  selected = null;
  answers = [];
  renderQuestion();
}

function startQuiz(amount) {
  const category = document.getElementById('categorySelect')?.value || '';
  document.getElementById('questionCountModal').classList.add('d-none');
  document.getElementById('quizContent').classList.remove('d-none');
  start(amount, category);
}

document.querySelectorAll('.question-count-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const count = parseInt(e.target.dataset.count);
    startQuiz(count);
  });
});

document.getElementById('startQuizBtn').addEventListener('click', () => {
  const customCount = parseInt(document.getElementById('customCountInput').value);
  if (!customCount || customCount < 1 || customCount > 100) {
    alert('Please enter a number between 1 and 100');
    return;
  }
  startQuiz(customCount);
});

document.getElementById('customCountInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('startQuizBtn').click();
  }
});

document.getElementById('submitAnswer').addEventListener('click', async () => {
  if (selected == null) {
    alert('Please select an answer');
    return;
  }

  answers.push({
    questionId: questions[current].id,
    selected,
    correct: questions[current].correctAnswer
  });

  current++;
  selected = null;

  if (current >= questions.length) {
    let score = answers.reduce((s,a)=> s + (a.selected === a.correct ? 1 : 0), 0);

    const token = localStorage.getItem('token');

    try {
      await apiFetch(API + '/quiz/submit', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          score,
          totalQuestions: questions.length,
          questionsUsed: answers
        })
      });
    } catch(e){}

    sessionStorage.setItem('latestScore', JSON.stringify({
      score,
      total: questions.length,
      answers
    }));

    window.location.href = '/results.html';
    return;
  }

  renderQuestion();
});

document.getElementById('restartBtn')?.addEventListener('click', () => {
  current = 0;
  selected = null;
  answers = [];
  questions = [];
  document.getElementById('quizContent').classList.add('d-none');
  document.getElementById('questionCountModal').classList.remove('d-none');
});

async function loadCategories() {
  try {
    const r = await fetch('https://opentdb.com/api_category.php');
    if (!r.ok) throw new Error('Could not load categories');
    const j = await r.json();
    if (!j || !Array.isArray(j.trivia_categories)) return;

    const sel = document.getElementById('categorySelect');
    j.trivia_categories.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name;
      sel.appendChild(opt);
    });
  } catch (err) {
    console.warn('Failed to load categories', err);
  }
}

document.getElementById('modalCancelBtn')?.addEventListener('click', () => {
  window.location.href = '/';
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadCategories);
} else {
  loadCategories();
}
