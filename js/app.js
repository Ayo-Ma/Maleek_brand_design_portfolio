(function () {
  'use strict';

  var visibleProjects = PROJECTS.filter(function (p) { return VISIBLE_SLUGS.indexOf(p.slug) !== -1; });

  var state = {
    page: 'home',
    slug: null,
    previewSlug: null,
    autoIdx: 0
  };

  var autoTimer = null;
  var activeCaseSection = 'background';
  var caseObserver = null;

  // ---------- Utilities ----------
  function hexToRgba(hex, alpha) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    var r = parseInt(h.substring(0, 2), 16);
    var g = parseInt(h.substring(2, 4), 16);
    var b = parseInt(h.substring(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  function imgSlot(opts) {
    opts = opts || {};
    var cls = 'img-slot';
    if (opts.bg) cls += ' img-slot-bg';
    if (opts.dark) cls += ' on-dark';
    if (opts.rounded) cls += ' rounded-' + opts.rounded;
    var hint = opts.bg ? '' : '<span class="img-slot-hint">' + (opts.hint || 'Drop an image') + '</span>';
    return '<div class="' + cls + '">' + hint + '</div>';
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------- Routing ----------
  function parseHash() {
    var h = window.location.hash.replace(/^#\/?/, '');
    var parts = h.split('/').filter(Boolean);
    if (parts.length === 0) return { page: 'home', slug: null };
    if (parts[0] === 'case' && parts[1]) return { page: 'case', slug: parts[1] };
    var known = ['home', 'about', 'work', 'services', 'contact'];
    if (known.indexOf(parts[0]) !== -1) return { page: parts[0], slug: null };
    return { page: 'home', slug: null };
  }

  function navigate(page, slug) {
    var hash = page === 'case' ? '#/case/' + slug : '#/' + page;
    if (window.location.hash === hash) {
      render();
    } else {
      window.location.hash = hash;
    }
  }

  window.addEventListener('hashchange', render);

  // ---------- Nav ----------
  document.querySelectorAll('[data-nav]').forEach(function (el) {
    el.addEventListener('click', function () {
      navigate(el.getAttribute('data-nav'));
    });
  });

  function updateNavActive(page) {
    document.querySelectorAll('.nav-link[data-nav]').forEach(function (el) {
      var target = el.getAttribute('data-nav');
      var isActive = target === page || (target === 'work' && page === 'case');
      el.classList.toggle('is-active', isActive);
    });
  }

  // ---------- Page switching ----------
  function showPage(page) {
    document.querySelectorAll('.page').forEach(function (el) {
      el.classList.toggle('active', el.id === 'page-' + page);
    });
    window.scrollTo(0, 0);
  }

  // ---------- Home ----------
  var homeInitialized = false;

  function initHomeStatic() {
    if (homeInitialized) return;
    homeInitialized = true;

    var industriesRow = document.getElementById('industries-row');
    industriesRow.innerHTML = INDUSTRY_LIST.map(function (ind) {
      return '<span>' + escapeHtml(ind) + '</span>';
    }).join('');

    var philosophyGrid = document.getElementById('philosophy-grid');
    philosophyGrid.innerHTML = PHILOSOPHY_LIST.map(function (p) {
      return '<div class="philosophy-card">' +
        '<div class="idx">' + p.indexLabel + '</div>' +
        '<div class="title">' + escapeHtml(p.title) + '</div>' +
        '<div class="desc">' + escapeHtml(p.desc) + '</div>' +
        '</div>';
    }).join('');

    var feedGrid = document.getElementById('feed-grid');
    var feedHtml = '';
    for (var i = 0; i < 8; i++) {
      feedHtml += '<div class="feed-tile">' + imgSlot({ hint: 'Drop a post or flyer' }) + '</div>';
    }
    feedGrid.innerHTML = feedHtml;

    var workList = document.getElementById('home-work-list');
    workList.innerHTML = visibleProjects.map(function (p, i) {
      return '<div class="work-row" data-slug="' + p.slug + '">' +
        '<div class="work-row-left">' +
        '<span class="idx">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span class="swatch" style="background:' + p.accent + '"></span>' +
        '<div><div class="name">' + escapeHtml(p.name) + '</div></div>' +
        '</div>' +
        '<div class="industry">' + escapeHtml(p.industry) + '</div>' +
        '</div>';
    }).join('');

    workList.querySelectorAll('.work-row').forEach(function (row) {
      var slug = row.getAttribute('data-slug');
      row.addEventListener('mouseenter', function () {
        state.previewSlug = slug;
        renderHomePreview();
      });
      row.addEventListener('click', function () {
        navigate('case', slug);
      });
      var tint = PROJECTS.find(function (p) { return p.slug === slug; }).accent + '17';
      row.addEventListener('mouseenter', function () { row.style.background = tint; });
      row.addEventListener('mouseleave', function () { row.style.background = 'transparent'; });
    });

    var workBody = document.getElementById('home-work-body');
    workBody.addEventListener('mouseleave', function () {
      state.previewSlug = null;
      renderHomePreview();
    });

    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(function () {
      if (!state.previewSlug) {
        state.autoIdx = (state.autoIdx + 1) % visibleProjects.length;
        renderHomePreview();
      }
    }, 2800);

    renderHomePreview();
  }

  function renderHomePreview() {
    var project = state.previewSlug
      ? visibleProjects.find(function (p) { return p.slug === state.previewSlug; })
      : visibleProjects[state.autoIdx % visibleProjects.length];
    var idx = visibleProjects.indexOf(project);
    var preview = document.getElementById('home-work-preview');
    preview.innerHTML = '<div class="work-preview-block" style="background:' + project.accent + '">' +
      '<div class="meta">' + String(idx + 1).padStart(2, '0') + ' / ' + escapeHtml(project.industry) + '</div>' +
      '<div><div class="name">' + escapeHtml(project.name) + '</div>' +
      '<div class="tagline">' + escapeHtml(project.tagline) + '</div></div>' +
      '</div>';
    preview.onclick = function () { navigate('case', project.slug); };
  }

  // ---------- Work page ----------
  var workInitialized = false;

  function initWorkPage() {
    if (workInitialized) return;
    workInitialized = true;

    var tilesEl = document.getElementById('work-tiles');
    tilesEl.innerHTML = visibleProjects.map(function (p, i) {
      return '<div class="work-tile" data-slug="' + p.slug + '">' +
        '<div class="work-tile-inner" style="background:' + p.accent + '">' +
        '<div class="work-tile-bg">' + imgSlot({ bg: true }) + '</div>' +
        '<div class="work-tile-tint" style="background:' + p.accent + '"></div>' +
        '<div class="work-tile-panel">' +
        '<div class="work-tile-name">' + escapeHtml(p.name) + '</div>' +
        '</div>' +
        '<div class="work-tile-cursor">View</div>' +
        '<div class="work-tile-caption">' +
        '<div class="meta">' + String(i + 1).padStart(2, '0') + ' — ' + escapeHtml(p.industry) + ' · ' + p.year + '</div>' +
        '<div class="tagline">' + escapeHtml(p.tagline) + '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
    }).join('');

    var comingSoonEl = document.getElementById('work-coming-soon');
    var comingHtml = '';
    for (var n = 1; n <= 3; n++) {
      comingHtml += '<div class="coming-soon">' +
        '<div>' +
        '<div class="meta">' + String(visibleProjects.length + n).padStart(2, '0') + ' — In Progress</div>' +
        '<div class="title">Coming Soon</div>' +
        '<div class="desc">A new case study is currently in progress.</div>' +
        '</div>' +
        '<div class="coming-soon-box"><span>Coming Soon</span></div>' +
        '</div>';
    }
    comingSoonEl.innerHTML = comingHtml;

    tilesEl.querySelectorAll('.work-tile').forEach(function (tile) {
      var slug = tile.getAttribute('data-slug');
      var inner = tile.querySelector('.work-tile-inner');
      var panel = tile.querySelector('.work-tile-panel');
      var cursor = tile.querySelector('.work-tile-cursor');

      tile.addEventListener('click', function () { navigate('case', slug); });

      inner.addEventListener('mousemove', function (e) {
        var rect = inner.getBoundingClientRect();
        var relX = (e.clientX - rect.left) / rect.width - 0.5;
        var relY = (e.clientY - rect.top) / rect.height - 0.5;
        panel.style.transform = 'perspective(900px) rotateY(' + (relX * 14) + 'deg) rotateX(' + (-relY * 14) + 'deg) scale(1.03)';
        cursor.style.left = (e.clientX - rect.left) + 'px';
        cursor.style.top = (e.clientY - rect.top) + 'px';
      });
      inner.addEventListener('mouseenter', function () { cursor.style.opacity = '1'; });
      inner.addEventListener('mouseleave', function () {
        panel.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) scale(1)';
        cursor.style.opacity = '0';
      });
    });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    tilesEl.querySelectorAll('.work-tile').forEach(function (t) { revealObserver.observe(t); });
  }

  // ---------- Case study page ----------
  function renderCase(slug) {
    var project = PROJECTS.find(function (p) { return p.slug === slug; });
    var container = document.getElementById('case-content');
    if (!project) {
      container.innerHTML = '<p>Project not found.</p>';
      return;
    }

    var idx = PROJECTS.indexOf(project);
    var nextProject = PROJECTS[(idx + 1) % PROJECTS.length];

    var hasExtended = !!project.extendedIdentity;
    var isFielo = project.slug === 'fielo';
    var hasLogoImage = !!project.logoImage;

    var html = '';
    html += '<div class="case-meta">' + escapeHtml(project.industry) + ' &nbsp;·&nbsp; ' + project.year + ' &nbsp;·&nbsp; ' + escapeHtml(project.scope) + '</div>';
    html += '<h1>' + escapeHtml(project.name) + '</h1>';
    html += '<p class="case-tagline">' + escapeHtml(project.tagline) + '</p>';

    html += '<div class="case-hero" id="case-hero" style="background:' + project.accent + '">';
    html += '<div class="work-tile-bg">' + imgSlot({ bg: true }) + '</div>';
    html += '<div class="case-hero-tint" style="background:' + project.accent + '"></div>';
    if (hasLogoImage) {
      html += '<img class="case-hero-logo" id="case-hero-visual" src="' + project.logoImage + '" alt="' + escapeHtml(project.name) + ' logo">';
    } else {
      html += '<div class="case-hero-name" id="case-hero-visual">' + escapeHtml(project.name) + '</div>';
    }
    html += '</div>';

    html += '<div class="case-body">';
    html += '<div class="case-nav" id="case-nav">' + SECTION_NAMES.map(function (n) {
      var label = n.charAt(0).toUpperCase() + n.slice(1);
      return '<button data-section="' + n + '">' + label + '</button>';
    }).join('') + '</div>';

    html += '<div class="case-content">';

    ['background', 'challenge', 'research', 'strategy'].forEach(function (key) {
      html += '<div class="case-section" data-section="' + key + '">' +
        '<div class="label">' + key.charAt(0).toUpperCase() + key.slice(1) + '</div>' +
        '<div class="text">' + escapeHtml(project[key]) + '</div>' +
        '</div>';
    });

    // Identity block
    html += '<div class="case-block" data-section="identity">';
    html += '<h2>Identity</h2>';
    html += '<p class="desc">' + escapeHtml(project.identityDesc) + '</p>';
    html += '<div class="identity-lockup">';
    if (hasLogoImage) {
      html += '<img src="' + project.logoImage + '" alt="' + escapeHtml(project.name) + ' logo">';
    } else {
      html += '<div class="identity-lockup-fallback"><div class="name">' + escapeHtml(project.name) + '</div>' +
        '<span class="dot" style="background:' + project.accent + '"></span></div>';
    }
    html += '</div>';
    html += '<div class="palette-row">' + project.palette.map(function (hex) {
      return '<div class="swatch" style="background:' + hex + '"><span class="hex-tip">' + hex + '</span></div>';
    }).join('') + '</div>';

    if (hasExtended) {
      var ext = project.extendedIdentity;
      html += '<div class="extended-identity">';
      html += '<div class="mini-label">Logo</div>';
      html += '<p class="body-copy">' + escapeHtml(ext.logoDesc) + '</p>';
      html += '<div class="logo-panels">' +
        '<div class="logo-panel-light">' + (hasLogoImage ? '<img src="' + project.logoImage + '" alt="">' : '<div class="identity-lockup-fallback"><div class="name">' + escapeHtml(project.name) + '</div></div>') + '</div>' +
        '<div class="logo-panel-dark">' + (project.logomarkImage ? '<img src="' + project.logomarkImage + '" alt="">' : '') + '</div>' +
        '</div>';

      html += '<div class="mini-label mb-20">Color Palette</div>';
      html += '<div class="color-grid">' + ext.palette.map(function (c) {
        return '<div class="color-card"><div class="swatch-fill" style="background:' + c.hex + '"></div>' +
          '<div class="swatch-info"><div class="name">' + escapeHtml(c.name) + '</div><div class="hex">' + c.hex + ' · ' + escapeHtml(c.meaning) + '</div></div></div>';
      }).join('') + '</div>';

      html += '<div class="mini-label">Typography</div>';
      html += '<p class="body-copy mb-56">' + escapeHtml(ext.typography) + '</p>';

      if (project.semanticColors) {
        html += '<div class="mini-label mb-20">Semantic Colors</div>';
        html += '<div class="color-grid">' + project.semanticColors.map(function (c) {
          return '<div class="color-card semantic"><div class="swatch-fill" style="background:' + c.hex + '"></div>' +
            '<div class="swatch-info"><div class="name">' + escapeHtml(c.name) + '</div><div class="hex">' + c.hex + ' · ' + escapeHtml(c.meaning) + '</div></div></div>';
        }).join('') + '</div>';
      }

      html += '<div class="mini-label">Graphic System</div>';
      html += '<p class="body-copy mb-56">' + escapeHtml(ext.graphicSystem) + '</p>';

      html += '<div class="mini-label">Photography</div>';
      html += '<p class="body-copy">' + escapeHtml(ext.photography) + '</p>';
      html += '<div class="photo-grid">' +
        '<div class="tile">' + imgSlot({ hint: 'Fleet / drivers' }) + '</div>' +
        '<div class="tile">' + imgSlot({ hint: 'Warehouse' }) + '</div>' +
        '<div class="tile">' + imgSlot({ hint: 'Operations' }) + '</div>' +
        '</div>';

      html += '<div class="mini-label">Tone of Voice</div>';
      html += '<p class="tone-quote">' + escapeHtml(ext.toneOfVoice) + '</p>';
      html += '</div>'; // extended-identity
    }
    html += '</div>'; // identity block

    // Applications block
    html += '<div class="case-block" data-section="applications">';
    html += '<h2>Applications</h2>';

    if (isFielo) {
      html += '<div class="fielo-apps-grid">';
      html += '<div class="fielo-app-card" data-lightbox="fielo-app-bg-businesscard" style="background:#123B63">' +
        '<div class="bg">' + imgSlot({ bg: true }) + '</div>' +
        '<div class="tint" style="background:#123B6399"></div>' +
        '<div class="content">' +
        (project.logomarkImage ? '<img class="mark" src="' + project.logomarkImage + '" alt="">' : '') +
        '<div><div class="card-name">Ada Chen</div><div class="card-role">Fleet Operations Lead — fielo.com</div></div>' +
        '</div>' +
        '<div class="label-tag" style="bottom:-12px;right:-12px;opacity:0.15;">Business Card</div>' +
        '</div>';
      html += '<div class="fielo-app-card" data-lightbox="fielo-app-bg-livery" style="background:#2B6CB0">' +
        '<div class="bg">' + imgSlot({ bg: true }) + '</div>' +
        '<div class="tint" style="background:#2B6CB099"></div>' +
        '<div class="content center">' +
        (hasLogoImage ? '<img src="' + project.logoImage + '" style="width:55%;height:44px;object-fit:contain;filter:brightness(0) invert(1);position:relative;z-index:2;" alt="">' : '') +
        '</div>' +
        '<div class="label-tag" style="bottom:16px;left:32px;opacity:0.7;">Vehicle Livery</div>' +
        '</div>';
      html += '<div class="fielo-app-card" data-lightbox="fielo-app-bg-dashboard" style="background:#F7F5F2;border:1px solid #E8E8E5;">' +
        '<div class="bg">' + imgSlot({ bg: true }) + '</div>' +
        '<div class="tint" style="background:#F7F5F2CC;opacity:0.57;"></div>' +
        '</div>';
      html += '<div class="fielo-app-card" data-lightbox="fielo-app-bg-pitchdeck" style="background:#111111">' +
        '<div class="bg">' + imgSlot({ bg: true }) + '</div>' +
        '<div class="tint" style="background:#111111AA;opacity:0.66;"></div>' +
        '<div class="content">' +
        (project.logomarkImage ? '<img class="mark" src="' + project.logomarkImage + '" alt="">' : '') +
        '<div class="pitch-copy">Built for the operator, not the analyst.</div>' +
        '</div>' +
        '<div class="label-tag" style="bottom:16px;right:20px;opacity:0.5;">Pitch Deck</div>' +
        '</div>';
      html += '</div>';
    }

    html += '<div class="apps-grid">' + project.applications.map(function (label, i) {
      return '<div class="app-tile" data-lightbox="' + project.slug + '-app-' + i + '" style="background:' + hexToRgba(project.accent, 0.08) + ';border:1px solid ' + hexToRgba(project.accent, 0.2) + ';">' +
        '<div class="bg">' + imgSlot({ bg: true }) + '</div>' +
        '<div class="app-label">' + escapeHtml(label) + '</div>' +
        '</div>';
    }).join('') + '</div>';
    html += '</div>'; // applications block

    // Outcome
    html += '<div class="case-block" data-section="outcome">';
    html += '<h2>Outcome</h2>';
    html += '<div class="outcome-card"><p>' + escapeHtml(project.outcome) + '</p>';
    html += '<div class="outcome-impact">' + project.impact.map(function (point) {
      return '<span>' + escapeHtml(point) + '</span>';
    }).join('') + '</div></div>';
    html += '</div>';

    // Lessons
    html += '<div class="case-block" data-section="lessons">';
    html += '<h2>Lessons</h2>';
    html += '<p style="font-size:17px;line-height:1.6;max-width:60ch;margin:0;">' + escapeHtml(project.lessons) + '</p>';
    html += '</div>';

    html += '<div class="case-next" id="case-next">' +
      '<div><div class="label">Next case study</div><div class="name">' + escapeHtml(nextProject.name) + '</div></div>' +
      '<div class="arrow">→</div>' +
      '</div>';

    html += '</div>'; // case-content
    html += '</div>'; // case-body

    container.innerHTML = html;

    // Wire up interactions
    document.getElementById('case-next').addEventListener('click', function () {
      navigate('case', nextProject.slug);
    });

    var caseNav = document.getElementById('case-nav');
    caseNav.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = container.querySelector('.case-section[data-section="' + btn.getAttribute('data-section') + '"], .case-block[data-section="' + btn.getAttribute('data-section') + '"]');
        if (target) {
          var top = target.getBoundingClientRect().top + window.scrollY - 110;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });

    container.querySelectorAll('[data-lightbox]').forEach(function (el) {
      el.addEventListener('click', function () { openLightbox(); });
    });

    // Hero parallax
    var heroEl = document.getElementById('case-hero');
    var heroVisual = document.getElementById('case-hero-visual');
    heroEl.addEventListener('mousemove', function (e) {
      var rect = heroEl.getBoundingClientRect();
      var relX = (e.clientX - rect.left) / rect.width - 0.5;
      var relY = (e.clientY - rect.top) / rect.height - 0.5;
      heroVisual.style.transform = 'translate(' + (relX * 18) + 'px, ' + (relY * 18) + 'px)';
    });
    heroEl.addEventListener('mouseleave', function () {
      heroVisual.style.transform = 'translate(0px, 0px)';
    });

    // Scrollspy + reveal
    if (caseObserver) caseObserver.disconnect();
    activeCaseSection = 'background';
    caseObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var name = entry.target.getAttribute('data-section');
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          activeCaseSection = name;
          updateCaseNavActive();
        }
      });
    }, { rootMargin: '-15% 0px -55% 0px', threshold: 0 });

    container.querySelectorAll('[data-section]').forEach(function (el) {
      if (el.classList.contains('case-section') || el.classList.contains('case-block')) {
        caseObserver.observe(el);
      }
    });
    updateCaseNavActive();

    // App tile reveal
    var appTileObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          appTileObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    container.querySelectorAll('.app-tile').forEach(function (t) { appTileObserver.observe(t); });
  }

  function updateCaseNavActive() {
    var caseNav = document.getElementById('case-nav');
    if (!caseNav) return;
    caseNav.querySelectorAll('button').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-section') === activeCaseSection);
    });
  }

  // ---------- Lightbox ----------
  var lightbox = document.getElementById('lightbox');
  var lightboxClose = document.getElementById('lightbox-close');

  function openLightbox() { lightbox.classList.add('open'); }
  function closeLightbox() { lightbox.classList.remove('open'); }

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  lightboxClose.addEventListener('click', closeLightbox);

  // ---------- Render dispatch ----------
  function render() {
    var route = parseHash();
    state.page = route.page;
    state.slug = route.slug;

    updateNavActive(route.page);
    showPage(route.page);

    if (route.page === 'home') initHomeStatic();
    if (route.page === 'work') initWorkPage();
    if (route.page === 'case') renderCase(route.slug);
  }

  render();
})();
