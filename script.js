const preloader = document.getElementById('preloader');
const loadPct = document.getElementById('loadPct');
const loadRing = document.getElementById('loadRing');

const hero = document.getElementById('hero');
const headlineWrap = document.getElementById('headlineWrap');
const headlineOutline = document.querySelector('.headline-outline');
const headlineFill = document.querySelector('.headline-fill');
const revealItems = Array.from(document.querySelectorAll('.reveal'));
const projectCards = document.querySelectorAll('.project-card');
const sections = Array.from(document.querySelectorAll('main section'));

const palette = document.getElementById('commandPalette');
const commandInput = document.getElementById('commandInput');
const commandList = document.getElementById('commandList');
const commandItems = Array.from(document.querySelectorAll('#commandList li'));


const ringLength = 276.46;
const revealLagMs = 100;
const mobileHeroText = 'engineering intelligent full stack systems with ai at the core';
let v = 0;
let letterItems = [];
let rafId = 0;
let paletteOpen = false;
let activeCommandIndex = 0;
const originalOutlineHTML = headlineOutline?.innerHTML || '';
const originalFillHTML = headlineFill?.innerHTML || '';

const loaderTimer = setInterval(() => {
  v = Math.min(v + Math.floor(Math.random() * 9) + 4, 100);
  if (loadPct) loadPct.textContent = String(v).padStart(2, '0');
  if (loadRing) {
    const offset = ringLength - (ringLength * v) / 100;
    loadRing.style.strokeDashoffset = `${offset}`;
  }
  if (v >= 100) {
    clearInterval(loaderTimer);
    setTimeout(closeLoader, 280);
  }
}, 85);

function closeLoader() {
  if (!preloader) return;
  document.body.style.overflowY = 'auto';
  preloader.classList.add('hide');
  setTimeout(() => {
    if (preloader && preloader.parentNode) preloader.remove();
  }, 500);
}

window.addEventListener('load', () => {
  setTimeout(() => {
    if (v < 100) v = 100;
    if (loadPct) loadPct.textContent = '100';
    if (loadRing) loadRing.style.strokeDashoffset = '0';
    closeLoader();
  }, 3200);
});
setTimeout(closeLoader, 8200);

function setHeroLens(clientX, clientY) {
  if (!headlineWrap) return;
  const rect = headlineWrap.getBoundingClientRect();
  headlineWrap.style.setProperty('--mx', `${clientX - rect.left}px`);
  headlineWrap.style.setProperty('--my', `${clientY - rect.top}px`);
}

hero?.addEventListener('pointerenter', () => headlineWrap?.classList.add('active'));
hero?.addEventListener('pointerleave', () => headlineWrap?.classList.remove('active'));
hero?.addEventListener('pointermove', (e) => setHeroLens(e.clientX, e.clientY));
hero?.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  if (!t) return;
  headlineWrap?.classList.add('active');
  setHeroLens(t.clientX, t.clientY);
}, { passive: true });
hero?.addEventListener('touchmove', (e) => {
  const t = e.touches[0];
  if (!t) return;
  setHeroLens(t.clientX, t.clientY);
}, { passive: true });
hero?.addEventListener('touchend', () => {
  if (!window.matchMedia('(pointer:coarse)').matches) {
    headlineWrap?.classList.remove('active');
  }
}, { passive: true });

function syncMobileHeroLayout() {
  const isMobile = window.matchMedia('(max-width: 900px)').matches;

  if (headlineOutline && headlineFill) {
    if (isMobile) {
      headlineOutline.textContent = mobileHeroText;
      headlineFill.textContent = mobileHeroText;
    } else {
      headlineOutline.innerHTML = originalOutlineHTML;
      headlineFill.innerHTML = originalFillHTML;
    }
  }

  if (!headlineWrap) return;
  if (isMobile) {
    headlineWrap.classList.add('active');
    const rect = headlineWrap.getBoundingClientRect();
    headlineWrap.style.setProperty('--mx', `${rect.width * 0.5}px`);
    headlineWrap.style.setProperty('--my', `${rect.height * 0.5}px`);
  }
}

syncMobileHeroLayout();
window.addEventListener('resize', syncMobileHeroLayout);

projectCards.forEach((card) => {
  const hidden = card.querySelector('.project-hidden');
  if (!hidden) return;

  card.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;
    card.classList.toggle('is-open');
  });

  card.setAttribute('tabindex', '0');
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.classList.toggle('is-open');
    }
  });
});

function clearRevealTimers() {
  letterItems.forEach((item) => {
    if (item.timer) clearTimeout(item.timer);
    item.timer = null;
  });
}

