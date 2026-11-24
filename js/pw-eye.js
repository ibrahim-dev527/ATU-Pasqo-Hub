// ============================================================
//  ATU PQ HUB: SHOW / HIDE PASSWORD
//  Adds an eye button to every password box that does not
//  already have one. Tap the eye to see the password, tap again
//  to hide it. Exposes pqhubAddEye(input) for boxes added later.
// ============================================================
(function () {
  var OPEN = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  var SHUT = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.9 17.9A10.4 10.4 0 0 1 12 19c-6.4 0-10-7-10-7a17.6 17.6 0 0 1 4.1-4.9M9.9 5.2A9.8 9.8 0 0 1 12 5c6.4 0 10 7 10 7a17.5 17.5 0 0 1-2.2 3.2M1 1l22 22"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';

  function addEye(input) {
    if (!input || input.dataset.pqEye) return;
    var next = input.nextElementSibling;
    if (next && next.classList && next.classList.contains('eye-toggle')) { input.dataset.pqEye = '1'; return; }
    input.dataset.pqEye = '1';

    var cs = window.getComputedStyle(input);
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:relative;display:block;width:100%';
    wrap.style.marginBottom = cs.marginBottom;
    input.style.marginBottom = '0';
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);
    input.style.paddingRight = '46px';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Show password');
    btn.innerHTML = OPEN;
    btn.style.cssText = 'position:absolute;right:6px;top:50%;transform:translateY(-50%);width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;color:#667085;padding:0;border-radius:8px';
    btn.addEventListener('click', function () {
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.innerHTML = show ? SHUT : OPEN;
      btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      input.focus();
    });
    wrap.appendChild(btn);
  }
  window.pqhubAddEye = addEye;

  function scan() { document.querySelectorAll('input[type="password"]').forEach(addEye); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
})();
