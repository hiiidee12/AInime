// ===== AInime =====

const API_URL = '/api/chat';

let askHistory = [];

// ===== Nav =====
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  const link = document.querySelector(`.nav-links a[href="#${id}"]`);
  if (link) link.classList.add('active');
  document.getElementById('nav-links').classList.remove('open');
  if (id === 'seasonal') loadSeasonal();
  if (id === 'news') loadNews();
}
function toggleMobileMenu() { document.getElementById('nav-links').classList.toggle('open'); }

// ===== Toast =====
function showToast(msg) {
  const t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:20px;right:20px;background:var(--bg2);color:var(--ink);border:1px solid var(--line);padding:10px 18px;border-radius:8px;z-index:999;font-size:.84rem;box-shadow:0 4px 12px rgba(0,0,0,.15);';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

// ===== Modal =====
function openModal(html) { document.getElementById('modal-content').innerHTML = html; document.getElementById('modal-overlay').classList.add('active'); }
function closeModal() { document.getElementById('modal-overlay').classList.remove('active'); }

// ===== Ask AI =====
const AI_SYSTEM = `You are AInime AI, an anime expert assistant. You have access to REAL-TIME anime data from MyAnimeList via the Jikan API. When answering, always use the provided data context to give accurate, up-to-date answers. Be enthusiastic, use emojis occasionally, give detailed but concise answers (2-4 paragraphs). When recommending anime include title, genre, year, score, and why it matches. IMPORTANT: NEVER use em dash (—), en dash (–), or any horizontal dash. Use commas, colons, or rephrase sentences instead.`;

async function fetchAnimeContext(query) {
  let context = '';
  const q = query.toLowerCase();
  try {
    const now = new Date();
    const yr = now.getFullYear();
    const mo = now.getMonth();
    const season = mo < 3 ? 'winter' : mo < 6 ? 'spring' : mo < 9 ? 'summer' : 'fall';
    const nextSeason = season === 'winter' ? 'spring' : season === 'spring' ? 'summer' : season === 'summer' ? 'fall' : 'winter';
    const nextYr = season === 'fall' ? yr + 1 : yr;

    const sRes = await fetch(`https://api.jikan.moe/v4/seasons/${yr}/${season}?limit=8`);
    const sData = await sRes.json();
    if (sData.data?.length) {
      context += `\n[Current Season: ${season.charAt(0).toUpperCase() + season.slice(1)} ${yr}]\n`;
      sData.data.forEach(a => {
        const g = (a.genres || []).map(x => x.name).join(', ');
        context += `- ${a.title} | Score: ${a.score || 'N/A'} | ${a.type} | ${a.episodes || '?'} eps | ${a.status} | ${g}\n`;
      });
    }

    const nRes = await fetch(`https://api.jikan.moe/v4/seasons/${nextYr}/${nextSeason}?limit=8`);
    const nData = await nRes.json();
    if (nData.data?.length) {
      context += `\n[Upcoming: ${nextSeason.charAt(0).toUpperCase() + nextSeason.slice(1)} ${nextYr}]\n`;
      nData.data.forEach(a => { context += `- ${a.title} | ${a.type} | ${a.status}\n`; });
    }

    const aRes = await fetch('https://api.jikan.moe/v4/top/anime?filter=airing&limit=5');
    const aData = await aRes.json();
    if (aData.data?.length) {
      context += `\n[Top Airing Now]\n`;
      aData.data.forEach(a => { context += `- ${a.title} | Score: ${a.score} | ${a.type} | ${a.episodes} eps\n`; });
    }

    if (q.length > 3) {
      const sr = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5&order_by=score&sort=desc`);
      const sd = await sr.json();
      if (sd.data?.length) {
        context += `\n[Search: "${query}"]\n`;
        sd.data.forEach(a => {
          const g = (a.genres || []).map(x => x.name).join(', ');
          context += `- ${a.title} (${a.year || 'N/A'}) | Score: ${a.score || 'N/A'} | ${a.type} | ${a.episodes || '?'} eps | ${g}\n`;
        });
      }
    }
  } catch (e) { /* continue without context */ }
  return context;
}

function askQuick(q) {
  document.getElementById('ask-input').value = q;
  askQuestion();
}

async function askQuestion() {
  const input = document.getElementById('ask-input');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  addMsg('user', msg);
  askHistory.push({ role: 'user', content: msg });
  const typingId = addTyping();
  const ctx = await fetchAnimeContext(msg);
  const sys = AI_SYSTEM + (ctx ? '\n\n--- REAL-TIME DATA ---' + ctx : '');

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'system', content: sys }, ...askHistory.slice(-10)], max_tokens: 800, temperature: 0.7 })
    });
    const data = await res.json();
    removeTyping(typingId);
    if (data.choices && data.choices[0]) {
      const reply = data.choices[0].message.content;
      askHistory.push({ role: 'assistant', content: reply });
      addMsg('bot', `<strong>AInime AI</strong><br>${fmt(reply)}`);
    } else {
      addMsg('bot', `<strong>AInime AI</strong><br>Error: ${data.error?.message || 'Unknown error'}`);
    }
  } catch (e) {
    removeTyping(typingId);
    addMsg('bot', `<strong>AInime AI</strong><br>Connection error. ${e.message}`);
  }
}

function addMsg(type, content) {
  const m = document.getElementById('ask-messages');
  const d = document.createElement('div');
  d.className = `msg msg--${type}`;
  d.innerHTML = `<div class="msg-body">${content}</div>`;
  m.appendChild(d);
  m.scrollTop = m.scrollHeight;
}

function addTyping() {
  const m = document.getElementById('ask-messages');
  const d = document.createElement('div');
  const id = 't-' + Date.now();
  d.id = id;
  d.className = 'msg msg--bot';
  d.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
  m.appendChild(d);
  m.scrollTop = m.scrollHeight;
  return id;
}

function removeTyping(id) { const e = document.getElementById(id); if (e) e.remove(); }

function fmt(t) {
  return t
    .replace(/—/g, ', ')
    .replace(/–/g, ', ')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
    .replace(/`(.*?)`/g, '<code style="background:var(--bg3);padding:2px 5px;border-radius:3px;font-size:.84em">$1</code>');
}

// ===== Characters =====
async function searchCharacters() {
  const q = document.getElementById('char-search').value.trim();
  if (!q) return;
  const grid = document.getElementById('char-grid');
  grid.innerHTML = '<div class="grid-msg">Searching...</div>';
  try {
    const res = await fetch(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(q)}&limit=12`);
    const data = await res.json();
    if (!data.data?.length) { grid.innerHTML = '<div class="grid-msg">No characters found.</div>'; return; }
    grid.innerHTML = data.data.map(c => `
      <div class="char-card" onclick="openModal('<h3>${c.name.replace(/'/g, '')}</h3><img src=${c.images.jpg.image_url}><p>${(c.about || 'No info available.').replace(/'/g, '').replace(/\n/g, '<br>').substring(0, 500)}...</p>')">
        <img src="${c.images.jpg.image_url}" alt="${c.name}" loading="lazy">
        <div class="char-meta"><h4>${c.name}</h4><p>${c.about ? c.about.substring(0, 80) + '...' : 'No info.'}</p></div>
      </div>
    `).join('');
  } catch (e) { grid.innerHTML = '<div class="grid-msg">Error loading characters.</div>'; }
}

// ===== Seasonal =====
async function loadSeasonal() {
  const year = document.getElementById('season-year').value;
  const season = document.getElementById('season-name').value;
  const grid = document.getElementById('season-grid');
  grid.innerHTML = '<div class="grid-msg">Loading...</div>';
  try {
    const res = await fetch(`https://api.jikan.moe/v4/seasons/${year}/${season}?limit=18`);
    const data = await res.json();
    if (!data.data?.length) { grid.innerHTML = '<div class="grid-msg">No anime found for this season.</div>'; return; }
    grid.innerHTML = data.data.map(a => `
      <div class="anime-card" onclick="window.open('${a.url}','_blank')">
        <img src="${a.images.jpg.large_image_url}" alt="${a.title}" loading="lazy">
        <div class="anime-meta">
          <h4 title="${a.title}">${a.title}</h4>
          <div class="anime-info"><span class="score">${a.score || 'N/A'}</span><span>${a.type || '?'}</span><span>${a.episodes || '?'} ep</span></div>
        </div>
      </div>
    `).join('');
  } catch (e) { grid.innerHTML = '<div class="grid-msg">Error loading seasonal data.</div>'; }
}

// ===== Quiz =====
let quizState = { questions: [], current: 0, score: 0, answered: false };

const QUIZ_BANKS = {
  general: [
    { q: "Which anime features a notebook that kills anyone whose name is written in it?", a: ["Death Note", "Naruto", "Bleach", "One Piece"], c: 0 },
    { q: "What studio produced Spirited Away?", a: ["Studio Ghibli", "Kyoto Animation", "Madhouse", "ufotable"], c: 0 },
    { q: "What is the virtual world in Sword Art Online called?", a: ["Aincrad", "Alfheim", "Underworld", "Gun Gale"], c: 0 },
    { q: "Which anime features alchemy as a power system?", a: ["Fullmetal Alchemist", "Naruto", "Hunter x Hunter", "Fairy Tail"], c: 0 },
    { q: "What year was the original Akira released?", a: ["1988", "1995", "2001", "1979"], c: 0 },
    { q: "Which anime has Satoru Gojo?", a: ["Jujutsu Kaisen", "Demon Slayer", "Chainsaw Man", "My Hero Academia"], c: 0 },
    { q: "Highest-grossing anime film ever?", a: ["Demon Slayer: Mugen Train", "Your Name", "Spirited Away", "One Piece Film Red"], c: 0 },
    { q: "What is Luffy's Devil Fruit?", a: ["Gomu Gomu no Mi", "Mera Mera no Mi", "Hito Hito no Mi", "Gura Gura no Mi"], c: 0 },
    { q: "Main character of Attack on Titan?", a: ["Eren Yeager", "Levi Ackerman", "Mikasa Ackerman", "Armin Arlert"], c: 0 },
    { q: "Which anime collects Dragon Balls?", a: ["Dragon Ball", "Naruto", "One Piece", "Bleach"], c: 0 }
  ],
  naruto: [
    { q: "Naruto's signature jutsu?", a: ["Rasengan", "Chidori", "Shadow Clone", "Kamehameha"], c: 0 },
    { q: "Leader of Akatsuki?", a: ["Pain/Nagato", "Itachi", "Obito", "Madara"], c: 0 },
    { q: "Name of the Nine-Tailed Fox?", a: ["Kurama", "Shukaku", "Matatabi", "Gyuki"], c: 0 },
    { q: "Who taught Naruto the Rasengan?", a: ["Jiraiya", "Kakashi", "Minato", "Tsunade"], c: 0 },
    { q: "Naruto's village?", a: ["Konoha", "Suna", "Kiri", "Kumo"], c: 0 }
  ],
  "one-piece": [
    { q: "Luffy's first ship?", a: ["Going Merry", "Thousand Sunny", "Oro Jackson", "Red Force"], c: 0 },
    { q: "Who is the Pirate King?", a: ["Gol D. Roger", "Whitebeard", "Shanks", "Kaido"], c: 0 },
    { q: "Zoro's goal?", a: ["Greatest swordsman", "Find One Piece", "Pirate King", "Map the world"], c: 0 },
    { q: "Straw Hat crew count?", a: ["10", "8", "12", "7"], c: 0 },
    { q: "Sanji's dream?", a: ["All Blue", "Pirate King", "Greatest swordsman", "Adventure"], c: 0 }
  ],
  "attack-on-titan": [
    { q: "Three walls protecting humanity?", a: ["Maria, Rose, Sina", "Titan, Rose, Sina", "Maria, Rose, Founding", "Maria, Rose, Attack"], c: 0 },
    { q: "Who is the Armored Titan?", a: ["Reiner Braun", "Bertholdt", "Annie", "Zeke"], c: 0 },
    { q: "Founding Titan's power?", a: ["Control titans/memories", "Transform into any titan", "See the future", "None"], c: 0 },
    { q: "Levi's military branch?", a: ["Survey Corps", "Garrison", "Military Police", "Training Corps"], c: 0 },
    { q: "Eren's last name?", a: ["Yeager", "Ackerman", "Arlelt", "Braun"], c: 0 }
  ],
  genshin: [
    { q: "Furina's element?", a: ["Hydro", "Pyro", "Cryo", "Anemo"], c: 0 },
    { q: "Nation based on Japan?", a: ["Inazuma", "Liyue", "Mondstadt", "Sumeru"], c: 0 },
    { q: "Geo Archon?", a: ["Zhongli", "Venti", "Raiden", "Nahida"], c: 0 },
    { q: "Traveler's sibling name?", a: ["Aether/Lumine", "Paimon", "Zhongli", "Venti"], c: 0 },
    { q: "Mondstadt receptionist?", a: ["Katheryne", "Jean", "Amber", "Lisa"], c: 0 }
  ],
  "studio-ghibli": [
    { q: "Main character of Spirited Away?", a: ["Chihiro", "Kiki", "Satsuki", "Sophie"], c: 0 },
    { q: "Forest spirit in Totoro?", a: ["Totoro", "Catbus", "Kodama", "No-Face"], c: 0 },
    { q: "Film with a moving castle?", a: ["Howl's Moving Castle", "Castle in the Sky", "Spirited Away", "Princess Mononoke"], c: 0 },
    { q: "Director of most Ghibli films?", a: ["Hayao Miyazaki", "Isao Takahata", "Gorou Miyazaki", "Mamoru Hosoda"], c: 0 },
    { q: "Witch in Kiki's Delivery Service?", a: ["Kiki", "Ursula", "Sophie", "San"], c: 0 }
  ]
};

function startQuiz() {
  const cat = document.getElementById('quiz-category').value;
  const bank = QUIZ_BANKS[cat] || QUIZ_BANKS.general;
  const shuffled = [...bank].sort(() => Math.random() - 0.5).slice(0, 5);
  quizState = {
    questions: shuffled.map(q => {
      const correct = q.a[q.c];
      const answers = [...q.a].sort(() => Math.random() - 0.5);
      return { q: q.q, a: answers, correct: answers.indexOf(correct) };
    }),
    current: 0, score: 0, answered: false
  };
  document.getElementById('quiz-start').style.display = 'none';
  document.getElementById('quiz-game').style.display = 'block';
  document.getElementById('quiz-result').style.display = 'none';
  document.getElementById('quiz-total').textContent = quizState.questions.length;
  document.getElementById('quiz-score').textContent = '0';
  document.getElementById('quiz-qnum').textContent = '1';
  showQuizQ();
}

function showQuizQ() {
  const q = quizState.questions[quizState.current];
  document.getElementById('quiz-progress-bar').style.width = ((quizState.current / quizState.questions.length) * 100) + '%';
  document.getElementById('quiz-qnum').textContent = quizState.current + 1;
  document.getElementById('quiz-question').textContent = `Q${quizState.current + 1}: ${q.q}`;
  document.getElementById('quiz-answers').innerHTML = q.a.map((a, i) => `<button class="quiz-answer" onclick="answerQuiz(${i})">${a}</button>`).join('');
  quizState.answered = false;
}

function answerQuiz(idx) {
  if (quizState.answered) return;
  quizState.answered = true;
  const q = quizState.questions[quizState.current];
  const btns = document.querySelectorAll('.quiz-answer');
  btns[q.correct].classList.add('correct');
  if (idx !== q.correct) btns[idx].classList.add('wrong');
  else { quizState.score++; document.getElementById('quiz-score').textContent = quizState.score; }
  setTimeout(() => {
    quizState.current++;
    if (quizState.current >= quizState.questions.length) {
      document.getElementById('quiz-game').style.display = 'none';
      document.getElementById('quiz-result').style.display = 'block';
      document.getElementById('quiz-progress-bar').style.width = '100%';
      document.getElementById('quiz-final-score').textContent = `${quizState.score}/${quizState.questions.length}`;
      const pct = (quizState.score / quizState.questions.length) * 100;
      document.getElementById('quiz-result-msg').textContent = pct === 100 ? "Perfect score! True otaku." : pct >= 60 ? "Not bad at all!" : "Watch more anime!";
    } else showQuizQ();
  }, 1000);
}

function resetQuiz() {
  document.getElementById('quiz-start').style.display = 'block';
  document.getElementById('quiz-game').style.display = 'none';
  document.getElementById('quiz-result').style.display = 'none';
}

// ===== Quotes =====
const QUOTES = [
  { t: "If you don't take risks, you can't create a future.", a: "Monkey D. Luffy", n: "One Piece" },
  { t: "People's lives don't end when they die. It ends when they lose faith.", a: "Itachi Uchiha", n: "Naruto" },
  { t: "The only ones who should kill are those prepared to be killed.", a: "Lelouch", n: "Code Geass" },
  { t: "A dropout will beat a genius through hard work.", a: "Rock Lee", n: "Naruto" },
  { t: "A lesson without pain is meaningless.", a: "Edward Elric", n: "Fullmetal Alchemist" },
  { t: "Throughout heaven and earth, I alone am the honored one.", a: "Gojo Satoru", n: "Jujutsu Kaisen" },
  { t: "I keep moving forward, until I destroy my enemies.", a: "Eren Yeager", n: "Attack on Titan" },
  { t: "I am atomic.", a: "Cid Kagenou", n: "The Eminence in Shadow" },
  { t: "Being alone is more painful than getting hurt.", a: "Monkey D. Luffy", n: "One Piece" },
  { t: "Sometimes, the questions are complicated and the answers are simple.", a: "L Lawliet", n: "Death Note" },
  { t: "Fear is not evil. It tells you what your weakness is.", a: "Gildarts", n: "Fairy Tail" },
  { t: "Miracles don't exist. Only cause and effect.", a: "Kirito", n: "Sword Art Online" },
  { t: "The world isn't perfect, but it's there for us doing its best.", a: "Roy Mustang", n: "Fullmetal Alchemist" },
  { t: "In this world, wherever there is light, there are also shadows.", a: "Madara Uchiha", n: "Naruto" },
  { t: "You can die anytime, but living takes true courage.", a: "Kenshin", n: "Rurouni Kenshin" },
  { t: "I'll leave tomorrow's problems to tomorrow's me.", a: "Saitama", n: "One Punch Man" },
  { t: "Those who forgive themselves are the strong ones.", a: "Itachi Uchiha", n: "Naruto" },
  { t: "I am the bone of my sword.", a: "Emiya Shirou", n: "Fate/stay night" },
  { t: "Whatever you lose, you'll find it again.", a: "Kenshin", n: "Rurouni Kenshin" },
  { t: "The only thing we're allowed to do is believe we won't regret our choice.", a: "Levi", n: "Attack on Titan" }
];

function getRandomQuote() {
  const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  document.getElementById('quote-text').textContent = q.t;
  document.getElementById('quote-author').textContent = q.a;
  document.getElementById('quote-anime').textContent = q.n;
}

// ===== Watchlist =====
let watchlist = JSON.parse(localStorage.getItem('ainime_wl') || '[]');
let wlFilter = 'all';
let wlTimer;

function saveWl() { localStorage.setItem('ainime_wl', JSON.stringify(watchlist)); }
function debounceWatchlistSearch() { clearTimeout(wlTimer); wlTimer = setTimeout(searchWl, 500); }

async function searchWl() {
  const q = document.getElementById('watchlist-search').value.trim();
  const c = document.getElementById('watchlist-search-results');
  if (!q) { c.innerHTML = ''; return; }
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=5`);
    const data = await res.json();
    if (!data.data?.length) { c.innerHTML = '<div style="color:var(--ink3);padding:8px;font-size:.84rem">No results found.</div>'; return; }
    c.innerHTML = data.data.map(a => `
      <div class="wl-search-item" onclick='addWl(${JSON.stringify({ id: a.mal_id, title: a.title, image: a.images.jpg.image_url, type: a.type, episodes: a.episodes }).replace(/'/g, "&#39;")})'>
        <img src="${a.images.jpg.image_url}" alt="">
        <div><h4>${a.title}</h4><small>${a.type || '?'} | ${a.episodes || '?'} ep</small></div>
      </div>
    `).join('');
  } catch (e) { c.innerHTML = ''; }
}

function addWl(anime) {
  if (watchlist.find(w => w.id === anime.id)) { showToast('Already in your watchlist.'); return; }
  watchlist.push({ ...anime, status: document.getElementById('watchlist-status').value });
  saveWl(); renderWl();
  document.getElementById('watchlist-search').value = '';
  document.getElementById('watchlist-search-results').innerHTML = '';
  showToast(`Added "${anime.title}"`);
}

function removeWl(id) { watchlist = watchlist.filter(w => w.id !== id); saveWl(); renderWl(); }
function cycleStatus(id) {
  const item = watchlist.find(w => w.id === id);
  if (!item) return;
  const s = ['watching', 'completed', 'plan-to-watch'];
  item.status = s[(s.indexOf(item.status) + 1) % s.length];
  saveWl(); renderWl();
}

function filterWatchlist(f, btn) { wlFilter = f; document.querySelectorAll('.tab').forEach(t => t.classList.remove('active')); if (btn) btn.classList.add('active'); renderWl(); }

function renderWl() {
  const grid = document.getElementById('watchlist-grid');
  const list = wlFilter === 'all' ? watchlist : watchlist.filter(w => w.status === wlFilter);
  if (!list.length) { grid.innerHTML = '<div class="grid-msg">Search and add anime to your watchlist.</div>'; return; }
  grid.innerHTML = list.map(w => `
    <div class="wl-card">
      <img src="${w.image}" alt="${w.title}">
      <div class="wl-card-body">
        <h4 title="${w.title}">${w.title}</h4>
        <span class="wl-badge ${w.status}">${w.status.replace(/-/g, ' ')}</span>
        <div class="wl-actions">
          <button onclick="cycleStatus(${w.id})">Change</button>
          <button onclick="removeWl(${w.id})">Remove</button>
        </div>
      </div>
    </div>
  `).join('');
}

// ===== News =====
async function loadNews() {
  const grid = document.getElementById('news-grid');
  grid.innerHTML = '<div class="grid-msg">Loading...</div>';
  try {
    const res = await fetch('https://api.jikan.moe/v4/watch/promos?page=1&limit=10');
    const data = await res.json();
    if (!data.data?.length) { grid.innerHTML = '<div class="grid-msg">No news available right now.</div>'; return; }
    grid.innerHTML = data.data.map(n => `
      <div class="news-item" onclick="window.open('${n.trailer?.url || '#'}','_blank')">
        <img src="${n.entry?.images?.jpg?.image_url || ''}" alt="">
        <div><h4>${n.title}</h4><p>${n.entry?.title || ''}</p><small>Promo</small></div>
      </div>
    `).join('');
  } catch (e) { grid.innerHTML = '<div class="grid-msg">Error loading news.</div>'; }
}

// ===== Stats Counter =====
function animateStats() {
  ['stat-anime', 'stat-chars'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const target = id === 'stat-anime' ? 20000 : 500000;
    let cur = 0;
    const step = target / 50;
    const iv = setInterval(() => {
      cur += step;
      if (cur >= target) { cur = target; clearInterval(iv); }
      el.textContent = Math.floor(cur).toLocaleString() + '+';
    }, 30);
  });
}

// ===== Init =====
renderWl();
animateStats();
