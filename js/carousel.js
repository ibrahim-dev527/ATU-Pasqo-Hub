// ============================================================
//  ATU PQ HUB — SHARED IMAGE CAROUSEL LOGIC
//  Works on every .pqhub-carousel element on the page (usually
//  just one). Auto-advances every 4.5s, pauses on hover, and
//  supports the prev/next arrows + dot clicks.
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.pqhub-carousel').forEach(function(carousel) {
    const track = carousel.querySelector('.pqhub-carousel-track');
    const slides = carousel.querySelectorAll('.pqhub-carousel-slide');
    const dotsWrap = carousel.querySelector('.pqhub-carousel-dots');
    if (!track || !slides.length) return;

    let index = 0;
    let timer = null;

    // Build dots
    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      slides.forEach(function(_, i) {
        const dot = document.createElement('div');
        dot.className = 'pqhub-carousel-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', function() { goTo(i); });
        dotsWrap.appendChild(dot);
      });
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      if (dotsWrap) {
        dotsWrap.querySelectorAll('.pqhub-carousel-dot').forEach(function(d, di) {
          d.classList.toggle('active', di === index);
        });
      }
    }

    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    const nextBtn = carousel.querySelector('.pqhub-carousel-arrow.next');
    const prevBtn = carousel.querySelector('.pqhub-carousel-arrow.prev');
    if (nextBtn) nextBtn.addEventListener('click', function() { next(); resetTimer(); });
    if (prevBtn) prevBtn.addEventListener('click', function() { prev(); resetTimer(); });

    function startTimer() { timer = setInterval(next, 4500); }
    function resetTimer() { clearInterval(timer); startTimer(); }

    carousel.addEventListener('mouseenter', function() { clearInterval(timer); });
    carousel.addEventListener('mouseleave', startTimer);

    startTimer();
  });
});
