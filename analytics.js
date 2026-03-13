/**
 * Remote Radar — Analytics & Event Tracking
 * Works with Microsoft Clarity (vuvc9ozsdi)
 * Tracks user behavior: filters, card opens, outbound clicks, scroll depth, persona clicks
 */

(function () {
  'use strict';

  // --- Utility: safe Clarity tag ---
  function tag(key, value) {
    if (typeof window.clarity === 'function') {
      window.clarity('set', key, value);
    }
  }

  // --- Utility: safe Clarity event ---
  function trackEvent(name) {
    if (typeof window.clarity === 'function') {
      window.clarity('event', name);
    }
  }

  // ==============================
  // 1. FILTER CLICKS
  // ==============================
  document.querySelectorAll('.filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var category = btn.getAttribute('data-cat') || 'unknown';
      tag('filter_category', category);
      trackEvent('filter_click');
    });
  });

  // ==============================
  // 2. PERSONA CARD CLICKS
  // ==============================
  document.querySelectorAll('.persona').forEach(function (p) {
    p.addEventListener('click', function () {
      var persona = p.getAttribute('data-persona') || 'unknown';
      tag('persona_clicked', persona);
      trackEvent('persona_click');
    });
  });

  // ==============================
  // 3. PLATFORM CARD OPENS
  // ==============================
  document.querySelectorAll('.card').forEach(function (card) {
    card.addEventListener('click', function () {
      var name = card.querySelector('.card-name');
      var rank = card.querySelector('.card-rank');
      if (name) {
        var platformName = name.textContent.trim().replace(/\s+/g, ' ').split(' ')[0];
        tag('card_opened', platformName);
        trackEvent('card_open');
      }
      if (rank) {
        tag('card_rank', rank.textContent.trim());
      }
    });
  });

  // ==============================
  // 4. OUTBOUND LINK CLICKS
  // ==============================
  document.querySelectorAll('.detail-link').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = link.getAttribute('href') || '';
      var domain = '';
      try {
        domain = new URL(href).hostname;
      } catch (err) {
        domain = href;
      }
      tag('outbound_click', domain);
      trackEvent('outbound_link');
    });
  });

  // ==============================
  // 5. SCROLL DEPTH TRACKING
  // ==============================
  var scrollMilestones = { 25: false, 50: false, 75: false, 100: false };

  function checkScrollDepth() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;

    var percent = Math.round((scrollTop / docHeight) * 100);

    Object.keys(scrollMilestones).forEach(function (milestone) {
      if (!scrollMilestones[milestone] && percent >= parseInt(milestone)) {
        scrollMilestones[milestone] = true;
        tag('scroll_depth', milestone + '%');
        trackEvent('scroll_' + milestone);
      }
    });
  }

  var scrollTimer = null;
  window.addEventListener('scroll', function () {
    if (scrollTimer) return;
    scrollTimer = setTimeout(function () {
      scrollTimer = null;
      checkScrollDepth();
    }, 200);
  }, { passive: true });

  // ==============================
  // 6. TIME ON PAGE
  // ==============================
  var startTime = Date.now();
  var timeTags = { 30: false, 60: false, 120: false, 300: false };

  setInterval(function () {
    var elapsed = Math.floor((Date.now() - startTime) / 1000);
    Object.keys(timeTags).forEach(function (sec) {
      if (!timeTags[sec] && elapsed >= parseInt(sec)) {
        timeTags[sec] = true;
        tag('time_on_page', sec + 's');
        trackEvent('engaged_' + sec + 's');
      }
    });
  }, 5000);

  // ==============================
  // 7. DEVICE & ENTRY TAGGING
  // ==============================
  tag('screen_width', window.innerWidth + 'px');
  tag('device_type', window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop');

  // UTM params
  var params = new URLSearchParams(window.location.search);
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach(function (key) {
    var val = params.get(key);
    if (val) tag(key, val);
  });

  // Referrer
  if (document.referrer) {
    try {
      tag('referrer_domain', new URL(document.referrer).hostname);
    } catch (e) { /* ignore */ }
  }

  // ==============================
  // 8. BACK TO TOP CLICKS
  // ==============================
  var backBtn = document.getElementById('backTop');
  if (backBtn) {
    backBtn.addEventListener('click', function () {
      trackEvent('back_to_top');
    });
  }

  // --- Init confirmation ---
  console.log('[Remote Radar] Analytics loaded — Clarity ID: vuvc9ozsdi');

})();
