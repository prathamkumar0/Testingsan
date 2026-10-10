(() => {
  'use strict';

  const body = document.body;
  const toggle = document.querySelector('.menu-toggle');
  const overlay = document.querySelector('.nav-overlay');
  const header = document.querySelector('.site-header');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.body.classList.add('page-enter');
  requestAnimationFrame(() => document.body.classList.add('page-ready'));

  // Add the editorial motion system across every page without changing markup.
  if (!reduceMotion) {
    document.querySelectorAll('main > section, .page-hero, .form-shell, .policy-grid, .story-grid, .destination-grid, .course-grid').forEach((el, i) => {
      if (!el.classList.contains('hero') && !el.classList.contains('editorial-hero')) el.classList.add('motion-reveal');
    });
    document.querySelectorAll('.service-list, .principles, .testimonials-grid, .recognition-grid, .education-cards, .milestones, .gallery-grid, .portfolio-grid').forEach(el => el.classList.add('motion-stagger','motion-reveal'));
    document.querySelectorAll('.section > .container > *, .artist-grid > *, .signature-top > *, .portfolio-intro > *, .form-shell > *, .page-hero-grid > *').forEach((el, i) => {
      if (!el.closest('.hero')) el.classList.add(i % 2 ? 'from-right' : 'from-left');
    });

    const motionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          motionObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .08, rootMargin: '0px 0px -45px' });
    document.querySelectorAll('.motion-reveal').forEach(el => motionObserver.observe(el));
  } else {
    document.querySelectorAll('.motion-reveal,.motion-stagger').forEach(el => el.classList.add('is-visible'));
  }



  const setMenu = (open) => {
    if (!toggle || !overlay) return;
    overlay.classList.toggle('open', open);
    toggle.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', String(open));
    body.classList.toggle('menu-open', open);
  };

  if (toggle && overlay) {
    // Dedicated close button inside the full-screen menu
    if (!overlay.querySelector('.nav-close')) {
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'nav-close';
      closeBtn.setAttribute('aria-label', 'Close menu');
      closeBtn.innerHTML = '<span></span><span></span>';
      overlay.appendChild(closeBtn);
      closeBtn.addEventListener('click', () => setMenu(false));
    }
    toggle.addEventListener('click', () => setMenu(!overlay.classList.contains('open')));
    overlay.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') setMenu(false);
    });
  }

  let ticking = false;
  const updateHeader = () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 40);
    ticking = false;
  };
  updateHeader();
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px' });
    revealItems.forEach(el => observer.observe(el));
  } else {
    revealItems.forEach(el => el.classList.add('visible'));
  }

  const lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    const lbImg = lightbox.querySelector('img');
    const closeLightbox = () => {
      lightbox.classList.remove('open');
      body.classList.remove('lightbox-open');
      if (lbImg) lbImg.removeAttribute('src');
    };

    document.querySelectorAll('[data-lightbox]').forEach(img => {
      img.addEventListener('click', () => {
        if (!lbImg) return;
        lbImg.src = img.currentSrc || img.src;
        lbImg.alt = img.alt || '';
        lightbox.classList.add('open');
        body.classList.add('lightbox-open');
      });
    });

    lightbox.addEventListener('click', e => {
      if (e.target === lightbox || e.target.closest('button')) closeLightbox();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
    });
  }

  const filterButtons = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  filterButtons.forEach(btn => btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.filter || 'all';
    galleryItems.forEach(item => {
      const show = cat === 'all' || item.dataset.category === cat;
      item.hidden = !show;
      item.style.display = show ? '' : 'none';
    });
  }));

  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // Prevent broken internal anchors from jumping to the top.
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  // Optional page cut/hide manager. Changes are stored in this browser only.
  const PAGE_KEY = 'sanpreet_hidden_pages_v1';
  const pages = [
    ['index.html','Home'], ['about.html','About'], ['services.html','Services'],
    ['portfolio.html','Portfolio'], ['education.html','Education'], ['testimonials.html','Testimonials'],
    ['contact.html','Enquire'], ['bridal-makeup-hair.html','Bridal Makeup & Hair'],
    ['pre-bridal.html','Pre-Bridal'], ['party-makeup.html','Party Makeup'],
    ['destination-bridal.html','Destination Bridal'], ['education-enquiry.html','Education Enquiry'],
    ['policies.html','Booking & Policies'], ['terms.html','Terms & Conditions'], ['thank-you.html','Thank You']
  ];
  const getHidden = () => { try { return JSON.parse(localStorage.getItem(PAGE_KEY) || '[]'); } catch(e) { return []; } };
  const setHidden = list => localStorage.setItem(PAGE_KEY, JSON.stringify([...new Set(list)]));
  const currentFile = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  const applyHiddenPages = () => {
    const hidden = getHidden();
    document.querySelectorAll('.nav-list a[href]').forEach(a => {
      const file = (a.getAttribute('href') || '').split('/').pop().split('#')[0].toLowerCase();
      if (pages.some(p => p[0] === file)) {
        const isHidden = hidden.includes(file);
        a.closest('li')?.classList.toggle('page-hidden-by-manager', isHidden);
        a.style.display = isHidden ? 'none' : '';
      }
    });
    renderInlinePageCutState?.();
    if (hidden.includes(currentFile) && currentFile !== 'index.html') location.href = 'index.html';
  };

  const addInlinePageCutButtons = () => {
    const navList = document.querySelector('.nav-list');
    if (!navList || navList.dataset.cutButtonsReady === '1') return;
    navList.dataset.cutButtonsReady = '1';
    navList.querySelectorAll('a[href]').forEach(a => {
      const file = (a.getAttribute('href') || '').split('/').pop().split('#')[0].toLowerCase();
      if (!pages.some(p => p[0] === file)) return;
      const wrap = document.createElement('div');
      wrap.className = 'nav-page-item';
      a.parentNode.insertBefore(wrap, a);
      wrap.appendChild(a);
      const cut = document.createElement('button');
      cut.type = 'button';
      cut.className = 'nav-page-cut';
      cut.dataset.file = file;
      cut.setAttribute('aria-label', 'Cut ' + (pages.find(p => p[0] === file)?.[1] || 'page'));
      cut.textContent = '×';
      if (file === 'index.html') {
        cut.disabled = true;
        cut.title = 'Home cannot be cut';
      } else {
        cut.title = 'Cut this page from the menu';
      }
      wrap.appendChild(cut);
    });

    navList.querySelectorAll('.nav-page-cut').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        if (btn.disabled) return;
        const file = btn.dataset.file;
        const next = getHidden();
        if (!next.includes(file)) setHidden([...next, file]);
        applyHiddenPages();
        renderInlinePageCutState();
      });
    });
  };

  const renderInlinePageCutState = () => {
    const hidden = getHidden();
    document.querySelectorAll('.nav-page-item').forEach(item => {
      const btn = item.querySelector('.nav-page-cut');
      const a = item.querySelector('a');
      if (!btn || !a) return;
      const file = btn.dataset.file;
      const isHidden = hidden.includes(file);
      item.classList.toggle('page-is-cut', isHidden);
      a.style.display = isHidden ? 'none' : '';
      btn.textContent = isHidden ? '+' : '×';
      btn.title = isHidden ? 'Restore this page' : 'Cut this page from the menu';
      btn.setAttribute('aria-label', isHidden ? 'Restore page' : 'Cut page');
      btn.classList.toggle('restore-page', isHidden);
    });
  };

  const buildPageManager = () => {
    if (document.querySelector('.page-manager-overlay')) return;
    const launcher = document.createElement('button');
    launcher.className = 'page-manager-launcher';
    launcher.type = 'button';
    launcher.textContent = '✂ Pages';
    launcher.setAttribute('aria-label','Open page cut manager');

    const overlayEl = document.createElement('div');
    overlayEl.className = 'page-manager-overlay';
    overlayEl.innerHTML = `<div class="page-manager-panel" role="dialog" aria-modal="true" aria-label="Page cut manager">
      <div class="page-manager-head"><h3>Page Cut / Hide</h3><button class="page-manager-close" type="button" aria-label="Close">×</button></div>
      <p class="page-manager-note">Cut a page from the website navigation. This hides it in this browser; your original HTML files remain safe.</p>
      <div class="page-manager-list"></div>
      <div class="page-manager-actions"><button class="restore-all" type="button">Restore All</button><button class="page-manager-close" type="button">Done</button></div>
    </div>`;
    document.body.append(launcher, overlayEl);

    const list = overlayEl.querySelector('.page-manager-list');
    const render = () => {
      const hidden = getHidden();
      list.innerHTML = pages.map(([file,label]) => `<div class="page-manager-item"><span>${label}</span><button class="${hidden.includes(file)?'restore':''}" data-file="${file}">${hidden.includes(file)?'Restore':'Cut Page'}</button></div>`).join('');
      list.querySelectorAll('button[data-file]').forEach(btn => btn.addEventListener('click', () => {
        const file = btn.dataset.file, next = getHidden();
        if (next.includes(file)) setHidden(next.filter(x => x !== file)); else setHidden([...next, file]);
        applyHiddenPages(); render();
      }));
    };
    const close = () => overlayEl.classList.remove('open');
    launcher.addEventListener('click', () => { render(); overlayEl.classList.add('open'); });
    overlayEl.querySelectorAll('.page-manager-close').forEach(b => b.addEventListener('click', close));
    overlayEl.addEventListener('click', e => { if (e.target === overlayEl) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    overlayEl.querySelector('.restore-all').addEventListener('click', () => { setHidden([]); applyHiddenPages(); render(); });
  };

  // Add a Back button to pages opened from the menu.
  // It uses browser history when available and falls back to Home.
  const addSiteBackButton = () => {
    const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (file === 'index.html' || document.querySelector('.site-back-button')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'site-back-button';
    btn.innerHTML = '<span aria-hidden="true">←</span><span>Back</span>';
    btn.setAttribute('aria-label', 'Go back to previous page');
    btn.addEventListener('click', () => {
      if (window.history.length > 1) window.history.back();
      else window.location.href = 'index.html';
    });
    document.body.appendChild(btn);
  };

  addSiteBackButton();
  buildPageManager();
  addInlinePageCutButtons();
  applyHiddenPages();
  renderInlinePageCutState();

})();
