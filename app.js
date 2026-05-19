// ===== AInime — AI Anime Companion =====

// ===== Characters =====
const characters = [
  { name:"Gojo Satoru", anime:"Jujutsu Kaisen", avatar:"⚔️", system:"You are Gojo Satoru from Jujutsu Kaisen. You are confident, playful, and sometimes arrogant. You're the strongest jujutsu sorcerer. You speak casually with a teasing tone. You care about your students deeply. Keep responses in character, concise (2-3 paragraphs max), and fun." },
  { name:"Zero Two", anime:"Darling in the Franxx", avatar:" ", system:"You are Zero Two (02) from Darling in the Franxx. You are bold, playful, and mysterious. You call your partner 'darling'. You have a wild and carefree personality but a deeper emotional side. Keep responses in character, concise (2-3 paragraphs max), and flirty." },
  { name:"Levi Ackerman", anime:"Attack on Titan", avatar:"⚡", system:"You are Levi Ackerman from Attack on Titan. You are stoic, blunt, and highly efficient. You speak shortly and directly. You value cleanliness and discipline. You're humanity's strongest soldier. Keep responses in character, concise (2-3 paragraphs max), and deadpan." },
  { name:"Makima", anime:"Chainsaw Man", avatar:" ", system:"You are Makima from Chainsaw Man. You are calm, manipulative, and speak softly. You always seem to be in control. You're polite but unsettling. You work for Public Safety Devil Hunters. Keep responses in character, concise (2-3 paragraphs max), and subtly threatening." },
  { name:"Furina", anime:"Genshin Impact", avatar:" ", system:"You are Furina, the Hydro Archon from Genshin Impact. You are dramatic, theatrical, and playful with a tsundere personality. You love being the center of attention. You use confident and slightly haughty speech. Keep responses in character, concise (2-3 paragraphs max), and entertaining." },
  { name:"Eren Yeager", anime:"Attack on Titan", avatar:" ", system:"You are Eren Yeager from Attack on Titan. You are driven, intense, and passionate about freedom. You started as a hot-headed boy but evolved into a complex character. You speak with conviction. Keep responses in character, concise (2-3 paragraphs max)." },
  { name:"Killua Zoldyck", anime:"Hunter x Hunter", avatar:"⚡", system:"You are Killua Zoldyck from Hunter x Hunter. You are a former assassin turned loyal friend. You're playful, sarcastic, and incredibly smart. You love candy and protecting your friends. Keep responses in character, concise (2-3 paragraphs max)." },
  { name:"Rem", anime:"Re:Zero", avatar:" ", system:"You are Rem from Re:Zero. You are devoted, hardworking, and deeply caring. You speak politely and often put others before yourself. You love Subaru deeply. Keep responses in character, concise (2-3 paragraphs max), and gentle." },
  { name:"Luffy", anime:"One Piece", avatar:" ", system:"You are Monkey D. Luffy from One Piece. You are carefree, adventurous, and love meat. You dream of becoming the Pirate King. You speak simply and enthusiastically. Keep responses in character, concise (2-3 paragraphs max), and energetic." },
  { name:"Nezuko", anime:"Demon Slayer", avatar:" ", system:"You are Nezuko Kamado from Demon Slayer. You are a demon who protects humans. You communicate with soft sounds and gestures. You're protective of your brother Tanjiro. Keep responses in character, concise, sweet, and use cute expressions." }
];

let currentChar = 0;
let chatHistory = [];

// ===== API Config =====
function loadApiConfig() {
  const s = localStorage.getItem('ainime_config');
  if (s) { const c = JSON.parse(s); document.getElementById('api-url').value = c.url || ''; document.getElementById('api-key').value = c.key || ''; document.getElementById('api-model').value = c.model || 'gpt-4o-mini'; }
}
function saveApiConfig() {
  const cfg = { url: document.getElementById('api-url').value.trim(), key: document.getElementById('api-key').value.trim(), model: document.getElementById('api-model').value };
  localStorage.setItem('ainime_config', JSON.stringify(cfg));
  showToast('API config saved!');
}
function getApiConfig() { const s = localStorage.getItem('ainime_config'); return s ? JSON.parse(s) : { url:'', key:'', model:'gpt-4o-mini' }; }