function buildLetterReveal() {
  clearRevealTimers();
  letterItems = [];

  const targets = document.querySelectorAll('main section:not(.hero) h2, main section:not(.hero) h3, main section:not(.hero) p, main section:not(.hero) li, main section:not(.hero) a');
  targets.forEach((el) => {
    if (el.closest('.project-head')) return;
    if (el.closest('.project-link')) return;
    if (el.querySelector('br') || el.children.length > 0) return;

    if (!el.dataset.baseText) {
      const initialText = (el.textContent || '').trim();
      if (!initialText) return;
      el.dataset.baseText = initialText;
    }

    const sourceText = el.dataset.baseText;
    if (!sourceText) return;

    const frag = document.createDocumentFragment();
    const chars = [];
    for (const ch of sourceText) {
      const span = document.createElement('span');
      span.className = 'char-reveal';
      span.textContent = ch;
      frag.appendChild(span);
      chars.push(span);
    }
    el.textContent = '';
    el.appendChild(frag);
    letterItems.push({ el, chars, shown: 0, pending: 0, timer: null });
  });
}

function updateLetterReveal() {
  const vh = window.innerHeight;
  letterItems.forEach((item) => {
    const rect = item.el.getBoundingClientRect();
    const start = vh * 1.35;
    const end = vh * 0.92;
    const progress = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
    const targetCount = Math.floor(item.chars.length * progress);
    if (targetCount === item.pending) return;

    item.pending = targetCount;
    if (item.timer) clearTimeout(item.timer);
    item.timer = setTimeout(() => {
      if (item.pending > item.shown) {
        for (let i = item.shown; i < item.pending; i += 1) item.chars[i]?.classList.add('is-visible');
      } else {
        for (let i = item.pending; i < item.shown; i += 1) item.chars[i]?.classList.remove('is-visible');
      }
      item.shown = item.pending;
      item.timer = null;
    }, revealLagMs);
  });
}

function updateParallaxLayers() {
  const y = window.scrollY;
  sections.forEach((section, idx) => {
    section.classList.add('depth-layer');
    const depth = Number(section.dataset.depth || ((idx % 4) * 0.04 + 0.06));
    section.style.transform = `translate3d(0, ${y * depth * -0.12}px, 0)`;
  });
}

function onScrollTick() {
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    updateLetterReveal();
    updateParallaxLayers();
    rafId = 0;
  });
}

buildLetterReveal();
window.addEventListener('scroll', onScrollTick, { passive: true });
window.addEventListener('resize', onScrollTick);
updateLetterReveal();
updateParallaxLayers();

if ('IntersectionObserver' in window) {
  revealItems.forEach((el, idx) => {
    el.style.transitionDuration = `${0.55 + (idx % 3) * 0.12}s`;
    el.style.transitionTimingFunction = idx % 2 === 0 ? 'cubic-bezier(.2,.8,.2,1)' : 'cubic-bezier(.16,1,.3,1)';
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
  revealItems.forEach((el) => io.observe(el));
} else {
  revealItems.forEach((el) => el.classList.add('visible'));
}

function openPalette() {
  if (!palette) return;
  palette.hidden = false;
  paletteOpen = true;
  activeCommandIndex = 0;
  commandItems.forEach((li, i) => li.classList.toggle('active', i === 0));
  if (commandInput) {
    commandInput.value = '';
    commandInput.focus();
  }
}

function closePalette() {
  if (!palette) return;
  palette.hidden = true;
  paletteOpen = false;
}

function executeCommand(item) {
  if (!item) return;
  const target = item.getAttribute('data-target');
  const url = item.getAttribute('data-url');
  if (target) {
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
  closePalette();
}

function filterCommands() {
  const q = (commandInput?.value || '').trim().toLowerCase();
  let firstVisible = -1;
  commandItems.forEach((li, idx) => {
    const show = li.textContent.toLowerCase().includes(q);
    li.style.display = show ? '' : 'none';
    if (show && firstVisible === -1) firstVisible = idx;
    li.classList.remove('active');
  });
  activeCommandIndex = firstVisible === -1 ? 0 : firstVisible;
  commandItems[activeCommandIndex]?.classList.add('active');
}

commandInput?.addEventListener('input', filterCommands);
commandItems.forEach((li) => {
  li.addEventListener('click', () => executeCommand(li));
});

document.addEventListener('keydown', (e) => {
  const isK = e.key.toLowerCase() === 'k';
  if ((e.ctrlKey || e.metaKey) && isK) {
    e.preventDefault();
    if (paletteOpen) closePalette(); else openPalette();
    return;
  }

  if (!paletteOpen) return;

  if (e.key === 'Escape') {
    e.preventDefault();
    closePalette();
    return;
  }

  const visible = commandItems.filter((li) => li.style.display !== 'none');
  if (!visible.length) return;

  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    const current = visible.indexOf(commandItems[activeCommandIndex]);
    const delta = e.key === 'ArrowDown' ? 1 : -1;
    const next = (current + delta + visible.length) % visible.length;
    commandItems.forEach((li) => li.classList.remove('active'));
    const nextEl = visible[next];
    nextEl.classList.add('active');
    activeCommandIndex = commandItems.indexOf(nextEl);
  }

  if (e.key === 'Enter') {
    e.preventDefault();
    executeCommand(commandItems[activeCommandIndex]);
  }
});

palette?.addEventListener('click', (e) => {
  if (e.target === palette) closePalette();
});
