/* Jinseong Han — personal site. Vanilla JS, no dependencies. */
(function () {
  'use strict';

  var root = document.documentElement;
  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };
  var hasIO = 'IntersectionObserver' in window;

  /* ---------- Theme toggle ---------- */
  var themeBtn = $('#theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  /* ---------- Nav: hairline once scrolled + scroll-spy ---------- */
  var nav = $('#nav');
  var onScroll = function () { nav.classList.toggle('is-stuck', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var links = $$('.nav__links a');
  if (hasIO) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) {
      var sec = $(a.getAttribute('href'));
      if (sec) spy.observe(sec);
    });
    // Clear the active pill when back in the hero
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) links.forEach(function (a) { a.classList.remove('is-active'); });
    }, { rootMargin: '-45% 0px -50% 0px' }).observe($('#top'));
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = $$('.reveal');
  if (hasIO) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); ro.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { ro.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Research dialogs (deep-linkable: #r-parametric …) ---------- */
  var modals = $$('dialog.modal');
  var canModal = modals.length && typeof modals[0].showModal === 'function';
  var pushed = false;

  function openModal(id, push) {
    var d = document.getElementById(id);
    if (!d || !canModal || d.open) return;
    modals.forEach(function (m) { if (m.open) m.close(); });
    d.showModal();
    $('.modal__body', d).scrollTop = 0;
    root.classList.add('is-locked');
    if (push) { history.pushState({ modal: id }, '', '#' + id); pushed = true; }
  }

  if (canModal) {
    $$('[data-modal]').forEach(function (a) {
      a.addEventListener('click', function (ev) {
        if (ev.metaKey || ev.ctrlKey || ev.shiftKey) return;
        ev.preventDefault();
        openModal(a.dataset.modal, true);
      });
    });

    modals.forEach(function (d) {
      // click on the backdrop closes
      d.addEventListener('click', function (ev) {
        if (ev.target !== d) return;
        var r = d.getBoundingClientRect();
        var inside = ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
        if (!inside) d.close();
      });
      d.addEventListener('close', function () {
        if (modals.some(function (m) { return m.open; })) return;
        root.classList.remove('is-locked');
        if (location.hash === '#' + d.id) {
          if (pushed) { pushed = false; history.back(); }
          else history.replaceState(null, '', '#research');
        }
      });
    });

    var syncFromHash = function () {
      var id = location.hash.slice(1);
      var target = id && document.getElementById(id);
      if (target && target.matches('dialog.modal')) { openModal(id, false); return; }
      pushed = false;
      modals.forEach(function (m) { if (m.open) m.close(); });
    };
    window.addEventListener('popstate', syncFromHash);
    if (location.hash.indexOf('#r-') === 0) {
      var sec = $('#research');
      if (sec) sec.scrollIntoView();
      syncFromHash();
    }
  }

  /* ---------- Publications: collapse the long list ---------- */
  var list = $('#publist-domestic');
  var more = $('#pub-more');
  if (list && more) {
    var total = list.children.length;
    list.classList.add('is-collapsed');
    more.hidden = false;
    more.addEventListener('click', function () {
      var open = more.getAttribute('aria-expanded') === 'true';
      list.classList.toggle('is-collapsed', open);
      more.setAttribute('aria-expanded', String(!open));
      more.firstChild.textContent = open ? 'Show all ' + total + ' ' : 'Show fewer ';
    });
  }

  /* ---------- Live demo: lazy iframe, scaled to a 1280×760 desktop viewport ---------- */
  var frame = $('#demo-frame');
  if (frame) {
    var VW = 1280;
    var view = $('.browser__view', frame);
    var shield = $('.browser__shield', frame);
    var iframe = null;
    var scale = function () { return view.clientWidth / VW; };

    // The console remembers its language in localStorage ('motorai-lang', default KO). When this page is served
    // from the same origin as the demo, first-time visitors coming from this English page get the EN console.
    try {
      if (new URL(frame.dataset.src).origin === location.origin && !localStorage.getItem('motorai-lang')) {
        localStorage.setItem('motorai-lang', 'en');
      }
    } catch (e) {}

    var hint = $('span', shield);
    var hintIcon = hint.innerHTML.slice(0, hint.innerHTML.indexOf('</svg>') + 6);
    var fit = function () {
      view.style.setProperty('--s', scale().toFixed(4));
      // Too small to use in place (phones): the shield opens the full demo instead.
      hint.innerHTML = hintIcon + (scale() < 0.6 ? ' Tap to open the demo' : ' Click to interact');
    };
    fit();
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(view);
    else window.addEventListener('resize', fit);

    var load = function () {
      if (iframe) return;
      iframe = document.createElement('iframe');
      iframe.src = frame.dataset.src;
      iframe.title = 'MotorAI — live demo of the multi-agent IPMSM design optimization console';
      iframe.setAttribute('tabindex', '-1');
      iframe.addEventListener('load', function () { frame.classList.add('is-loaded'); });
      view.insertBefore(iframe, view.firstChild);
    };
    if (hasIO) {
      var dio = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) { dio.disconnect(); load(); }
      }, { rootMargin: '500px 0px' });
      dio.observe(frame);
    } else {
      load();
    }

    // Click to interact; the frame locks again when the pointer leaves, so page scrolling is never trapped.
    shield.addEventListener('click', function () {
      if (scale() < 0.6 || !iframe) { window.open(frame.dataset.src, '_blank', 'noopener'); return; }
      frame.classList.add('is-live');
      iframe.removeAttribute('tabindex');
      iframe.focus();
    });
    view.addEventListener('mouseleave', function () {
      if (!frame.classList.contains('is-live')) return;
      frame.classList.remove('is-live');
      iframe.setAttribute('tabindex', '-1');
    });
  }
})();
