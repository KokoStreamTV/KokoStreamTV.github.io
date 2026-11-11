import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

import { setupTheme } from '../assets/site.js';

/** Model the browser controls while keeping theme preference changes observable. */
function themeFixture(dark = false, preference) {
  const button = new EventTarget();
  const attributes = {};
  button.setAttribute = (name, value) => { attributes[name] = value; };
  button.hidden = true;
  const media = new EventTarget();
  media.matches = dark;
  const dataset = preference ? { theme: preference } : {};
  const doc = {
    documentElement: { dataset },
    querySelector: selector => selector === '.theme-toggle' ? button : null,
    getElementById: () => null
  };
  return { button, attributes, media, dataset, doc };
}

test('device theme changes remain active until a visitor makes and persists a choice', () => {
  const fixture = themeFixture();
  const writes = [];
  setupTheme(fixture.doc, { setItem: (...args) => writes.push(args) }, fixture.media);
  assert.equal(fixture.button.hidden, false);
  assert.equal(fixture.attributes['aria-label'], 'Switch to dark mode');
  fixture.media.matches = true;
  fixture.media.dispatchEvent(new Event('change'));
  assert.equal(fixture.attributes['aria-label'], 'Switch to light mode');
  assert.equal(fixture.dataset.theme, undefined);
  fixture.button.dispatchEvent(new Event('click'));
  assert.equal(fixture.dataset.theme, 'light');
  assert.deepEqual(writes, [['koko-site-theme', 'light']]);
  fixture.media.dispatchEvent(new Event('change'));
  assert.equal(fixture.attributes['aria-label'], 'Switch to dark mode');
});

test('an existing explicit preference overrides a different device preference', () => {
  const fixture = themeFixture(false, 'dark');
  setupTheme(fixture.doc, { setItem() {} }, fixture.media);
  assert.equal(fixture.attributes['aria-label'], 'Switch to light mode');
  fixture.media.dispatchEvent(new Event('change'));
  assert.equal(fixture.dataset.theme, 'dark');
  assert.equal(fixture.attributes['aria-label'], 'Switch to light mode');
});

test('blocked storage still permits toggling themes for the current page', () => {
  const fixture = themeFixture();
  setupTheme(fixture.doc, { setItem() { throw new Error('Storage blocked'); } }, fixture.media);
  fixture.button.dispatchEvent(new Event('click'));
  assert.equal(fixture.dataset.theme, 'dark');
  fixture.button.dispatchEvent(new Event('click'));
  assert.equal(fixture.dataset.theme, 'light');
});

test('theme setup tolerates a missing optional control', () => {
  assert.doesNotThrow(() => setupTheme({ querySelector: () => null }));
});

test('early theme initialization accepts only valid preferences and tolerates blocked storage', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const script = /<script>\s*([\s\S]*?)<\/script>/.exec(html)[1];
  for (const choice of ['dark', 'light', 'invalid', null]) {
    const dataset = {};
    runInNewContext(script, { document: { documentElement: { dataset } }, localStorage: { getItem: () => choice } });
    assert.equal(dataset.theme, ['dark', 'light'].includes(choice) ? choice : undefined);
  }
  const dataset = {};
  assert.doesNotThrow(() => runInNewContext(script, {
    document: { documentElement: { dataset } },
    get localStorage() { throw new Error('Storage unavailable'); }
  }));
  assert.equal(dataset.theme, undefined);
});

test('all page anchors and local assets resolve, including stylesheet font assets', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'Duplicate element IDs');
  for (const match of html.matchAll(/(?:href|xlink:href)="#([^"]+)"/g)) {
    assert.ok(ids.includes(match[1]), `Missing target ${match[1]}`);
  }
  for (const match of html.matchAll(/(?:href|src)="\.\/([^"#]+)"/g)) {
    await access(new URL('../' + match[1], import.meta.url));
  }
  const css = await readFile(new URL('../assets/site.css', import.meta.url), 'utf8');
  for (const match of css.matchAll(/url\(['"](\.\/[^'"]+)['"]\)/g)) {
    await access(new URL('../assets/' + match[1], import.meta.url));
  }
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
});

test('project actions work without JavaScript and do not promise a finished release', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /href="https:\/\/github.com\/KokoStreamTV\/Koko">Follow development/);
  assert.match(html, /href="https:\/\/docs.lizardbyte.dev\/projects\/koko\/latest\/"/);
  assert.match(html, /In development/);
  assert.match(html, /not a finished product/);
  assert.doesNotMatch(html, /\/releases\/latest|Download now|Open.source/i);
  const donations = [...html.matchAll(/class="button button-outline" href="(https:\/\/[^\"]+)"/g)];
  assert.equal(donations.length, 3);
});
