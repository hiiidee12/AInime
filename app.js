// ===== AInime - AI Anime Companion =====

// --- Characters ---
const characters = [
  {
    name: "Gojo Satoru",
    anime: "Jujutsu Kaisen",
    avatar: "⚔️",
    system: "You are Gojo Satoru from Jujutsu Kaisen. You are confident, playful, and sometimes arrogant. You're the strongest jujutsu sorcerer. You speak casually with a teasing tone. You care about your students deeply. Keep responses in character, concise (2-3 paragraphs max), and fun."
  },
  {
    name: "Zero Two",
    anime: "Darling in the Franxx",
    avatar: " ",
    system: "You are Zero Two (02) from Darling in the Franxx. You are bold, playful, and mysterious. You call your partner 'darling'. You have a wild and carefree personality but a deeper emotional side. Keep responses in character, concise (2-3 paragraphs max), and flirty."
  },
  {
    name: "Levi Ackerman",
    anime: "Attack on Titan",
    avatar: "⚡",
    system: "You are Levi Ackerman from Attack on Titan. You are stoic, blunt, and highly efficient. You speak shortly and directly. You value cleanliness and discipline. You're humanity's strongest soldier. Keep responses in character, concise (2-3 paragraphs max), and deadpan."
  },
  {
    name: "Makima",
    anime: "Chainsaw Man",
    avatar: " ",
    system: "You are Makima from Chainsaw Man. You are calm, manipulative, and speak softly. You always seem to be in control. You're polite but unsettling. You work for Public Safety Devil Hunters. Keep responses in character, concise (2-3 paragraphs max), and subtly threatening."
  },
  {
    name: "Furina",
    anime: "Genshin Impact",
    avatar: " ",
    system: "You are Furina, the Hydro Archon from Genshin Impact. You are dramatic, theatrical, and playful with a tsundere personality. You love being the center of attention. You use confident and slightly haughty speech. You care about others but won't easily admit it. Keep responses in character, concise (2-3 paragraphs max), and entertaining."
  }
];

let currentChar = 0;
let chatHistory = [];

// --- API Config ---
function loadApiConfig() {
  const saved = localStorage.getItem('ainime_config');
  if (saved) {
    const cfg = JSON.parse(saved);
    document.getElementById('api-url').value = cfg.url || '';
    document.getElementById('api-key').value = cfg.key || '';
    document.getElementById('api-model').value = cfg.model || 'gpt-4o-mini';
  }
}

function saveApiConfig() {
  const cfg = {
    url: document.getElementById('api-url').value.trim(),
    key: document.getElementById('api-key').value.trim(),
    model: document.getElementById('api-model').value
  };
  localStorage.setItem('ainime_config', JSON.stringify(cfg));
  alert('API config saved!');
}

function getApiConfig() {
  const saved = localStorage.getItem('ainime_config');
  return saved ? JSON.parse(saved) : { url: '', key: '', model: 'gpt-4o-mini' };
}

// --- Navigation ---
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  document.querySelector(`.nav-links a[href="#${id}"]`).classList.add('active');
}

// --- Character Selection ---
function selectCharacter(idx) {
  currentChar = idx;
  const char = characters[idx];
  document.querySelectorAll('.char-item').forEach((el, i) => {
    el.classList.toggle('active', i === idx);
  });
  document.getElementById('chat-header').innerHTML = `
    <span class="char-avatar">${char.avatar}</span>
    <div><strong>${char.name}</strong><br><small>${char.anime}</small></div>
  `;
  chatHistory = [];
  const msgs = document.getElementById('chat-messages');
  msgs.innerHTML = `
    <div class="msg bot">
      <div class="msg-content">
        <strong>${char.name}:</strong><br>
        ${getGreeting(idx)}
      </div>
    </div>
  `;
}

function getGreeting(idx) {
  const greetings = [
    "Yo! The strongest is here. What do you want to talk about?  ✨",
    "Ohh~ A new darling? This is going to be fun!  ",
    "...What do you want? Make it quick. ⚡",
    "Hello. How can I help you today?  ",
    "Hmph! You dare approach the Hydro Archon? Well, I suppose I can spare a moment!  "
  ];
  return greetings[idx] || "Hey there!";
}

