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
  const btnClose = lightbox.querySelector('.lightbox-close');
  const btnPrev = lightbox.querySelector('.lightbox-prev');
  const btnNext = lightbox.querySelector('.lightbox-next');
  const items = Array.from(document.querySelectorAll('.gallery-item'));

  const ZOOM_SCALE = 2.5;
  const DRAG_MARGIN = 80;

  let currentIndex = 0;
  let zoomed = false;
  let posX = 0;
  let posY = 0;
  let drag = null;
  let justDragged = false;

  function applyTransform() {
    lightboxImg.style.transform =
      'translate(' + posX + 'px, ' + posY + 'px) scale(' + (zoomed ? ZOOM_SCALE : 1) + ')';
  }

  function clampPosition() {
    const scaledW = lightboxImg.offsetWidth * ZOOM_SCALE;
    const scaledH = lightboxImg.offsetHeight * ZOOM_SCALE;
    const maxX = Math.max(0, (scaledW - window.innerWidth) / 2) + DRAG_MARGIN;
    const maxY = Math.max(0, (scaledH - window.innerHeight) / 2) + DRAG_MARGIN;
    posX = Math.max(-maxX, Math.min(maxX, posX));
    posY = Math.max(-maxY, Math.min(maxY, posY));
  }

  function resetZoom() {
    zoomed = false;
    posX = 0;
    posY = 0;
    drag = null;
    lightbox.classList.remove('zoomed', 'dragging');
    applyTransform();
  }

  function showImage(index) {
    currentIndex = (index + items.length) % items.length;
    const item = items[currentIndex];
    lightboxImg.src = item.getAttribute('href');
    lightboxImg.alt = item.querySelector('img').alt;
    resetZoom();
  }

  function openLightbox(index) {
    showImage(index);
    lightbox.classList.toggle('single', items.length <= 1);
    lightbox.hidden = false;
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.src = '';
    resetZoom();
  }

  items.forEach((item, index) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(index);
    });
  });

  btnClose.addEventListener('click', closeLightbox);
  btnPrev.addEventListener('click', () => showImage(currentIndex - 1));
  btnNext.addEventListener('click', () => showImage(currentIndex + 1));

  lightboxImg.addEventListener('click', (e) => {
    if (justDragged) {
      justDragged = false;
      return;
    }

    if (!zoomed) {
      const rect = lightboxImg.getBoundingClientRect();
      const cx = e.clientX - (rect.left + rect.width / 2);
      const cy = e.clientY - (rect.top + rect.height / 2);
      posX = -cx * (ZOOM_SCALE - 1);
      posY = -cy * (ZOOM_SCALE - 1);
      zoomed = true;
      lightbox.classList.add('zoomed');
      clampPosition();
      applyTransform();
    } else {
      resetZoom();
    }
  });

  lightboxImg.addEventListener('pointerdown', (e) => {
    if (!zoomed) return;
    drag = { startX: e.clientX, startY: e.clientY, baseX: posX, baseY: posY };
    lightboxImg.setPointerCapture(e.pointerId);
    lightbox.classList.add('dragging');
  });

  lightboxImg.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (Math.abs(dx) + Math.abs(dy) > 4) justDragged = true;
    posX = drag.baseX + dx;
    posY = drag.baseY + dy;
    clampPosition();
    applyTransform();
  });

  function endDrag() {
    drag = null;
    lightbox.classList.remove('dragging');
  }

  lightboxImg.addEventListener('pointerup', endDrag);
  lightboxImg.addEventListener('pointercancel', endDrag);

  lightboxImg.addEventListener('dragstart', (e) => e.preventDefault());

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
  });
}
