/* My Medical Daybook: the website. Plain JavaScript, no build step, nothing tracked. */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var APP = 'https://app.mymedicaldaybook.co.uk/';
  var BRIDGE = 'https://care-log-bridge.markbrown667.workers.dev';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var io = 'IntersectionObserver' in window;

  /* The opening clip, the app's own opener: plays once over its first frame and rests on its last.
     With motion reduced, or where autoplay is refused, the still stays. */
  var hero = $('.hero .film');
  var clip = hero && hero.querySelector('video');
  if (clip && !reduced) {
    clip.addEventListener('playing', function () { hero.classList.add('playing'); }, { once: true });
    var go = function () { var p = clip.play(); if (p && p.catch) { p.catch(function () { /* the still stays */ }); } };
    clip.load();
    go();
  }

  /* The walk film in the story: plays over its poster, loops, pauses out of view. */
  var walkWrap = $('.pic.film-walk');
  var walk = walkWrap && walkWrap.querySelector('video');
  if (walk && !reduced) {
    var wide = window.innerWidth >= 1400;
    var src = walk.getAttribute('data-src-' + (wide ? '1920' : '1280')) || walk.getAttribute('data-src-1280');
    var webm = walk.getAttribute('data-webm');
    if (webm && walk.canPlayType('video/webm') && !wide) { var s1 = document.createElement('source'); s1.src = webm; s1.type = 'video/webm'; walk.appendChild(s1); }
    var s2 = document.createElement('source'); s2.src = src; s2.type = 'video/mp4'; walk.appendChild(s2);
    walk.loop = true;
    walk.addEventListener('playing', function () { walkWrap.classList.add('playing'); }, { once: true });
    var tryWalk = function () { var p = walk.play(); if (p && p.catch) { p.catch(function () {}); } };
    if (io) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { if (!walk.getAttribute('data-loaded')) { walk.setAttribute('data-loaded', '1'); walk.load(); } tryWalk(); } else { walk.pause(); } });
      }, { threshold: 0.25 }).observe(walkWrap);
    } else { walk.load(); tryWalk(); }
    document.addEventListener('visibilitychange', function () { if (document.hidden) { walk.pause(); } else if (walk.getAttribute('data-loaded')) { tryWalk(); } });
  }

  /* Blocks rise in as they arrive. */
  var reveals = $$('.reveal, .pages');
  if (reveals.length && io) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { ro.observe(el); });
  } else { reveals.forEach(function (el) { el.classList.add('in'); }); }

  /* The stills drift a little slower than the page (a gentle parallax), only while on screen. */
  var paras = $$('.pic.parallax');
  if (paras.length && !reduced) {
    var seen = new Set();
    var tick = function () {
      var vh = window.innerHeight;
      paras.forEach(function (el) {
        if (!seen.has(el)) return;
        var r = el.getBoundingClientRect();
        var mid = (r.top + r.height / 2 - vh / 2) / vh; /* -1 above the middle of the screen, 1 below */
        var img = el.querySelector('img');
        if (img) img.style.setProperty('--py', (mid * -7).toFixed(2) + '%');
      });
    };
    var queued = false;
    var onScroll = function () { if (queued) return; queued = true; requestAnimationFrame(function () { queued = false; tick(); }); };
    if (io) {
      var po = new IntersectionObserver(function (entries) { entries.forEach(function (e) { if (e.isIntersecting) seen.add(e.target); else seen.delete(e.target); }); tick(); }, { threshold: 0 });
      paras.forEach(function (el) { po.observe(el); });
    } else { paras.forEach(function (el) { seen.add(el); }); }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    tick();
  }

  /* See it work: the app's own guide, inside a phone. Loads guide/guide.json, plays a topic by itself when it is on
     screen and not under reduced motion, pauses on a tap, steps with the arrows, and never fetches a topic's frames
     until it is chosen. */
  var G = { data: null, topic: null, i: 0, timer: 0, playing: false, visible: false };
  var STEP_MS = 2800;
  var gphone = $('#g-phone');
  if (gphone) {
    var gimg = $('#g-img'), gring = $('#g-ring'), gstep = $('#g-step'), gcap = $('#g-cap'), gintro = $('#g-intro'), glist = $('#g-list'), gchips = $('#g-chips'), gplay = $('#g-play');
    var show = function (i) {
      var t = G.topic; if (!t) return;
      G.i = (i + t.steps.length) % t.steps.length;
      var st = t.steps[G.i];
      gimg.src = 'guide/' + st.file;
      gimg.alt = st.caption;
      var next = t.steps[(G.i + 1) % t.steps.length];
      if (next && next.file !== st.file) { var pre = new Image(); pre.src = 'guide/' + next.file; }
      if (st.tap) { gring.hidden = false; gring.style.left = (st.tap.x * 100) + '%'; gring.style.top = (st.tap.y * 100) + '%'; } else { gring.hidden = true; }
      gstep.textContent = 'Step ' + (G.i + 1) + ' of ' + t.steps.length;
      gcap.textContent = st.caption;
      $$('li', glist).forEach(function (li, k) { li.classList.toggle('is-current', k === G.i); });
    };
    var stop = function () { G.playing = false; clearInterval(G.timer); G.timer = 0; gplay.textContent = 'Play'; gplay.setAttribute('aria-pressed', 'false'); };
    var play = function () {
      G.playing = true; gplay.textContent = 'Pause'; gplay.setAttribute('aria-pressed', 'true');
      clearInterval(G.timer);
      G.timer = setInterval(function () { if (!G.visible || document.hidden) return; show(G.i + 1); }, STEP_MS);
    };
    var openTopic = function (t, auto) {
      G.topic = t; G.i = 0;
      $$('button', gchips).forEach(function (b) {
        var on = b.getAttribute('data-topic') === t.key;
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        /* in the sideways row on a phone, bring the chosen topic into view without moving the page */
        if (on && gchips.scrollWidth > gchips.clientWidth) gchips.scrollTo({ left: Math.max(0, b.offsetLeft - gchips.offsetLeft - 16), behavior: reduced ? 'auto' : 'smooth' });
      });
      gintro.textContent = t.intro || '';
      glist.innerHTML = '';
      t.steps.forEach(function (st, i) { var li = document.createElement('li'); li.textContent = st.caption; li.addEventListener('click', function () { stop(); show(i); }); glist.appendChild(li); });
      show(0);
      if (!reduced && auto !== false) play(); else stop();
    };
    var load = function () {
      return fetch('guide/guide.json?v=21').then(function (r) { if (!r.ok) throw new Error('guide ' + r.status); return r.json(); });
    };
    load().then(function (d) {
      G.data = d;
      gchips.innerHTML = '';
      var order = ['story'].concat(d.topics.map(function (t) { return t.key; }).filter(function (k) { return k !== 'story'; }));
      order.forEach(function (key) {
        var t = d.topics.filter(function (x) { return x.key === key; })[0]; if (!t) return;
        var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.setAttribute('data-topic', t.key); b.setAttribute('aria-pressed', 'false'); b.textContent = t.title;
        b.addEventListener('click', function () { openTopic(t); });
        gchips.appendChild(b);
      });
      var gall = $('#g-all');
      if (gall && window.matchMedia && window.matchMedia('(min-width: 820px)').matches) gall.open = true;
      var first = d.topics.filter(function (x) { return x.key === 'story'; })[0] || d.topics[0];
      openTopic(first, true);
    }).catch(function (e) { gcap.textContent = 'The guide needs a connection. Try again when you have signal.'; gchips.innerHTML = ''; });
    $('#g-prev').addEventListener('click', function () { stop(); show(G.i - 1); });
    $('#g-next').addEventListener('click', function () { stop(); show(G.i + 1); });
    gplay.addEventListener('click', function () { if (G.playing) stop(); else { show(G.i + 1); play(); } });
    gphone.addEventListener('click', function () { if (G.playing) stop(); else play(); });
    if (io) { new IntersectionObserver(function (entries) { entries.forEach(function (e) { G.visible = e.isIntersecting; }); }, { threshold: 0.3 }).observe(gphone); } else { G.visible = true; }
  }

  /* The reports: one set of pages at a time. */
  var rchips = $('#r-chips');
  if (rchips) {
    var sets = $$('.pages[data-report]');
    var rcap = $('#r-cap');
    var pick = function (key) {
      $$('button', rchips).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-report') === key ? 'true' : 'false'); });
      sets.forEach(function (s) {
        var on = s.getAttribute('data-report') === key;
        s.hidden = !on;
        if (on) {
          $$('img[data-src]', s).forEach(function (im) { im.src = im.getAttribute('data-src'); im.removeAttribute('data-src'); });
          s.classList.remove('in'); void s.offsetWidth; requestAnimationFrame(function () { s.classList.add('in'); });
          if (rcap) rcap.textContent = s.getAttribute('data-cap') || '';
        }
      });
    };
    $$('button', rchips).forEach(function (b) { b.addEventListener('click', function () { pick(b.getAttribute('data-report')); }); });
    pick(rchips.getAttribute('data-first') || 'notes');
  }

  /* Join the Beta: the code box. The bridge says whether a code is good and whose it is; only then does the link
     to create an account appear, with the code filled in. Nothing is sent anywhere but the bridge, and only the code. */
  var box = $('#beta-code');
  if (box) {
    var checkBtn = $('#beta-check'), msg = $('#beta-msg'), go = $('#beta-go'), okline = $('#beta-ok'), picks = $$('#beta-go [data-for]');
    var tidy = function (v) { return String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 24); };
    var say = function (text, bad) { msg.textContent = text; msg.classList.toggle('is-bad', !!bad); };
    var check = function () {
      var code = tidy(box.value);
      box.value = code;
      go.hidden = true;
      if (!code) { say('Type the code first.', true); box.focus(); return; }
      say('Checking the code.');
      checkBtn.disabled = true;
      fetch(BRIDGE + '/beta-info?code=' + encodeURIComponent(code)).then(function (r) { return r.json(); }).then(function (d) {
        checkBtn.disabled = false;
        if (d && d.valid) {
          say('');
          okline.textContent = d.label ? 'Your code from ' + d.label + ' is good.' : 'Your code is good.';
          /* what Daybook is for, chosen here: the app saves it and its set-up does not ask again */
          picks.forEach(function (a) { a.href = APP + '?beta=' + encodeURIComponent(code) + '&for=' + a.getAttribute('data-for'); });
          go.hidden = false;
          if (picks[0]) picks[0].focus({ preventScroll: true });
          go.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' });
        } else {
          say((d && d.message) || 'That code is not one we know. Check it with whoever gave it to you.', true);
          box.focus();
        }
      }).catch(function () {
        checkBtn.disabled = false;
        say('Could not check the code just now. Try again in a moment, or email support@mymedicaldaybook.co.uk.', true);
      });
    };
    checkBtn.addEventListener('click', check);
    box.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    box.addEventListener('input', function () { go.hidden = true; say(''); });
    /* a ?beta=CODE link to the site fills the box and checks it */
    try {
      var fromLink = tidy(new URL(location.href).searchParams.get('beta'));
      if (fromLink) { box.value = fromLink; check(); var sec = $('#beta'); if (sec) sec.scrollIntoView({ block: 'start' }); }
    } catch (e) { /* an old browser without URL: the box still works by hand */ }
  }

  /* The year in the footer. */
  $$('[data-year]').forEach(function (y) { y.textContent = String(new Date().getFullYear()); });
})();
