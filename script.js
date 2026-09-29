const container = document.querySelector('.snap-container');
const panels = Array.from(document.querySelectorAll('.panel'));

let isAnimating = false; // zamezí přeskakování více sekcí najednou

function getCurrentIndex() {
  return Math.round(container.scrollTop / window.innerHeight);
}

function scrollToPanel(index) {
  // omezit na rozsah sekcí
  index = Math.max(0, Math.min(panels.length - 1, index));

  isAnimating = true;
  panels[index].scrollIntoView({ behavior: 'smooth' });

  // po dokončení animace (~1 s) povolit další scroll
  setTimeout(() => {
    isAnimating = false;
  }, 1000);
}

container.addEventListener('wheel', (e) => {
  e.preventDefault();

  if (isAnimating) return;

  if (e.deltaY > 0) {
    scrollToPanel(getCurrentIndex() + 1); // dolů
  } else {
    scrollToPanel(getCurrentIndex() - 1); // nahoru
  }
}, { passive: false });