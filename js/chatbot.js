// ============================================================
//  ATU PQ HUB — CHATBOT (no external AI API)
//  Rule-based assistant: matches quick-option buttons, and for
//  typed questions, scans the message for a faculty, department,
//  level, and/or year using the same data as the rest of the
//  site (PQHUB_FACULTIES / PQHUB_LEVELS / PQHUB_YEARS from
//  js/pq-hub.js), then queries Supabase for matching past
//  questions. Falls back to the developer's WhatsApp number
//  whenever it can't confidently answer.
// ============================================================

const PQHUB_DEV_WHATSAPP = '233554196068';

const PQHUB_CHAT_FAQ = [
  {
    keywords: ['sign up', 'signup', 'register', 'create account', 'create an account'],
    reply: 'Creating an account is free and takes under a minute. Tap "Sign Up" in the menu, enter your full name, Student ID, contact number and a password. You\'ll be signed in right away.',
    link: { href: 'signup.html', label: 'Go to Sign Up' }
  },
  {
    keywords: ['log in', 'login', 'sign in', 'signin'],
    reply: 'Use your Student ID and password to log in. No email needed.',
    link: { href: 'login.html', label: 'Go to Login' }
  },
  {
    keywords: ['download', 'save', 'how do i get', 'how to get'],
    reply: 'Once you\'re logged in, open Past Questions, find what you need, and tap Download. It saves straight to your device.',
    link: { href: 'past-questions.html', label: 'Browse Past Questions' }
  },
  {
    keywords: ['faculty', 'faculties', 'department', 'departments'],
    reply: 'ATU PQ Hub covers all 5 faculties at ATU: Engineering, Built Environment, Applied Sciences, Applied Arts, and Business, 16 departments in total.',
    link: { href: 'faculties.html', label: 'See All Faculties' }
  },
  {
    keywords: ['request', 'cant find', "can't find", 'missing', 'dont have', "don't have", 'upload a past question'],
    reply: 'If a past question isn\'t on the platform yet, send a request and the admin will upload it. If you\'re logged in, it also shows up in "My Requests" on your dashboard.',
    link: { href: 'contact.html', label: 'Request a Past Question' }
  },
  {
    keywords: ['free', 'cost', 'price', 'pay', 'payment', 'charge'],
    reply: 'ATU PQ Hub is completely free. You\'ll never be asked to pay to download a past question.'
  },
  {
    keywords: ['who', 'about', 'moyole', 'omar', 'sulley', 'backed', 'behind this'],
    reply: 'ATU PQ Hub is brought to you by Omar Sulley Bin, popularly known as Officer Moyole, SRC Part Time Representative for 2026/2027, and built by Ibrahim Mohammed Lotsu (Ibratech).',
    link: { href: 'about.html', label: 'Read More' }
  },
  {
    keywords: ['dashboard', 'my downloads', 'my requests', 'my profile', 'my account'],
    reply: 'Your dashboard shows your download history, your requests to the admin, and lets you edit your profile.',
    link: { href: 'dashboard.html', label: 'Go to My Dashboard' }
  },
  {
    keywords: ['mission'],
    reply: 'Our mission is making academic resources accessible to every ATU student, faculty by faculty.',
    link: { href: 'mission.html', label: 'Read Our Mission' }
  },
  {
    keywords: ['vision'],
    reply: 'Our vision is a platform for academic access and student empowerment at ATU.',
    link: { href: 'vision.html', label: 'Read Our Vision' }
  },
  {
    keywords: ['privacy'],
    reply: 'You can read exactly how we handle your data on our Privacy Policy page.',
    link: { href: 'privacy.html', label: 'View Privacy Policy' }
  },
  {
    keywords: ['terms'],
    reply: 'Our Terms of Use cover how the platform should be used.',
    link: { href: 'terms.html', label: 'View Terms of Use' }
  },
];

