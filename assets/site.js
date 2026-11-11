/** Follow the system theme until the visitor saves an explicit choice. */
export function setupTheme(doc = document, storage, media = globalThis.matchMedia?.('(prefers-color-scheme: dark)')) {
  const button = doc.querySelector('.theme-toggle');
  if (!button) return;
  if (!storage) {
    try { storage = globalThis.localStorage; } catch { /* Storage may be unavailable. */ }
  }
  const root = doc.documentElement;
  function effectiveTheme() {
    if (['light', 'dark'].includes(root.dataset.theme)) return root.dataset.theme;
    return media?.matches ? 'dark' : 'light';
  }
  function sync() {
    const dark = effectiveTheme() === 'dark';
    const label = dark ? 'Switch to light mode' : 'Switch to dark mode';
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
    doc.getElementById('theme-icon')?.setAttribute('href', dark ? '#sun' : '#moon');
    doc.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#141812' : '#f6f7f2');
  }
  button.addEventListener('click', () => {
    const theme = effectiveTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = theme;
    try { storage?.setItem('koko-site-theme', theme); } catch { /* Keep the current-page preference. */ }
    sync();
  });
  media?.addEventListener('change', sync);
  button.hidden = false;
  sync();
}

if (typeof document !== 'undefined') {
  setupTheme();
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
}
