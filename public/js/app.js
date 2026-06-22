/* app.js – Tab navigation, continent events, form handling */
(function () {
  'use strict';

  /* ── DOM refs ───────────────────────────────────── */
  const navLinks   = document.querySelectorAll('[data-tab]');
  const panels     = document.querySelectorAll('.tab-panel');
  const burger     = document.getElementById('burger');
  const mainNav    = document.getElementById('main-nav');
  const globeHint  = document.getElementById('globe-hint');
  const yearEl     = document.getElementById('fyear');
  const contactForm = document.getElementById('contact-form');
  const formStatus  = document.getElementById('form-status');

  /* ── Year in footer ─────────────────────────────── */
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Current tab state ──────────────────────────── */
  let currentTab = 'welcome';
  let hintHidden = false;

  /* ── Show tab ───────────────────────────────────── */
  function showTab(tabId) {
    const target = document.getElementById('tab-' + tabId);
    if (!target) return;

    // Deactivate all
    panels.forEach(p => {
      p.classList.remove('active');
    });
    navLinks.forEach(a => a.classList.remove('active'));

    // Activate target
    target.classList.add('active');
    currentTab = tabId;

    // Highlight matching nav link(s)
    document.querySelectorAll(`[data-tab="${tabId}"]`).forEach(a => a.classList.add('active'));

    // Scroll panel to top
    target.scrollTop = 0;

    // Hide globe hint after first navigation
    if (!hintHidden) {
      hintHidden = true;
      globeHint.classList.add('hidden');
    }

    // Close mobile menu
    mainNav.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');

    // Update URL hash silently
    history.replaceState(null, '', '#' + tabId);
  }

  /* ── Nav link clicks ────────────────────────────── */
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const tab = link.getAttribute('data-tab');
      if (tab) showTab(tab);
    });
  });

  /* ── Highlight card / research card clicks ──────── */
  document.querySelectorAll('.hcard, .rcard, .acard').forEach(card => {
    card.addEventListener('click', () => {
      const tab = card.getAttribute('data-tab');
      if (tab) showTab(tab);
    });
  });

  /* ── Inline links (data-tab anchors) ────────────── */
  document.querySelectorAll('a[data-tab]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      showTab(a.getAttribute('data-tab'));
    });
  });

  /* ── Globe continent click event ────────────────── */
  document.addEventListener('continentClick', e => {
    const { tab } = e.detail;
    if (tab) showTab(tab);
  });

  /* ── Burger menu ────────────────────────────────── */
  burger.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', isOpen);
  });

  /* ── Mobile sub-nav toggle ──────────────────────── */
  document.querySelectorAll('.has-sub > .nav-link').forEach(link => {
    link.addEventListener('click', e => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        e.stopPropagation();
        const parent = link.closest('.has-sub');
        parent.classList.toggle('open');
      }
    });
  });

  /* ── Hash routing on load ───────────────────────── */
  function routeFromHash() {
    const hash = location.hash.slice(1);
    const validTabs = Array.from(panels).map(p => p.id.replace('tab-', ''));
    if (hash && validTabs.includes(hash)) {
      showTab(hash);
    } else {
      showTab('welcome');
    }
  }
  routeFromHash();
  window.addEventListener('hashchange', routeFromHash);

  /* ── Contact form ───────────────────────────────── */
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const name    = contactForm.querySelector('[name="name"]').value.trim();
      const email   = contactForm.querySelector('[name="email"]').value.trim();
      const message = contactForm.querySelector('[name="message"]').value.trim();

      if (!name || !email || !message) {
        formStatus.textContent = 'Please fill in all required fields.';
        formStatus.style.color = '#f97316';
        return;
      }

      // Simulate send (no backend mailer on free plan – uses mailto fallback)
      const subject  = contactForm.querySelector('[name="subject"]').value.trim() || 'Message from website';
      const body     = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
      const mailtoUrl = `mailto:andrepython@zju.edu.cn?subject=${encodeURIComponent(subject)}&body=${body}`;
      window.location.href = mailtoUrl;

      formStatus.textContent = '✓ Opening your email client…';
      formStatus.style.color = '#3ec6c6';
      contactForm.reset();
    });
  }

  /* ── Keyboard navigation ────────────────────────── */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      mainNav.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });

}());