// ------------------------------------------------------------
//  Try to pull a faculty, department, level, and/or year out of
//  free text the student typed, using the same lists that power
//  every dropdown on the site.
// ------------------------------------------------------------
function pqhubChatExtractFilters(text) {
  const lower = text.toLowerCase();
  const found = { courseCode: null, faculty: null, department: null, level: null, year: null, remainder: text };

  // Course codes typically look like "MATH 151", "CSCD101", "ACCT-101"
  const codeMatch = text.match(/\b([A-Za-z]{3,5})\s?-?\s?(\d{3})\b/);
  if (codeMatch) found.courseCode = (codeMatch[1] + ' ' + codeMatch[2]).toUpperCase();

  if (typeof PQHUB_FACULTIES !== 'undefined') {
    Object.keys(PQHUB_FACULTIES).forEach(function(faculty) {
      const shortName = faculty.replace('Faculty of ', '').toLowerCase();
      if (lower.includes(shortName) || lower.includes(faculty.toLowerCase())) {
        found.faculty = faculty;
      }
      PQHUB_FACULTIES[faculty].forEach(function(dept) {
        if (lower.includes(dept.toLowerCase())) {
          found.department = dept;
          found.faculty = faculty;
        }
      });
    });
  }

  if (typeof PQHUB_LEVELS !== 'undefined') {
    PQHUB_LEVELS.forEach(function(level) {
      if (lower.includes(level.toLowerCase())) found.level = level;
    });
    // common shorthand
    const levelMap = { 'year 1': 'Level 100', 'year 2': 'Level 200', 'year 3': 'Level 300', 'year 4': 'Level 400', '100 level': 'Level 100', '200 level': 'Level 200', '300 level': 'Level 300', '400 level': 'Level 400' };
    Object.keys(levelMap).forEach(function(k) { if (lower.includes(k)) found.level = levelMap[k]; });
  }

  if (typeof PQHUB_YEARS !== 'undefined') {
    PQHUB_YEARS.forEach(function(year) {
      if (lower.includes(String(year))) found.year = year;
    });
  }

  return found;
}

// ------------------------------------------------------------
//  Query Supabase for past questions matching whatever filters
//  were detected in the student's message.
// ------------------------------------------------------------
async function pqhubChatSearchPQ(filters) {
  if (typeof sb === 'undefined' || !sb) return [];
  try {
    let query = sb.from('past_questions').select('id, title, course_code, faculty, department, level, year, file_url').limit(4);
    if (filters.courseCode) query = query.ilike('course_code', '%' + filters.courseCode + '%');
    if (filters.faculty)    query = query.ilike('faculty', '%' + filters.faculty + '%');
    if (filters.department) query = query.ilike('department', '%' + filters.department + '%');
    if (filters.level)      query = query.ilike('level', '%' + filters.level + '%');
    if (filters.year)       query = query.eq('year', filters.year);
    const { data, error } = await query;
    if (error) { console.warn('Chat PQ search error:', error); return []; }
    return data || [];
  } catch (e) {
    console.warn('Chat PQ search failed:', e);
    return [];
  }
}

// ------------------------------------------------------------
//  Render a message bubble
// ------------------------------------------------------------
function pqhubChatAddMessage(html, who) {
  const wrap = document.getElementById('chatbotMessages');
  if (!wrap) return;
  const bubble = document.createElement('div');
  bubble.className = 'chat-msg ' + (who === 'user' ? 'chat-msg-user' : who === 'typing' ? 'chat-msg-bot chat-msg-typing' : 'chat-msg-bot');
  bubble.innerHTML = html;
  wrap.appendChild(bubble);
  wrap.scrollTop = wrap.scrollHeight;
}

function pqhubChatRemoveTyping() {
  const wrap = document.getElementById('chatbotMessages');
  if (!wrap) return;
  wrap.querySelectorAll('.chat-msg-typing').forEach(function(el) { el.remove(); });
}

function pqhubChatDevFallback(customLine) {
  const line = customLine || "I couldn't find an answer to that.";
  pqhubChatAddMessage(
    line + ' Chat directly with our team and we\'ll help you out:' +
    '<br><a href="https://wa.me/' + PQHUB_DEV_WHATSAPP + '" target="_blank" class="chat-link-btn">💬 Message us on WhatsApp</a>',
    'bot'
  );
}