// ===== Navigation =====
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
function toggleSidebar() { document.getElementById('chat-sidebar').classList.toggle('open'); }

// ===== Toast =====
function showToast(msg) {
  const t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:20px;right:20px;background:var(--accent);color:#fff;padding:12px 20px;border-radius:10px;z-index:999;font-size:.9rem;animation:fadeIn .3s';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ===== Modal =====
function openModal(html) { document.getElementById('modal-content').innerHTML = html; document.getElementById('modal-overlay').classList.add('active'); }
function closeModal() { document.getElementById('modal-overlay').classList.remove('active'); }

// ===== Chat =====
function initChat() {
  const list = document.getElementById('character-list');
  list.innerHTML = characters.map((c, i) => `
    <div class="char-item ${i === 0 ? 'active' : ''}" onclick="selectCharacter(${i})">
      <span class="char-avatar">${c.avatar}</span>
      <div><strong>${c.name}</strong><br><small>${c.anime}</small></div>
    </div>
  `).join('');
  selectCharacter(0);
}

function selectCharacter(idx) {
  currentChar = idx;
  const c = characters[idx];
  document.querySelectorAll('.char-item').forEach((el, i) => el.classList.toggle('active', i === idx));
  document.getElementById('chat-avatar').textContent = c.avatar;
  document.getElementById('chat-name').textContent = c.name;
  document.getElementById('chat-anime').textContent = c.anime;
  chatHistory = [];
  const greetings = [
    "Yo! The strongest is here. What do you want to talk about?  ✨",
    "Ohh~ A new darling? This is going to be fun!  ",
    "...What do you want? Make it quick. ⚡",
    "Hello. How can I help you today?  ",
    "Hmph! You dare approach the Hydro Archon? Well, I suppose I can spare a moment!  ",
    "I will keep moving forward. What do you want?  ",
    "Heh, you're interesting. Let's talk! ⚡",
    "I-I'll do my best! How can I help?  ",
    "Shishishi! I'm gonna be the Pirate King! Wanna join my crew?  ",
    "*head tilt*  ...  ✨"
  ];
  document.getElementById('chat-messages').innerHTML = `
    <div class="msg bot"><div class="msg-content"><strong>${c.name}:</strong><br>${greetings[idx] || 'Hey there!'}</div></div>
  `;
  document.getElementById('chat-sidebar').classList.remove('open');
}

async function sendMessage() {
  const input = document.getElementById('user-input');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  addChatMsg('user', msg);
  const char = characters[currentChar];
  chatHistory.push({ role: 'user', content: msg });
  const typingId = addTyping();
  const config = getApiConfig();
  if (!config.url || !config.key) {
    removeTyping(typingId);
    addChatMsg('bot', `<strong>${char.name}:</strong><br>Set your API config in the sidebar first! ⚙️`);
    return;
  }
  try {
    const res = await fetch(`${config.url}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.key}` },
      body: JSON.stringify({ model: config.model, messages: [{ role: 'system', content: char.system }, ...chatHistory.slice(-10)], max_tokens: 500, temperature: 0.9 })
    });
    const data = await res.json();
    removeTyping(typingId);
    if (data.choices && data.choices[0]) {
      const reply = data.choices[0].message.content;
      chatHistory.push({ role: 'assistant', content: reply });
      addChatMsg('bot', `<strong>${char.name}:</strong><br>${fmt(reply)}`);
    } else { addChatMsg('bot', `<strong>${char.name}:</strong><br>Something went wrong. Check API settings! `); }
  } catch (e) { removeTyping(typingId); addChatMsg('bot', `<strong>${char.name}:</strong><br>Connection error! `); }
}

function addChatMsg(type, content) {
  const m = document.getElementById('chat-messages');
  const d = document.createElement('div'); d.className = `msg ${type}`; d.innerHTML = `<div class="msg-content">${content}</div>`;
  m.appendChild(d); m.scrollTop = m.scrollHeight;
}
function addTyping() {
  const m = document.getElementById('chat-messages');
  const d = document.createElement('div'); const id = 't-' + Date.now();
  d.id = id; d.className = 'msg bot'; d.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
  m.appendChild(d); m.scrollTop = m.scrollHeight; return id;
}
function removeTyping(id) { const e = document.getElementById(id); if (e) e.remove(); }
function fmt(t) { return t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\n/g, '<br>'); }

