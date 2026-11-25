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
function filterProjects(category) { const academic = category === 'academico'; $('#project-list').hidden = !academic; $('#empty').hidden = academic; $('#filter-count').textContent = academic ? '02 EXIBIDOS' : '00 EXIBIDOS'; $$('.filters button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category))); }
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
