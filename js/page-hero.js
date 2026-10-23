// ============================================================
//  ATU PQ HUB: PAGE HERO IMAGES
//  Gives each page's hero a campus photo background that slowly
//  zooms. The picture is only used once it has loaded, so a
//  missing file simply leaves the blue gradient in place.
// ============================================================
(function () {
  var MAP = {
    'about.html': 'images/entrance1.jpeg',
    'faculties.html': 'images/Btech1.jpeg',
    'departments.html': 'images/administration1.jpeg',
    'past-questions.html': 'images/learningcenter1.jpeg',
    'mission.html': 'images/auditorium1.jpeg',
    'vision.html': 'images/Btech2.jpeg',
    'help.html': 'images/mediahouse1.jpeg',
    'contact.html': 'images/fashion1.jpeg',
    'privacy.html': 'images/administration1.jpeg',
    'terms.html': 'images/learningcenter1.jpeg',
    'login.html': 'images/auditorium1.jpeg',
    'signup.html': 'images/entrance1.jpeg'
  };
  function run() {
    var page = location.pathname.split('/').pop() || 'index.html';
    var src = MAP[page];
    if (!src) return;
    var targets = document.querySelectorAll('.page-hero, .auth-left');
    if (!targets.length) return;
    var img = new Image();
    img.onload = function () {
      targets.forEach(function (box) {
        if (box.querySelector('.ph-bg')) return;
        var bg = document.createElement('div'); bg.className = 'ph-bg';
        bg.style.backgroundImage = 'url("' + src + '")';
        var ov = document.createElement('div'); ov.className = 'ph-overlay';
        box.insertBefore(ov, box.firstChild);
        box.insertBefore(bg, box.firstChild);
        requestAnimationFrame(function () { bg.classList.add('ready'); });
      });
    };
    img.src = src;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
