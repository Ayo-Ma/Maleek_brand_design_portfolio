// Fetches page content from Sanity (https://www.sanity.io) at runtime, over plain HTTP —
// no SDK, no build step, so this drops straight into the static site.
//
// If the fetch fails (offline, CORS not yet allow-listed in sanity.io/manage, or the
// dataset is still empty) every value quietly falls back to the seed content in
// js/data.js, so the site never breaks while content is being set up.
(function () {
  'use strict';

  var SANITY_PROJECT_ID = 'ulfzngs6';
  var SANITY_DATASET = 'production';
  var SANITY_API_VERSION = 'v2024-01-01';

  var QUERY = '{' +
    '"settings": *[_type == "siteSettings"][0],' +
    '"projects": *[_type == "project"] | order(order asc)' +
    '}';

  function queryUrl() {
    return 'https://' + SANITY_PROJECT_ID + '.api.sanity.io/' + SANITY_API_VERSION +
      '/data/query/' + SANITY_DATASET + '?query=' + encodeURIComponent(QUERY);
  }

  // Sanity image asset refs look like "image-<id>-<width>x<height>-<format>".
  // This is Sanity's documented, stable URL scheme — no SDK required to build it.
  function imageUrl(imageField, opts) {
    if (!imageField || !imageField.asset || !imageField.asset._ref) return null;
    var ref = imageField.asset._ref;
    var parts = ref.split('-');
    if (parts.length < 4 || parts[0] !== 'image') return null;
    var id = parts[1];
    var dimensions = parts[2];
    var format = parts[3];
    var url = 'https://cdn.sanity.io/images/' + SANITY_PROJECT_ID + '/' + SANITY_DATASET + '/' + id + '-' + dimensions + '.' + format;
    var params = ['auto=format'];
    if (opts) {
      if (opts.w) params.push('w=' + opts.w);
      if (opts.h) params.push('h=' + opts.h);
      if (opts.fit) params.push('fit=' + opts.fit);
      if (opts.q) params.push('q=' + opts.q);
    }
    return url + '?' + params.join('&');
  }

  function pick(value, fallback) {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string' && value.trim() === '') return fallback;
    if (Array.isArray(value) && value.length === 0) return fallback;
    return value;
  }

  function mergeSettings(remote) {
    var seed = SITE_SETTINGS;
    remote = remote || {};
    var merged = {};
    Object.keys(seed).forEach(function (key) {
      merged[key] = pick(remote[key], seed[key]);
    });
    merged.homePortraitUrl = imageUrl(remote.homePortrait, { w: 1200 });
    merged.aboutPortraitUrl = imageUrl(remote.aboutPortrait, { w: 1200 });
    merged.feedImageUrls = (remote.feedImages || []).map(function (img) { return imageUrl(img, { w: 800 }); }).filter(Boolean);
    merged.servicesList = (merged.servicesList || []).map(function (item) {
      return Object.assign({}, item, { imageUrl: imageUrl(item.image, { w: 300 }) || null });
    });
    return merged;
  }

  function mergeProject(seed, remote) {
    var p = Object.assign({}, seed, remote ? {
      name: pick(remote.name, seed && seed.name),
      slug: pick(remote.slug && remote.slug.current, seed && seed.slug),
      industry: pick(remote.industry, seed && seed.industry),
      year: pick(remote.year, seed && seed.year),
      scope: pick(remote.scope, seed && seed.scope),
      tagline: pick(remote.tagline, seed && seed.tagline),
      accent: pick(remote.accent, seed && seed.accent),
      palette: pick(remote.palette, seed && seed.palette),
      background: pick(remote.background, seed && seed.background),
      challenge: pick(remote.challenge, seed && seed.challenge),
      research: pick(remote.research, seed && seed.research),
      strategy: pick(remote.strategy, seed && seed.strategy),
      identityDesc: pick(remote.identityDesc, seed && seed.identityDesc),
      outcome: pick(remote.outcome, seed && seed.outcome),
      impact: pick(remote.impact, seed && seed.impact),
      lessons: pick(remote.lessons, seed && seed.lessons),
      visibleOnWork: remote.visibleOnWork === true,
      extendedIdentity: remote.extendedIdentity || (seed && seed.extendedIdentity) || null,
      semanticColors: pick(remote.semanticColors, seed && seed.semanticColors),
      applications: remote.applications ? remote.applications.map(function (a) { return a.label; }) : (seed && seed.applications) || []
    } : {});

    p.logoImage = imageUrl(remote && remote.logo, { w: 800 }) || (seed && seed.logoImage) || null;
    p.logomarkImage = imageUrl(remote && remote.logomark, { w: 400 }) || (seed && seed.logomarkImage) || null;
    p.tileBackgroundUrl = imageUrl(remote && remote.tileBackground, { w: 1600 });
    p.caseHeroBackgroundUrl = imageUrl(remote && remote.caseHeroBackground, { w: 1600 });

    if (remote && remote.extendedIdentity) {
      p.extendedIdentity = {
        logoDesc: remote.extendedIdentity.logoDesc || '',
        palette: remote.extendedIdentity.palette || [],
        typography: remote.extendedIdentity.typography || '',
        graphicSystem: remote.extendedIdentity.graphicSystem || '',
        photography: remote.extendedIdentity.photography || '',
        toneOfVoice: remote.extendedIdentity.toneOfVoice || '',
        photoUrls: (remote.extendedIdentity.photos || []).map(function (img) { return imageUrl(img, { w: 800 }); }).filter(Boolean)
      };
    } else if (p.extendedIdentity) {
      p.extendedIdentity.photoUrls = [];
    }

    p.applicationImageUrls = remote && remote.applications
      ? remote.applications.map(function (a) { return imageUrl(a.image, { w: 900 }); })
      : [];

    if (remote && remote.fieloApps) {
      p.fieloApps = {
        businessCardImageUrl: imageUrl(remote.fieloApps.businessCardImage, { w: 900 }),
        liveryImageUrl: imageUrl(remote.fieloApps.liveryImage, { w: 900 }),
        dashboardImageUrl: imageUrl(remote.fieloApps.dashboardImage, { w: 900 }),
        pitchDeckImageUrl: imageUrl(remote.fieloApps.pitchDeckImage, { w: 900 }),
        contactName: remote.fieloApps.contactName || 'Ada Chen',
        contactRole: remote.fieloApps.contactRole || 'Fleet Operations Lead — fielo.com',
        pitchCopy: remote.fieloApps.pitchCopy || 'Built for the operator, not the analyst.'
      };
    }

    return p;
  }

  function mergeProjects(remoteProjects) {
    if (!remoteProjects || remoteProjects.length === 0) {
      return PROJECTS.map(function (seed) { return mergeProject(seed, null); });
    }
    return remoteProjects.map(function (remote) {
      var seed = PROJECTS.find(function (p) { return p.slug === (remote.slug && remote.slug.current); });
      return mergeProject(seed, remote);
    });
  }

  window.loadSiteContent = function loadSiteContent() {
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timeoutId = controller ? setTimeout(function () { controller.abort(); }, 6000) : null;

    return fetch(queryUrl(), controller ? { signal: controller.signal } : undefined)
      .then(function (res) {
        if (timeoutId) clearTimeout(timeoutId);
        return res;
      })
      .then(function (res) {
        if (!res.ok) throw new Error('Sanity fetch failed: ' + res.status);
        return res.json();
      })
      .then(function (json) {
        var result = json.result || {};
        return {
          settings: mergeSettings(result.settings),
          projects: mergeProjects(result.projects),
          source: 'sanity'
        };
      })
      .catch(function (err) {
        console.warn('[sanity-client] Falling back to seed content:', err.message);
        return {
          settings: mergeSettings(null),
          projects: mergeProjects(null),
          source: 'seed'
        };
      });
  };
})();