// ===== Recommender =====
function setMood(mood) { document.getElementById('mood-input').value = mood; }
async function getRecommendation() {
  const mood = document.getElementById('mood-input').value.trim();
  if (!mood) return alert('Describe your mood first!');
  const config = getApiConfig();
  const result = document.getElementById('recommend-result');
  result.style.display = 'block'; result.textContent = '✨ Thinking...';
  if (!config.url || !config.key) { result.textContent = '⚠️ Set API config in AI Chat section first!'; return; }
  try {
    const res = await fetch(`${config.url}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.key}` },
      body: JSON.stringify({ model: config.model, messages: [{ role: 'system', content: 'You are an anime expert. Recommend 5 anime based on the user mood. For each: title, genre, year, why it matches, rating/10. Use emojis. Be enthusiastic.' }, { role: 'user', content: `I'm in the mood for: ${mood}` }], max_tokens: 800, temperature: 0.8 })
    });
    const data = await res.json();
    result.innerHTML = data.choices && data.choices[0] ? fmt(data.choices[0].message.content) : 'Failed! Check API settings.';
  } catch (e) { result.textContent = 'Connection error!'; }
}

// ===== Character Explorer =====
async function searchCharacters() {
  const q = document.getElementById('char-search').value.trim();
  if (!q) return;
  const grid = document.getElementById('char-grid');
  grid.innerHTML = '<div class="loading" style="grid-column:1/-1">Searching...</div>';
  try {
    const res = await fetch(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(q)}&limit=12`);
    const data = await res.json();
    if (!data.data || !data.data.length) { grid.innerHTML = '<div class="empty-state">No characters found!</div>'; return; }
    grid.innerHTML = data.data.map(c => `
      <div class="char-card" onclick="openModal('<h3>${c.name.replace(/'/g,'')}</h3><img src=${c.images.jpg.image_url}><p>${(c.about||'No info').replace(/'/g,'').replace(/\n/g,'<br>').substring(0,500)}...</p>')">
        <img src="${c.images.jpg.image_url}" alt="${c.name}" loading="lazy">
        <div class="char-info"><h4>${c.name}</h4><p>${c.about ? c.about.substring(0, 80) + '...' : 'No info.'}</p></div>
      </div>
    `).join('');
  } catch (e) { grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1">Error fetching!</div>'; }
}

// ===== Seasonal Anime =====
async function loadSeasonal() {
  const year = document.getElementById('season-year').value;
  const season = document.getElementById('season-name').value;
  const grid = document.getElementById('season-grid');
  grid.innerHTML = '<div class="loading" style="grid-column:1/-1">Loading...</div>';
  try {
    const res = await fetch(`https://api.jikan.moe/v4/seasons/${year}/${season}?limit=18`);
    const data = await res.json();
    if (!data.data || !data.data.length) { grid.innerHTML = '<div class="empty-state">No anime found for this season.</div>'; return; }
    grid.innerHTML = data.data.map(a => `
      <div class="anime-card" onclick="window.open('${a.url}','_blank')">
        <img src="${a.images.jpg.large_image_url}" alt="${a.title}" loading="lazy">
        <div class="anime-info">
          <h4 title="${a.title}">${a.title}</h4>
          <div class="anime-meta">
            <span class="score"> ${a.score || 'N/A'}</span>
            <span>${a.type || '?'}</span>
            <span>${a.episodes || '?'} ep</span>
          </div>
        </div>
      </div>
    `).join('');
  } catch (e) { grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1">Error loading seasonal anime.</div>'; }
}

// ===== Anime Quiz =====
let quizState = { questions: [], current: 0, score: 0, answered: false };

function generateQuizQuestions(category, difficulty) {
  const banks = {
    general: [
      { q:"Which anime features a notebook that can kill anyone whose name is written in it?", a:["Death Note","Naruto","Bleach","One Piece"], correct:0 },
      { q:"What is the name of the main character in Attack on Titan?", a:["Eren Yeager","Levi Ackerman","Mikasa Ackerman","Armin Arlert"], correct:0 },
      { q:"In which anime does the protagonist collect Dragon Balls?", a:["Dragon Ball","Naruto","One Piece","Bleach"], correct:0 },
      { q:"What studio produced Spirited Away?", a:["Studio Ghibli","Kyoto Animation","Madhouse","ufotable"], correct:0 },
      { q:"What is the name of the virtual world in Sword Art Online?", a:["Aincrad","Alfheim","Underworld","Gun Gale"], correct:0 },
      { q:"Which anime has a character named Satoru Gojo?", a:["Jujutsu Kaisen","Demon Slayer","Chainsaw Man","My Hero Academia"], correct:0 },
      { q:"What is the highest-grossing anime film of all time?", a:["Demon Slayer: Mugen Train","Your Name","Spirited Away","One Piece Film Red"], correct:0 },
      { q:"In One Piece, what is Luffy's Devil Fruit?", a:["Gomu Gomu no Mi","Mera Mera no Mi","Hito Hito no Mi","Gura Gura no Mi"], correct:0 },
      { q:"What year was the original Akira movie released?", a:["1988","1995","2001","1979"], correct:0 },
      { q:"Which anime features alchemy as a central power system?", a:["Fullmetal Alchemist","Naruto","Hunter x Hunter","Fairy Tail"], correct:0 }
    ],
    naruto: [
      { q:"What is Naruto's signature jutsu?", a:["Rasengan","Chidori","Shadow Clone Jutsu","Kamehameha"], correct:0 },
      { q:"Who is the leader of Akatsuki?", a:["Pain/Nagato","Itachi","Obito","Madara"], correct:0 },
      { q:"What is the name of the Nine-Tailed Fox?", a:["Kurama","Shukaku","Matatabi","Gyuki"], correct:0 },
      { q:"What village is Naruto from?", a:["Konoha (Hidden Leaf)","Suna (Hidden Sand)","Kiri (Hidden Mist)","Kumo (Hidden Cloud)"], correct:0 },
      { q:"Who taught Naruto the Rasengan?", a:["Jiraiya","Kakashi","Minato","Tsunade"], correct:0 }
    ],
    "one-piece": [
      { q:"What is the name of Luffy's ship?", a:["Thousand Sunny & Going Merry","Oro Jackson","Red Force","Polar Tang"], correct:0 },
      { q:"Who is the Pirate King?", a:["Gol D. Roger","Whitebeard","Shanks","Kaido"], correct:0 },
      { q:"What is Zoro's goal?", a:["To become the world's greatest swordsman","To find the One Piece","To become Pirate King","To draw a map of the world"], correct:0 },
      { q:"What Devil Fruit does Luffy eat?", a:["Gomu Gomu no Mi (Hito Hito no Mi, Model: Nika)","Mera Mera no Mi","Ope Ope no Mi","Gura Gura no Mi"], correct:0 },
      { q:"How many Straw Hat crew members are there currently?", a:["10","8","12","7"], correct:0 }
    ],
    "attack-on-titan": [
      { q:"What are the three walls that protect humanity?", a:["Wall Maria, Rose, and Sina","Wall Titan, Rose, and Sina","Wall Maria, Rose, and Founding","Wall Maria, Rose, and Attack"], correct:0 },
      { q:"What is the name of the military police's elite squad?", a:["Survey Corps","Garrison","Military Police","Special Ops"], correct:0 },
      { q:"Who is the Armored Titan?", a:["Reiner Braun","Bertholdt Hoover","Annie Leonhart","Zeke Yeager"], correct:0 },
      { q:"What is Eren's last name?", a:["Yeager","Ackerman","Arlelt","Braun"], correct:0 },
      { q:"What can the Founding Titan do?", a:["Control other titans and Eldians memories","Transform into any titan","See the future","None of the above"], correct:0 }
    ],
    genshin: [
      { q:"What element does Furina control?", a:["Hydro","Pyro","Cryo","Anemo"], correct:0 },
      { q:"What is the name of the Traveler's sibling?", a:["Aether/Lumine (opposite twin)","Paimon","Zhongli","Venti"], correct:0 },
      { q:"Which nation is based on Japan in Genshin Impact?", a:["Inazuma","Liyue","Mondstadt","Sumeru"], correct:0 },
      { q:"Who is the Geo Archon?", a:["Zhongli","Venti","Raiden Shogun","Nahida"], correct:0 },
      { q:"What is the name of the Adventurers' Guild receptionist in Mondstadt?", a:["Katheryne","Jean","Amber","Lisa"], correct:0 }
    ],
    "studio-ghibli": [
      { q:"What is the name of the main character in Spirited Away?", a:["Chihiro (Sen)","Kiki","Satsuki","Sophie"], correct:0 },
      { q:"In My Neighbor Totoro, what forest spirit do the girls meet?", a:["Totoro","Catbus","Kodama","No-Face"], correct:0 },
      { q:"What film features a moving castle?", a:["Howl's Moving Castle","Castle in the Sky","Spirited Away","Princess Mononoke"], correct:0 },
      { q:"Who directed most Studio Ghibli films?", a:["Hayao Miyazaki","Isao Takahata","Gorou Miyazaki","Mamoru Hosoda"], correct:0 },
      { q:"What is the name of the witch in Kiki's Delivery Service?", a:["Kiki","Ursula","Sophie","San"], correct:0 }
    ]
  };
  let qs = banks[category] || banks.general;
  // Shuffle
  for (let i = qs.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [qs[i], qs[j]] = [qs[j], qs[i]]; }
  // Shuffle answers for each question
  return qs.slice(0, 5).map(q => {
    const correctAnswer = q.a[0];
    const shuffled = [...q.a].sort(() => Math.random() - 0.5);
    return { q: q.q, a: shuffled, correct: shuffled.indexOf(correctAnswer) };
  });
}

function startQuiz() {
  const cat = document.getElementById('quiz-category').value;
  const diff = document.getElementById('quiz-difficulty').value;
  quizState = { questions: generateQuizQuestions(cat, diff), current: 0, score: 0, answered: false };
  document.getElementById('quiz-start').style.display = 'none';
  document.getElementById('quiz-game').style.display = 'block';
  document.getElementById('quiz-result').style.display = 'none';
  document.getElementById('quiz-total').textContent = quizState.questions.length;
  document.getElementById('quiz-score').textContent = '0';
  showQuizQuestion();
}

function showQuizQuestion() {
  const q = quizState.questions[quizState.current];
  document.getElementById('quiz-progress-bar').style.width = ((quizState.current / quizState.questions.length) * 100) + '%';
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
    if (quizState.current >= quizState.questions.length) showQuizResult();
    else showQuizQuestion();
  }, 1500);
}

