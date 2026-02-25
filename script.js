const preloader = document.getElementById('preloader');
const loadPct = document.getElementById('loadPct');
const loadRing = document.getElementById('loadRing');

const hero = document.getElementById('hero');
const headlineWrap = document.getElementById('headlineWrap');
const revealItems = document.querySelectorAll('.reveal');
const projectCards = document.querySelectorAll('.project-card');

const ringLength = 276.46;
const revealLagMs = 120;
let v = 0;
let letterItems = [];

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
hero?.addEventListener('touchend', () => headlineWrap?.classList.remove('active'), { passive: true });

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

    const sourceText = (el.dataset.baseText || el.textContent || '').trim();
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

let rafId = 0;
function onScrollTick() {
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    updateLetterReveal();
    rafId = 0;
  });
}

buildLetterReveal();
window.addEventListener('scroll', onScrollTick, { passive: true });
window.addEventListener('resize', onScrollTick);
updateLetterReveal();

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
  revealItems.forEach((el) => io.observe(el));
} else {
  revealItems.forEach((el) => el.classList.add('visible'));
}
