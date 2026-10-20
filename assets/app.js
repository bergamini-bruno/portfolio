/* =========================================================
   Portfolio — shared behaviour
   ========================================================= */

(function () {
  // UI strings per language
  var LANGS = {
    pt: {
      details: 'Ver detalhes',
      detailsOpen: 'Ocultar detalhes',
      pages: 'Ver páginas',
      pagesOpen: 'Ocultar páginas',
      arch: 'Ver arquitetura',
      archOpen: 'Ocultar arquitetura'
    },
    en: {
      details: 'View details',
      detailsOpen: 'Hide details',
      pages: 'View pages',
      pagesOpen: 'Hide pages',
      arch: 'View architecture',
      archOpen: 'Hide architecture'
    }
  };

  var lang = (document.documentElement.getAttribute('lang') || 'pt').slice(0, 2).toLowerCase();
  var t = LANGS[lang] || LANGS.pt;

  var LABELS = {
    details: { open: t.detailsOpen, closed: t.details },
    pages: { open: t.pagesOpen, closed: t.pages },
    arch: { open: t.archOpen, closed: t.arch }
  };

  var hasHistory = typeof history !== 'undefined' && history.replaceState;

  // Panels: one open at a time
  var panels = {};
  document.querySelectorAll('[data-target]').forEach(function (card) {
    var id = card.getAttribute('data-target');
    var panel = document.getElementById(id);
    if (!panel) return;

    var label = card.querySelector('.card-link');
    var kind = label ? (label.getAttribute('data-label') || 'details') : 'details';
    panels[id] = { panel: panel, card: card, label: label, texts: LABELS[kind] || LABELS.details };
  });

  var activeKey = null;

  function syncHash() {
    if (!hasHistory) return;
    var base = window.location.pathname + window.location.search;
    history.replaceState(null, '', base + (activeKey ? '#' + activeKey : ''));
  }

  function render() {
    Object.keys(panels).forEach(function (key) {
      var p = panels[key];
      var isOpen = key === activeKey;
      p.panel.classList.toggle('open', isOpen);
      p.card.classList.toggle('is-active', isOpen);
      p.card.setAttribute('aria-expanded', String(isOpen));
      if (p.label) {
        p.label.innerHTML = isOpen
          ? p.texts.open + ' <span class="arrow">↑</span>'
          : p.texts.closed + ' <span class="arrow">→</span>';
      }
    });

    // Animate chart bars of visible panels
    document.querySelectorAll('.aero-panel.open .bar-fill').forEach(function (bar) {
      bar.style.width = (bar.dataset.w || 0) + '%';
    });
  }

  function setActive(key, scroll) {
    activeKey = (activeKey === key) ? null : key;
    render();
    syncHash();
    if (activeKey && scroll !== false) {
      var el = panels[activeKey].panel;
      window.setTimeout(function () {
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' });
      }, 60);
    }
  }

  Object.keys(panels).forEach(function (key) {
    var p = panels[key];
    p.card.classList.add('is-clickable');

    p.card.addEventListener('click', function () { setActive(key); });

    p.card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setActive(key);
      }
    });
  });

  document.querySelectorAll('[data-close]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      activeKey = null;
      render();
      syncHash();
    });
  });

  // Links inside cards must not open the panel
  document.querySelectorAll('.card .repo-link a').forEach(function (link) {
    link.addEventListener('click', function (e) { e.stopPropagation(); });
  });

  // Deep link: /#panel-id opens the matching panel on load
  function openFromHash() {
    var id = (window.location.hash || '').replace(/^#/, '');
    if (id && panels[id] && activeKey !== id) {
      activeKey = id;
      render();
      window.setTimeout(function () {
        var el = panels[id].panel;
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: 'auto' });
      }, 80);
    }
  }

  render();
  openFromHash();
  window.addEventListener('hashchange', openFromHash);

  // Images: reveal when loaded (covers cached images)
  function markImage(img) {
    var frame = img.parentElement;
    if (!frame || !frame.classList.contains('figure-frame')) return;
    if (img.complete) {
      frame.classList.add(img.naturalWidth > 0 ? 'has-img' : 'no-img');
    }
  }

  document.querySelectorAll('.figure-frame img').forEach(function (img) {
    img.addEventListener('load', function () { markImage(img); });
    img.addEventListener('error', function () { markImage(img); });
    markImage(img);
  });

  // Scroll reveal
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
})();