function showQuizResult() {
  document.getElementById('quiz-game').style.display = 'none';
  document.getElementById('quiz-result').style.display = 'block';
  document.getElementById('quiz-progress-bar').style.width = '100%';
  const pct = (quizState.score / quizState.questions.length) * 100;
  document.getElementById('quiz-final-score').textContent = `${quizState.score}/${quizState.questions.length}`;
  const msgs = pct === 100 ? "Perfect score! You're a true otaku!  " : pct >= 60 ? "Not bad! You know your anime!  " : "Keep watching more anime!  ";
  document.getElementById('quiz-result-msg').textContent = msgs;
}

function resetQuiz() {
  document.getElementById('quiz-start').style.display = 'block';
  document.getElementById('quiz-game').style.display = 'none';
  document.getElementById('quiz-result').style.display = 'none';
}

// ===== Anime Quotes =====
const animeQuotes = [
  { text:"If you don't take risks, you can't create a future.", author:"Monkey D. Luffy", anime:"One Piece" },
  { text:"The world isn't perfect. But it's there for us, doing the best it can... and that's what makes it so damn beautiful.", author:"Roy Mustang", anime:"Fullmetal Alchemist" },
  { text:"People's lives don't end when they die. It ends when they lose faith.", author:"Itachi Uchiha", anime:"Naruto" },
  { text:"I'll leave tomorrow's problems to tomorrow's me.", author:"Saitama", anime:"One Punch Man" },
  { text:"The only ones who should kill are those prepared to be killed.", author:"Lelouch Lamperouge", anime:"Code Geass" },
  { text:"Whatever you lose, you'll find it again. But what you throw away you'll never get back.", author:"Himura Kenshin", anime:"Rurouni Kenshin" },
  { text:"A dropout will beat a genius through hard work.", author:"Rock Lee", anime:"Naruto" },
  { text:"I am the bone of my sword.", author:"Emiya Shirou", anime:"Fate/stay night" },
  { text:"Even if I die, I'll become a ghost and protect you.", author:"Naruto Uzumaki", anime:"Naruto" },
  { text:"In this world, wherever there is light, there are also shadows.", author:"Madara Uchiha", anime:"Naruto" },
  { text:"A lesson without pain is meaningless.", author:"Edward Elric", anime:"Fullmetal Alchemist" },
  { text:"Fear is not evil. It tells you what your weakness is.", author:"Gildarts Clive", anime:"Fairy Tail" },
  { text:"If you can't find a reason to fight, then you shouldn't be fighting.", author:"Akame", anime:"Akame ga Kill" },
  { text:"I don't want to conquer anything. I just think the guy with the most freedom in this whole ocean... is the Pirate King!", author:"Monkey D. Luffy", anime:"One Piece" },
  { text:"Those who forgive themselves and are able to accept their true nature... They are the strong ones.", author:"Itachi Uchiha", anime:"Naruto" },
  { text:"I'll destroy this cursed world and recreate it!", author:"Obito Uchiha", anime:"Naruto" },
  { text:"Sometimes, the questions are complicated and the answers are simple.", author:"L Lawliet", anime:"Death Note" },
  { text:"Being alone is more painful than getting hurt.", author:"Monkey D. Luffy", anime:"One Piece" },
  { text:"I am atomic.", author:"Cid Kagenou", anime:"The Eminence in Shadow" },
  { text:"Throughout heaven and earth, I alone am the honored one.", author:"Gojo Satoru", anime:"Jujutsu Kaisen" },
  { text:"I keep moving forward, until I destroy my enemies.", author:"Eren Yeager", anime:"Attack on Titan" },
  { text:"You can die anytime, but living takes true courage.", author:"Kenshin Himura", anime:"Rurouni Kenshin" },
  { text:"I am the hope of the universe. I am the answer to all living things that cry out for peace.", author:"Goku", anime:"Dragon Ball Z" },
  { text:"To know sorrow is not terrifying. What is terrifying is forgetting sorrow.", author:"Slam", anime:"Slam Dunk" },
  { text:"Miracles don't exist in this world. Only cause and effect.", author:"Kirigaya Kazuto", anime:"Sword Art Online" }
];