// ------------------------------------------------------------
//  Handle a quick-option button
// ------------------------------------------------------------
function pqhubChatOption(action) {
  const optWrap = document.getElementById('chatbotOptions');
  if (optWrap) optWrap.style.display = 'none';

  if (action === 'past-questions') {
    pqhubChatAddMessage('Browse Past Questions', 'user');
    pqhubChatAddMessage('Here you go, search and filter by faculty, department, level or year:<br><a href="past-questions.html" class="chat-link-btn">📚 Open Past Questions</a>', 'bot');
  } else if (action === 'faculties') {
    pqhubChatAddMessage('Browse Faculties', 'user');
    pqhubChatAddMessage('We cover all 5 ATU faculties, 16 departments:<br><a href="faculties.html" class="chat-link-btn">🏛️ See All Faculties</a>', 'bot');
  } else if (action === 'signup') {
    pqhubChatAddMessage('How to sign up', 'user');
    pqhubChatAddMessage('Tap Sign Up, enter your name, Student ID, contact number and a password, you\'re in right away, no email needed.<br><a href="signup.html" class="chat-link-btn">🎓 Create Account</a>', 'bot');
  } else if (action === 'download') {
    pqhubChatAddMessage('How to download', 'user');
    pqhubChatAddMessage('Log in, open a past question, tap Download, it saves straight to your device.<br><a href="past-questions.html" class="chat-link-btn">📚 Browse Now</a>', 'bot');
  } else if (action === 'request') {
    pqhubChatAddMessage('Request a past question', 'user');
    pqhubChatAddMessage('Can\'t find your course? Send a request and we\'ll upload it, usually within 24 hours.<br><a href="contact.html" class="chat-link-btn">📲 Request a Past Question</a>', 'bot');
  } else if (action === 'about') {
    pqhubChatAddMessage('About this platform', 'user');
    pqhubChatAddMessage('ATU PQ Hub is brought to you by Omar Sulley Bin (Officer Moyole), SRC Part Time Representative 2026/2027, and built by Ibrahim Mohammed Lotsu (Ibratech).<br><a href="about.html" class="chat-link-btn">ℹ️ Read More</a>', 'bot');
  } else if (action === 'contact') {
    pqhubChatAddMessage('Get help', 'user');
    pqhubChatDevFallback('Happy to help.');
  }
}

// ------------------------------------------------------------
//  Handle typed free-text questions
// ------------------------------------------------------------
async function pqhubChatSend() {
  const input = document.getElementById('chatbotInput');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  input.value = '';

  const optWrap = document.getElementById('chatbotOptions');
  if (optWrap) optWrap.style.display = 'none';

  pqhubChatAddMessage(text.replace(/</g, '&lt;'), 'user');
  pqhubChatAddMessage('typing…', 'typing');

  // 1. Try to detect a faculty/department/level/year and search live past questions
  const filters = pqhubChatExtractFilters(text);
  const hasFilter = filters.courseCode || filters.faculty || filters.department || filters.level || filters.year;

  let handled = false;

  if (hasFilter) {
    const results = await pqhubChatSearchPQ(filters);
    pqhubChatRemoveTyping();
    if (results.length) {
      let html = 'Found ' + results.length + ' matching past question' + (results.length > 1 ? 's' : '') + ':<br>';
      html += results.map(function(pq) {
        return '<div class="chat-pq-result"><strong>' + (pq.course_code ? '[' + pq.course_code + '] ' : '') + pq.title + '</strong><br><span>' + (pq.faculty || '') + (pq.department ? ' · ' + pq.department : '') + (pq.level ? ' · ' + pq.level : '') + (pq.year ? ' · ' + pq.year : '') + '</span></div>';
      }).join('');
      html += '<a href="past-questions.html" class="chat-link-btn">📚 Open in Past Questions</a>';
      pqhubChatAddMessage(html, 'bot');
      handled = true;
    }
  } else {
    pqhubChatRemoveTyping();
  }

  // 2. Fall back to the local FAQ keyword match
  if (!handled) {
    const lower = text.toLowerCase();
    const match = PQHUB_CHAT_FAQ.find(function(item) {
      return item.keywords.some(function(k) { return lower.includes(k); });
    });
    if (match) {
      let html = match.reply;
      if (match.link) html += '<br><a href="' + match.link.href + '" class="chat-link-btn">' + match.link.label + '</a>';
      pqhubChatAddMessage(html, 'bot');
      handled = true;
    }
  }

  // 3. Nothing matched, hand off to the developer
  if (!handled) {
    if (hasFilter) {
      pqhubChatDevFallback("I searched but couldn't find that exact past question yet.");
    } else {
      pqhubChatDevFallback("I'm not able to answer that one yet.");
    }
  }
}

function pqhubChatKeydown(e) {
  if (e.key === 'Enter') pqhubChatSend();
}

// Toggle chatbot open/closed (shared across every page)
function toggleChatbot() {
  const b = document.getElementById('chatbotBubble');
  const t = document.getElementById('chatbotToggle');
  if (!b || !t) return;
  const open = b.classList.toggle('open');
  t.textContent = open ? '✕' : '💬';
}
