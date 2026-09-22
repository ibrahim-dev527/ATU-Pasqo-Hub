// ============================================================
//  ATU PQ HUB — SHARED CONFIG + HELPERS
//  Loaded by every page (after the Supabase CDN script tag).
//  Edit ONLY the two constants below when setting up your own
//  Supabase project — everything else can stay as-is.
// ============================================================

const SUPABASE_URL      = 'https://iwroiojwbyieryjhlkuz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3cm9pb2p3YnlpZXJ5amhsa3V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5Njk4OTksImV4cCI6MjEwNTU0NTg5OX0.bcFql2DwhrPd_DlV43MzBKtENL24FkEkP1jPhhvAHaU';

// Domain used to turn a Student ID into a Supabase Auth email.
// Supabase Auth always needs *an* email under the hood — students
// never see this, they only ever type their Student ID.
const PQHUB_AUTH_DOMAIN = 'students.atupqhub.local';

let sb = null;
try {
  if (typeof supabase !== 'undefined' && SUPABASE_URL && SUPABASE_ANON_KEY) {
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e) { console.warn('Supabase not initialized:', e); }

// ------------------------------------------------------------
//  STUDENT ID  <->  INTERNAL AUTH EMAIL
// ------------------------------------------------------------
function pqhubStudentIdToEmail(studentId) {
  const clean = String(studentId || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${clean}@${PQHUB_AUTH_DOMAIN}`;
}

// ------------------------------------------------------------
//  SIGN UP — full name, student ID, contact, password
//  Creates the Auth user AND the profile row in `users`.
// ------------------------------------------------------------
async function pqhubSignUp({ fullName, studentId, contact, password, faculty, department, level }) {
  if (!sb) throw new Error('Supabase is not configured yet.');
  const email = pqhubStudentIdToEmail(studentId);

  const { data, error } = await sb.auth.signUp({
    email, password,
    options: { data: { full_name: fullName, student_id: studentId } }
  });
  if (error) throw error;

  // Best-effort profile row — if this fails, the account still exists,
  // but the student's name/contact won't show up until they edit their
  // profile from the dashboard.
  if (data.user) {
    const { error: profileError } = await sb.from('users').upsert({
      id: data.user.id,
      student_id: studentId.trim(),
      name: fullName,
      contact: contact,
      faculty: faculty || null,
      department: department || null,
      level: level || null
    });
    if (profileError) console.warn('Profile row failed to save:', profileError);
  }
  return data;
}

// ------------------------------------------------------------
//  LOG IN — student ID + password
// ------------------------------------------------------------
async function pqhubSignIn({ studentId, password }) {
  if (!sb) throw new Error('Supabase is not configured yet.');
  const email = pqhubStudentIdToEmail(studentId);
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function pqhubSignOut() {
  if (sb) await sb.auth.signOut();
}

async function pqhubGetUser() {
  if (!sb) return null;
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

// ------------------------------------------------------------
//  FORCE A REAL FILE DOWNLOAD (not a new tab)
//  Fetches the PDF as a blob so the browser saves it straight
//  to the student's Downloads folder, then logs it (if signed in)
//  so it shows up in "My Downloads" on their dashboard.
// ------------------------------------------------------------
async function pqhubDownloadFile(url, filename, meta) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error('Could not fetch the file (' + resp.status + ')');
  const blob = await resp.blob();
  const blobUrl = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename || 'past-question.pdf';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(blobUrl);

  // Log the download for the student's dashboard history (best-effort)
  try {
    const user = await pqhubGetUser();
    if (user && sb && meta) {
      await sb.from('downloads').insert({
        user_id: user.id,
        pq_id: meta.pqId || null,
        pq_title: meta.title || filename,
        pq_faculty: meta.faculty || null
      });
    }
  } catch (e) { console.warn('Could not log download:', e); }
}

// ------------------------------------------------------------
//  SUBMIT A REQUEST TO THE ADMIN (a past question they need,
//  or a question about the platform). Shows up in the student's
//  "My Requests" panel and in the admin dashboard.
// ------------------------------------------------------------
async function pqhubSubmitRequest({ message, type }) {
  if (!sb) throw new Error('Supabase is not configured yet.');
  const user = await pqhubGetUser();
  if (!user) throw new Error('You need to be signed in to send a request.');
  const { error } = await sb.from('pq_requests').insert({
    user_id: user.id,
    message: message,
    type: type || 'past_question',
    status: 'pending'
  });
  if (error) throw error;
}

// ------------------------------------------------------------
//  GUARD — redirect to login.html if not signed in.
//  Call this at the top of any page that requires an account.
// ------------------------------------------------------------
async function pqhubRequireAuth(redirectTo) {
  const user = await pqhubGetUser();
  if (!user) {
    window.location.href = redirectTo || 'login.html';
    return null;
  }
  return user;
}

// ============================================================
//  ATU FACULTIES, DEPARTMENTS, LEVELS & YEARS — single source
//  of truth. Every dropdown on the site (signup, profile,
//  upload form, search filters, request forms) is populated
//  from this data, so updating a faculty/department/level/year
//  list here updates it EVERYWHERE at once.
// ============================================================
const PQHUB_FACULTIES = {
  "Faculty of Engineering": ["Mechanical Engineering", "Electrical/Electronic Engineering", "Civil Engineering"],
  "Faculty of Built Environment": ["Building Technology", "Interior Design and Upholstery Technology"],
  "Faculty of Applied Sciences": ["Applied Mathematics and Statistics", "Science Laboratory Technology", "Computer Science", "Medical Laboratory Technology"],
  "Faculty of Applied Arts": ["Hotel Catering & Institutional Management (HCIM)", "Fashion Design & Textiles", "Liberal Studies and Communications Technology"],
  "Faculty of Business": ["Accountancy and Finance", "Management and Public Administration", "Procurement and Supply Chain Management", "Marketing"]
};

const PQHUB_LEVELS = ["Level 100", "Level 200", "Level 300", "Level 400", "HND 100", "HND 200", "HND 300", "Diploma 100", "Diploma 200"];

// Newest first
const PQHUB_YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];

// Fill a <select> with every faculty. Pass allLabel (e.g. "All Faculties")
// to add a blank leading option for a filter UI, or omit it for a form
// where a faculty must be chosen.
function pqhubFillFacultySelect(selectEl, allLabel) {
  if (!selectEl) return;
  const opts = Object.keys(PQHUB_FACULTIES).map(f => `<option value="${f}">${f}</option>`).join('');
  selectEl.innerHTML = (allLabel ? `<option value="">${allLabel}</option>` : '<option value="">Select Faculty</option>') + opts;
}

// Fill a <select> with the departments under one faculty. Call this
// again whenever the faculty select changes, to keep them in sync.
function pqhubFillDepartmentSelect(selectEl, faculty, allLabel) {
  if (!selectEl) return;
  const depts = PQHUB_FACULTIES[faculty] || [];
  const opts = depts.map(d => `<option value="${d}">${d}</option>`).join('');
  selectEl.innerHTML = (allLabel ? `<option value="">${allLabel}</option>` : '<option value="">Select Department</option>') + opts;
}

function pqhubFillLevelSelect(selectEl, allLabel) {
  if (!selectEl) return;
  const opts = PQHUB_LEVELS.map(l => `<option value="${l}">${l}</option>`).join('');
  selectEl.innerHTML = (allLabel ? `<option value="">${allLabel}</option>` : '<option value="">Select Level</option>') + opts;
}

function pqhubFillYearSelect(selectEl, allLabel) {
  if (!selectEl) return;
  const opts = PQHUB_YEARS.map(y => `<option value="${y}">${y}</option>`).join('');
  selectEl.innerHTML = (allLabel ? `<option value="">${allLabel}</option>` : '<option value="">Select Year</option>') + opts;
}

// Wire a faculty <select> so its paired department <select> refills
// automatically whenever the faculty changes.
function pqhubLinkFacultyToDepartment(facultySelectEl, deptSelectEl, allLabel) {
  if (!facultySelectEl || !deptSelectEl) return;
  facultySelectEl.addEventListener('change', function() {
    pqhubFillDepartmentSelect(deptSelectEl, this.value, allLabel);
  });
}
