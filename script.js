const container = document.querySelector('.snap-container');

if (container) {
  const panels = Array.from(document.querySelectorAll('.panel'));

  let isAnimating = false;
  let accumulatedDelta = 0;
  let idleTimer = null;

  const THRESHOLD = 1;

  function getCurrentIndex() {
    return Math.round(container.scrollTop / window.innerHeight);
  }

  function scrollToPanel(index) {
    index = Math.max(0, Math.min(panels.length - 1, index));

    if (index === getCurrentIndex()) {
      accumulatedDelta = 0;
      return;
    }

    isAnimating = true;
    panels[index].scrollIntoView({ behavior: 'smooth' });

    setTimeout(() => {
      isAnimating = false;
      accumulatedDelta = 0;
    }, 200);
  }

  container.addEventListener('wheel', (e) => {
    e.preventDefault();

    if (isAnimating) return;

    let delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 32;
    if (e.deltaMode === 2) delta *= window.innerHeight;

    if (Math.sign(delta) !== Math.sign(accumulatedDelta)) {
      accumulatedDelta = 0;
    }

    accumulatedDelta += delta;

    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      accumulatedDelta = 0;
    }, 0);

    if (Math.abs(accumulatedDelta) >= THRESHOLD) {
      const direction = accumulatedDelta > 0 ? 1 : -1;
      accumulatedDelta = 0;
      clearTimeout(idleTimer);
      scrollToPanel(getCurrentIndex() + direction);
    }
  }, { passive: false });
}

const lightbox = document.querySelector('.lightbox');

if (lightbox) {
  const lightboxImg = lightbox.querySelector('img');
  const lightboxClose = lightbox.querySelector('.lightbox-close');

  document.querySelectorAll('.gallery-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      lightboxImg.src = item.getAttribute('href');
      lightboxImg.alt = item.querySelector('img').alt;
      lightbox.hidden = false;
    });
  });

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.src = '';
  }

  lightboxClose.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });
}
