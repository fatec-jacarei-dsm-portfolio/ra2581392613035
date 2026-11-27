'use strict';
const root = document.documentElement;
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const accentNames = { lime: 'LIMA / ORIGINAL', mint: 'VERDE MENTA', teal: 'VERDE ÁGUA', gold: 'AMARELO SUAVE' };
function readPreference(key) { try { return localStorage.getItem(key); } catch { return null; } }
function savePreference(key, value) { try { localStorage.setItem(key, value); } catch { /* Site remains functional without storage. */ } }
function setTheme(theme) { root.dataset.theme = theme; $('#theme').setAttribute('aria-pressed', String(theme === 'light')); savePreference('gmp-theme', theme); }
function setAccent(accent) { if (!Object.hasOwn(accentNames, accent)) return; root.dataset.accent = accent; $$('.swatches button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.accent === accent))); $('#accent-name').textContent = accentNames[accent]; savePreference('gmp-accent', accent); }
setTheme(readPreference('gmp-theme') === 'light' ? 'light' : 'dark');
setAccent(readPreference('gmp-accent') || 'lime');
$('#theme').addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));
$$('.swatches button').forEach(button => button.addEventListener('click', () => setAccent(button.dataset.accent)));
function filterProjects(category) {
  const academic = category === 'academico';
  const wasHidden = $('#project-carousel').hidden;
  $('#project-carousel').hidden = !academic;
  $('#empty').hidden = academic;
  $$('.filters button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  if (!academic) {
    clearTimeout(carouselTimer);
    targetProject = null;
    pendingSteps = [];
  } else if (wasHidden) {
    requestAnimationFrame(() => {
      scrollToPhysical(settledIndex, true);
      updateCarousel();
    });
  }
}
$$('[data-filter]').forEach(button => button.addEventListener('click', () => filterProjects(button.dataset.filter)));
$$('[data-jump]').forEach(link => link.addEventListener('click', () => filterProjects(link.dataset.jump)));
const command = $('#command-dialog');
const search = $('#command-search');
const commandLinks = $$('.commands a');
function filterCommands() { const normalize = str => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); let count = 0; commandLinks.forEach(link => { const visible = normalize(link.textContent).includes(normalize(search.value.trim())); link.hidden = !visible; if (visible) count++; }); $('#no-command').hidden = count !== 0; }
function openCommand() { if ($('dialog[open]')) return; search.value = ''; filterCommands(); command.showModal(); search.focus(); }
$('#command').addEventListener('click', openCommand);
search.addEventListener('input', filterCommands);
search.addEventListener('keydown', event => { if (event.key === 'ArrowDown' || event.key === 'Enter') { const first = commandLinks.find(link => !link.hidden); if (first) { event.preventDefault(); if (event.key === 'Enter') first.click(); else first.focus(); } } });
commandLinks.forEach(link => link.addEventListener('click', () => command.close()));
document.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openCommand(); } });
$$('[data-case]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.case).showModal()));
$$('dialog').forEach(dialog => { dialog.querySelector('.close').addEventListener('click', () => dialog.close()); dialog.addEventListener('click', event => { if (event.target !== dialog) return; const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); }); });
const hero = $('#hero-art');
if (!matchMedia('(prefers-reduced-motion: reduce)').matches && matchMedia('(pointer: fine)').matches) { hero.addEventListener('pointermove', event => { const r = hero.getBoundingClientRect(); const x = (event.clientX - r.left - r.width / 2) / r.width; const y = (event.clientY - r.top - r.height / 2) / r.height; hero.style.setProperty('--mx', `${x * 34}px`); hero.style.setProperty('--my', `${y * 34}px`); hero.style.setProperty('--rot', `${x * 18}deg`); }); hero.addEventListener('pointerleave', () => { hero.style.setProperty('--mx', '0px'); hero.style.setProperty('--my', '0px'); hero.style.setProperty('--rot', '0deg'); }); }
const navLinks = $$('.nav-links a');
const sections = navLinks.map(link => $(link.getAttribute('href')));
function updateScroll() { const max = root.scrollHeight - innerHeight; $('.progress').style.width = `${max > 0 ? scrollY / max * 100 : 0}%`; let active = sections[0]; for (const section of sections) if (section.getBoundingClientRect().top <= 135) active = section; if (max > 0 && scrollY >= max - 5) active = sections.at(-1); navLinks.forEach(link => { if (link.hash === `#${active.id}`) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); }); }
let scrollScheduled = false; window.addEventListener('scroll', () => { if (scrollScheduled) return; scrollScheduled = true; requestAnimationFrame(() => { updateScroll(); scrollScheduled = false; }); }, { passive: true }); window.addEventListener('resize', updateScroll); updateScroll();


