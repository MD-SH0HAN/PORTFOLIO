(() => {
  'use strict';
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const themeToggle = document.getElementById('themeToggle');
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  const backToTop = document.getElementById('backToTop');
  const profilePhoto = document.getElementById('profilePhoto');
  const toast = document.getElementById('toast');
  const accessibilityDialog = document.getElementById('accessibilityDialog');
  const accessibilityTrigger = document.getElementById('accessibilityTrigger');
  const shortcutsTrigger = document.getElementById('shortcutsTrigger');
  const reduceMotionToggle = document.getElementById('reduceMotionToggle');
  const highContrastToggle = document.getElementById('highContrastToggle');
  let toastTimer;

  const cvDownloadPath = 'assets/MD-SHOHAN-DevOps-Portfolio.pdf';
  const motionPreferenceKey = 'shohan-reduce-motion';
  const contrastPreferenceKey = 'shohan-high-contrast';
  const readPreference = key => { try { return localStorage.getItem(key) === 'true'; } catch (_) { return false; } };
  let userReducedMotion = readPreference(motionPreferenceKey);
  let highContrastEnabled = readPreference(contrastPreferenceKey);
  const motionIsReduced = () => reducedMotion.matches || userReducedMotion;

  // Repository links target the recommended public repo name. Change this once if you choose another repo name.
  const sourceRepositoryRoot = 'https://github.com/MD-SH0HAN/PORTFOLIO';
  document.querySelectorAll('[data-repository-path]').forEach(link => {
    const repositoryPath = link.dataset.repositoryPath;
    if (repositoryPath) link.href = `${sourceRepositoryRoot}/${repositoryPath.replace(/^\/+/, '')}`;
  });

  // One authoritative source for public profile destinations and contact emails.
  const profileDestinations = [
    { key: 'portfolio', label: 'Portfolio', href: 'https://md-sh0han.github.io/PORTFOLIO/', group: 'website', professional: true, short: 'Portfolio' },
    { key: 'github', label: 'GitHub', href: 'https://github.com/MD-SH0HAN', group: 'developer', professional: true, short: 'GitHub' },
    { key: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/mohammad.and.shohan', group: 'social', short: 'Facebook' },
    { key: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/_md.shohan_/', group: 'social', short: 'Instagram' },
    { key: 'threads', label: 'Threads', href: 'https://www.threads.com/@_md.shohan_', group: 'social', short: 'Threads' },
    { key: 'twitch', label: 'Twitch', href: 'https://www.twitch.tv/md_shohan', group: 'social', short: 'Twitch' },
    { key: 'tumblr', label: 'Tumblr', href: 'https://www.tumblr.com/md-shohan', group: 'social', short: 'Tumblr' },
    { key: 'reddit', label: 'Reddit', href: 'https://www.reddit.com/user/MD-SH0HAN/', group: 'social', short: 'Reddit' },
    { key: 'discord', label: 'Discord', href: 'https://discord.com/users/1221600292915773468', group: 'social', short: 'Discord' },
    { key: 'gitlab', label: 'GitLab', href: 'https://gitlab.com/MD-SHOHAN', group: 'developer', short: 'GitLab' },
    { key: 'docker', label: 'Docker Hub', href: 'https://hub.docker.com/u/mdsh0han', group: 'developer', short: 'Docker' },
    { key: 'vercel', label: 'Vercel', href: 'https://vercel.com/md-shohan', group: 'developer', short: 'Vercel' }
  ];
  const emailDestinations = [
    { key: 'primary', label: 'Primary email', address: 'mohammad.and.shohan@gmail.com' },
    { key: 'secondary', label: 'Alternative email', address: 'mohammad.and.shohan@outlook.com' }
  ];
  const profileRecord = key => profileDestinations.find(profile => profile.key === key);
  const emailAddress = key => emailDestinations.find(email => email.key === key)?.address || '';
  document.querySelectorAll('[data-email]').forEach(link => { const address = emailAddress(link.dataset.email); if (address) link.href = `mailto:${address}`; });
  document.querySelectorAll('.cv-shortcut').forEach(link => { link.href = cvDownloadPath; });

  // Brand marks are inline SVG: sharp at any display density and independent of remote icon requests.
  const profileIconMarkup = {
    portfolio: '<svg class="profile-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><path d="M3.5 12h17M12 3c2.7 2.5 3.8 5.5 3.8 9S14.7 18.5 12 21M12 3C9.3 5.5 8.2 8.5 8.2 12s1.1 6.5 3.8 9"/></svg>',
    github: '<svg class="profile-icon profile-icon-filled" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.68-3.76-1.32-3.76-1.32-.5-1.3-1.24-1.65-1.24-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 .1.76 2.17 4.45 1.55.1-.74.39-1.25.7-1.54-2.48-.28-5.08-1.24-5.08-5.52 0-1.22.44-2.22 1.16-3-.12-.29-.5-1.43.11-2.98 0 0 .95-.3 3.05 1.15a10.6 10.6 0 0 1 5.56 0c2.1-1.42 3.05-1.15 3.05-1.15.61 1.55.23 2.69.11 2.98.72.78 1.16 1.78 1.16 3 0 4.29-2.6 5.23-5.09 5.51.4.35.75 1.02.75 2.06v3.04c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z"/></svg>',
    facebook: '<svg class="profile-icon profile-icon-filled" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M13.55 21v-8.24h2.77l.42-3.21h-3.19V7.5c0-.93.26-1.57 1.6-1.57h1.71V3.06c-.3-.04-1.33-.13-2.52-.13-2.5 0-4.22 1.53-4.22 4.35v2.27H7.29v3.21h2.83V21z"/></svg>',
    instagram: '<svg class="profile-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5.2"/><circle cx="12" cy="12" r="4.1"/><circle cx="17.7" cy="6.6" r="1" class="profile-icon-dot"/></svg>',
    threads: '<svg class="profile-icon profile-icon-filled" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12.18 2.5c-5.16 0-8.43 3.7-8.43 9.57 0 5.82 3.1 9.43 8.02 9.43 4.22 0 7.1-2.46 7.1-6.2 0-3.24-2.06-5.3-5.32-5.3-2.28 0-3.92 1.33-3.92 3.22 0 1.72 1.28 2.94 3.09 2.94 1.28 0 2.3-.52 2.99-1.52-.14 2.08-1.44 3.37-3.8 3.37-3.2 0-5.06-2.32-5.06-6.14 0-3.9 1.98-6.2 5.31-6.2 2.23 0 3.62 1.1 4.23 3.27l2.37-.62C17.86 4.46 15.62 2.5 12.18 2.5Zm.44 10.04c1.82 0 2.68.77 2.68 1.8 0 .97-.83 1.65-2.3 1.65-.88 0-1.42-.42-1.42-1.04 0-1.08 1-2.41 1.04-2.41Z"/></svg>',
    twitch: '<svg class="profile-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 3h17v12.2l-4.8 4.7h-4.1L10 22v-2.1H5z"/><path d="M9 7v5M15 7v5"/></svg>',
    tumblr: '<svg class="profile-icon profile-icon-filled" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M13.25 2.5v4.1h4.02v3.94h-4.02v5.03c0 1.42.69 2.13 2.08 2.13h2.07v3.65h-3.92c-3.66 0-5.63-1.99-5.63-5.59v-5.22H5.18V6.97c2.6-.68 4.03-2.2 4.42-4.47z"/></svg>',
    reddit: '<svg class="profile-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="13" r="8.3"/><path d="M8.5 15.1c1.9 1.65 5.1 1.65 7 0M12.9 4.6l.9-2.1 3.5.7"/><circle cx="9.2" cy="11.7" r=".7" class="profile-icon-dot"/><circle cx="14.7" cy="11.7" r=".7" class="profile-icon-dot"/><circle cx="18.1" cy="3.6" r="1.4"/></svg>',
    discord: '<svg class="profile-icon profile-icon-filled" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19.73 5.19a18.1 18.1 0 0 0-4.53-1.42.09.09 0 0 0-.09.04c-.2.36-.43.84-.59 1.21a16.8 16.8 0 0 0-5.04 0c-.17-.38-.39-.85-.6-1.21a.09.09 0 0 0-.09-.04 18.1 18.1 0 0 0-4.53 1.42.08.08 0 0 0-.04.03C1.34 9.01.55 12.7.88 16.34a.1.1 0 0 0 .04.07 18.4 18.4 0 0 0 5.51 2.78.09.09 0 0 0 .09-.03c.43-.58.8-1.19 1.13-1.83a.09.09 0 0 0-.05-.12 12.1 12.1 0 0 1-1.72-.82.09.09 0 0 1-.01-.15l.34-.27a.09.09 0 0 1 .09-.01c3.61 1.65 7.52 1.65 11.08 0a.09.09 0 0 1 .09.01l.34.27a.09.09 0 0 1-.01.15c-.55.32-1.12.59-1.72.82a.09.09 0 0 0-.05.12c.33.64.71 1.25 1.13 1.83a.09.09 0 0 0 .09.03 18.3 18.3 0 0 0 5.52-2.78.1.1 0 0 0 .04-.07c.39-4.21-.66-7.87-2.78-11.12a.08.08 0 0 0-.04-.03ZM8.56 13.7c-1.08 0-1.97-.99-1.97-2.2s.87-2.2 1.97-2.2 1.98.99 1.97 2.2-.87 2.2-1.97 2.2Zm6.88 0c-1.08 0-1.97-.99-1.97-2.2s.87-2.2 1.97-2.2 1.98.99 1.97 2.2-.87 2.2-1.97 2.2Z"/></svg>',
    gitlab: '<svg class="profile-icon profile-icon-filled" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m12 21.2-4.1-12.6h8.2L12 21.2Z"/><path d="m2.2 12.1 1.9-5.9c.1-.4.7-.4.8 0l1.2 3.7 1.8 0L12 21.2 2.2 14a1.6 1.6 0 0 1 0-1.9Z"/><path d="m21.8 12.1-1.9-5.9c-.1-.4-.7-.4-.8 0l-1.2 3.7-1.8 0L12 21.2l9.8-7.2a1.6 1.6 0 0 0 0-1.9Z"/><path d="m6.1 9.9 1.8 0L12 21.2 8 8.6M17.9 9.9 16 9.9 12 21.2l4-12.6"/></svg>',
    docker: '<svg class="profile-icon profile-icon-filled" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M2 11.6h17.8c.1 3.9-3.1 7.1-7.8 7.1H8.9C5 18.7 2.7 16.3 2 11.6Z"/><path d="M5 8.5h3v2.4H5zM8.4 5.8h3v2.4h-3zM8.4 8.5h3v2.4h-3zM11.8 8.5h3v2.4h-3zM11.8 5.8h3v2.4h-3zM11.8 3.1h3v2.4h-3zM15.2 8.5h3v2.4h-3z"/><path d="M19.7 9.2c.8-.3 1.6-.2 2.3.3-.3.9-.9 1.5-1.8 1.7-.2-.7-.4-1.3-.5-2Z"/></svg>',
    vercel: '<svg class="profile-icon profile-icon-filled" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3 23 21H1L12 3Z"/></svg>'
  };

  // Keep statically-authored links (header, project notes, and footer text links) in sync with the source of truth.
  document.querySelectorAll('[data-profile]').forEach(link => {
    const destination = profileRecord(link.dataset.profile);
    if (destination?.href) {
      link.href = destination.href;
      link.removeAttribute('aria-disabled');
      link.classList.remove('is-unconfigured');
      link.tabIndex = 0;
    } else {
      link.removeAttribute('href');
      link.setAttribute('aria-disabled', 'true');
      link.setAttribute('tabindex', '-1');
      link.classList.add('is-unconfigured');
    }
    const iconMarkup = profileIconMarkup[link.dataset.profile];
    if (iconMarkup && !link.querySelector('svg')) {
      link.insertAdjacentHTML('afterbegin', iconMarkup);
      link.classList.add('has-profile-icon');
    }
  });

  // Render each profile exactly once in the unified contact directory.
  const buildProfileLink = profile => {
    const link = document.createElement('a');
    link.className = 'contact-profile-link';
    link.href = profile.href;
    link.insertAdjacentHTML('afterbegin', profileIconMarkup[profile.key] || profileIconMarkup.portfolio);

    const label = document.createElement('span');
    label.className = 'contact-profile-label';
    label.textContent = profile.label;
    link.appendChild(label);

    const arrow = document.createElement('span');
    arrow.className = 'contact-profile-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';
    link.appendChild(arrow);

    link.title = profile.label;
    link.setAttribute('aria-label', `${profile.label} profile (opens in a new tab)`);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.dataset.profileKey = profile.key;
    link.dataset.profileGroup = profile.group;
    return link;
  };

  const renderContactProfiles = (elementId, group) => {
    const container = document.getElementById(elementId);
    if (!container) return;
    profileDestinations.filter(profile => profile.group === group && profile.href).forEach(profile => {
      container.appendChild(buildProfileLink(profile));
    });
  };
  renderContactProfiles('contactSocialLinks', 'social');
  renderContactProfiles('contactDeveloperLinks', 'developer');
  renderContactProfiles('contactWebsiteLinks', 'website');
  const profileCountLabel = document.querySelector('.contact-directory-kicker');
  if (profileCountLabel) profileCountLabel.textContent = `FIND ME ONLINE / ${profileDestinations.filter(profile => profile.href).length} DESTINATIONS`;

  // The primary portrait uses the canonical local WebP asset. If it is missing,
  // fall back once to the bundled placeholder instead of retrying the same URL.
  if (profilePhoto) {
    const usePortraitPlaceholder = () => {
      if (profilePhoto.dataset.placeholderTried) return;
      profilePhoto.dataset.placeholderTried = 'true';
      profilePhoto.classList.add('photo-placeholder');
      profilePhoto.alt = 'Monogram placeholder for MD Shohan';
      profilePhoto.src = profilePhoto.dataset.placeholderSrc || 'assets/portrait-placeholder.svg';
    };
    profilePhoto.addEventListener('error', usePortraitPlaceholder);
  }

  const showToast = message => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2300);
  };

  // Native View Transitions enhance state changes where supported; every update has a direct fallback.
  const withViewTransition = update => {
    if (motionIsReduced() || typeof document.startViewTransition !== 'function') return update();
    try { return document.startViewTransition(update); }
    catch (_) { return update(); }
  };

  // Theme persists when storage is available; both themes retain the monochrome language.
  const savedTheme = (() => { try { return localStorage.getItem('shohan-theme'); } catch (_) { return null; } })();
  if (savedTheme === 'light' || savedTheme === 'dark') root.dataset.theme = savedTheme;
  const updateThemeControl = () => {
    if (!themeToggle) return;
    const light = root.dataset.theme === 'light';
    themeToggle.setAttribute('aria-label', light ? 'Switch to dark monochrome theme' : 'Switch to light monochrome theme');
    themeToggle.title = light ? 'Switch to dark theme' : 'Switch to light theme';
    if (themeColorMeta) themeColorMeta.setAttribute('content', light ? '#ececec' : '#090909');
  };
  const toggleTheme = () => {
    const nextTheme = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = nextTheme;
    try { localStorage.setItem('shohan-theme', nextTheme); } catch (_) { /* Storage may be unavailable for local files. */ }
    updateThemeControl();
    showToast(`Switched to ${nextTheme} theme.`);
  };
  updateThemeControl();
  themeToggle?.addEventListener('click', toggleTheme);

  // Respect the visitor's operating-system reduced-motion preference and avoid
  // running SVG motion in sections that are well outside the viewport.
  const syncSvgMotion = () => {
    const shouldPause = motionIsReduced();
    document.querySelectorAll('[data-motion-section] svg').forEach(svg => {
      if (typeof svg.pauseAnimations !== 'function') return;
      if (shouldPause || svg.closest('.motion-offscreen')) svg.pauseAnimations();
      else svg.unpauseAnimations();
    });
  };
  if ('IntersectionObserver' in window) {
    const motionVisibilityObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        entry.target.classList.toggle('motion-offscreen', !entry.isIntersecting);
        entry.target.querySelectorAll('svg').forEach(svg => {
          if (typeof svg.pauseAnimations !== 'function') return;
          if (!entry.isIntersecting || motionIsReduced()) svg.pauseAnimations();
          else svg.unpauseAnimations();
        });
      });
    }, { rootMargin: '100px 0px', threshold: 0.01 });
    document.querySelectorAll('[data-motion-section]').forEach(section => motionVisibilityObserver.observe(section));
  }
  if (typeof reducedMotion.addEventListener === 'function') reducedMotion.addEventListener('change', syncSvgMotion);
  else reducedMotion.addListener?.(syncSvgMotion);
  syncSvgMotion();

  const syncAccessibilityPreferences = () => {
    root.dataset.reduceMotion = userReducedMotion ? 'true' : 'false';
    root.dataset.contrast = highContrastEnabled ? 'high' : 'normal';
    if (reduceMotionToggle) {
      reduceMotionToggle.checked = userReducedMotion || reducedMotion.matches;
      reduceMotionToggle.disabled = reducedMotion.matches;
    }
    if (highContrastToggle) highContrastToggle.checked = highContrastEnabled;
    syncSvgMotion();
  };
  const setStoredPreference = (key, value) => {
    try { localStorage.setItem(key, String(value)); } catch (_) { /* Preferences still apply for this page view. */ }
  };
  reduceMotionToggle?.addEventListener('change', () => {
    userReducedMotion = reduceMotionToggle.checked;
    setStoredPreference(motionPreferenceKey, userReducedMotion);
    syncAccessibilityPreferences();
    showToast(userReducedMotion ? 'Reduced motion enabled.' : 'Reduced motion disabled.');
  });
  highContrastToggle?.addEventListener('change', () => {
    highContrastEnabled = highContrastToggle.checked;
    setStoredPreference(contrastPreferenceKey, highContrastEnabled);
    syncAccessibilityPreferences();
    showToast(highContrastEnabled ? 'Higher contrast enabled.' : 'Higher contrast disabled.');
  });
  let accessibilityLauncher = accessibilityTrigger;
  const openAccessibilitySettings = (launcher = accessibilityTrigger) => {
    if (!accessibilityDialog) return;
    accessibilityLauncher = launcher;
    syncAccessibilityPreferences();
    if (typeof accessibilityDialog.showModal === 'function') accessibilityDialog.showModal();
    else accessibilityDialog.setAttribute('open', '');
    window.setTimeout(() => reduceMotionToggle?.focus(), 0);
  };
  const openKeyboardShortcuts = () => {
    openAccessibilitySettings(shortcutsTrigger);
    window.setTimeout(() => document.getElementById('accessibilityShortcuts')?.focus({ preventScroll: true }), 0);
  };
  const closeAccessibilitySettings = () => {
    if (accessibilityDialog?.open) accessibilityDialog.close();
    if (typeof accessibilityLauncher?.focus === 'function') accessibilityLauncher.focus({ preventScroll: true });
  };
  accessibilityTrigger?.addEventListener('click', () => openAccessibilitySettings(accessibilityTrigger));
  shortcutsTrigger?.addEventListener('click', openKeyboardShortcuts);
  document.getElementById('accessibilityClose')?.addEventListener('click', closeAccessibilitySettings);
  accessibilityDialog?.addEventListener('cancel', event => { event.preventDefault(); closeAccessibilitySettings(); });
  accessibilityDialog?.addEventListener('click', event => { if (event.target === accessibilityDialog) closeAccessibilitySettings(); });
  syncAccessibilityPreferences();
  if (typeof reducedMotion.addEventListener === 'function') reducedMotion.addEventListener('change', syncAccessibilityPreferences);
  else reducedMotion.addListener?.(syncAccessibilityPreferences);

  // Keep the portfolio in sync when the shared preference changes in another tab.
  window.addEventListener('storage', event => {
    if (event.key !== 'shohan-theme' || (event.newValue !== 'light' && event.newValue !== 'dark')) return;
    root.dataset.theme = event.newValue;
    updateThemeControl();
  });

  // Mobile navigation.
  const setMenuOpen = open => {
    if (!mobileNav || !menuToggle) return;
    mobileNav.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  menuToggle?.addEventListener('click', () => setMenuOpen(mobileNav.hidden));
  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 821px)').matches) setMenuOpen(false);
  }, { passive: true });
  mobileNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenuOpen(false)));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenuOpen(false); });

  // Scroll progress, reliable active-section navigation, and the Back to Top control.
  const navLinks = [...document.querySelectorAll('[data-nav]')];
  // Keep active-section tracking in document order, even if nav items are rearranged later.
  const sections = navLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean)
    .sort((a, b) => {
      if (a === b) return 0;
      return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
  let activeSectionId = '';

  const updateActiveSection = () => {
    if (!sections.length) return;

    // Select the last section that has crossed a stable reading line below the sticky rail.
    const activationLine = Math.max(100, Math.min(220, window.innerHeight * 0.30));
    let currentSection = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= activationLine) currentSection = section;
      else break;
    }

    // Keep the final destination selected at the true bottom, even when its section is short.
    const scrollable = root.scrollHeight - window.innerHeight;
    if (scrollable > 0 && window.scrollY >= scrollable - 4) currentSection = sections[sections.length - 1];

    if (!currentSection || currentSection.id === activeSectionId) return;
    activeSectionId = currentSection.id;
    navLinks.forEach(link => {
      const active = link.getAttribute('href') === `#${activeSectionId}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  const updateBackToTop = amount => {
    if (!backToTop) return;
    // The button doubles as the page-reading indicator; its fill follows the full scroll range.
    const percentage = Math.round(amount);
    backToTop.style.setProperty('--scroll-progress', `${amount}%`);
    backToTop.setAttribute('aria-label', `Back to top — page progress ${percentage}%`);
    backToTop.title = `Back to top · ${percentage}% page progress`;
    // Keep the focused button available until focus leaves it after activation.
    backToTop.hidden = !(window.scrollY > 520 || document.activeElement === backToTop);
  };
  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: motionIsReduced() ? 'auto' : 'smooth' });
  });
  backToTop?.addEventListener('blur', () => window.requestAnimationFrame(updateScrollUI));

  const updateScrollUI = () => {
    const scrollable = root.scrollHeight - window.innerHeight;
    const amount = scrollable > 0 ? Math.min(100, Math.max(0, window.scrollY / scrollable * 100)) : 0;

    updateActiveSection();
    updateBackToTop(amount);

    // Scroll-linked architecture wires are independent of the card-based learning roadmap.
    const architectureSection = document.getElementById('architecture');
    if (architectureSection) {
      const rect = architectureSection.getBoundingClientRect();
      const start = window.innerHeight * 0.86;
      const end = -Math.max(280, rect.height * 0.48);
      const drawProgress = motionIsReduced() ? 1 : Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
      document.querySelectorAll('.arch-wire-draw').forEach(path => { path.style.strokeDashoffset = String(100 * (1 - drawProgress)); });
    }
  };
  // Coalesce scroll-driven geometry reads into one update per paint to avoid excess layout work.
  let scrollFrame = 0;
  window.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(() => {
      scrollFrame = 0;
      updateScrollUI();
    });
  }, { passive: true });
  window.addEventListener('resize', updateScrollUI, { passive: true });
  updateScrollUI();
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.11, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
  } else {
    document.querySelectorAll('.reveal').forEach(element => element.classList.add('is-visible'));
  }

  // Stagger sibling cards for a deliberate entrance without delaying the whole page.
  const revealGroups = ['.about-grid', '.principle-cards', '.focus-grid', '.project-grid', '.stack-categories', '.journey-track', '.slo-principles'];
  revealGroups.forEach(selector => {
    document.querySelectorAll(selector).forEach(group => {
      [...group.children].filter(child => child.classList.contains('reveal')).forEach((child, index) => {
        child.style.setProperty('--reveal-order', String(Math.min(index, 4)));
      });
    });
  });

  // Hero parallax is intentionally small and is disabled on touch / reduced-motion setups.
  const heroVisual = document.querySelector('.hero-visual');
  const portraitFrame = document.querySelector('.portrait-frame');

  // Pause decorative hero motion when the portrait stage is well outside the viewport.
  // This keeps the glass/orbital treatment lively without spending cycles off-screen.
  if (heroVisual && 'IntersectionObserver' in window) {
    const heroMotionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => heroVisual.classList.toggle('is-offscreen', !entry.isIntersecting));
    }, { rootMargin: '120px 0px', threshold: 0.01 });
    heroMotionObserver.observe(heroVisual);
  }

  // Touch devices emulate hover: tap the portrait to reveal its colors; tap it again
  // or touch elsewhere to return it to grayscale. Mouse hover remains CSS-only.
  if (portraitFrame) {
    portraitFrame.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'touch') return;
      portraitFrame.classList.toggle('is-color');
    }, { passive: true });

    document.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'touch' || portraitFrame.contains(event.target)) return;
      portraitFrame.classList.remove('is-color');
    }, { passive: true });
  }

  // Portrait remains still when the pointer moves; orbital motion is CSS-only.

  // Desktop-only liquid reflections: one shared rAF keeps the spotlight smooth without
  // adding per-frame work to every card. The cards still use their CSS-only hover state.
  if (!motionIsReduced() && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const motionCards = [...document.querySelectorAll('.principle-card, .focus-card, .project-card, .stack-row')];
    let cardPointerFrame = 0;
    let pendingCardPointer = null;

    motionCards.forEach(card => {
      card.classList.add('motion-card');
      if (!card.querySelector(':scope > .pointer-spotlight')) {
        const spotlight = document.createElement('span');
        spotlight.className = 'pointer-spotlight';
        spotlight.setAttribute('aria-hidden', 'true');
        card.insertBefore(spotlight, card.firstChild);
      }

      card.addEventListener('pointermove', event => {
        if (motionIsReduced() || event.pointerType === 'touch') return;
        pendingCardPointer = { card, clientX: event.clientX, clientY: event.clientY };
        if (cardPointerFrame) return;
        cardPointerFrame = window.requestAnimationFrame(() => {
          cardPointerFrame = 0;
          const pointer = pendingCardPointer;
          pendingCardPointer = null;
          if (!pointer || motionIsReduced()) return;
          const bounds = pointer.card.getBoundingClientRect();
          if (!bounds.width || !bounds.height) return;
          const x = Math.max(0, Math.min(100, ((pointer.clientX - bounds.left) / bounds.width) * 100));
          const y = Math.max(0, Math.min(100, ((pointer.clientY - bounds.top) / bounds.height) * 100));
          pointer.card.style.setProperty('--spot-x', `${x}%`);
          pointer.card.style.setProperty('--spot-y', `${y}%`);
        });
      }, { passive: true });

      card.addEventListener('pointerleave', () => {
        if (pendingCardPointer?.card === card) pendingCardPointer = null;
        card.style.setProperty('--spot-x', '50%');
        card.style.setProperty('--spot-y', '50%');
      }, { passive: true });
    });
  }

  // SLO calculator with a visually responsive objective ring.
  const sloTarget = document.getElementById('sloTarget');
  const sloWindow = document.getElementById('sloWindow');
  const sloRequests = document.getElementById('sloRequests');
  const fmt = new Intl.NumberFormat('en-US');
  const byId = id => document.getElementById(id);
  const animateNumber = (element, target, formatter = value => fmt.format(Math.round(value)), writer = null) => {
    if (!element || !Number.isFinite(target)) return;
    if (element._countFrame) cancelAnimationFrame(element._countFrame);
    const draw = value => (writer ? writer(value) : (element.textContent = formatter(value)));
    const previous = element._countValue;
    if (!Number.isFinite(previous) || previous === target || motionIsReduced()) {
      element._countValue = target;
      draw(target);
      return;
    }
    const hadLive = element.hasAttribute('aria-live');
    const previousLive = element.getAttribute('aria-live');
    const parentLive = element.closest('[aria-live]');
    const shouldMute = (previousLive && previousLive !== 'off') || (!hadLive && parentLive && parentLive.getAttribute('aria-live') !== 'off');
    if (shouldMute) element.setAttribute('aria-live', 'off');
    const start = previous;
    const startedAt = performance.now();
    const duration = 330;
    const step = now => {
      const t = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = start + (target - start) * eased;
      element._countValue = value;
      draw(value);
      if (t < 1) {
        element._countFrame = requestAnimationFrame(step);
      } else {
        element._countValue = target;
        draw(target);
        element._countFrame = 0;
        if (shouldMute) {
          if (hadLive) element.setAttribute('aria-live', previousLive);
          else element.removeAttribute('aria-live');
          draw(target);
        }
      }
    };
    element._countFrame = requestAnimationFrame(step);
  };
  const appendTerminalLine = (listId, level, message) => {
    const list = byId(listId);
    if (!list) return;
    list.querySelectorAll('.terminal-caret').forEach(caret => caret.remove());
    list.querySelectorAll('.terminal-line.is-latest').forEach(line => line.classList.remove('is-latest'));
    const index = Number(list.dataset.lineCount || list.children.length || 0);
    list.dataset.lineCount = String(index + 1);
    const item = document.createElement('li');
    item.className = `terminal-line${level === 'WARN' ? ' terminal-warn' : level === 'ERROR' ? ' terminal-error' : level === 'SUCCESS' ? ' terminal-success' : ''} is-latest`;
    const time = document.createElement('time');
    time.textContent = `T+${String(index).padStart(2, '0')}s`;
    const levelEl = document.createElement('span');
    levelEl.className = 'terminal-level';
    levelEl.textContent = level;
    const code = document.createElement('code');
    code.textContent = message;
    const caret = document.createElement('span');
    caret.className = 'terminal-caret';
    caret.setAttribute('aria-hidden', 'true');
    caret.textContent = '▍';
    item.append(time, levelEl, code, caret);
    list.appendChild(item);
    while (list.children.length > 12) list.firstElementChild.remove();
    list.scrollTop = list.scrollHeight;
  };
  const resetTerminal = (listId, level, message) => {
    const list = byId(listId);
    if (!list) return;
    list.replaceChildren();
    list.dataset.lineCount = '0';
    appendTerminalLine(listId, level, message);
  };
  const formatDuration = totalSeconds => {
    let seconds = Math.round(totalSeconds);
    const days = Math.floor(seconds / 86400); seconds %= 86400;
    const hours = Math.floor(seconds / 3600); seconds %= 3600;
    const minutes = Math.floor(seconds / 60); seconds %= 60;
    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    if (seconds || parts.length === 0) parts.push(`${seconds}s`);
    return parts.join(' ');
  };

  // Reliability controls use synthetic, event-driven values and never contact a live endpoint.
  const simulation = {
    failures: 0,
    latency: 84,
    events: 1,
    incidentCount: 0,
    samples: Array.from({ length: 20 }, (_, index) => ({
      latency: 72 + ((index * 19) % 39),
      errors: 0,
      label: `Baseline ${index + 1}`
    })),
    timeline: []
  };
  const simulationChartBars = byId('simulationChartBars');
  const simulationLatencyPath = byId('simulationLatencyPath');
  const simulationLatencyDot = byId('simulationLatencyDot');
  const simulationTimeline = byId('simulationTimeline');
  const simulationEventCount = byId('simulationEventCount');
  const svgNs = 'http://www.w3.org/2000/svg';
  const getBudget = () => {
    if (!sloTarget || !sloWindow || !sloRequests) return 0;
    const requestBudget = Math.floor(Number(sloRequests.value) * Number(sloWindow.value) * Math.max(0, 1 - Number(sloTarget.value) / 100) + 1e-9);
    return requestBudget;
  };
  const renderSimulationTimeline = () => {
    if (!simulationTimeline) return;
    simulationTimeline.replaceChildren();
    const recent = simulation.timeline.slice(-5).reverse();
    recent.forEach(entry => {
      const li = document.createElement('li');
      const time = document.createElement('time');
      const body = document.createElement('span');
      time.textContent = entry.time;
      body.textContent = entry.message;
      li.className = `event-${entry.kind}`;
      li.append(time, body);
      simulationTimeline.appendChild(li);
    });
    if (simulationEventCount) simulationEventCount.textContent = `${String(simulation.events).padStart(2, '0')} EVENTS`;
  };
  const addSimulationEvent = (message, kind = 'info') => {
    simulation.events += 1;
    const time = `00:${String(simulation.events - 1).padStart(2, '0')}`;
    simulation.timeline.push({ time, message, kind });
    renderSimulationTimeline();
    const level = kind === 'danger' ? 'ERROR' : kind === 'warning' ? 'WARN' : kind === 'success' ? 'SUCCESS' : 'INFO';
    appendTerminalLine('simulationTerminalLog', level, message);
  };
  const renderSimulationChart = () => {
    if (!simulationChartBars || !simulationLatencyPath || !simulationLatencyDot) return;
    const samples = simulation.samples.slice(-24);
    const left = 42;
    const right = 742;
    const top = 35;
    const bottom = 220;
    const width = right - left;
    const step = width / Math.max(1, samples.length - 1);
    const maxErrors = Math.max(10, ...samples.map(sample => sample.errors)) * 1.08;
    const errorAxisTop = byId('simulationErrorAxisTop');
    const errorAxisMid = byId('simulationErrorAxisMid');
    if (errorAxisTop) errorAxisTop.textContent = String(Math.ceil(maxErrors));
    if (errorAxisMid) errorAxisMid.textContent = String(Math.round(maxErrors / 2));
    simulationChartBars.replaceChildren();
    samples.forEach((sample, index) => {
      const barWidth = Math.min(18, Math.max(5, step * 0.42));
      const height = sample.errors > 0 ? Math.max(3, sample.errors / maxErrors * 76) : 1.5;
      const rect = document.createElementNS(svgNs, 'rect');
      rect.setAttribute('x', String(left + index * step - barWidth / 2));
      rect.setAttribute('y', String(bottom - height));
      rect.setAttribute('width', String(barWidth));
      rect.setAttribute('height', String(height));
      rect.setAttribute('rx', '2');
      rect.setAttribute('class', sample.errors > 0 ? 'simulation-error-bar has-errors' : 'simulation-error-bar');
      rect.style.setProperty('--bar-order', String(Math.min(index, 22)));
      simulationChartBars.appendChild(rect);
    });
    const points = samples.map((sample, index) => {
      const x = left + index * step;
      const y = bottom - (Math.max(0, Math.min(400, sample.latency)) / 400) * (bottom - top);
      return [x, y];
    });
    const smoothPath = points.map((point, index) => {
      if (index === 0) return `M${point[0].toFixed(1)} ${point[1].toFixed(1)}`;
      const previous = points[index - 1];
      const beforePrevious = points[index - 2] || previous;
      const next = points[index + 1] || point;
      const c1x = previous[0] + (point[0] - beforePrevious[0]) / 6;
      const c1y = previous[1] + (point[1] - beforePrevious[1]) / 6;
      const c2x = point[0] - (next[0] - previous[0]) / 6;
      const c2y = point[1] - (next[1] - previous[1]) / 6;
      return `C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${point[0].toFixed(1)} ${point[1].toFixed(1)}`;
    }).join(' ');
    simulationLatencyPath.setAttribute('d', smoothPath);
    const lastPoint = points[points.length - 1] || [right, bottom];
    simulationLatencyDot.setAttribute('cx', String(lastPoint[0]));
    simulationLatencyDot.setAttribute('cy', String(lastPoint[1]));
    simulationLatencyDot.classList.toggle('is-elevated', simulation.latency >= 250);
  };
  const updateSimulationStats = () => {
    const budget = getBudget();
    const usage = budget > 0 ? simulation.failures / budget * 100 : (simulation.failures > 0 ? 100 : 0);
    const clampedUsage = Math.min(100, usage);
    const usageLabel = `${clampedUsage.toFixed(1)}%`;
    animateNumber(byId('simFailures'), simulation.failures, value => fmt.format(Math.round(value)));
    animateNumber(byId('simBudgetUsage'), clampedUsage, value => `${value.toFixed(1)}%`);
    const budgetGauge = byId('simBudgetGaugeProgress');
    if (budgetGauge) budgetGauge.style.strokeDashoffset = String(100 - clampedUsage);
    if (byId('simBudgetRemaining')) {
      const remaining = Math.max(0, budget - simulation.failures);
      byId('simBudgetRemaining').textContent = simulation.failures >= budget ? 'Modeled budget exhausted' : `${fmt.format(remaining)} failed requests remain in budget`;
    }
    animateNumber(byId('simLatency'), simulation.latency, value => `${Math.round(value)} ms`, value => { byId('simLatency').innerHTML = `${Math.round(value)} <em>ms</em>`; });
    if (byId('simLatencyState')) byId('simLatencyState').textContent = simulation.latency >= 250 ? 'Degraded signal' : 'Within illustrative baseline';
    if (byId('simulationChartState')) byId('simulationChartState').textContent = simulation.latency >= 250 ? 'Latency elevated' : (simulation.failures > 0 ? 'Incident recorded · service responding' : 'Traffic stable');
    const usageMetric = byId('simBudgetUsage')?.closest('.simulation-metric');
    usageMetric?.classList.toggle('budget-warning', clampedUsage >= 50 && clampedUsage < 100);
    usageMetric?.classList.toggle('budget-exhausted', clampedUsage >= 100);
  };
  const recordSimulationSample = (latency, errors, label) => {
    simulation.latency = latency;
    simulation.samples.push({ latency, errors, label });
    if (simulation.samples.length > 32) simulation.samples.shift();
    renderSimulationChart();
    updateSimulationStats();
  };
  const resetSimulation = (announce = true) => {
    resetTerminal('simulationTerminalLog', 'INFO', 'Resetting synthetic signals to the baseline model.');
    simulation.failures = 0;
    simulation.latency = 84;
    simulation.events = 0;
    simulation.incidentCount = 0;
    simulation.samples = Array.from({ length: 20 }, (_, index) => ({ latency: 72 + ((index * 19) % 39), errors: 0, label: `Baseline ${index + 1}` }));
    simulation.timeline = [];
    addSimulationEvent('Baseline signals initialized.', 'info');
    recordSimulationSample(84, 0, 'Reset baseline');
    if (announce) showToast('DevOps reliability simulation reset.');
  };
  byId('injectIncident')?.addEventListener('click', () => {
    const dailyRequests = Number(sloRequests?.value || 100000);
    const errors = Math.max(1, Math.floor(dailyRequests * 0.01));
    simulation.failures += errors;
    simulation.incidentCount += 1;
    recordSimulationSample(320, errors, 'Error burst');
    addSimulationEvent(`Error burst: ${fmt.format(errors)} failed requests modeled.`, 'danger');
    showToast('Synthetic error burst added to the reliability simulation.');
  });
  byId('injectLatency')?.addEventListener('click', () => {
    const nextLatency = Math.min(400, Math.max(260, simulation.latency + 115));
    recordSimulationSample(nextLatency, 0, 'Latency spike');
    addSimulationEvent(`Latency elevated to ${Math.round(nextLatency)} ms p95.`, 'warning');
    showToast('Synthetic latency spike added.');
  });
  byId('recoverService')?.addEventListener('click', () => {
    recordSimulationSample(86, 0, 'Recovery');
    addSimulationEvent('Recovery observed; new samples returned to baseline. Past errors remain counted.', 'success');
    showToast('Simulation recovered. Historical errors remain in the budget.');
  });
  byId('resetSimulation')?.addEventListener('click', () => resetSimulation(true));

  const sloRing = byId('sloRing');
  const updateSlo = () => {
    if (!sloTarget || !sloWindow || !sloRequests) return;
    const target = Number(sloTarget.value);
    const days = Number(sloWindow.value);
    const requestsPerDay = Number(sloRequests.value);
    const errorRate = Math.max(0, 1 - target / 100);
    const windowSeconds = days * 86400;
    const downtimeSeconds = windowSeconds * errorRate;
    const requestBudget = Math.floor(requestsPerDay * days * errorRate + 1e-9);
    const dailyBudget = Math.floor(requestsPerDay * errorRate + 1e-9);
    const pct = `${target.toFixed(2)}%`;
    animateNumber(byId('sloRequestsValue'), requestsPerDay, value => fmt.format(Math.round(value)));
    animateNumber(byId('sloTargetOutput'), target, value => `${value.toFixed(2)}%`);
    byId('sloWindowOutput').textContent = `${days} ${days === 1 ? 'day' : 'days'}`;
    animateNumber(byId('sloDowntime'), downtimeSeconds, value => formatDuration(value));
    byId('sloDowntimeCaption').textContent = `Maximum unavailable time across ${days} days`;
    animateNumber(byId('sloErrorBudget'), requestBudget, value => fmt.format(Math.round(value)));
    byId('sloErrorCaption').textContent = `Unsuccessful requests across ${days} days`;
    animateNumber(byId('sloDailyAllowance'), dailyBudget, value => fmt.format(Math.round(value)));
    byId('sloTakeaway').textContent = `A ${pct} target allows ${formatDuration(downtimeSeconds)} of unavailability over ${days} days. At ${fmt.format(requestsPerDay)} requests per day, the modeled error budget is ${fmt.format(requestBudget)} unsuccessful requests. Use the budget to guide release risk and reliability work—not as a reason to spend every second.`;
    if (sloRing) {
      sloRing.style.setProperty('--slo-target', `${target}%`);
      sloRing.setAttribute('aria-label', `${pct} availability target`);
      const gaugeProgress = byId('sloGaugeProgress');
      if (gaugeProgress) gaugeProgress.style.strokeDashoffset = String(100 - target);
      sloRing.classList.remove('slo-pulse');
      if (!motionIsReduced()) requestAnimationFrame(() => sloRing.classList.add('slo-pulse'));
    }
    updateSimulationStats();
  };
  [sloTarget, sloWindow, sloRequests].filter(Boolean).forEach(control => {
    control.addEventListener('input', updateSlo);
    control.addEventListener('change', updateSlo);
  });
  if (sloTarget && sloWindow && sloRequests) {
    resetSimulation(false);
    updateSlo();
  }


  // Animated delivery runner. Failure injection stops the run at test and never reaches deploy.
  const pipelineStages = [...document.querySelectorAll('[data-pipeline-stage]')];
  let pipelineRunId = 0;
  const pipelineDelay = ms => new Promise(resolve => window.setTimeout(resolve, motionIsReduced() ? 0 : ms));
  const setPipelineState = (stage, state, label) => {
    stage.classList.remove('is-running', 'is-pass', 'is-fail', 'is-skipped');
    if (state) stage.classList.add(`is-${state}`);
    const status = stage.querySelector('.pipeline-stage-state');
    if (status) status.textContent = label;
  };
  const resetPipeline = () => {
    pipelineRunId += 1;
    resetTerminal('pipelineTerminalLog', 'INFO', 'Pipeline reset; awaiting a new run.');
    pipelineStages.forEach(stage => setPipelineState(stage, '', 'Waiting'));
    byId('pipelineRunState')?.classList.remove('is-running', 'is-fail', 'is-pass');
    if (byId('pipelineRunState')) byId('pipelineRunState').innerHTML = '<i></i> READY';
    if (byId('pipelineRunMessage')) byId('pipelineRunMessage').textContent = 'The pipeline is idle. Run a successful path or inject a failure at the test stage.';
    byId('runPipeline').disabled = false;
    byId('failPipeline').disabled = false;
  };
  const runPipeline = async failAtTest => {
    const runId = ++pipelineRunId;
    pipelineStages.forEach(stage => setPipelineState(stage, '', 'Waiting'));
    resetTerminal('pipelineTerminalLog', 'INFO', failAtTest ? 'Run requested with a deliberate test failure.' : 'Run requested; starting the delivery sequence.');
    const statePill = byId('pipelineRunState');
    statePill?.classList.remove('is-fail', 'is-pass');
    statePill?.classList.add('is-running');
    if (statePill) statePill.innerHTML = '<i></i> RUNNING';
    byId('runPipeline').disabled = true;
    byId('failPipeline').disabled = true;
    if (byId('pipelineRunMessage')) byId('pipelineRunMessage').textContent = failAtTest ? 'Running checks with an injected test failure.' : 'Executing source, validation, build, and deployment stages.';
    const stages = ['commit', 'test', 'build', 'deploy'];
    for (const stageName of stages) {
      if (runId !== pipelineRunId) return;
      const stage = pipelineStages.find(item => item.dataset.pipelineStage === stageName);
      if (!stage) continue;
      setPipelineState(stage, 'running', 'In progress');
      appendTerminalLine('pipelineTerminalLog', 'INFO', `${stageName.toUpperCase()}: stage started.`);
      await pipelineDelay(560);
      if (runId !== pipelineRunId) return;
      if (failAtTest && stageName === 'test') {
        setPipelineState(stage, 'fail', 'Failed');
        appendTerminalLine('pipelineTerminalLog', 'ERROR', 'TEST: a deliberately injected check failed.');
        stages.slice(stages.indexOf(stageName) + 1).forEach(skippedName => {
          const skipped = pipelineStages.find(item => item.dataset.pipelineStage === skippedName);
          if (skipped) setPipelineState(skipped, 'skipped', 'Blocked');
          appendTerminalLine('pipelineTerminalLog', 'WARN', `${skippedName.toUpperCase()}: blocked because validation failed.`);
        });
        statePill?.classList.remove('is-running');
        statePill?.classList.add('is-fail');
        if (statePill) statePill.innerHTML = '<i></i> FAILED SAFELY';
        appendTerminalLine('pipelineTerminalLog', 'ERROR', 'SAFE STOP: build and deploy were not executed.');
        byId('pipelineRunMessage').textContent = 'The test stage failed. Build and deploy were blocked; fix the change and rerun the pipeline.';
        byId('runPipeline').disabled = false;
        byId('failPipeline').disabled = false;
        return;
      }
      setPipelineState(stage, 'pass', 'Passed');
      appendTerminalLine('pipelineTerminalLog', 'SUCCESS', `${stageName.toUpperCase()}: stage passed.`);
    }
    if (runId !== pipelineRunId) return;
    statePill?.classList.remove('is-running');
    statePill?.classList.add('is-pass');
    if (statePill) statePill.innerHTML = '<i></i> COMPLETE';
    appendTerminalLine('pipelineTerminalLog', 'SUCCESS', 'COMPLETE: illustrative release flow reached post-deploy health verification.');
    byId('pipelineRunMessage').textContent = 'All stages passed in this illustrative run. A real release still needs environment-specific health verification.';
    byId('runPipeline').disabled = false;
    byId('failPipeline').disabled = false;
  };
  byId('runPipeline')?.addEventListener('click', () => runPipeline(false));
  byId('failPipeline')?.addEventListener('click', () => runPipeline(true));
  byId('resetPipeline')?.addEventListener('click', resetPipeline);

  // Kubernetes readiness simulation: a failing readiness probe removes traffic eligibility without implying the process stopped.
  const podNodes = [...document.querySelectorAll('[data-pod-state]')];
  const podConnectors = [...document.querySelectorAll('#podStateFlow .pod-state-connector')];
  let podMode = 'healthy';
  let podRunId = 0;
  const podDelay = ms => new Promise(resolve => window.setTimeout(resolve, motionIsReduced() ? 0 : ms));
  const setPodNode = (key, state, value) => {
    const node = podNodes.find(item => item.dataset.podState === key);
    if (!node) return;
    node.classList.remove('is-healthy', 'is-failing', 'is-checking', 'is-recovering');
    node.classList.add(state);
    const label = node.querySelector('.pod-state-value');
    if (label) label.textContent = value;
  };
  const setPodMessage = message => { if (byId('podRunMessage')) byId('podRunMessage').textContent = message; };
  const addPodEvent = (level, message) => appendTerminalLine('podTerminalLog', level, message);
  const renderPodState = mode => {
    podMode = mode;
    if (mode === 'healthy') {
      setPodNode('desired', 'is-healthy', '1 replica desired');
      setPodNode('pod', 'is-healthy', 'Running');
      setPodNode('readiness', 'is-healthy', 'Passing');
      setPodNode('endpoint', 'is-healthy', '1 ready endpoint');
      podConnectors.forEach(item => item.classList.remove('is-alert'));
      byId('simulatePodFailure').disabled = false;
      byId('recoverPod').disabled = true;
    } else if (mode === 'failing') {
      setPodNode('desired', 'is-healthy', '1 replica desired');
      setPodNode('pod', 'is-healthy', 'Running');
      setPodNode('readiness', 'is-failing', 'Probe failing');
      setPodNode('endpoint', 'is-failing', '0 ready endpoints');
      podConnectors.forEach((item, index) => item.classList.toggle('is-alert', index >= 2));
      byId('simulatePodFailure').disabled = true;
      byId('recoverPod').disabled = false;
    } else if (mode === 'recovering') {
      setPodNode('desired', 'is-healthy', '1 replica desired');
      setPodNode('pod', 'is-healthy', 'Running');
      setPodNode('readiness', 'is-recovering', 'Checking');
      setPodNode('endpoint', 'is-recovering', 'Waiting to rejoin');
      podConnectors.forEach(item => item.classList.remove('is-alert'));
      byId('simulatePodFailure').disabled = true;
      byId('recoverPod').disabled = true;
    }
  };
  byId('simulatePodFailure')?.addEventListener('click', () => {
    if (podMode !== 'healthy') return;
    renderPodState('failing');
    setPodMessage('The container process is still running, but readiness is failing. The Service removes this pod from ready endpoints until it passes again.');
    addPodEvent('ERROR', 'Readiness probe failed; pod remains Running but is not Ready.');
    addPodEvent('WARN', 'Service endpoint eligibility dropped to 0 for this replica.');
  });
  byId('recoverPod')?.addEventListener('click', async () => {
    if (podMode !== 'failing') return;
    const runId = ++podRunId;
    renderPodState('recovering');
    setPodMessage('Recovery check in progress: the process is running and readiness is being evaluated again.');
    addPodEvent('INFO', 'Recovery requested; readiness checks are being re-evaluated.');
    await podDelay(520);
    if (runId !== podRunId) return;
    renderPodState('healthy');
    setPodMessage('Recovery verified in the simulation. Readiness passes and the Service may include one ready endpoint again.');
    addPodEvent('SUCCESS', 'Readiness probe passed; one endpoint is eligible for traffic again.');
  });
  byId('resetPod')?.addEventListener('click', () => {
    podRunId += 1;
    renderPodState('healthy');
    setPodMessage('Healthy baseline: the pod is running, the readiness probe passes, and one endpoint is eligible for traffic.');
    resetTerminal('podTerminalLog', 'INFO', 'Reset to healthy baseline: 1 desired replica, 1 ready endpoint.');
  });


  // The technology index is a relationship explorer, not a proficiency score.
  const toolDefinitions = {
    'Linux': {domain:'FOUNDATION / SYSTEMS', description:'The operating-system layer for processes, permissions, services, filesystems, namespaces, resource limits, and host troubleshooting.', relations:['Bash','systemd','SSH','Containers'], anchor:'#focus'},
    'Bash': {domain:'FOUNDATION / AUTOMATION', description:'A command interpreter for composing Unix tools and automating system tasks. Safe scripts validate inputs, quote expansions, handle exit status, and are repeatable.', relations:['Linux','Git','CI runners','Python'], anchor:'#focus'},
    'Python': {domain:'FOUNDATION / PROGRAMMING', description:'A general-purpose language for API clients, automation, tests, data transformation, and service tooling. Use environments, dependencies, types, tests, and structured errors.', relations:['APIs','Automation','Testing','CI/CD'], anchor:'#focus'},
    'Git': {domain:'FOUNDATION / CHANGE CONTROL', description:'A distributed version-control system that records source history and enables reviewable change, branching, tagging, and reproducible release references.', relations:['Pull requests','CI/CD','GitOps','Release tags'], anchor:'#focus'},
    'TCP/IP': {domain:'FOUNDATION / NETWORKING', description:'The protocol suite that carries application traffic through addressing, routing, transport, and application protocols. Diagnose each layer independently.', relations:['DNS','TLS','HTTP','Load balancing'], anchor:'#focus'},
    'Terraform': {domain:'DELIVERY / INFRASTRUCTURE AS CODE', description:'A declarative provisioning tool that plans changes across provider APIs while tracking resource identity in state. Review plans and protect state before apply.', relations:['Cloud APIs','IAM','Remote state','Policy'], anchor:'#delivery-model'},
    'Ansible': {domain:'DELIVERY / CONFIGURATION', description:'An agentless automation engine that uses inventory, playbooks, modules, roles, and handlers to converge hosts toward repeatable configuration.', relations:['Linux','SSH','Idempotency','Vault'], anchor:'#delivery-model'},
    'Docker': {domain:'DELIVERY / CONTAINERIZATION', description:'Builds OCI-compatible images and runs isolated processes using namespaces, cgroups, layered filesystems, networks, and volumes.', relations:['BuildKit','OCI registry','Kubernetes','SBOM'], anchor:'#delivery-model'},
    'GitHub Actions': {domain:'DELIVERY / CI PLATFORM', description:'Event-driven hosted or self-hosted runners execute jobs, workflows, reusable actions, and deployment environments. Scope permissions and credential trust carefully.', relations:['Git','Buildx','OIDC','GHCR'], anchor:'#delivery-model'},
    'Jenkins': {domain:'DELIVERY / CI PLATFORM', description:'An extensible automation server using controllers, agents, pipelines, plugins, credentials, and shared libraries. Plugin and controller maintenance are operational responsibilities.', relations:['Pipeline as code','Agents','Credentials','Artifacts'], anchor:'#delivery-model'},
    'GitLab CI': {domain:'DELIVERY / CI PLATFORM', description:'A pipeline system based on stages, jobs, runners, artifacts, rules, and environments, integrated with GitLab source and merge-request workflows.', relations:['Git','Runners','Artifacts','Environments'], anchor:'#delivery-model'},
    'AWS': {domain:'DELIVERY / CLOUD PLATFORM', description:'Cloud infrastructure services for networks, identity, compute, storage, registries, managed Kubernetes, databases, and observability. Design around shared responsibility and cost.', relations:['VPC','IAM','ECR','EKS'], anchor:'#delivery-model'},
    'Azure': {domain:'DELIVERY / CLOUD PLATFORM', description:'Microsoft cloud services for identity, virtual networks, compute, storage, container registries, AKS, and operations. Map control-plane and identity boundaries explicitly.', relations:['Entra ID','VNet','ACR','AKS'], anchor:'#delivery-model'},
    'Google Cloud': {domain:'DELIVERY / CLOUD PLATFORM', description:'Google Cloud services for IAM, VPC, compute, object storage, Artifact Registry, GKE, and Cloud Operations. Understand IAM hierarchy and network design.', relations:['IAM','VPC','GKE','Artifact Registry'], anchor:'#delivery-model'},
    'Kubernetes': {domain:'PLATFORM / ORCHESTRATION', description:'A declarative orchestration platform whose control plane stores and reconciles desired state while worker nodes run container workloads.', relations:['Docker / OCI','Helm','CNI / CSI','Prometheus'], anchor:'#advanced'},
    'Helm': {domain:'PLATFORM / PACKAGING', description:'A templating and release system for Kubernetes applications. Charts package templates and defaults; values adapt them to a target environment.', relations:['Kubernetes','Values schema','Argo CD','Kustomize'], anchor:'#advanced'},
    'Argo CD': {domain:'PLATFORM / GITOPS', description:'A Kubernetes continuous-delivery controller that compares repository-defined desired state with cluster state and reports or reconciles drift.', relations:['Git','Helm','Sync policy','RBAC'], anchor:'#advanced'},
    'Flux CD': {domain:'PLATFORM / GITOPS', description:'A toolkit of Kubernetes controllers that reconcile source, Kustomize, Helm, and other declared resources from versioned sources.', relations:['Git','Kustomize','Helm','Reconciliation'], anchor:'#advanced'},
    'Backstage': {domain:'PLATFORM / DEVELOPER EXPERIENCE', description:'An extensible developer portal with a software catalog, documentation, templates, and integrations. Value comes from maintained golden paths and clear ownership.', relations:['Service catalog','Scaffolder','Templates','CI/CD'], anchor:'#advanced'},
    'Prometheus': {domain:'RELIABILITY / METRICS', description:'A pull-based time-series monitoring system with exporters, scrape targets, labels, PromQL, recording rules, and alert rules.', relations:['Grafana','Alertmanager','OpenTelemetry','SLOs'], anchor:'#reliability'},
    'Grafana': {domain:'RELIABILITY / VISUALIZATION', description:'A visualization and alerting platform that queries metrics, logs, traces, and other data sources to make operational questions inspectable.', relations:['Prometheus','Loki','Tempo','Dashboards'], anchor:'#reliability'},
    'OpenTelemetry': {domain:'RELIABILITY / TELEMETRY', description:'A vendor-neutral set of APIs, SDKs, semantic conventions, and Collector components for generating, processing, and exporting telemetry.', relations:['Metrics','Logs','Traces','Collector'], anchor:'#reliability'},
    'SLOs': {domain:'RELIABILITY / SERVICE OBJECTIVES', description:'Service-level objectives define target outcomes over a window using explicit indicators and eligibility rules. Error budgets connect reliability with change risk.', relations:['SLIs','SLAs','Alerting','Incident response'], anchor:'#reliability'},
    'Trivy': {domain:'SECURITY / VULNERABILITY SCANNING', description:'A scanner for container images, filesystems, repositories, and configuration. Findings need policy, triage, ownership, and exception management.', relations:['Container images','SBOM','CI gates','IaC'], anchor:'#reliability'},
    'OIDC': {domain:'SECURITY / FEDERATED IDENTITY', description:'An identity layer often used with short-lived workload federation. CI jobs can exchange trusted identity tokens for narrowly scoped cloud credentials.', relations:['IAM roles','GitHub Actions','Trust policy','Short-lived credentials'], anchor:'#reliability'},
    'Vault': {domain:'SECURITY / SECRETS', description:'A secrets-management pattern and product category for issuing, storing, leasing, rotating, and auditing sensitive credentials and encryption material.', relations:['Dynamic secrets','Rotation','Workload identity','Audit'], anchor:'#reliability'},
    'NGINX': {domain:'PLATFORM / EDGE ROUTING', description:'A web server and reverse proxy used for TLS termination, routing, caching, request limits, and connection management at the service edge.', relations:['DNS','TLS','Load balancing','HTTP'], anchor:'#supporting'}
  };
  const toolList = document.getElementById('toolList');
  const toolButtons = [...(toolList?.querySelectorAll('[data-tool]') || [])];
  const toolSearch = document.getElementById('toolSearch');
  const detailDomain = document.getElementById('toolDetailDomain');
  const detailTitle = document.getElementById('toolDetailTitle');
  const detailText = document.getElementById('toolDetailText');
  const detailRelations = document.getElementById('toolDetailRelations');
  const detailLink = document.getElementById('toolDetailLink');
  let activeToolFilter = 'all';
  const selectTool = name => {
    const item = toolDefinitions[name];
    if (!item) return;
    toolButtons.forEach(button => {
      const selected = button.dataset.tool === name;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    if (detailDomain) detailDomain.textContent = item.domain;
    if (detailTitle) detailTitle.textContent = name;
    if (detailText) detailText.textContent = item.description;
    if (detailRelations) {
      detailRelations.replaceChildren(...item.relations.map(relation => {
        const tag = document.createElement('span'); tag.textContent = relation; return tag;
      }));
    }
    if (detailLink) {
      detailLink.href = item.anchor;
      detailLink.textContent = `Explore related section ↗`;
    }
  };
  const applyToolFilters = () => {
    const query = (toolSearch?.value || '').trim().toLowerCase();
    let visibleCount = 0;
    toolButtons.forEach(button => {
      const name = button.dataset.tool || '';
      const definition = toolDefinitions[name];
      const matchesDomain = activeToolFilter === 'all' || button.dataset.domain === activeToolFilter;
      const haystack = `${name} ${button.textContent} ${definition?.description || ''}`.toLowerCase();
      const visible = matchesDomain && haystack.includes(query);
      button.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    let empty = toolList?.querySelector('.eng-tool-empty');
    if (toolList && visibleCount === 0) {
      if (!empty) { empty = document.createElement('p'); empty.className = 'eng-tool-empty'; empty.textContent = 'No matching technologies. Try a different term or domain.'; toolList.appendChild(empty); }
    } else empty?.remove();
    if (toolButtons.every(button => button.hidden)) return;
    const selected = toolButtons.find(button => button.classList.contains('is-selected') && !button.hidden);
    if (!selected) {
      const first = toolButtons.find(button => !button.hidden);
      if (first) selectTool(first.dataset.tool);
    }
  };
  document.querySelectorAll('[data-tool-filter]').forEach(button => button.addEventListener('click', () => {
    activeToolFilter = button.dataset.toolFilter || 'all';
    document.querySelectorAll('[data-tool-filter]').forEach(item => {
      const active = item === button; item.classList.toggle('is-active', active); item.setAttribute('aria-pressed', String(active));
    });
    applyToolFilters();
  }));
  toolButtons.forEach(button => button.addEventListener('click', () => selectTool(button.dataset.tool)));
  toolSearch?.addEventListener('input', applyToolFilters);
  if (toolButtons.length) { selectTool('Linux'); applyToolFilters(); }

  // Keyboard-accessible command palette for the single integrated portfolio.
  const commandDialog = document.getElementById('commandDialog');
  const commandTrigger = document.getElementById('commandTrigger');
  const commandSearch = document.getElementById('commandSearch');
  const commandResults = document.getElementById('commandResults');
  const commandEmpty = document.getElementById('commandEmpty');
  const commandClose = document.getElementById('commandClose');
  const goTo = selector => {
    const target = document.querySelector(selector);
    target?.scrollIntoView({behavior: motionIsReduced() ? 'auto' : 'smooth', block:'start'});
  };
  const commands = [
    {label:'Explore engineering mindset',group:'FOUNDATION',keywords:'about education principles learning',run:()=>goTo('#about')},
    {label:'Open Linux and networking foundations',group:'FOUNDATION',keywords:'linux operating systems networking shell bash python git',run:()=>goTo('#focus')},
    {label:'Explore cloud infrastructure architecture',group:'CLOUD',keywords:'aws azure google cloud vpc vnet subnet route nat gateway load balancer iam dns tls availability disaster recovery',run:()=>goTo('#cloud-infrastructure')},
    {label:'Explore CI/CD delivery engineering',group:'DELIVERY',keywords:'pipeline ci cd tests security build deploy jenkins github actions gitlab',run:()=>goTo('#delivery-model')},
    {label:'Explore Terraform and infrastructure as code',group:'IaC',keywords:'terraform opentofu cloudformation ansible modules state drift plan apply',run:()=>goTo('#iac')},
    {label:'Explore Docker and Kubernetes',group:'CONTAINERS',keywords:'docker image container compose kubernetes pods deployments services helm ingress rbac',run:()=>goTo('#containers')},
    {label:'Explore platform engineering and GitOps',group:'PLATFORM',keywords:'platform backstage golden paths developer portal self service gitops argo flux',run:()=>goTo('#platform-engineering')},
    {label:'Explore Kubernetes and platform foundations',group:'PLATFORM',keywords:'kubernetes helm gitops argo flux backstage service mesh microservices',run:()=>goTo('#advanced')},
    {label:'Open synthetic observability dashboard',group:'RELIABILITY',keywords:'prometheus grafana opentelemetry metrics logs traces cpu memory latency errors uptime',run:()=>goTo('#observability-dashboard')},
    {label:'Explore SRE and DevSecOps',group:'RELIABILITY',keywords:'slo sli incidents security vulnerabilities iam secrets encryption',run:()=>goTo('#reliability')},
    {label:'Explore cloud security and DevSecOps',group:'SECURITY',keywords:'secure cicd policy scanner sbom sast sca vulnerability iam oicd',run:()=>goTo('#security-devsecops')},
    {label:'Estimate illustrative cloud costs',group:'FINOPS',keywords:'cloud cost calculator estimate finops budget tagging right sizing storage egress',run:()=>goTo('#finops')},
    {label:'Browse the 12 architecture patterns',group:'ARCHITECTURE',keywords:'three tier vpc subnet docker kubernetes terraform gitops microservices dr disaster recovery',run:()=>goTo('#architecture-gallery')},
    {label:'Open interactive engineering workbench',group:'WORKBENCH',keywords:'simulate simulator terraform pipeline slo incident pod cost',run:()=>goTo('#workbench')},
    {label:'Explore APIs, databases and traffic management',group:'SUPPORTING',keywords:'api databases dns tls nginx load balancer storage queues finops',run:()=>goTo('#supporting')},
    {label:'Open integrated engineering reference patterns',group:'REFERENCE',keywords:'laboratory observability terraform kubernetes gitops ghcr backstage',run:()=>goTo('#work')},
    {label:'Run the CI/CD pipeline simulation',group:'DELIVERY',keywords:'pipeline ci cd tests failure build deploy simulation',run:()=>{goTo('#pipelinePlayground');window.setTimeout(()=>document.getElementById('runPipeline')?.click(),motionIsReduced()?0:350);}},
    {label:'Simulate Kubernetes readiness failure',group:'PLATFORM',keywords:'kubernetes pod probe readiness endpoint simulation failure',run:()=>{goTo('#podHealthPlayground');window.setTimeout(()=>document.getElementById('simulatePodFailure')?.click(),motionIsReduced()?0:350);}},
    {label:'Open technology relationship explorer',group:'TOOLS',keywords:'technology map search tools stack',run:()=>goTo('#stack')},
    {label:'Open learning progression',group:'LEARNING',keywords:'roadmap sequence progression',run:()=>goTo('#journey')},
    {label:'Switch monochrome theme',group:'PREFERENCES',keywords:'theme dark light appearance',run:()=>themeToggle?.click()},
    {label:'Open accessibility settings',group:'PREFERENCES',keywords:'accessibility motion contrast preferences',run:()=>openAccessibilitySettings()},
    {label:'Show keyboard shortcuts',group:'PREFERENCES',keywords:'keyboard shortcuts hotkeys keys command',run:()=>openKeyboardShortcuts()},
    {label:'Download Technical Portfolio',group:'PROFILE',keywords:'download technical portfolio pdf',run:()=>document.querySelector('.cv-shortcut')?.click()},
    {label:'Go to contact',group:'CONTACT',keywords:'contact email connect github',run:()=>goTo('#contact')}
  ];
  let activeCommandIndex = 0;
  let renderedCommands = [];
  const syncCommandSelection = () => {
    commandResults?.querySelectorAll('.command-result').forEach((button, index) => {
      const active = index === activeCommandIndex;
      button.setAttribute('aria-selected', String(active));
      if (active) button.scrollIntoView({block:'nearest'});
    });
    if (commandSearch) {
      const activeOption = commandResults?.querySelector(`#command-option-${activeCommandIndex}`);
      commandSearch.setAttribute('aria-expanded', String(Boolean(commandDialog?.open && renderedCommands.length)));
      if (activeOption) commandSearch.setAttribute('aria-activedescendant', activeOption.id);
      else commandSearch.removeAttribute('aria-activedescendant');
    }
  };
  const closeCommandPalette = () => {
    if (commandDialog?.open) commandDialog.close();
    commandTrigger?.focus({preventScroll:true});
  };
  const renderCommands = () => {
    if (!commandResults || !commandSearch) return;
    const query = commandSearch.value.trim().toLowerCase();
    renderedCommands = commands.filter(command => `${command.label} ${command.group} ${command.keywords}`.toLowerCase().includes(query));
    activeCommandIndex = Math.max(0, Math.min(activeCommandIndex, renderedCommands.length - 1));
    commandResults.replaceChildren();
    if (commandEmpty) commandEmpty.hidden = renderedCommands.length > 0;
    renderedCommands.forEach((command, index) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'command-result'; button.id = `command-option-${index}`;
      button.setAttribute('role','option'); button.setAttribute('aria-selected',String(index===activeCommandIndex));
      const label=document.createElement('span'); label.textContent=command.label;
      const group=document.createElement('small'); group.textContent=command.group;
      const arrow=document.createElement('span'); arrow.className='command-result-arrow'; arrow.textContent='↗';
      button.append(label,group,arrow);
      button.addEventListener('click',()=>{closeCommandPalette();window.setTimeout(command.run,20);});
      button.addEventListener('mouseenter',()=>{activeCommandIndex=index;syncCommandSelection();});
      commandResults.appendChild(button);
    });
    syncCommandSelection();
  };
  const openCommandPalette = () => {
    if (!commandDialog || !commandSearch) return;
    if (typeof commandDialog.showModal === 'function') commandDialog.showModal();
    else commandDialog.setAttribute('open','');
    commandSearch.value=''; activeCommandIndex=0; renderCommands();
    window.setTimeout(()=>commandSearch.focus(),0);
  };
  commandTrigger?.addEventListener('click',openCommandPalette);
  commandClose?.addEventListener('click',closeCommandPalette);
  commandDialog?.addEventListener('cancel',event=>{event.preventDefault();closeCommandPalette();});
  commandDialog?.addEventListener('click',event=>{if(event.target===commandDialog)closeCommandPalette();});
  commandSearch?.addEventListener('input',()=>{activeCommandIndex=0;renderCommands();});
  commandSearch?.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeCommandPalette();}
    else if(event.key==='ArrowDown'){event.preventDefault();activeCommandIndex=Math.min(renderedCommands.length-1,activeCommandIndex+1);syncCommandSelection();}
    else if(event.key==='ArrowUp'){event.preventDefault();activeCommandIndex=Math.max(0,activeCommandIndex-1);syncCommandSelection();}
    else if(event.key==='Enter'){event.preventDefault();renderedCommands[activeCommandIndex]&& (closeCommandPalette(),window.setTimeout(renderedCommands[activeCommandIndex].run,20));}
  });
  document.addEventListener('keydown', event => {
    const key = event.key.toLowerCase();
    const target = event.target;
    const isEditable = target instanceof HTMLElement && (target.isContentEditable || target.matches('input, textarea, select, [role="textbox"]'));
    if ((event.ctrlKey || event.metaKey) && key === 'k') {
      event.preventDefault();
      if (commandDialog?.open) closeCommandPalette();
      else openCommandPalette();
      return;
    }
    if (event.key === '?' && !isEditable && !commandDialog?.open && !accessibilityDialog?.open) {
      event.preventDefault();
      openKeyboardShortcuts();
      return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    if (isEditable || commandDialog?.open || accessibilityDialog?.open) return;
    if (key === 't') {
      event.preventDefault();
      toggleTheme();
    } else if (key === 'c') {
      event.preventDefault();
      goTo('#contact');
    } else if (key === 'a') {
      event.preventDefault();
      openAccessibilitySettings();
    }
  });


  // Architecture gallery filters operate on the already-rendered conceptual diagrams.
  const architectureCards = [...document.querySelectorAll('.architecture-card[data-architecture]')];
  const architectureStatus = document.getElementById('architectureFilterStatus');
  document.querySelectorAll('[data-architecture-filter]').forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.architectureFilter || 'all';
      document.querySelectorAll('[data-architecture-filter]').forEach(option => {
        const active = option === button;
        option.classList.toggle('is-active', active);
        option.setAttribute('aria-pressed', String(active));
      });
      let visible = 0;
      architectureCards.forEach(card => {
        const show = filter === 'all' || card.dataset.architecture === filter;
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (architectureStatus) {
        const label = filter === 'all' ? 'conceptual architecture patterns' : `${filter} patterns`;
        architectureStatus.textContent = `Showing ${visible} ${label}.`;
      }
    });
  });

  // Illustrative cloud cost estimator. Rates are fictional teaching inputs, not provider pricing.
  const finopsInputs = {
    compute: document.getElementById('finopsCompute'),
    storage: document.getElementById('finopsStorage'),
    egress: document.getElementById('finopsEgress')
  };
  const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  const countFormat = value => new Intl.NumberFormat('en-US').format(value);
  const finopsCalculate = () => {
    if (!finopsInputs.compute || !finopsInputs.storage || !finopsInputs.egress) return;
    const computeQty = Number(finopsInputs.compute.value);
    const storageQty = Number(finopsInputs.storage.value);
    const egressQty = Number(finopsInputs.egress.value);
    const costs = {
      compute: computeQty * 0.04,
      storage: storageQty * 0.025,
      egress: egressQty * 0.08
    };
    const total = costs.compute + costs.storage + costs.egress;
    const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    setText('finopsComputeOutput', countFormat(computeQty));
    setText('finopsStorageOutput', countFormat(storageQty));
    setText('finopsEgressOutput', countFormat(egressQty));
    setText('finopsTotal', money(total));
    setText('finopsComputeCost', money(costs.compute));
    setText('finopsStorageCost', money(costs.storage));
    setText('finopsEgressCost', money(costs.egress));
    const maxCost = Math.max(total, 1);
    [['finopsComputeBar', costs.compute], ['finopsStorageBar', costs.storage], ['finopsEgressBar', costs.egress]].forEach(([id, amount]) => {
      const bar = document.getElementById(id);
      if (bar) bar.style.width = `${(amount / maxCost) * 100}%`;
    });
  };
  Object.values(finopsInputs).forEach(input => {
    input?.addEventListener('input', finopsCalculate);
    input?.addEventListener('change', finopsCalculate);
  });
  finopsCalculate();

  // Terraform lifecycle workbench: a local state machine, not a real provider operation.
  const terraformSteps = [...document.querySelectorAll('#terraformSimSteps li')];
  const terraformNext = document.getElementById('terraformSimNext');
  const terraformComplete = document.getElementById('terraformSimComplete');
  const terraformReset = document.getElementById('terraformSimReset');
  const terraformStatus = document.getElementById('terraformSimStatus');
  const terraformMessage = document.getElementById('terraformSimMessage');
  const terraformStages = [
    { name: 'WRITE', message: 'Configuration is authored in version control. Keep providers, modules, variables, and outputs reviewable.' },
    { name: 'INIT', message: 'The working directory initializes provider plugins, modules, and the configured backend.' },
    { name: 'VALIDATE', message: 'Configuration structure and internal references are checked before a plan is generated.' },
    { name: 'PLAN', message: 'A proposed set of infrastructure changes is calculated against the current state and refreshed objects.' },
    { name: 'REVIEW', message: 'A human reviews destructive actions, policy results, cost implications, and approval requirements.' },
    { name: 'APPLY', message: 'An authorized apply requests the approved changes through provider APIs. This simulator does not call any API.' },
    { name: 'MONITOR', message: 'After a real apply, monitor infrastructure health, costs, policy, and drift; plan and remediate discrepancies.' }
  ];
  let terraformStage = 0;
  const renderTerraformStage = () => {
    terraformSteps.forEach((step, index) => {
      step.classList.toggle('is-done', index < terraformStage);
      step.classList.toggle('is-current', index === terraformStage);
      if (index === terraformStage) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
    if (terraformStatus) terraformStatus.textContent = terraformStage === terraformStages.length - 1 ? 'COMPLETE / LOCAL' : `STAGE ${terraformStage + 1} OF ${terraformStages.length} · ${terraformStages[terraformStage].name}`;
    if (terraformMessage) terraformMessage.textContent = terraformStages[terraformStage].message;
    if (terraformNext) terraformNext.disabled = terraformStage >= terraformStages.length - 1;
    if (terraformComplete) terraformComplete.disabled = terraformStage >= terraformStages.length - 1;
  };
  terraformNext?.addEventListener('click', () => {
    terraformStage = Math.min(terraformSteps.length - 1, terraformStage + 1);
    renderTerraformStage();
  });
  terraformComplete?.addEventListener('click', () => {
    terraformStage = terraformSteps.length - 1;
    renderTerraformStage();
  });
  terraformReset?.addEventListener('click', () => {
    terraformStage = 0;
    renderTerraformStage();
  });
  renderTerraformStage();
})();
