// ============================================================
//  ATU PQ HUB: SITE SETTINGS (loaded on public pages)
//  Reads the values the admin saves under Settings in admin.html
//  and applies them: welcome pop-up, announcement banner, logo,
//  site/rep names, contact numbers and social links.
//
//  SECURITY: values are only ever written with textContent or
//  validated attributes (https links, digits for phone numbers).
//  Nothing from the database is inserted as HTML.
// ============================================================
(function () {
  var DEF = {
    moyoleWa: '233245607110', devWa: '233554196068',
    siteName: 'ATU PQ Hub', repName: 'Omar Sulley Bin',
    repNick: 'Officer Moyole', repTitle: 'SRC Part Time Representative',
    logo: 'images/atu-logo.png'
  };
  var CACHE = 'pqhub_settings_v2';
  var origText = new Map();

  // ---------- validation helpers ----------
  function httpsUrl(v) { v = String(v || '').trim(); return /^https:\/\/[^\s"'<>]+$/i.test(v) ? v : ''; }
  function linkUrl(v) {
    v = String(v || '').trim();
    if (httpsUrl(v)) return v;
    if (/^[a-z0-9\-_.\/]+\.html(#[\w-]*)?$/i.test(v)) return v; // a page on this site
    return '';
  }
  function intlPhone(v) {
    var d = String(v || '').replace(/\D/g, '');
    if (!d) return '';
    if (d.charAt(0) === '0') d = '233' + d.slice(1);
    return (d.length >= 11 && d.length <= 15) ? d : '';
  }
  function localDisplay(intl) {
    if (intl.indexOf('233') === 0 && intl.length === 12) {
      var l = '0' + intl.slice(3);
      return l.slice(0, 3) + ' ' + l.slice(3, 6) + ' ' + l.slice(6);
    }
    return '+' + intl;
  }
  function disp(intl) { return localDisplay(intl); }

  // ---------- fetch ----------
  function readCache() { try { return JSON.parse(localStorage.getItem(CACHE) || '{}'); } catch (e) { return {}; } }
  function writeCache(o) { try { localStorage.setItem(CACHE, JSON.stringify(o)); } catch (e) {} }

  async function fetchSettings() {
    if (typeof sb === 'undefined' || !sb) return null;
    try {
      var r = await sb.from('site_settings').select('key,value');
      if (r.error || !r.data) return null;
      var o = {}; r.data.forEach(function (x) { o[x.key] = x.value; });
      return o;
    } catch (e) { return null; }
  }

  // ---------- text + attribute replacement (re-applicable) ----------
  function textNodes() {
    var out = [], w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode && n.parentNode.nodeName;
        if (/^(SCRIPT|STYLE|TEXTAREA|NOSCRIPT)$/.test(p)) return NodeFilter.FILTER_REJECT;
        return n.nodeValue && n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    while (w.nextNode()) out.push(w.currentNode);
    return out;
  }

  function applyReplacements(pairs) {
    textNodes().forEach(function (n) {
      if (!origText.has(n)) origText.set(n, n.nodeValue);
      var t = origText.get(n);
      pairs.forEach(function (p) { if (t.indexOf(p[0]) > -1) t = t.split(p[0]).join(p[1]); });
      if (t !== n.nodeValue) n.nodeValue = t;
    });
  }

  function setAttr(el, attr, orig, val) {
    var key = 'pqOrig' + attr;
    if (!el.dataset[key]) el.dataset[key] = orig;
    el.setAttribute(attr, val);
  }

  function apply(S, withPopup) {
    var pairs = [];
    var moy = intlPhone(S.moyole_whatsapp), dev = intlPhone(S.dev_whatsapp);
    var name = (S.site_name || '').trim().slice(0, 40);
    var rep = (S.rep_name || '').trim().slice(0, 60);
    var nick = (S.rep_nickname || '').trim().slice(0, 40);
    var title = (S.rep_title || '').trim().slice(0, 80);

    if (rep && rep !== DEF.repName) pairs.push([DEF.repName, rep]);
    if (nick && nick !== DEF.repNick) pairs.push([DEF.repNick, nick]);
    if (title && title !== DEF.repTitle) pairs.push([DEF.repTitle, title]);
    if (name && name !== DEF.siteName) pairs.push([DEF.siteName, name]);
    if (moy && moy !== DEF.moyoleWa) pairs.push([disp(DEF.moyoleWa), disp(moy)]);
    if (dev && dev !== DEF.devWa) pairs.push([disp(DEF.devWa), disp(dev)]);
    if (pairs.length) applyReplacements(pairs);

    // Brand name in the logo text, split "FIRST <span>rest</span>"
    if (name && name !== DEF.siteName) {
      var parts = name.split(' '), first = parts.shift(), rest = parts.join(' ');
      document.querySelectorAll('.nav-logo, .footer-logo, .sidebar-logo-text').forEach(function (el) {
        el.textContent = '';
        el.appendChild(document.createTextNode(first + (rest ? ' ' : '')));
        if (rest) { var sp = document.createElement('span'); sp.textContent = rest; el.appendChild(sp); }
      });
      document.title = document.title.split(DEF.siteName).join(name);
    }

    // Phone links
    document.querySelectorAll('a[href]').forEach(function (a) {
      var h = a.dataset.pqOrighref || a.getAttribute('href') || '';
      if (moy && h.indexOf('wa.me/' + DEF.moyoleWa) > -1) setAttr(a, 'href', h, h.split(DEF.moyoleWa).join(moy));
      if (dev && h.indexOf('wa.me/' + DEF.devWa) > -1) setAttr(a, 'href', h, h.split(DEF.devWa).join(dev));
      if (dev && h.indexOf('tel:+' + DEF.devWa) > -1) setAttr(a, 'href', h, h.split(DEF.devWa).join(dev));
      if (moy && h.indexOf('tel:+' + DEF.moyoleWa) > -1) setAttr(a, 'href', h, h.split(DEF.moyoleWa).join(moy));
    });
    window.PQHUB_DEV_WA = dev || DEF.devWa;

    // Logo (every image that uses the ATU logo)
    var logo = httpsUrl(S.logo_url);
    if (logo) {
      document.querySelectorAll('img').forEach(function (img) {
        var src = img.dataset.pqOrigsrc || img.getAttribute('src') || '';
        if (src.indexOf('atu-logo') > -1) setAttr(img, 'src', src, logo);
      });
    }

    // Social links appended to every footer social row
    var socials = [['instagram', 'Instagram'], ['twitter', 'X'], ['tiktok', 'TikTok'], ['facebook', 'Facebook'], ['youtube', 'YouTube'], ['linkedin', 'LinkedIn']];
    document.querySelectorAll('.footer-social').forEach(function (box) {
      box.querySelectorAll('[data-pq-social]').forEach(function (x) { x.remove(); });
      socials.forEach(function (s) {
        var u = httpsUrl(S[s[0]]);
        if (!u) return;
        var a = document.createElement('a');
        a.href = u; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.className = 'social-btn';
        a.setAttribute('data-pq-social', '1'); a.setAttribute('aria-label', s[1]);
        a.style.cssText = 'width:auto;padding:0 12px;font-size:.72rem;font-weight:600;font-family:Poppins,sans-serif';
        a.textContent = s[1];
        box.appendChild(a);
      });
    });

    banner(S);
    if (withPopup) popup(S);
  }

  // ---------- announcement banner ----------
  function banner(S) {
    var old = document.getElementById('pqhubBanner'); if (old) old.remove();
    var text = (S.banner_text || '').trim().slice(0, 300);
    if (S.banner_enabled !== 'yes' || !text) return;
    var key = 'pqhubBannerClosed:' + text;
    try { if (sessionStorage.getItem(key)) return; } catch (e) {}
    var bar = document.createElement('div');
    bar.id = 'pqhubBanner';
    bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:8000;background:#14315D;color:#fff;padding:12px 60px 12px 18px;font-family:Poppins,sans-serif;font-size:.84rem;line-height:1.5;text-align:center;border-top:3px solid #D8A727;box-shadow:0 -6px 24px rgba(0,0,0,.2)';
    var span = document.createElement('span'); span.textContent = text; bar.appendChild(span);
    var link = linkUrl(S.banner_link);
    if (link) {
      var a = document.createElement('a'); a.href = link; a.textContent = (S.banner_link_text || 'Learn more').slice(0, 30);
      a.style.cssText = 'color:#D8A727;font-weight:700;margin-left:10px;text-decoration:underline';
      if (/^https:/i.test(link)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      bar.appendChild(a);
    }
    var x = document.createElement('button'); x.type = 'button'; x.setAttribute('aria-label', 'Dismiss'); x.textContent = '✕';
    x.style.cssText = 'position:absolute;right:14px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.15);color:#fff;border:none;width:28px;height:28px;border-radius:50%;cursor:pointer';
    x.onclick = function () { bar.remove(); try { sessionStorage.setItem(key, '1'); } catch (e) {} };
    bar.appendChild(x);
    document.body.appendChild(bar);
  }

  // ---------- welcome pop-up (homepage only) ----------
  var popupDone = false;
  function popup(S) {
    if (popupDone) return;
    var p = location.pathname.split('/').pop();
    if (p !== '' && p !== 'index.html') return;
    if (S.popup_enabled === 'no') return;
    popupDone = true;

    var title = (S.popup_title || ('Welcome to ' + (S.site_name || DEF.siteName))).slice(0, 80);
    var text = (S.popup_text || ('Free past questions for every ATU student, brought to you by ' + (S.rep_name || DEF.repName) + ', ' + (S.rep_title || DEF.repTitle) + '.')).slice(0, 400);
    var img = httpsUrl(S.popup_image) || 'images/Moyole1.jpg';
    var btnText = (S.popup_btn_text || 'Browse Past Questions').slice(0, 30);
    var btnLink = linkUrl(S.popup_btn_link) || 'past-questions.html';
    var freq = S.popup_frequency || 'session';
    var ver = S.popup_version || '0';

    // Frequency control
    try {
      if (freq === 'session' && sessionStorage.getItem('pqhubPopup:' + ver)) return;
      if (freq === 'day') {
        var last = parseInt(localStorage.getItem('pqhubPopupDay:' + ver) || '0', 10);
        if (Date.now() - last < 86400000) return;
      }
      if (freq === 'once' && localStorage.getItem('pqhubPopupOnce:' + ver)) return;
    } catch (e) {}

    var st = document.createElement('style');
    st.textContent = '#pqPopup{position:fixed;inset:0;background:rgba(10,20,40,.7);z-index:9998;display:flex;align-items:center;justify-content:center;padding:20px}.pqp-card{background:#fff;border-radius:20px;max-width:380px;width:100%;max-height:92vh;overflow:auto;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.4);font-family:Poppins,sans-serif;animation:pqpIn .3s ease}@keyframes pqpIn{from{opacity:0;transform:scale(.92) translateY(20px)}to{opacity:1;transform:none}}.pqp-x{position:absolute;top:12px;right:12px;width:32px;height:32px;border-radius:50%;background:rgba(0,0,0,.45);color:#fff;border:none;cursor:pointer;z-index:2}.pqp-img{width:100%;display:block;max-height:420px;object-fit:cover}.pqp-body{padding:20px 24px 24px;text-align:center}.pqp-body h3{margin:0 0 8px;font-size:1.25rem;color:#0A1B36}.pqp-body p{margin:0 0 16px;font-size:.86rem;line-height:1.6;color:#555}.pqp-btn{display:block;background:#14315D;color:#fff;padding:12px;border-radius:10px;font-weight:700;font-size:.9rem;text-decoration:none}.pqp-btn:hover{background:#0A1B36}';
    document.head.appendChild(st);

    var ov = document.createElement('div'); ov.id = 'pqPopup'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
    var card = document.createElement('div'); card.className = 'pqp-card';
    var x = document.createElement('button'); x.className = 'pqp-x'; x.type = 'button'; x.setAttribute('aria-label', 'Close'); x.textContent = '✕';
    var im = document.createElement('img'); im.className = 'pqp-img'; im.alt = ''; im.src = img;
    im.onerror = function () { im.remove(); };
    var body = document.createElement('div'); body.className = 'pqp-body';
    var h = document.createElement('h3'); h.textContent = title;
    var pp = document.createElement('p'); pp.textContent = text;
    body.appendChild(h); body.appendChild(pp);
    if (btnText && btnLink) {
      var b = document.createElement('a'); b.className = 'pqp-btn'; b.href = btnLink; b.textContent = btnText;
      if (/^https:/i.test(btnLink)) { b.target = '_blank'; b.rel = 'noopener noreferrer'; }
      body.appendChild(b);
    }
    card.appendChild(x); card.appendChild(im); card.appendChild(body); ov.appendChild(card);

    function close() { ov.remove(); }
    x.onclick = close;
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    var loader = document.getElementById('page-loader');
    setTimeout(function () {
      document.body.appendChild(ov);
      try {
        sessionStorage.setItem('pqhubPopup:' + ver, '1');
        localStorage.setItem('pqhubPopupDay:' + ver, String(Date.now()));
        localStorage.setItem('pqhubPopupOnce:' + ver, '1');
      } catch (e) {}
    }, loader ? 3000 : 700);
  }

  // ---------- run ----------
  function run() {
    var cached = readCache();
    apply(cached, false);                // instant, avoids flicker
    fetchSettings().then(function (fresh) {
      var use = fresh || cached;
      if (fresh && JSON.stringify(fresh) !== JSON.stringify(cached)) writeCache(fresh);
      apply(use, true);                  // pop-up waits for the latest settings
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
