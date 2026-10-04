/* localhost studio — portfolio
   - no video playback on site; every card redirects to the host platform
   - filters + reveal on scroll
   - background music autoplays on arrival (with gesture fallback) */
(function () {
  'use strict';

  var grid = document.getElementById('grid');
  var filtersEl = document.getElementById('filters');
  var countEl = document.getElementById('count');
  var emptyEl = document.getElementById('empty');
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var ALL = [], VISIBLE = [], activeFilter = 'All';
  var CAT_ORDER = ['Film Festival', 'Film', 'Launch Video', 'Feature Launch', 'Event Video', 'Founder Update', 'Reel'];

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function platformOf(href) {
    if (!href || href === '#') return '';
    if (/:\/\/(www\.)?(x|twitter)\.com\//.test(href)) return 'X';
    if (/instagram\.com/.test(href)) return 'Instagram';
    if (/linkedin\.com/.test(href)) return 'LinkedIn';
    if (/youtu\.?be/.test(href)) return 'YouTube';
    if (/vimeo\.com/.test(href)) return 'Vimeo';
    if (/tiktok\.com/.test(href)) return 'TikTok';
    try { return new URL(href).hostname.replace(/^www\./, ''); } catch (e) { return 'link'; }
  }

  function makeCard(item) {
    var href = (item.href && item.href !== '#') ? item.href : null;
    var card = el(href ? 'a' : 'article', 'card');
    if (href) {
      card.href = href;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
    } else {
      card.setAttribute('aria-disabled', 'true');
    }

    var media = el('div', 'card__media');
    if (item.mode === 'logo') {
      media.classList.add('card__media--logo');
      media.classList.add(item.tile === 'dark' ? 'is-dark' : 'is-light');
      var slot = el('div', 'logo');
      if (item.logo) {
        var lg = new Image();
        lg.loading = 'lazy';
        lg.decoding = 'async';
        lg.src = item.logo;
        lg.alt = (item.brand || item.title) + ' logo';
        slot.appendChild(lg);
      } else {
        slot.appendChild(el('span', 'logo__word', item.brand || item.title));
      }
      media.appendChild(slot);
    } else {
      var img = new Image();
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = item.img;
      img.alt = item.title;
      media.appendChild(img);
    }

    /* hover preview: a muted, looping snippet of the real cut.
       pointer-events off so the click still goes to the host platform */
    if (item.preview) {
      var vid = document.createElement('video');
      vid.className = 'card__preview';
      vid.muted = true;
      vid.defaultMuted = true;
      vid.loop = true;
      vid.playsInline = true;
      vid.setAttribute('muted', '');
      vid.setAttribute('playsinline', '');
      vid.preload = 'none';
      vid.dataset.src = item.preview;
      vid.setAttribute('aria-hidden', 'true');
      media.appendChild(vid);
      attachPreview(card, vid);
    }
    if (item.category === 'Film Festival') media.appendChild(el('span', 'card__badge', 'festival'));
    if (href) media.appendChild(el('span', 'card__ext', '\u2197'));
    card.appendChild(media);

    var body = el('div', 'card__body');
    body.appendChild(el('h3', 'card__title', item.title));
    if (item.desc) body.appendChild(el('p', 'card__desc', item.desc));

    var meta = el('div', 'card__meta');
    meta.appendChild(el('span', null, item.category || 'Work'));
    var plat = platformOf(item.href);
    if (plat) {
      meta.appendChild(el('span', 'card__dot'));
      meta.appendChild(el('span', null, 'Watch on ' + plat));
    }
    if (item.views) {
      meta.appendChild(el('span', 'card__dot'));
      meta.appendChild(el('span', 'card__views', item.views));
    }
    var firstTag = (item.tags || [])[0];
    if (firstTag) meta.appendChild(el('span', 'card__tag', firstTag));
    body.appendChild(meta);

    card.appendChild(body);
    return card;
  }

  function attachPreview(card, vid) {
    var timer = null;

    function load() {
      if (!vid.src) { vid.src = vid.dataset.src; vid.load(); }
    }
    function start() {
      clearTimeout(timer);
      timer = setTimeout(function () {
        load();
        card.classList.add('is-previewing');
        vid.muted = true;
        var pr = vid.play();
        if (pr && pr.catch) pr.catch(function () {});
      }, 90);
    }
    function stop() {
      clearTimeout(timer);
      card.classList.remove('is-previewing');
      try { vid.pause(); vid.currentTime = 0; } catch (e) {}
    }

    card.addEventListener('mouseenter', start);
    card.addEventListener('mouseleave', stop);
    card.addEventListener('focus', start);
    card.addEventListener('blur', stop);
    card.addEventListener('touchstart', function () { load(); }, { passive: true });

    /* touch: play the snippet in view instead of on hover */
    if ('IntersectionObserver' in window && window.matchMedia('(hover:none)').matches) {
      var tio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.intersectionRatio > 0.6) {
            load();
            card.classList.add('is-previewing');
            var pr = vid.play(); if (pr && pr.catch) pr.catch(function () {});
          } else { stop(); }
        });
      }, { threshold: [0, 0.6] });
      tio.observe(card);
    }
  }

  var io = ('IntersectionObserver' in window)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
        });
      }, { rootMargin: '120px' })
    : null;

  function render() {
    grid.innerHTML = '';
    VISIBLE = ALL.filter(function (i) {
      return activeFilter === 'All' || i.category === activeFilter;
    });
    VISIBLE.forEach(function (item) {
      var card = makeCard(item);
      grid.appendChild(card);
      if (io) io.observe(card); else card.classList.add('is-in');
    });
    countEl.textContent = String(VISIBLE.length).padStart(2, '0') + ' / ' +
      String(ALL.length).padStart(2, '0') + ' projects';
    emptyEl.hidden = VISIBLE.length !== 0;
  }

  function buildFilters() {
    var set = {};
    ALL.forEach(function (i) { set[i.category] = (set[i.category] || 0) + 1; });
    var cats = Object.keys(set).sort(function (a, b) {
      var ai = CAT_ORDER.indexOf(a), bi = CAT_ORDER.indexOf(b);
      return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
    });
    ['All'].concat(cats).forEach(function (c) {
      var b = el('button', 'chip', c === 'All' ? 'All work' : c);
      b.type = 'button';
      b.setAttribute('aria-pressed', String(c === activeFilter));
      b.addEventListener('click', function () {
        activeFilter = c;
        [].forEach.call(filtersEl.children, function (n) { n.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        render();
      });
      filtersEl.appendChild(b);
    });
  }

  function animateStats() {
    document.querySelectorAll('.stats strong').forEach(function (n) {
      var target = parseFloat(n.dataset.count) || 0, cur = 0;
      var step = Math.max(1, Math.round(target / 34));
      var id = setInterval(function () {
        cur += step;
        if (cur >= target) { cur = target; clearInterval(id); }
        n.textContent = cur;
      }, 28);
    });
  }

  /* ---------- background music: on by default ---------- */
  var audio = document.getElementById('bgAudio');
  var toggle = document.getElementById('soundToggle');
  var BASE_VOL = 0.3;
  var fadeReq = null;

  function setToggleState(on) {
    if (!toggle) return;
    toggle.setAttribute('aria-pressed', String(on));
    var lbl = toggle.querySelector('.sound__label');
    if (lbl) lbl.textContent = on ? 'sound on' : 'sound off';
    toggle.classList.toggle('is-on', on);
  }

  function fadeTo(target, ms) {
    if (!audio) return;
    if (fadeReq) cancelAnimationFrame(fadeReq);
    var from = audio.volume, t0 = performance.now();
    (function tick(now) {
      var k = Math.min(1, (now - t0) / (ms || 1200));
      audio.volume = Math.max(0, Math.min(1, from + (target - from) * k));
      if (k < 1) fadeReq = requestAnimationFrame(tick);
    })(t0);
  }

  var ARM_EVENTS = ['pointerdown', 'pointermove', 'mousemove', 'keydown', 'scroll', 'wheel', 'touchstart', 'click'];
  function armAll(on) {
    ARM_EVENTS.forEach(function (t) {
      if (on) window.addEventListener(t, armOnce, { passive: true });
      else window.removeEventListener(t, armOnce, { passive: true });
    });
  }

  function startAudio() {
    if (!audio) return Promise.reject();
    audio.volume = 0;
    audio.muted = false;
    var pr = audio.play();
    if (!pr || !pr.then) { setToggleState(true); fadeTo(BASE_VOL, 1400); return Promise.resolve(); }
    return pr.then(function () {
      audio.muted = false;
      setToggleState(true);
      fadeTo(BASE_VOL, 1400);
      armAll(false);
    });
  }

  /* keeps the track rolling silently so the moment a visitor moves, breathes
     on the page or scrolls, the music is already in position and just fades up */
  function primeSilent() {
    if (!audio) return;
    audio.muted = true;
    audio.volume = 0;
    try { audio.play(); } catch (e) {}
  }

  function stopAudio() {
    if (!audio) return;
    fadeTo(0, 260);
    setTimeout(function () { try { audio.pause(); } catch (e) {} }, 280);
    setToggleState(false);
    audio.dataset.userOff = '1';
  }

  function armOnce() {
    if (!audio) return;
    if (audio.dataset.userOff === '1') return;
    if (!audio.paused && !audio.muted && audio.volume > 0) { armAll(false); return; }
    startAudio().catch(function () {});
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      if (audio.paused || audio.muted || audio.volume === 0) {
        audio.dataset.userOff = '';
        startAudio().catch(function () {});
      } else {
        stopAudio();
      }
    });
  }

  if (audio) {
    // try for real audio immediately
    startAudio().catch(function () {
      // blocked by autoplay policy: keep the track running muted and in position,
      // then unmute on the very first sign of life from the visitor
      primeSilent();
      setToggleState(false);
      armAll(true);
    });
    // pause while the tab is hidden, resume when it comes back
    document.addEventListener('visibilitychange', function () {
      if (!audio) return;
      if (document.hidden) { if (!audio.paused) { audio.pause(); audio.dataset.wasOn = '1'; } }
      else if (audio.dataset.wasOn === '1') { audio.dataset.wasOn = ''; startAudio().catch(function () {}); }
    });
  }

  function boot(data) {
    ALL = data;
    buildFilters();
    render();
    animateStats();
  }

  fetch('data/projects.json')
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(boot)
    .catch(function () {
      if (window.PROJECTS) { boot(window.PROJECTS); return; }
      grid.innerHTML = '<p class="empty">could not load projects data.</p>';
    });
})();
