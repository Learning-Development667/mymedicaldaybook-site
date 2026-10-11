/* My Medical Daybook: the website. Plain JavaScript, no build step, nothing tracked. */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* The opening film: plays once over its poster, then rests on its last frame.
     With motion reduced, or where autoplay is refused, the poster stays. */
  var film = document.querySelector('.hero .film');
  var video = film && film.querySelector('video');
  if (video && !reduced) {
    var wide = window.innerWidth >= 1400;
    var src = video.getAttribute('data-src-' + (wide ? '1920' : '1280')) || video.getAttribute('data-src-1280');
    var webm = video.getAttribute('data-webm');
    if (webm && video.canPlayType('video/webm') && !wide) { var s1 = document.createElement('source'); s1.src = webm; s1.type = 'video/webm'; video.appendChild(s1); }
    var s2 = document.createElement('source'); s2.src = src; s2.type = 'video/mp4'; video.appendChild(s2);
    video.addEventListener('playing', function () { film.classList.add('playing'); }, { once: true });
    video.addEventListener('ended', function () { video.pause(); });
    video.load();
    var p = video.play();
    if (p && p.catch) { p.catch(function () { /* autoplay refused: the poster stays */ }); }
  }

  /* Slow zooms on the stills, started as each comes into view. */
  var pics = document.querySelectorAll('.pic[data-kb]');
  if (pics.length && !reduced && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.35 });
    pics.forEach(function (el) { el.style.setProperty('--kb-origin', el.getAttribute('data-kb')); io.observe(el); });
  }

  /* The year in the footer. */
  var y = document.querySelector('[data-year]');
  if (y) { y.textContent = String(new Date().getFullYear()); }
})();