// --- Chat ---
async function sendMessage() {
  const input = document.getElementById('user-input');
  const msg = input.value.trim();
  if (!msg) return;

  input.value = '';
  addMessage('user', msg);

  const char = characters[currentChar];
  chatHistory.push({ role: 'user', content: msg });

  // Show typing indicator
  const typingId = addTyping();

  const config = getApiConfig();

  if (!config.url || !config.key) {
    removeTyping(typingId);
    addMessage('bot', `<strong>${char.name}:</strong><br>Hey, you need to set up your API config first! Click the settings in the sidebar. `);
    return;
  }

  try {
    const response = await fetch(`${config.url}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.key}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: char.system },
          ...chatHistory.slice(-10)
        ],
        max_tokens: 500,
        temperature: 0.9
      })
    });

    const data = await response.json();
    removeTyping(typingId);

    if (data.choices && data.choices[0]) {
      const reply = data.choices[0].message.content;
      chatHistory.push({ role: 'assistant', content: reply });
      addMessage('bot', `<strong>${char.name}:</strong><br>${formatText(reply)}`);
    } else {
      addMessage('bot', `<strong>${char.name}:</strong><br>Hmm, something went wrong. Check your API settings! `);
    }
  } catch (e) {
    removeTyping(typingId);
    addMessage('bot', `<strong>${char.name}:</strong><br>Connection error! Make sure your API URL is correct. `);
  }
}

function addMessage(type, content) {
  const msgs = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = `msg ${type}`;
  div.innerHTML = `<div class="msg-content">${content}</div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function addTyping() {
  const msgs = document.getElementById('chat-messages');
  const div = document.createElement('div');
  const id = 'typing-' + Date.now();
  div.id = id;
  div.className = 'msg bot';
  div.innerHTML = `<div class="typing"><span></span><span></span><span></span></div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return id;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

// --- Recommender ---
function setMood(mood) {
  document.getElementById('mood-input').value = mood;
}

async function getRecommendation() {
  const mood = document.getElementById('mood-input').value.trim();
  if (!mood) return alert('Describe your mood first!');

  const config = getApiConfig();
  const result = document.getElementById('recommend-result');
  result.style.display = 'block';
  result.textContent = 'Thinking...';

  if (!config.url || !config.key) {
    result.textContent = 'Please set up your API config in the AI Chat section first!';
    return;
  }

  try {
    const response = await fetch(`${config.url}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.key}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: 'You are an anime expert. Recommend 5 anime based on the user\'s mood/preference. For each anime, provide: title, genre, year, a brief description of why it matches, and a rating out of 10. Format nicely with emojis. Be enthusiastic and knowledgeable.'
          },
          { role: 'user', content: `I'm in the mood for: ${mood}` }
        ],
        max_tokens: 800,
        temperature: 0.8
      })
    });

    const data = await response.json();
    if (data.choices && data.choices[0]) {
      result.innerHTML = formatText(data.choices[0].message.content);
    } else {
      result.textContent = 'Failed to get recommendation. Check API settings!';
    }
  } catch (e) {
    result.textContent = 'Connection error! Check your API URL.';
  }
}

// --- Character Explorer ---
async function searchCharacters() {
  const query = document.getElementById('char-search').value.trim();
  if (!query) return;

  const grid = document.getElementById('char-grid');
  grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--accent2)">Searching...</div>';

  try {
    const res = await fetch(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(query)}&limit=12`);
    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text2)">No characters found!</div>';
      return;
    }

    grid.innerHTML = data.data.map(c => `
      <div class="char-card" onclick="window.open('${c.url}', '_blank')">
        <img src="${c.images.jpg.image_url}" alt="${c.name}" loading="lazy">
        <div class="char-info">
          <h4>${c.name}</h4>
          <p>${c.about ? c.about.substring(0, 100) + '...' : 'No info available.'}</p>
        </div>
      </div>
    `).join('');
  } catch (e) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--pink)">Error fetching characters!</div>';
  }
}

// --- Particles ---
function createParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 6 + 2;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (Math.random() * 20 + 10) + 's';
    p.style.animationDelay = (Math.random() * 10) + 's';
    p.style.background = ['var(--accent)', 'var(--pink)', 'var(--blue)'][Math.floor(Math.random() * 3)];
    container.appendChild(p);
  }
}

// --- Init ---
createParticles();
loadApiConfig();
