// ============================================================
//  ATU PQ HUB: SHARED LOGIN MODAL (loaded on every page)
//  Injects its own styles + markup, turns every "Login" link in
//  the nav into a button that opens the modal, and sends admins
//  to dashboard.html and students to user-dashboard.html.
// ============================================================
(function () {
  var CSS = '#loginModalOverlay{position:fixed;inset:0;background:rgba(10,27,54,0.55);z-index:9000;display:none;align-items:center;justify-content:center;padding:20px}#loginModalOverlay.show{display:flex}.login-modal-card{background:#fff;border-radius:20px;max-width:380px;width:100%;padding:36px 32px;position:relative;box-shadow:0 24px 64px rgba(0,0,0,0.3);animation:loginModalIn .3s cubic-bezier(.4,0,.2,1);text-align:center;font-family:Poppins,sans-serif}@keyframes loginModalIn{from{opacity:0;transform:scale(.92) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}.login-modal-close{position:absolute;top:14px;right:14px;width:30px;height:30px;border-radius:50%;background:#eef1f6;color:#667;border:none;font-size:.9rem;cursor:pointer}.login-modal-close:hover{background:rgba(23,70,162,.1);color:#1746A2}.login-modal-logo{width:72px;height:72px;margin:0 auto 16px;border-radius:50%;overflow:hidden;background:#eef1f6;display:flex;align-items:center;justify-content:center}.login-modal-logo img{width:100%;height:100%;object-fit:contain;padding:8px}.login-modal-title{font-size:1.1rem;font-weight:600;color:#0A1B36;margin:0 0 24px;line-height:1.4}.login-modal-title span{color:#1746A2;font-weight:700}.login-modal-fieldgroup{border:1px solid rgba(23,70,162,.18);border-radius:10px;overflow:hidden;margin-bottom:18px}.login-modal-field{border-bottom:1px solid rgba(23,70,162,.12)}.login-modal-field:last-child{border-bottom:none}.login-modal-field input{width:100%;box-sizing:border-box;border:none;padding:14px 16px;font-family:inherit;font-size:.9rem;color:#0A1B36;outline:none;background:transparent}.login-modal-field input:focus{background:rgba(23,70,162,.03)}.login-modal-btn{width:100%;padding:13px;background:#1746A2;color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:.92rem;font-weight:700;cursor:pointer}.login-modal-btn:hover{background:#0f3278}.login-modal-btn:disabled{opacity:.7;cursor:not-allowed}.login-modal-error{font-size:.78rem;color:#c0392b;margin-top:10px;display:none}.login-modal-error.show{display:block}.login-modal-links{margin-top:18px;display:flex;flex-direction:column;gap:10px;font-size:.8rem}.login-modal-links a{color:#1746A2;font-weight:500;text-decoration:none}.login-modal-links a:hover{text-decoration:underline}@media(max-width:480px){.login-modal-card{padding:28px 22px}}'
   + '.nav-right-mobile{display:none;align-items:center;gap:10px}.nav-cta-mobile{padding:7px 14px!important;font-size:.78rem!important}button.nav-cta{background:#D8A727!important;color:#0A1B36!important;font-weight:700!important;padding:8px 16px!important;border-radius:8px!important;border:none;cursor:pointer;font-family:Poppins,sans-serif;font-size:.82rem}@media(max-width:900px){.nav-right-mobile{display:flex}}';

  var HTML = '<div id="loginModalOverlay" role="dialog" aria-modal="true" aria-label="Log in"><div class="login-modal-card">'
   + '<button class="login-modal-close" type="button" aria-label="Close" data-lm-close>✕</button>'
   + '<div class="login-modal-logo"><img src="images/atu-logo.png" alt="ATU PQ Hub" onerror="this.style.display=\'none\'"></div>'
   + '<h3 class="login-modal-title">Please log in to <span>ATU PQ Hub</span></h3>'
   + '<div class="login-modal-fieldgroup"><div class="login-modal-field"><input type="text" id="loginModalStudentId" placeholder="Student ID" autocomplete="username"></div>'
   + '<div class="login-modal-field"><input type="password" id="loginModalPassword" placeholder="Password" autocomplete="current-password"></div></div>'
   + '<button class="login-modal-btn" type="button" id="loginModalBtn">Log in</button>'
   + '<div class="login-modal-error" id="loginModalError" role="alert"></div>'
   + '<div class="login-modal-links"><a href="signup.html">New user? Click here to register.</a>'
   + '<a href="https://wa.me/233554196068?text=Hi%2C+I+forgot+my+ATU+PQ+Hub+password.+My+Student+ID+is%3A+" target="_blank" rel="noopener">Have you forgotten your password?</a></div>'
   + '</div></div>';

  function $(id) { return document.getElementById(id); }

  window.openLoginModal = function () {
    $('loginModalOverlay').classList.add('show');
    document.body.style.overflow = 'hidden';
    $('loginModalError').classList.remove('show');
    setTimeout(function () { $('loginModalStudentId').focus(); }, 50);
  };
  window.closeLoginModal = function () {
    $('loginModalOverlay').classList.remove('show');
    document.body.style.overflow = '';
  };

  async function submit() {
    var sid = $('loginModalStudentId').value.trim(), pw = $('loginModalPassword').value;
    var btn = $('loginModalBtn'), err = $('loginModalError');
    err.classList.remove('show');
    if (!sid || !pw) { err.textContent = 'Enter your Student ID and password.'; err.classList.add('show'); return; }
    if (typeof sb === 'undefined' || !sb) { err.textContent = 'Not connected yet. Please try again shortly.'; err.classList.add('show'); return; }
    btn.disabled = true; btn.textContent = 'Logging in...';
    try {
      await pqhubSignIn({ studentId: sid, password: pw });
      window.location.href = await pqhubLandingPage();
    } catch (e) {
      err.textContent = (e && e.message) ? e.message : 'Incorrect Student ID or password.';
      err.classList.add('show');
      btn.disabled = false; btn.textContent = 'Log in';
    }
  }

  function init() {
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var wrap = document.createElement('div'); wrap.innerHTML = HTML; document.body.appendChild(wrap.firstChild);

    $('loginModalOverlay').addEventListener('click', function (e) { if (e.target === this) closeLoginModal(); });
    document.querySelector('[data-lm-close]').addEventListener('click', closeLoginModal);
    $('loginModalBtn').addEventListener('click', submit);
    $('loginModalPassword').addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLoginModal(); });

    // Mobile: a visible Log In button beside the hamburger on every page
    var ham = $('hamburger');
    if (ham && !document.querySelector('.nav-right-mobile .nav-cta')) {
      var box = document.querySelector('.nav-right-mobile');
      var b = document.createElement('button'); b.type = 'button'; b.className = 'nav-cta nav-cta-mobile'; b.textContent = 'Log In';
      b.addEventListener('click', openLoginModal);
      if (box) { box.insertBefore(b, ham); }
      else { box = document.createElement('div'); box.className = 'nav-right-mobile'; ham.parentNode.insertBefore(box, ham); box.appendChild(b); box.appendChild(ham); }
    }
    document.querySelectorAll('[data-open-login]').forEach(function (el) { el.addEventListener('click', openLoginModal); });

    // Turn every "Login" link on the page into a modal trigger
    document.querySelectorAll('a[href="login.html"].nav-cta, a[href="login.html"].mob-cta').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var m = $('mobile-menu'), h = $('hamburger');
        if (m) m.classList.remove('open'); if (h) h.classList.remove('open');
        openLoginModal();
      });
      if (a.classList.contains('nav-cta')) a.textContent = 'Log In';
      if (a.classList.contains('mob-cta')) a.textContent = 'Log In';
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
