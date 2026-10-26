(() => {
  'use strict';
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const themeToggle = document.getElementById('themeToggle');
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  const progress = document.getElementById('scrollProgress');
  const profilePhoto = document.getElementById('profilePhoto');
  const toast = document.getElementById('toast');
  let toastTimer;

  // Keep the small contact portrait resilient without relying on a remote URL.
  // If the orbit crop fails, use the optimized primary portrait, then the local SVG.
  const contactOrbitPhoto = document.getElementById('contactOrbitPhoto');
  if (contactOrbitPhoto) {
    const orbitPhotoFallbacks = [
      contactOrbitPhoto.dataset.localFallbackSrc,
      contactOrbitPhoto.dataset.placeholderSrc || 'assets/portrait-placeholder.svg'
    ].filter(Boolean);
    let orbitPhotoFallbackIndex = 0;
    contactOrbitPhoto.addEventListener('error', () => {
      if (orbitPhotoFallbackIndex < orbitPhotoFallbacks.length) {
        contactOrbitPhoto.src = orbitPhotoFallbacks[orbitPhotoFallbackIndex++];
      } else {
        contactOrbitPhoto.hidden = true;
      }
    });
  }

  // Pause the orbital layer animations when the visualization is far outside the viewport.
  // CSS separately respects prefers-reduced-motion for visitors who request less motion.
  const contactOrbit = document.querySelector('.contact-orbit');
  if (contactOrbit && 'IntersectionObserver' in window) {
    const contactOrbitVisibilityObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => contactOrbit.classList.toggle('is-offscreen', !entry.isIntersecting));
    }, { rootMargin: '100px 0px', threshold: 0.01 });
    contactOrbitVisibilityObserver.observe(contactOrbit);
  }

  // Repository links target the recommended public repo name. Change this once if you choose another repo name.
  const sourceRepositoryRoot = 'https://github.com/MD-SH0HAN/PORTFOLIO';
  document.querySelectorAll('[data-repository-path]').forEach(link => {
    const repositoryPath = link.dataset.repositoryPath;
    if (repositoryPath) link.href = `${sourceRepositoryRoot}/${repositoryPath.replace(/^\/+/, '')}`;
  });

  // One authoritative source for all public profile destinations and contact emails.
  // Portfolio and GitHub remain in the compact professional-link row as well as in the footer hub.
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
  const profileHref = key => profileDestinations.find(profile => profile.key === key)?.href || '#';
  const emailAddress = key => emailDestinations.find(email => email.key === key)?.address || '';
  document.querySelectorAll('[data-email]').forEach(link => { const address = emailAddress(link.dataset.email); if (address) link.href = `mailto:${address}`; });

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
    link.href = profileHref(link.dataset.profile);
    const iconMarkup = profileIconMarkup[link.dataset.profile];
    if (iconMarkup && !link.querySelector('svg')) {
      link.insertAdjacentHTML('afterbegin', iconMarkup);
      link.classList.add('has-profile-icon');
    }
  });

  const buildProfileLink = (profile, compact = false, iconOnly = false, order = 0) => {
    const link = document.createElement('a');
    link.href = profile.href;
    link.classList.add(compact ? 'social-icon-link' : 'profile-badge-link');
    link.insertAdjacentHTML('afterbegin', profileIconMarkup[profile.key] || profileIconMarkup.portfolio);
    if (!iconOnly) {
      const label = document.createElement('span');
      label.textContent = compact ? profile.short : `${profile.label} ↗`;
      link.appendChild(label);
    }
    link.title = profile.label;
    link.setAttribute('aria-label', `${profile.label} profile (opens in a new tab)`);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.dataset.profileKey = profile.key;
    link.dataset.profileGroup = profile.group;
    if (iconOnly) {
      link.classList.add('footer-profile-link');
      link.style.setProperty('--profile-order', String(order));
    }
    return link;
  };

  const profileBadgeLinks = document.getElementById('profileBadgeLinks');
  profileDestinations.filter(profile => profile.professional).forEach(profile => profileBadgeLinks?.appendChild(buildProfileLink(profile)));
  const contactSocialLinks = document.getElementById('contactSocialLinks');
  profileDestinations.filter(profile => profile.group === 'social').forEach(profile => contactSocialLinks?.appendChild(buildProfileLink(profile, true)));

  const renderFooterProfiles = (elementId, group) => {
    const container = document.getElementById(elementId);
    if (!container) return;
    profileDestinations.filter(profile => profile.group === group).forEach((profile, index) => {
      container.appendChild(buildProfileLink(profile, true, true, index));
    });
  };
  renderFooterProfiles('footerSocialLinks', 'social');
  renderFooterProfiles('footerDeveloperLinks', 'developer');
  renderFooterProfiles('footerWebsiteLinks', 'website');

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
    if (reducedMotion.matches || typeof document.startViewTransition !== 'function') return update();
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
    withViewTransition(() => {
      root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
      try { localStorage.setItem('shohan-theme', root.dataset.theme); } catch (_) { /* Storage may be unavailable for local files. */ }
      updateThemeControl();
    });
    showToast(`Switched to ${root.dataset.theme} theme.`);
  };
  updateThemeControl();
  themeToggle?.addEventListener('click', toggleTheme);

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

  // Scroll progress and active navigation.
  const updateScrollUI = () => {
    if (!progress) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const amount = scrollable > 0 ? Math.min(100, Math.max(0, window.scrollY / scrollable * 100)) : 0;
    progress.style.transform = `scaleX(${amount / 100})`;
    const journeyTrack = document.querySelector('.journey-track');
    if (journeyTrack) {
      const rect = journeyTrack.getBoundingClientRect();
      const trackProgress = rect.height > 0 ? Math.max(0, Math.min(100, ((window.innerHeight * 0.68 - rect.top) / rect.height) * 100)) : 0;
      journeyTrack.style.setProperty('--journey-progress', `${trackProgress}%`);
    }
    const architectureSection = document.getElementById('architecture');
    if (architectureSection) {
      const rect = architectureSection.getBoundingClientRect();
      const start = window.innerHeight * 0.86;
      const end = -Math.max(280, rect.height * 0.48);
      const drawProgress = reducedMotion.matches ? 1 : Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
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
  updateScrollUI();
  const navLinks = [...document.querySelectorAll('[data-nav]')];
  const sections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-28% 0px -58% 0px', threshold: 0 });
    sections.forEach(section => navObserver.observe(section));
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
  const portraitOrbitSystem = document.querySelector('.portrait-orbit-system');

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

  if (heroVisual && portraitFrame && !reducedMotion.matches && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let heroPointerFrame = 0;
    let latestHeroPointer = null;
    heroVisual.addEventListener('pointermove', event => {
      latestHeroPointer = { clientX: event.clientX, clientY: event.clientY };
      if (heroPointerFrame) return;
      heroPointerFrame = window.requestAnimationFrame(() => {
        heroPointerFrame = 0;
        if (!latestHeroPointer) return;
        const bounds = heroVisual.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        const x = Math.max(0, Math.min(1, (latestHeroPointer.clientX - bounds.left) / bounds.width));
        const y = Math.max(0, Math.min(1, (latestHeroPointer.clientY - bounds.top) / bounds.height));
        heroVisual.style.setProperty('--pointer-x', `${x * 100}%`);
        heroVisual.style.setProperty('--pointer-y', `${y * 100}%`);
        heroVisual.classList.add('is-pointer-active');
        portraitFrame.style.setProperty('--hero-tilt-x', `${(x - 0.5) * 3.6}deg`);
        portraitFrame.style.setProperty('--hero-tilt-y', `${(0.5 - y) * 2.8}deg`);
        if (portraitOrbitSystem) {
          portraitOrbitSystem.style.setProperty('--orbit-pointer-x', `${(x - 0.5) * 5}deg`);
          portraitOrbitSystem.style.setProperty('--orbit-pointer-y', `${(0.5 - y) * 4}deg`);
        }
      });
    }, { passive: true });
    heroVisual.addEventListener('pointerleave', () => {
      latestHeroPointer = null;
      if (heroPointerFrame) window.cancelAnimationFrame(heroPointerFrame);
      heroPointerFrame = 0;
      heroVisual.style.setProperty('--pointer-x', '50%');
      heroVisual.style.setProperty('--pointer-y', '50%');
      heroVisual.classList.remove('is-pointer-active');
      portraitFrame.style.setProperty('--hero-tilt-x', '0deg');
      portraitFrame.style.setProperty('--hero-tilt-y', '0deg');
      if (portraitOrbitSystem) {
        portraitOrbitSystem.style.setProperty('--orbit-pointer-x', '0deg');
        portraitOrbitSystem.style.setProperty('--orbit-pointer-y', '0deg');
      }
    }, { passive: true });
  }

  // Keep card interactions transform-only; per-card pointer tracking added unnecessary work
  // and did not improve keyboard/touch use. Hover polish is handled entirely in CSS.
  if (!reducedMotion.matches && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.principle-card, .focus-card, .project-card, .stack-row').forEach(card => {
      card.classList.add('motion-card');
    });
  }

  // Project filtering uses native View Transitions where available and CSS out/in states otherwise.
  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const projectCards = [...document.querySelectorAll('.project-card[data-category]')];
  const applyFilterInstantly = filter => {
    filterButtons.forEach(item => {
      const active = item.dataset.filter === filter;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    projectCards.forEach(card => {
      const shouldShow = filter === 'all' || card.dataset.category.split(/\s+/).includes(filter);
      card.hidden = !shouldShow;
      card.classList.remove('filter-exit', 'filter-enter');
      card.toggleAttribute('aria-hidden', !shouldShow);
      card.inert = !shouldShow;
    });
  };
  filterButtons.forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    if (!reducedMotion.matches && typeof document.startViewTransition === 'function') {
      withViewTransition(() => applyFilterInstantly(filter));
      return;
    }
    filterButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    projectCards.forEach(card => {
      window.clearTimeout(card._filterTimer);
      const categories = card.dataset.category.split(/\s+/);
      const shouldShow = filter === 'all' || categories.includes(filter);
      if (shouldShow) {
        const wasHidden = card.hidden;
        const wasExiting = card.classList.contains('filter-exit');
        card.classList.remove('filter-exit');
        if (wasHidden) {
          card.hidden = false;
          card.classList.add('filter-enter');
          requestAnimationFrame(() => requestAnimationFrame(() => card.classList.remove('filter-enter')));
        } else if (wasExiting) {
          card.classList.add('filter-enter');
          requestAnimationFrame(() => requestAnimationFrame(() => card.classList.remove('filter-enter')));
        }
        card.removeAttribute('aria-hidden');
        card.inert = false;
      } else if (!card.hidden) {
        card.classList.remove('filter-enter');
        card.classList.add('filter-exit');
        card.setAttribute('aria-hidden', 'true');
        card.inert = true;
        card._filterTimer = window.setTimeout(() => {
          card.hidden = true;
          card.classList.remove('filter-exit');
          card.removeAttribute('aria-hidden');
        }, 190);
      }
    });
  }));

  // Project detail dialogs retain the existing briefs, adding a measured entrance/exit transition.
  const projectDetails = {
    pipeline: {
      kicker: 'BUILD BRIEF / 001', title: 'Golden-path delivery workflow',
      description: 'A planned platform build brief for turning a small service into a repeatable, guardrailed developer workflow with traceable artifacts.',
      objective: 'Create a reusable golden path that validates source changes, builds immutable artifacts, applies policy checks, and reports actionable results without exposing credentials.',
      checklist: ['Define a minimal service template and its supported inputs.', 'Create a reusable workflow for tests, image build, and artifact metadata.', 'Add policy and security checks with clear failure messages.', 'Use immutable image tags and least-privilege workflow permissions.', 'Document the supported path, extension points, secret handling, and failure recovery.'],
      done: 'A new developer can create the sample service from documented defaults, run the checks, inspect a traceable artifact, and understand how to customize or safely diverge from the golden path.'
    },
    infra: {
      kicker: 'BUILD BRIEF / 002', title: 'Self-service infrastructure foundation',
      description: 'A planned infrastructure module set designed to make common platform resources reproducible, reviewable, policy-checked, and safe to clean up.',
      objective: 'Provide reusable infrastructure modules with validated inputs, identity boundaries, policy checks, cost context, and a documented cleanup path.',
      checklist: ['Define reusable Terraform modules and versioned interfaces.', 'Validate inputs and outputs; document supported patterns and extension points.', 'Apply least-privilege identity and never commit credentials or state files.', 'Add format, validate, plan review, and policy checks before apply.', 'Document ownership, estimated cost, exception handling, and teardown steps.'],
      done: 'A platform consumer can request a supported resource configuration, review the generated plan and policy results, and remove resources deliberately without orphaned billable infrastructure.'
    },
    k8s: {
      kicker: 'BUILD BRIEF / 003', title: 'Kubernetes platform operations lab',
      description: 'A planned local-cluster lab for defining the runtime contracts a platform offers to application teams.',
      objective: 'Create a supported workload path with sensible resource defaults, namespace boundaries, health probes, rollout safety, and self-service runtime documentation.',
      checklist: ['Create a local cluster and publish a traceable application image.', 'Define reusable workload templates, namespace conventions, resource requests, and limits.', 'Add readiness and liveness probes with sensible defaults.', 'Practice a safe rolling update and a failed rollout.', 'Write a runbook and define the supported escape hatch for uncommon workloads.'],
      done: 'A developer can deploy through a documented golden path, understand the runtime contract, diagnose a failed rollout, and recover using a tested runbook.'
    },
    observability: {
      kicker: 'REFERENCE IMPLEMENTATION / 004', title: 'Platform observability reference lab',
      description: 'A locally runnable reference stack included in this portfolio package. A small Python API emits service health, request counters, and latency histograms for Prometheus to scrape and Grafana to visualize.',
      objective: 'Practice the observability loop from instrumentation to dashboards and alerts while keeping the services bound to localhost and avoiding production claims.',
      checklist: ['Run the API unit tests with Python 3.12 and the pinned Prometheus client.', 'Copy .env.example to .env and set a strong local Grafana password.', 'Start the stack with Docker Compose and verify the API health/readiness endpoints.', 'Generate sample traffic and one intentional 503, then inspect the Prometheus target and Grafana panels.', 'Review the alert rules, container restrictions, and teardown instructions.'],
      done: 'Unit tests pass, Compose configuration validates, Prometheus scrapes the API, the pre-provisioned dashboard shows generated sample traffic, and the user can stop the stack and remove its local data deliberately.',
      status: 'SOURCE INCLUDED / LOCAL STACK NOT RUN HERE',
      resourceHref: 'projects/observability-lab/index.html',
      resourceLabel: 'Open lab overview ↗',
      resourceExternal: false
    }
  };
  const dialog = document.getElementById('projectDialog');
  const dialogTitle = document.getElementById('dialogTitle');
  const dialogKicker = document.getElementById('dialogKicker');
  const dialogDescription = document.getElementById('dialogDescription');
  const dialogObjective = document.getElementById('dialogObjective');
  const dialogChecklist = document.getElementById('dialogChecklist');
  const dialogDone = document.getElementById('dialogDone');
  const dialogStatus = document.getElementById('dialogStatus');
  const dialogResourceLink = document.getElementById('dialogResourceLink');
  const openProject = key => {
    const detail = projectDetails[key];
    if (!detail || !dialog) return;
    dialogKicker.textContent = detail.kicker;
    dialogTitle.textContent = detail.title;
    dialogDescription.textContent = detail.description;
    dialogObjective.textContent = detail.objective;
    dialogChecklist.replaceChildren(...detail.checklist.map(item => {
      const li = document.createElement('li');
      li.textContent = item;
      return li;
    }));
    dialogDone.textContent = detail.done;
    dialogStatus.textContent = detail.status || 'PLANNED / NOT YET SHIPPED';
    dialogResourceLink.href = detail.resourceHref || profileHref('github');
    dialogResourceLink.textContent = detail.resourceLabel || 'Follow updates on GitHub ↗';
    dialogResourceLink.target = detail.resourceExternal === false ? '_self' : '_blank';
    if (dialogResourceLink.target === '_blank') dialogResourceLink.rel = 'noreferrer';
    else dialogResourceLink.removeAttribute('rel');
    dialog.classList.remove('is-closing');
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  };
  document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => openProject(button.dataset.project)));
  const closeProjectDialog = () => {
    if (!dialog || !dialog.open || dialog.classList.contains('is-closing')) return;
    if (reducedMotion.matches) { dialog.close(); return; }
    dialog.classList.add('is-closing');
    window.setTimeout(() => {
      if (dialog.open) dialog.close();
      dialog.classList.remove('is-closing');
    }, 150);
  };
  document.querySelector('.dialog-close')?.addEventListener('click', closeProjectDialog);
  dialog?.addEventListener('cancel', event => { event.preventDefault(); closeProjectDialog(); });
  dialog?.addEventListener('click', event => { if (event.target === dialog) closeProjectDialog(); });

  // Copy-email feedback.
  document.getElementById('copyEmail')?.addEventListener('click', async () => {
    const email = emailDestinations[0].address;
    try {
      await navigator.clipboard.writeText(email);
      showToast('Email address copied to clipboard.');
    } catch (_) {
      const temporary = document.createElement('textarea');
      temporary.value = email;
      temporary.setAttribute('readonly', '');
      temporary.style.position = 'fixed'; temporary.style.opacity = '0';
      document.body.appendChild(temporary); temporary.select();
      let success = false;
      try { success = document.execCommand('copy'); } catch (_) { success = false; }
      temporary.remove();
      showToast(success ? 'Email address copied to clipboard.' : email);
    }
  });

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
    if (!Number.isFinite(previous) || previous === target || reducedMotion.matches) {
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

  // Platform reliability controls use synthetic, event-driven values and never contact a live endpoint.
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
    if (announce) showToast('Platform reliability simulation reset.');
  };
  byId('injectIncident')?.addEventListener('click', () => {
    const dailyRequests = Number(sloRequests?.value || 100000);
    const errors = Math.max(1, Math.floor(dailyRequests * 0.01));
    simulation.failures += errors;
    simulation.incidentCount += 1;
    recordSimulationSample(320, errors, 'Error burst');
    addSimulationEvent(`Error burst: ${fmt.format(errors)} failed requests modeled.`, 'danger');
    showToast('Synthetic error burst added to the platform reliability simulation.');
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
      if (!reducedMotion.matches) requestAnimationFrame(() => sloRing.classList.add('slo-pulse'));
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

  // SVG architecture map: select a node to reveal grounded explanatory copy.
  const architectureCopy = {
    source: { index: 'PLATFORM STAGE / 01', title: 'Start with developer intent.', text: 'A platform begins with a repeatable developer need. Source control, a service catalog entry, and a well-defined request make the intent visible before automation runs.', state: 'DEVELOPER INPUT', wires: ['source-pipeline'] },
    pipeline: { index: 'PLATFORM STAGE / 02', title: 'Encode the golden path.', text: 'Reusable workflows validate source changes, apply policy checks, and surface actionable feedback. A failed gate should stop unsafe changes while explaining how to fix them.', state: 'GOLDEN-PATH WORKFLOW', wires: ['source-pipeline', 'pipeline-registry'] },
    registry: { index: 'PLATFORM STAGE / 03', title: 'Provide reusable building blocks.', text: 'Templates, approved base images, versioned artifacts, and documented modules reduce duplication while keeping provenance and ownership visible.', state: 'REUSABLE CAPABILITIES', wires: ['pipeline-registry', 'registry-runtime'] },
    runtime: { index: 'PLATFORM STAGE / 04', title: 'Make the runtime a supported capability.', text: 'The platform should offer documented workload conventions, resource defaults, health checks, namespaces, and safe rollout and recovery patterns.', state: 'RUNTIME CONTRACT', wires: ['registry-runtime', 'runtime-observability'] },
    observability: { index: 'PLATFORM STAGE / 05', title: 'Measure service health and developer friction.', text: 'Service signals, platform adoption, time-to-first-deploy, support requests, and developer feedback reveal whether the platform actually makes delivery easier.', state: 'PRODUCT FEEDBACK', wires: ['runtime-observability', 'observability-source'] }
  };
  const architectureStage = byId('architectureStage');
  const architectureSvg = architectureStage?.querySelector('svg');
  if (architectureSvg && typeof architectureSvg.pauseAnimations === 'function') {
    if (reducedMotion.matches) architectureSvg.pauseAnimations();
    else if ('IntersectionObserver' in window) {
      const architectureVisibilityObserver = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting && !reducedMotion.matches) architectureSvg.unpauseAnimations();
        else architectureSvg.pauseAnimations();
      }), { rootMargin: '120px 0px', threshold: 0.01 });
      architectureVisibilityObserver.observe(architectureStage);
    }
    reducedMotion.addEventListener?.('change', event => { if (event.matches) architectureSvg.pauseAnimations(); });
  }
  const architectureNodes = [...document.querySelectorAll('[data-arch-node]')];
  architectureNodes.forEach(node => node.addEventListener('click', () => {
    const detail = architectureCopy[node.dataset.archNode];
    if (!detail) return;
    withViewTransition(() => {
      architectureNodes.forEach(item => {
        const selected = item === node;
        item.classList.toggle('is-selected', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      architectureStage?.querySelectorAll('[data-wire]').forEach(wire => wire.classList.toggle('is-active', detail.wires.includes(wire.dataset.wire)));
      byId('architectureDetailIndex').textContent = detail.index;
      byId('architectureDetailTitle').textContent = detail.title;
      byId('architectureDetailText').textContent = detail.text;
      byId('architectureDetailState').textContent = detail.state;
    });
  }));
  document.querySelectorAll('[data-arch-view]').forEach(button => button.addEventListener('click', () => {
    const view = button.dataset.archView;
    architectureStage?.classList.toggle('is-isometric', view === 'isometric');
    document.querySelectorAll('[data-arch-view]').forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    showToast(view === 'isometric' ? 'Spatial perspective enabled.' : 'Flow view enabled.');
  }));

  // Animated delivery runner. Failure injection stops the run at test and never reaches deploy.
  const pipelineStages = [...document.querySelectorAll('[data-pipeline-stage]')];
  let pipelineRunId = 0;
  const pipelineDelay = ms => new Promise(resolve => window.setTimeout(resolve, reducedMotion.matches ? 0 : ms));
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
  const podDelay = ms => new Promise(resolve => window.setTimeout(resolve, reducedMotion.matches ? 0 : ms));
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

  // Technology constellation: graph nodes can be searched, selected, and connected to portfolio sections.
  const technologies = {
    'Linux': { type: 'SYSTEMS / FOUNDATION', title: 'Start with the machine.', text: 'Processes, filesystems, permissions, networking tools, and service management explain the environment containers and applications depend on.', tags: ['Processes', 'Shell', 'Networking'], target: '#stack', related: ['Terraform', 'Docker'] },
    'Terraform': { type: 'PLATFORM FOUNDATION / PROVISIONING', title: 'Expose infrastructure through reusable contracts.', text: 'Versioned infrastructure modules make resource intent reviewable and reusable. Validated inputs, policy checks, scoped permissions, and teardown are part of the platform interface.', tags: ['IaC', 'Module contracts', 'Policy'], target: '#platform-model', related: ['Linux', 'GitHub Actions'] },
    'Docker': { type: 'PACKAGING / RUNTIME', title: 'Package a repeatable workload.', text: 'Images reduce differences between build and run environments. Image tags, health checks, resource limits, and secrets handling remain important.', tags: ['Images', 'Compose', 'Health'], target: '#work', related: ['GitHub Actions', 'Kubernetes'] },
    'GitHub Actions': { type: 'GOLDEN PATH / AUTOMATION', title: 'Make the supported path repeatable.', text: 'Reusable workflows can validate, test, build, scan, and publish artifacts consistently. Clear feedback, least-privilege permissions, and safe failure behavior help a platform earn trust.', tags: ['Golden paths', 'Checks', 'Artifacts'], target: '#pipelinePlayground', related: ['Terraform', 'Docker'] },
    'Kubernetes': { type: 'PLATFORM / ORCHESTRATION', title: 'Declare the desired state.', text: 'Deployments, Services, readiness probes, resource requests, and rollouts provide a starting point for understanding platform behavior and recovery.', tags: ['Pods', 'Probes', 'Rollouts'], target: '#work', related: ['Docker', 'Prometheus', 'NGINX'] },
    'Prometheus': { type: 'PLATFORM RELIABILITY / METRICS', title: 'Make platform workloads observable.', text: 'Metrics, scrape targets, alert rules, and service-level indicators help teams detect regressions and improve the runtime contract offered by the platform.', tags: ['Metrics', 'Alerts', 'SLOs'], target: '#sreControlRoom', related: ['Kubernetes', 'Grafana'] },
    'Grafana': { type: 'OBSERVABILITY / VISUALIZATION', title: 'Make the signal useful to humans.', text: 'Dashboards should make common questions fast to answer and put trends in context. An alert should lead to a clear action, not only a bright panel.', tags: ['Dashboards', 'Triage', 'Signals'], target: 'projects/observability-lab/index.html', related: ['Prometheus', 'Kubernetes'] },
    'NGINX': { type: 'NETWORKING / TRAFFIC', title: 'Understand the path into a service.', text: 'Reverse proxying, routing, TLS termination, and upstream health are useful concepts for tracing a request from client to workload.', tags: ['Routing', 'TLS', 'Upstreams'], target: '#architecture', related: ['Kubernetes', 'Linux'] }
  };
  const technologyNodes = [...document.querySelectorAll('[data-tech]')];
  const technologySearch = byId('technologySearch');
  const selectTechnology = name => {
    const detail = technologies[name];
    if (!detail) return;
    withViewTransition(() => {
      technologyNodes.forEach(node => {
        const selected = node.dataset.tech === name;
        const related = detail.related.includes(node.dataset.tech);
        node.classList.toggle('is-selected', selected);
        node.classList.toggle('is-related', related);
        node.setAttribute('aria-pressed', String(selected));
      });
      byId('techDetailType').textContent = detail.type;
      byId('techDetailTitle').textContent = detail.title;
      byId('techDetailText').textContent = detail.text;
      const tagWrap = byId('techDetailTags');
      tagWrap.replaceChildren(...detail.tags.map(tag => {
        const span = document.createElement('span'); span.textContent = tag; return span;
      }));
      byId('techDetailAction').textContent = detail.target.startsWith('projects/') ? 'Open observability lab ↗' : 'Explore related section ↗';
      byId('techDetailAction').dataset.target = detail.target;
    });
  };
  technologyNodes.forEach(node => node.addEventListener('click', () => selectTechnology(node.dataset.tech)));
  technologySearch?.addEventListener('input', () => {
    const query = technologySearch.value.trim().toLowerCase();
    technologyNodes.forEach(node => {
      const matches = !query || node.dataset.tech.toLowerCase().includes(query);
      node.hidden = !matches;
    });
  });
  byId('techDetailAction')?.addEventListener('click', () => {
    const target = byId('techDetailAction').dataset.target;
    if (!target) return;
    if (target.startsWith('#')) document.querySelector(target)?.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
    else window.location.href = target;
  });
  selectTechnology('Docker');

  // Learning journey stages connect their narrative to the relevant demos.
  const journeyStages = {
    foundation: { kicker: 'STAGE 01 / FOUNDATION', title: 'Understand the machine before abstracting it.', text: 'Build comfort with processes, filesystems, permissions, shell tools, SSH, and network basics. These concepts help diagnose container and application behavior later.', action: 'Explore the tooling map ↗', target: '#stack' },
    provision: { kicker: 'STAGE 02 / PLATFORM FOUNDATIONS', title: 'Make platform contracts reviewable.', text: 'Practice reusable infrastructure modules, identity boundaries, policy-as-code checks, Terraform plans, cost context, and safe teardown.', action: 'Explore the platform model ↗', target: '#platform-model' },
    deliver: { kicker: 'STAGE 03 / DELIVER', title: 'Automate the checks before release.', text: 'Use a pipeline to validate changes, package artifacts, and block unsafe releases. Learn from both the successful path and an intentionally failed test.', action: 'Run the CI/CD preview ↗', target: '#pipelinePlayground' },
    operate: { kicker: 'STAGE 04 / OPERATE & IMPROVE', title: 'Improve the platform through service and developer signals.', text: 'Connect health checks, latency, request errors, alerts, runbooks, platform adoption, and developer friction. Recovery should restore service and feed improvements into the supported path.', action: 'Open platform reliability signals ↗', target: '#sreControlRoom' }
  };
  const journeyDetailAction = byId('journeyDetailAction');
  document.querySelectorAll('[data-journey-step]').forEach(button => button.addEventListener('click', () => {
    const detail = journeyStages[button.dataset.journeyStep];
    if (!detail) return;
    withViewTransition(() => {
      document.querySelectorAll('[data-journey-step]').forEach(item => item.closest('.journey-step')?.classList.toggle('is-selected', item === button));
      byId('journeyDetailKicker').textContent = detail.kicker;
      byId('journeyDetailTitle').textContent = detail.title;
      byId('journeyDetailText').textContent = detail.text;
      journeyDetailAction.textContent = detail.action;
      journeyDetailAction.dataset.target = detail.target;
    });
  }));
  journeyDetailAction?.addEventListener('click', () => {
    const target = journeyDetailAction.dataset.target;
    if (target) document.querySelector(target)?.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
  });
  if ('IntersectionObserver' in window) {
    const journeyObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('journey-in-view');
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('.journey-step').forEach(step => journeyObserver.observe(step));
  }

  // Engineering investigation desk: all records below are prepared client-side teaching examples.
  const investigationTabs = [...document.querySelectorAll('[data-investigation-tab]')];
  const investigationPanels = [...document.querySelectorAll('[data-investigation-panel]')];
  const activateInvestigationTab = tab => {
    const selected = tab.dataset.investigationTab;
    investigationTabs.forEach(item => {
      const active = item === tab;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    investigationPanels.forEach(panel => { panel.hidden = panel.dataset.investigationPanel !== selected; });
  };
  investigationTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateInvestigationTab(tab));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowLeft') next = (index - 1 + investigationTabs.length) % investigationTabs.length;
      if (event.key === 'ArrowRight') next = (index + 1) % investigationTabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = investigationTabs.length - 1;
      investigationTabs[next]?.focus();
      activateInvestigationTab(investigationTabs[next]);
    });
  });

  const traceSpans = {
    gateway: { index: 'SPAN / 01 · ROOT', title: 'GET /catalog', service: 'edge-gateway', duration: '148 ms', parent: 'none · root span', description: 'The edge gateway received the request and coordinated downstream work before returning the response.', state: 'OK · SAMPLE', log: 'request.completed method=GET route=/catalog status=200 duration_ms=148' },
    auth: { index: 'SPAN / 02 · CHILD', title: 'validate-session', service: 'identity-service', duration: '18 ms', parent: 'GET /catalog', description: 'The identity service validated a prepared session token. In a real trace, inspect this span alongside auth logs without exposing the token itself.', state: 'OK · SAMPLE', log: 'session.validation outcome=accepted duration_ms=18 token=REDACTED' },
    catalog: { index: 'SPAN / 03 · CHILD', title: 'list-items', service: 'catalog-service', duration: '91 ms', parent: 'GET /catalog', description: 'The catalog service fetched the items required to build the response. This is the largest child span in the sample and is a useful starting point for latency analysis.', state: 'OK · SAMPLE', log: 'catalog.query result_count=24 duration_ms=91' },
    database: { index: 'SPAN / 04 · DATABASE', title: 'SELECT items', service: 'catalog-db', duration: '54 ms', parent: 'list-items', description: 'The database query accounts for a meaningful portion of the catalog service duration. A real investigation would compare query plans, pool wait time, and neighboring requests.', state: 'OK · SAMPLE', log: 'db.query name=select_items rows=24 duration_ms=54' },
    cache: { index: 'SPAN / 05 · CACHE', title: 'cache lookup', service: 'catalog-cache', duration: '7 ms', parent: 'list-items', description: 'The cache check is short in this prepared trace. Its presence illustrates how dependency work appears as a separate span rather than being hidden inside the parent service.', state: 'OK · SAMPLE', log: 'cache.lookup key=catalog:list result=hit duration_ms=7' }
  };
  document.querySelectorAll('[data-trace-span]').forEach(button => button.addEventListener('click', () => {
    const trace = traceSpans[button.dataset.traceSpan];
    if (!trace) return;
    document.querySelectorAll('[data-trace-span]').forEach(item => {
      const active = item === button;
      item.classList.toggle('is-selected', active);
      item.setAttribute('aria-pressed', String(active));
    });
    const textTargets = { traceDetailKind: trace.index, traceDetailTitle: trace.title, traceDetailService: trace.service, traceDetailDuration: trace.duration, traceDetailParent: trace.parent, traceDetailDescription: trace.description, traceDetailState: trace.state, traceDetailLog: trace.log };
    Object.entries(textTargets).forEach(([id, value]) => { const element = byId(id); if (element) element.textContent = value; });
  }));

  const releaseDiffs = {
    development: [
      ['replicas', '1', '1', 'Capacity unchanged; useful for a local smoke test.'],
      ['request.timeout', '800 ms', '600 ms', 'Check slow dependency behavior before merging.'],
      ['image.tag', '1.4.2', '1.4.3', 'Pin the version to the reviewed artifact.']
    ],
    staging: [
      ['replicas', '2', '3', 'More capacity; verify resource budget.'],
      ['request.timeout', '800 ms', '600 ms', 'Compare timeout behavior with dependency latency.'],
      ['readiness.failureThreshold', '3', '2', 'Faster removal can help, but may make transient startup more sensitive.']
    ],
    production: [
      ['replicas', '3', '4', 'Capacity change needs a cost and saturation review.'],
      ['maxUnavailable', '1', '0', 'Rollout aims to preserve capacity; confirm surge capacity is available.'],
      ['networkPolicy', 'baseline', 'catalog-egress-restricted', 'Validate required egress and rollback access before rollout.']
    ]
  };
  const releaseEnvironment = byId('releaseEnvironment');
  const releaseDiffBody = byId('releaseDiffBody');
  const renderReleaseDiff = () => {
    if (!releaseEnvironment || !releaseDiffBody) return;
    const environment = releaseEnvironment.value;
    releaseDiffBody.replaceChildren();
    (releaseDiffs[environment] || []).forEach(([setting, before, after, note]) => {
      const row = document.createElement('tr');
      [setting, before, after, note].forEach((value, index) => {
        const cell = document.createElement('td');
        cell.textContent = value;
        if (index === 1) cell.className = 'diff-before';
        if (index === 2) cell.className = 'diff-after';
        row.appendChild(cell);
      });
      releaseDiffBody.appendChild(row);
    });
    const label = environment.charAt(0).toUpperCase() + environment.slice(1);
    if (byId('releaseDiffCaption')) byId('releaseDiffCaption').textContent = `${label} · illustrative configuration differences`;
    if (byId('releaseReviewNote')) byId('releaseReviewNote').textContent = `${label}: compare these example values with environment policy, secrets handling, traffic patterns, and rollback criteria before approving a real change.`;
  };
  releaseEnvironment?.addEventListener('change', renderReleaseDiff);
  renderReleaseDiff();

  const infrastructureEvents = [
    { time: 'T+00', title: 'Baseline recorded', text: 'The service starts in its expected state. Baseline request latency and error rate are recorded for comparison.', signal: 'p95 120 ms · errors 0.4%', followup: 'Confirm telemetry and release reference.' },
    { time: 'T+04', title: 'Candidate release begins', text: 'A new application revision starts its rollout. This prepared example assumes a gradual deployment and a health check at each step.', signal: 'revision 1.4.3 · rollout started', followup: 'Watch readiness, latency, and error rate together.' },
    { time: 'T+06', title: 'Latency alert fires', text: 'The sample p95 latency rises after the candidate begins receiving traffic. An alert should trigger investigation, not an automatic claim about root cause.', signal: 'p95 780 ms · errors 4.2%', followup: 'Correlate traces and logs; assess impact.' },
    { time: 'T+08', title: 'Rollback is selected', text: 'The release owner chooses the prepared rollback path while preserving the failed revision and relevant diagnostic evidence.', signal: 'rollback requested · old revision retained', followup: 'Verify capacity, readiness, and error trend.' },
    { time: 'T+11', title: 'Service returns to baseline', text: 'The simulation returns traffic to the earlier revision. A real recovery would still require verification against a trusted telemetry source.', signal: 'p95 135 ms · errors 0.5%', followup: 'Close only after the recovery window is verified.' }
  ];
  const historySeek = byId('historySeek');
  const historyPlayback = byId('historyPlayback');
  let historyIndex = 0;
  let historyTimer = null;
  const stopHistoryPlayback = () => {
    if (historyTimer !== null) window.clearInterval(historyTimer);
    historyTimer = null;
    if (historyPlayback) { historyPlayback.textContent = 'Play replay'; historyPlayback.setAttribute('aria-pressed', 'false'); }
  };
  const renderHistoryEvent = index => {
    historyIndex = Math.max(0, Math.min(infrastructureEvents.length - 1, index));
    const event = infrastructureEvents[historyIndex];
    if (historySeek) historySeek.value = String(historyIndex);
    const values = { historyEventTime: `EVENT ${String(historyIndex + 1).padStart(2, '0')} / ${event.time}`, historyEventCounter: `${String(historyIndex + 1).padStart(2, '0')} / ${infrastructureEvents.length}`, historyEventTitle: event.title, historyEventText: event.text, historyEventSignal: event.signal, historyEventFollowup: event.followup };
    Object.entries(values).forEach(([id, value]) => { const el = byId(id); if (el) el.textContent = value; });
    document.querySelectorAll('#historyTrack li').forEach((item, itemIndex) => {
      item.classList.toggle('is-current', itemIndex === historyIndex);
      item.classList.toggle('is-complete', itemIndex < historyIndex);
      if (itemIndex === historyIndex) item.setAttribute('aria-current', 'step'); else item.removeAttribute('aria-current');
    });
    const previous = byId('historyPrevious'); const next = byId('historyNext');
    if (previous) previous.disabled = historyIndex === 0;
    if (next) next.disabled = historyIndex === infrastructureEvents.length - 1;
    if (historyIndex === infrastructureEvents.length - 1) stopHistoryPlayback();
  };
  byId('historyPrevious')?.addEventListener('click', () => { stopHistoryPlayback(); renderHistoryEvent(historyIndex - 1); });
  byId('historyNext')?.addEventListener('click', () => { stopHistoryPlayback(); renderHistoryEvent(historyIndex + 1); });
  historySeek?.addEventListener('input', () => { stopHistoryPlayback(); renderHistoryEvent(Number(historySeek.value)); });
  historyPlayback?.addEventListener('click', () => {
    if (historyTimer !== null) { stopHistoryPlayback(); return; }
    if (historyIndex >= infrastructureEvents.length - 1) renderHistoryEvent(0);
    historyPlayback.textContent = 'Pause replay'; historyPlayback.setAttribute('aria-pressed', 'true');
    historyTimer = window.setInterval(() => {
      if (historyIndex >= infrastructureEvents.length - 1) { stopHistoryPlayback(); return; }
      renderHistoryEvent(historyIndex + 1);
    }, reducedMotion.matches ? 1800 : 1250);
  });
  renderHistoryEvent(0);

  const recoveryScenarios = {
    deployment: { title: 'Release not healthy', text: 'The rollout is paused because the new revision is not passing its health check.', signal: 'readiness success below expected threshold', actionTitle: 'Inspect the failing check', actionText: 'Review readiness and startup probe paths, recent configuration changes, and application logs before deciding to roll back.', expected: 'Previous revision remains available for rollback.', resolution: 'Simulated rollback selected; verify readiness and request health before closing the scenario.' },
    dependency: { title: 'Downstream calls are slow', text: 'A dependency is exceeding its expected response time and is increasing the caller’s latency.', signal: 'dependency p95 above the example threshold', actionTitle: 'Bound dependency impact', actionText: 'Inspect traces and dependency health, verify timeout budgets, and check whether retries could amplify load.', expected: 'Timeout and retry budgets remain bounded; dependency recovery is confirmed.', resolution: 'Simulated traffic is routed through a bounded-timeout path; verify latency and error trends.' },
    memory: { title: 'Workload memory is elevated', text: 'Memory usage in the example workload is approaching its configured limit.', signal: 'memory working set near the configured limit', actionTitle: 'Inspect usage and limits', actionText: 'Review recent workload changes, memory trends, and container limits before deciding whether to scale or roll back.', expected: 'Capacity and resource limits are validated before another rollout.', resolution: 'Simulated workload returns to a safer memory state; verify sustained headroom.' },
    readiness: { title: 'Pod is running but not ready', text: 'The pod process is present, but its readiness probe is failing, so the service should not route new traffic to it.', signal: 'readiness probe failing · endpoint excluded', actionTitle: 'Validate probe assumptions', actionText: 'Check the probe path, startup timing, dependencies, and application logs. Do not treat a running process as proof of readiness.', expected: 'Readiness passes and the endpoint is safely restored.', resolution: 'Simulated readiness passes and the endpoint returns; verify recovery before closing the drill.' }
  };
  let recoveryApplied = false;
  const renderRecovery = () => {
    const scenario = recoveryScenarios[byId('recoveryScenario')?.value || 'deployment'];
    if (!scenario) return;
    const values = recoveryApplied
      ? { recoverySymptomsTitle: 'Recovery step applied', recoverySymptomsText: 'The local example has advanced to its post-remediation state. Treat this as an exercise result, not production evidence.', recoverySignal: 'example symptoms cleared', recoveryActionTitle: 'Verify before closing', recoveryActionText: scenario.resolution, recoveryExpected: 'Check the relevant service signal over an agreed observation window.', recoveryStatus: 'SIMULATED STATE: remediation selected. No external system was contacted.' }
      : { recoverySymptomsTitle: scenario.title, recoverySymptomsText: scenario.text, recoverySignal: scenario.signal, recoveryActionTitle: scenario.actionTitle, recoveryActionText: scenario.actionText, recoveryExpected: scenario.expected, recoveryStatus: 'Scenario ready · no action has been applied.' };
    Object.entries(values).forEach(([id, value]) => { const el = byId(id); if (el) el.textContent = value; });
    const apply = byId('applyRecovery');
    if (apply) { apply.disabled = recoveryApplied; apply.textContent = recoveryApplied ? 'Remediation simulated' : 'Apply simulated remediation'; }
  };
  byId('recoveryScenario')?.addEventListener('change', () => { recoveryApplied = false; renderRecovery(); });
  byId('applyRecovery')?.addEventListener('click', () => { recoveryApplied = true; renderRecovery(); showToast('Local recovery scenario updated.'); });
  byId('resetRecovery')?.addEventListener('click', () => { recoveryApplied = false; renderRecovery(); });
  renderRecovery();

  // Accessible command palette: Ctrl/⌘+K, type to filter, arrows to move, Enter to run.
  const commandDialog = byId('commandDialog');
  const commandTrigger = byId('commandTrigger');
  const commandSearch = byId('commandSearch');
  const commandResults = byId('commandResults');
  const commandEmpty = byId('commandEmpty');
  const commands = [
    { label: 'Go to About', group: 'NAVIGATION', keywords: 'about mindset principles', run: () => goTo('#about') },
    { label: 'Explore platform capabilities', group: 'NAVIGATION', keywords: 'platform engineering internal developer platform capabilities', run: () => goTo('#focus') },
    { label: 'Open interactive platform map', group: 'DIAGRAMS', keywords: 'architecture internal developer platform golden paths graph map', run: () => goTo('#architecture') },
    { label: 'Explore platform-as-product model', group: 'NAVIGATION', keywords: 'IDP internal developer portal service catalog self service golden paths policy developer experience', run: () => goTo('#platform-model') },
    { label: 'Open engineering investigation desk', group: 'LAB', keywords: 'request trace tracing spans release diff comparison infrastructure history replay recovery incident logs metrics', run: () => goTo('#investigation') },
    { label: 'Inspect sample request trace', group: 'TRACE EXPLORER', keywords: 'trace latency spans gateway database catalog logs', run: () => { goTo('#investigation'); activateInvestigationTab(document.querySelector('[data-investigation-tab="trace"]')); } },
    { label: 'Compare sample release configurations', group: 'RELEASE REVIEW', keywords: 'release staging production development terraform config diff version rollout', run: () => { goTo('#investigation'); activateInvestigationTab(document.querySelector('[data-investigation-tab="release"]')); } },
    { label: 'Replay infrastructure history', group: 'SIMULATION', keywords: 'timeline event replay rollback deployment history', run: () => { goTo('#investigation'); activateInvestigationTab(document.querySelector('[data-investigation-tab="history"]')); } },
    { label: 'Open the safe recovery drill', group: 'SIMULATION', keywords: 'failure recovery remediation readiness dependency memory troubleshooting runbook', run: () => { goTo('#investigation'); activateInvestigationTab(document.querySelector('[data-investigation-tab="recovery"]')); } },
    { label: 'Open the platform observability lab guide', group: 'DOCUMENTATION', keywords: 'platform observability documentation readme python prometheus grafana docker compose tests runbook', run: () => { window.location.href = 'projects/observability-lab/index.html'; } },
    { label: 'Find education and background', group: 'PROFILE', keywords: 'education bachelor university hsc ssc gpa bangladesh', run: () => goTo('#about') },
    { label: 'Open platform reliability signals', group: 'SIMULATION', keywords: 'platform reliability incident error budget latency monitor', run: () => goTo('#sreControlRoom') },
    { label: 'Open Kubernetes readiness simulation', group: 'SIMULATION', keywords: 'kubernetes pod readiness probe service endpoint health', run: () => goTo('#podHealthPlayground') },
    { label: 'Simulate Kubernetes readiness failure', group: 'DEMO', keywords: 'kubernetes pod unhealthy probe error', run: () => { goTo('#podHealthPlayground'); window.setTimeout(() => byId('simulatePodFailure')?.click(), reducedMotion.matches ? 0 : 350); } },
    { label: 'Go to SLO calculator', group: 'SIMULATION', keywords: 'slo uptime availability calculator', run: () => goTo('#lab') },
    { label: 'Run successful CI/CD pipeline', group: 'DEMO', keywords: 'pipeline ci cd deploy build run', run: () => { goTo('#pipelinePlayground'); window.setTimeout(() => byId('runPipeline')?.click(), reducedMotion.matches ? 0 : 350); } },
    { label: 'Inject a platform reliability error burst', group: 'DEMO', keywords: 'incident failure errors budget platform reliability', run: () => { goTo('#sreControlRoom'); window.setTimeout(() => byId('injectIncident')?.click(), reducedMotion.matches ? 0 : 350); } },
    { label: 'Show Golden-path projects', group: 'PROJECT FILTER', keywords: 'golden path service templates workflow pipeline filter', run: () => { goTo('#work'); document.querySelector('[data-filter="golden-path"]')?.click(); } },
    { label: 'Show Runtime & reliability projects', group: 'PROJECT FILTER', keywords: 'runtime kubernetes reliability observability filter', run: () => { goTo('#work'); document.querySelector('[data-filter="runtime"]')?.click(); } },
    { label: 'Show Platform foundation projects', group: 'PROJECT FILTER', keywords: 'platform foundation terraform infrastructure policy filter', run: () => { goTo('#work'); document.querySelector('[data-filter="foundation"]')?.click(); } },
    { label: 'Open golden-path workflow brief', group: 'PROJECT', keywords: 'golden path pipeline project docker actions', run: () => { goTo('#work'); openProject('pipeline'); } },
    { label: 'Open self-service infrastructure brief', group: 'PROJECT', keywords: 'platform infrastructure terraform policy project', run: () => { goTo('#work'); openProject('infra'); } },
    { label: 'Open Kubernetes lab brief', group: 'PROJECT', keywords: 'kubernetes k8s platform project', run: () => { goTo('#work'); openProject('k8s'); } },
    { label: 'Open observability implementation', group: 'PROJECT', keywords: 'prometheus grafana observability project source', run: () => { goTo('#work'); openProject('observability'); } },
    { label: 'Explore technology constellation', group: 'DIAGRAMS', keywords: 'tools stack technology graph skills', run: () => goTo('#constellationTitle') },
    { label: 'Explore platform engineering roadmap', group: 'NAVIGATION', keywords: 'platform engineering journey learning roadmap golden paths self service', run: () => goTo('.section-journey') },
    { label: 'Switch monochrome theme', group: 'PREFERENCES', keywords: 'theme dark light appearance', run: toggleTheme },
    { label: 'Copy email address', group: 'CONTACT', keywords: 'email contact copy', run: () => byId('copyEmail')?.click() },
    { label: 'Go to contact', group: 'NAVIGATION', keywords: 'contact email connect github', run: () => goTo('#contact') }
  ];
  function goTo(selector) {
    const target = document.querySelector(selector);
    target?.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
  }
  let activeCommandIndex = 0;
  let renderedCommands = [];
  const syncCommandComboboxState = () => {
    if (!commandSearch) return;
    const hasActiveOption = Boolean(commandDialog?.open && renderedCommands.length);
    commandSearch.setAttribute('aria-expanded', String(hasActiveOption));
    const activeOption = hasActiveOption
      ? commandResults?.querySelector(`#command-option-${activeCommandIndex}`)
      : null;
    if (activeOption) commandSearch.setAttribute('aria-activedescendant', activeOption.id);
    else commandSearch.removeAttribute('aria-activedescendant');
  };
  const closeCommandPalette = () => {
    if (commandDialog?.open) commandDialog.close();
    syncCommandComboboxState();
    commandTrigger?.focus({ preventScroll: true });
  };
  // Search inputs can consume Escape to clear their value, so explicitly close the palette.
  commandDialog?.addEventListener('cancel', event => {
    event.preventDefault();
    closeCommandPalette();
  });
  const runCommand = command => {
    closeCommandPalette();
    window.setTimeout(() => command.run(), 20);
  };
  const renderCommands = () => {
    if (!commandResults || !commandSearch) return;
    const query = commandSearch.value.trim().toLowerCase();
    renderedCommands = commands.filter(command => `${command.label} ${command.group} ${command.keywords}`.toLowerCase().includes(query));
    activeCommandIndex = renderedCommands.length ? Math.max(0, Math.min(activeCommandIndex, renderedCommands.length - 1)) : 0;
    commandResults.replaceChildren();
    if (commandEmpty) commandEmpty.hidden = renderedCommands.length > 0;
    if (!renderedCommands.length) {
      syncCommandComboboxState();
      return;
    }
    renderedCommands.forEach((command, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'command-result';
      button.id = `command-option-${index}`;
      button.setAttribute('role', 'option');
      button.setAttribute('aria-selected', String(index === activeCommandIndex));
      button.dataset.commandIndex = String(index);
      const label = document.createElement('span'); label.textContent = command.label;
      const group = document.createElement('small'); group.textContent = command.group;
      const icon = document.createElement('span'); icon.className = 'command-result-arrow'; icon.textContent = '↗';
      button.append(label, group, icon);
      button.addEventListener('click', () => runCommand(command));
      button.addEventListener('mouseenter', () => { activeCommandIndex = index; syncCommandSelection(); });
      commandResults.appendChild(button);
    });
    syncCommandComboboxState();
  };
  const syncCommandSelection = () => {
    commandResults?.querySelectorAll('.command-result').forEach((button, index) => {
      const selected = index === activeCommandIndex;
      button.setAttribute('aria-selected', String(selected));
      if (selected) button.scrollIntoView({ block: 'nearest' });
    });
    syncCommandComboboxState();
  };
  const openCommandPalette = () => {
    if (!commandDialog) return;
    if (typeof commandDialog.showModal === 'function') commandDialog.showModal();
    else commandDialog.setAttribute('open', '');
    commandSearch.value = '';
    activeCommandIndex = 0;
    renderCommands();
    window.setTimeout(() => commandSearch.focus(), 0);
  };
  commandTrigger?.addEventListener('click', openCommandPalette);
  byId('commandClose')?.addEventListener('click', closeCommandPalette);
  commandDialog?.addEventListener('click', event => { if (event.target === commandDialog) closeCommandPalette(); });
  commandSearch?.addEventListener('input', () => { activeCommandIndex = 0; renderCommands(); });
  commandSearch?.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closeCommandPalette();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault(); activeCommandIndex = Math.min(renderedCommands.length - 1, activeCommandIndex + 1); syncCommandSelection();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault(); activeCommandIndex = Math.max(0, activeCommandIndex - 1); syncCommandSelection();
    } else if (event.key === 'Enter') {
      event.preventDefault(); if (renderedCommands[activeCommandIndex]) runCommand(renderedCommands[activeCommandIndex]);
    }
  });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (commandDialog?.open) closeCommandPalette(); else openCommandPalette();
    }
  });

  const year = byId('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