// Carrossel circular: cópias nas extremidades permitem transições contínuas.
const carousel = $('#project-list');
const carouselCards = [...carousel.querySelectorAll('.project')];
const carouselDots = $$('[data-slide]');
const prevProject = $('#carousel-prev');
const nextProject = $('#carousel-next');
const carouselPosition = $('#carousel-position');
const totalProjects = carouselCards.length;
const buffer = Math.min(2, totalProjects);
const formatSemester = n => String(n).padStart(2, '0');
const modulo = n => (n % totalProjects + totalProjects) % totalProjects;
carouselCards.forEach((card, i) => { card.dataset.projectIndex = i; });
function copyProject(card) {
  const copy = card.cloneNode(true);
  copy.removeAttribute('id');
  copy.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
  copy.dataset.carouselCopy = 'true';
  copy.setAttribute('aria-hidden', 'true');
  copy.inert = true;
  copy.querySelectorAll('[data-case]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.case).showModal()));
  return copy;
}
carousel.prepend(...carouselCards.slice(-buffer).map(copyProject));
carousel.append(...carouselCards.slice(0, buffer).map(copyProject));
const trackCards = [...carousel.children];
const cardOffset = card => card.offsetLeft - trackCards[0].offsetLeft;
const logicalIndex = physical => modulo(physical - buffer);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let settledIndex = buffer;
let targetProject = null;
let carouselTimer;
let pendingSteps = [];
function nearestCard() {
  return trackCards.reduce((nearest, card, i) => Math.abs(cardOffset(card) - carousel.scrollLeft) < Math.abs(cardOffset(trackCards[nearest]) - carousel.scrollLeft) ? i : nearest, 0);
}
function visibleCards() {
  const left = carousel.scrollLeft;
  const right = left + carousel.clientWidth;
  return trackCards.map((card, i) => {
    const start = cardOffset(card);
    const overlap = Math.min(right, start + card.offsetWidth) - Math.max(left, start);
    return overlap >= card.offsetWidth * .5 ? i : -1;
  }).filter(i => i !== -1);
}
function updateCarousel() {
  if ($('#project-carousel').hidden || !carousel.clientWidth) return;
  const visible = visibleCards();
  if (!visible.length) return;
  const indices = visible.map(logicalIndex);
  const first = indices[0], last = indices.at(-1);
  const label = `${formatSemester(first + 1)}${first !== last ? '–' + formatSemester(last + 1) : ''} / ${formatSemester(totalProjects)}`;
  if (carouselPosition.textContent !== label) carouselPosition.textContent = label;
  carouselDots.forEach((dot, i) => {
    dot.classList.toggle('is-visible', indices.includes(i));
    if (i === first) dot.setAttribute('aria-current', 'true');
    else dot.removeAttribute('aria-current');
  });
  trackCards.forEach((card, i) => {
    const active = visible.includes(i) || card.contains(document.activeElement);
    card.inert = !active;
    if (active) card.removeAttribute('aria-hidden');
    else card.setAttribute('aria-hidden', 'true');
  });
}
function scrollToPhysical(index, instant = false) {
  carousel.scrollTo({ left: cardOffset(trackCards[index]), behavior: instant || reducedMotion.matches ? 'instant' : 'smooth' });
}
function settleCarousel() {
  clearTimeout(carouselTimer);
  if ($('#project-carousel').hidden || !carousel.clientWidth) return;
  const nearest = nearestCard();
  const equivalent = buffer + logicalIndex(nearest);
  // Reposicionamento invisível: os cards exibidos são os mesmos nos dois pontos.
  if (nearest !== equivalent) {
    const focused = document.activeElement;
    const focusCard = trackCards.find(card => card.contains(focused));
    const focusIndex = focusCard ? Number(focusCard.dataset.projectIndex) : -1;
    const focusSelector = focused.matches?.('[data-case]') ? '[data-case]' : focused.matches?.('a') ? 'a' : null;
    scrollToPhysical(equivalent, true);
    if (focusCard?.dataset.carouselCopy && focusSelector) {
      carouselCards[focusIndex].querySelector(focusSelector)?.focus({ preventScroll: true });
    }
  }
  settledIndex = equivalent;
  targetProject = null;
  updateCarousel();
  if (pendingSteps.length) moveProject(pendingSteps.shift());
}
function goToProject(index) {
  pendingSteps = [];
  const logical = modulo(index);
  const nearest = nearestCard();
  const candidates = trackCards.map((_, i) => i).filter(i => logicalIndex(i) === logical && i < trackCards.length - (matchMedia('(max-width: 700px)').matches ? 0 : 1));
  const physical = candidates.reduce((best, i) => Math.abs(i - nearest) < Math.abs(best - nearest) ? i : best, buffer + logical);
  targetProject = physical;
  scrollToPhysical(physical);
  clearTimeout(carouselTimer);
  carouselTimer = setTimeout(settleCarousel, 180);
}
function moveProject(step) {
  if (targetProject !== null) { pendingSteps.push(step); return; }
  const nearest = nearestCard();
  const physical = buffer + logicalIndex(nearest);
  if (physical !== nearest) scrollToPhysical(physical, true);
  targetProject = physical + step;
  scrollToPhysical(targetProject);
  clearTimeout(carouselTimer);
  carouselTimer = setTimeout(settleCarousel, 180);
}
prevProject.addEventListener('click', () => moveProject(-1));
nextProject.addEventListener('click', () => moveProject(1));
carouselDots.forEach(dot => dot.addEventListener('click', () => goToProject(Number(dot.dataset.slide))));
carousel.addEventListener('keydown', event => {
  if (event.target !== carousel) return;
  if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
    event.preventDefault();
    if (event.key === 'Home' || event.key === 'End') goToProject(event.key === 'Home' ? 0 : totalProjects - 1);
    else moveProject(event.key === 'ArrowLeft' ? -1 : 1);
  }
});
carousel.addEventListener('scroll', () => {
  updateCarousel();
  clearTimeout(carouselTimer);
  carouselTimer = setTimeout(settleCarousel, 150);
}, { passive: true });
carousel.addEventListener('pointerdown', () => { targetProject = null; pendingSteps = []; });
window.addEventListener('resize', () => {
  if ($('#project-carousel').hidden) return;
  targetProject = null;
  pendingSteps = [];
  scrollToPhysical(settledIndex, true);
  updateCarousel();
});
// Links da trajetória e da busca apontam para os projetos reais, não suas cópias.
$$('[data-jump][href]').forEach(link => {
  const index = carouselCards.findIndex(card => `#${card.id}` === link.hash);
  if (index === -1) return;
  link.addEventListener('click', event => {
    event.preventDefault();
    requestAnimationFrame(() => {
      goToProject(index);
      $('#project-carousel').scrollIntoView({ block: 'start', behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    });
  });
});
scrollToPhysical(buffer, true);
updateCarousel();