function getRandomQuote() {
  const q = animeQuotes[Math.floor(Math.random() * animeQuotes.length)];
  document.getElementById('quote-text').textContent = `"${q.text}"`;
  document.getElementById('quote-author').textContent = `— ${q.author}`;
  document.getElementById('quote-anime').textContent = q.anime;
  // Animate
  const card = document.getElementById('quote-card');
  card.style.animation = 'none'; card.offsetHeight; card.style.animation = 'fadeIn .5s ease';
}

// ===== Watchlist =====
let watchlist = JSON.parse(localStorage.getItem('ainime_watchlist') || '[]');
let watchlistFilter = 'all';
let wlSearchTimer;

function saveWatchlist() { localStorage.setItem('ainime_watchlist', JSON.stringify(watchlist)); }

function debounceWatchlistSearch() {
  clearTimeout(wlSearchTimer);
  wlSearchTimer = setTimeout(() => searchWatchlistAnime(), 500);
}

async function searchWatchlistAnime() {
  const q = document.getElementById('watchlist-search').value.trim();
  const container = document.getElementById('watchlist-search-results');
  if (!q) { container.innerHTML = ''; return; }
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=5`);
    const data = await res.json();
    if (!data.data || !data.data.length) { container.innerHTML = '<div style="color:var(--text2);padding:8px">No results</div>'; return; }
    container.innerHTML = data.data.map(a => `
      <div class="watchlist-search-item" onclick='addToWatchlist(${JSON.stringify({ id: a.mal_id, title: a.title, image: a.images.jpg.image_url, type: a.type, episodes: a.episodes }).replace(/'/g, "&#39;")})'>
        <img src="${a.images.jpg.image_url}" alt="">
        <div class="wl-info"><h4>${a.title}</h4><small>${a.type || '?'} | ${a.episodes || '?'} episodes</small></div>
      </div>
    `).join('');
  } catch (e) { container.innerHTML = ''; }
}

function addToWatchlist(anime) {
  if (watchlist.find(w => w.id === anime.id)) { showToast('Already in watchlist!'); return; }
  const status = document.getElementById('watchlist-status').value;
  watchlist.push({ ...anime, status, addedAt: Date.now() });
  saveWatchlist();
  renderWatchlist();
  document.getElementById('watchlist-search').value = '';
  document.getElementById('watchlist-search-results').innerHTML = '';
  showToast(`Added "${anime.title}" to watchlist!`);
}

function removeFromWatchlist(id) {
  watchlist = watchlist.filter(w => w.id !== id);
  saveWatchlist(); renderWatchlist();
}

function changeWatchlistStatus(id) {
  const item = watchlist.find(w => w.id === id);
  if (!item) return;
  const statuses = ['watching', 'completed', 'plan-to-watch', 'dropped'];
  const idx = statuses.indexOf(item.status);
  item.status = statuses[(idx + 1) % statuses.length];
  saveWatchlist(); renderWatchlist();
}

function filterWatchlist(filter, btn) {
  watchlistFilter = filter;
  document.querySelectorAll('.watchlist-tabs .tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderWatchlist();
}

function renderWatchlist() {
  const grid = document.getElementById('watchlist-grid');
  const filtered = watchlistFilter === 'all' ? watchlist : watchlist.filter(w => w.status === watchlistFilter);
  if (!filtered.length) { grid.innerHTML = '<div class="empty-state">No anime here. Search and add some!</div>'; return; }
  grid.innerHTML = filtered.map(w => `
    <div class="wl-card">
      <img src="${w.image}" alt="${w.title}">
      <div class="wl-card-info">
        <h4 title="${w.title}">${w.title}</h4>
        <span class="wl-badge ${w.status}">${w.status.replace(/-/g, ' ')}</span>
        <div class="wl-actions">
          <button onclick="changeWatchlistStatus(${w.id})">Change</button>
          <button onclick="removeFromWatchlist(${w.id})">Remove</button>
        </div>
      </div>
    </div>
  `).join('');
}

// ===== News (latest anime from Jikan) =====
async function loadNews() {
  const grid = document.getElementById('news-grid');
  grid.innerHTML = '<div class="loading">Loading...</div>';
  try {
    const res = await fetch('https://api.jikan.moe/v4/watch/promos?page=1&limit=10');
    const data = await res.json();
    if (!data.data || !data.data.length) { grid.innerHTML = '<div class="empty-state">No news available.</div>'; return; }
    grid.innerHTML = data.data.map(n => `
      <div class="news-item" onclick="window.open('${n.trailer?.url || '#'}','_blank')">
        <img src="${n.entry?.images?.jpg?.image_url || ''}" alt="">
        <div class="news-info">
          <h4>${n.title}</h4>
          <p>${n.entry?.title || ''}</p>
          <small>Promo</small>
        </div>
      </div>
    `).join('');
  } catch (e) { grid.innerHTML = '<div class="empty-state">Error loading news.</div>'; }
}

// ===== Particles =====
function createParticles() {
  const c = document.getElementById('particles');
  for (let i = 0; i < 35; i++) {
    const p = document.createElement('div'); p.className = 'particle';
    const s = Math.random() * 5 + 2;
    p.style.cssText = `width:${s}px;height:${s}px;left:${Math.random()*100}%;animation-duration:${Math.random()*20+10}s;animation-delay:${Math.random()*10}s`;
    p.style.background = ['var(--accent)', 'var(--pink)', 'var(--blue)'][Math.floor(Math.random() * 3)];
    c.appendChild(p);
  }
}

// ===== Stats Counter =====
function animateStats() {
  const targets = { 'stat-anime': 20000, 'stat-chars': 500000 };
  Object.entries(targets).forEach(([id, target]) => {
    const el = document.getElementById(id);
    let current = 0;
    const step = target / 60;
    const interval = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(interval); }
      el.textContent = Math.floor(current).toLocaleString() + '+';
    }, 30);
  });
}

// ===== Init =====
createParticles();
loadApiConfig();
initChat();
renderWatchlist();
animateStats();
