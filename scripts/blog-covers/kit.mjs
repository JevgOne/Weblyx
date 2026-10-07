// Drawing kit for the blog covers: one visual language, many scenes.
// Everything is 1600x900 SVG, rendered to PNG at 2x.

export const F = "-apple-system, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";
export const C = {
  teal: '#14b8a6', tealL: '#5eead4', tealD: '#0d9488', ink: '#0f172a', slate: '#94a3b8',
  amber: '#f59e0b', amberL: '#fbbf24', red: '#f87171', white: '#ffffff', line: '#e2e8f0', soft: '#f4f6fa',
};

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** Rough advance width of a string in SF bold. Good enough to size pills. */
export const tw = (s, size) => [...String(s)].reduce((n, ch) => n + (/[ .,:;!|il1'’]/.test(ch) ? 0.3 : /[mwMW%]/.test(ch) ? 0.9 : /[A-ZČŘŠŽÁÉÍÓÚ0-9]/.test(ch) ? 0.66 : 0.56), 0) * size;

export function t(x, y, s, o = {}) {
  const { size = 22, w = 600, fill = C.ink, anchor = 'start', ls = 0, op = 1 } = o;
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${w}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${ls}" opacity="${op}">${esc(s)}</text>`;
}

export const sk = (x, y, w, h = 12, fill = '#cbd5e1') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}"/>`;

export function defs(blob = '#6366f1') {
  return `<defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b1222"/><stop offset="1" stop-color="#14213d"/></linearGradient>
    <radialGradient id="blobTeal" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#14b8a6" stop-opacity=".55"/><stop offset="1" stop-color="#14b8a6" stop-opacity="0"/></radialGradient>
    <radialGradient id="blob2" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${blob}" stop-opacity=".42"/><stop offset="1" stop-color="${blob}" stop-opacity="0"/></radialGradient>
    <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5eead4"/><stop offset="1" stop-color="#0d9488"/></linearGradient>
    <linearGradient id="ringAmber" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fcd34d"/><stop offset="1" stop-color="#f59e0b"/></linearGradient>
    <linearGradient id="photo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#99f6e4"/><stop offset="1" stop-color="#22d3ee"/></linearGradient>
    <linearGradient id="card" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#243449"/><stop offset="1" stop-color="#18243a"/></linearGradient>
    <linearGradient id="tealBar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2dd4bf"/><stop offset="1" stop-color="#14b8a6"/></linearGradient>
    <linearGradient id="amberBar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fbbf24"/><stop offset="1" stop-color="#f59e0b"/></linearGradient>
    <pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.6" fill="#fff" fill-opacity=".07"/></pattern>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="30" stdDeviation="30" flood-color="#020617" flood-opacity=".55"/></filter>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#020617" flood-opacity=".5"/></filter>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
    <path id="spark" d="M0 -1Q0 0 1 0Q0 0 0 1Q0 0 -1 0Q0 0 0 -1Z"/>
  </defs>`;
}

export function backdrop(flip = false) {
  const [a, b] = flip ? [[330, 380], [1320, 830]] : [[1250, 430], [260, 820]];
  return `<rect width="1600" height="900" fill="url(#bg)"/>
  <circle cx="${a[0]}" cy="${a[1]}" r="560" fill="url(#blobTeal)"/>
  <circle cx="${b[0]}" cy="${b[1]}" r="460" fill="url(#blob2)"/>
  <rect width="1600" height="900" fill="url(#dots)"/>`;
}

export function sparkles(seed = 0) {
  const sets = [
    [[1486, 420, 26, C.tealL, 1], [1040, 150, 16, '#fff', .8], [548, 86, 14, C.tealL, .8], [1500, 790, 18, '#fff', .6]],
    [[70, 430, 22, C.tealL, 1], [1010, 96, 15, '#fff', .8], [1540, 250, 18, C.tealL, .8], [640, 840, 14, '#fff', .6]],
    [[1530, 600, 24, C.tealL, 1], [90, 110, 16, '#fff', .8], [1000, 830, 14, C.tealL, .8], [520, 70, 12, '#fff', .6]],
  ][seed % 3];
  return sets.map(([x, y, s, f, o]) => `<use href="#spark" transform="translate(${x} ${y}) scale(${s})" fill="${f}" fill-opacity="${o}"/>`).join('') +
    `<circle cx="${[1000, 1200, 60][seed % 3]}" cy="${[800, 60, 760][seed % 3]}" r="7" fill="${C.teal}"/>`;
}

let uid = 0;

/** A macOS Safari window. `inner(x, y, w, h)` draws the page below the toolbar. */
export function macWindow(x, y, w, h, domain, inner) {
  const id = `win${uid++}`;
  const TB = 64;
  const aw = Math.min(380, w * 0.44);
  const ax = x + (w - aw) / 2;
  const cy = y + TB / 2;
  const label = esc(domain);
  const lw = tw(domain, 16) + 22;
  const lx = x + w / 2 - lw / 2;
  const ic = `fill="none" stroke="#6e6e73" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"`;
  return `<g filter="url(#shadow)"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="#fff"/></g>
  <clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18"/></clipPath>
  <g clip-path="url(#${id})">
    <rect x="${x}" y="${y}" width="${w}" height="${TB}" fill="#f6f6f6"/>
    <rect x="${x}" y="${y + TB - 1}" width="${w}" height="1.5" fill="#d9d9de"/>
    <circle cx="${x + 32}" cy="${cy}" r="8.5" fill="#ff5f57" stroke="#e0443e"/>
    <circle cx="${x + 59}" cy="${cy}" r="8.5" fill="#febc2e" stroke="#d89e24"/>
    <circle cx="${x + 86}" cy="${cy}" r="8.5" fill="#28c840" stroke="#1aab29"/>
    <g ${ic}>
      <rect x="${x + 120}" y="${cy - 10}" width="26" height="20" rx="5"/><path d="M${x + 129} ${cy - 10}v20"/>
      <path d="M${x + 180} ${cy - 9}l-9 9 9 9"/><path d="M${x + 202} ${cy - 9}l9 9-9 9" stroke="#b9b9be"/>
    </g>
    <rect x="${ax}" y="${cy - 17}" width="${aw}" height="34" rx="9" fill="#e6e6ea"/>
    <g fill="none" stroke="#6e6e73" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="${lx}" y="${cy - 2}" width="11" height="9" rx="2.2" fill="#6e6e73"/>
      <path d="M${lx + 2.3} ${cy - 2}v-3a3.2 3.2 0 0 1 6.4 0v3"/>
      <path d="M${ax + aw - 18} ${cy - 4}a7 7 0 1 0 2 6"/><path d="M${ax + aw - 15} ${cy - 9}v5.5h-5.5"/>
    </g>
    <text x="${lx + 19}" y="${cy + 6}" font-size="16" font-weight="500" fill="#1d1d1f">${label}</text>
    <g ${ic}>
      <path d="M${x + w - 124} ${cy - 2}h-3v13h20v-13h-3"/><path d="M${x + w - 117} ${cy + 4}v-17M${x + w - 122.5} ${cy - 8}l5.5-5.5 5.5 5.5"/>
      <path d="M${x + w - 78} ${cy - 9}v18M${x + w - 87} ${cy}h18"/>
      <rect x="${x + w - 48}" y="${cy - 5}" width="16" height="15" rx="3.5"/><path d="M${x + w - 43.5} ${cy - 9.5}h12a3.5 3.5 0 0 1 3.5 3.5v11.5"/>
    </g>
    ${inner(x, y + TB, w, h - TB)}
  </g>`;
}

/** An iPhone showing Safari. `inner(x, y, w, h)` draws the page between the status bar and the address bar. */
export function iphone(x, y, h, domain, inner) {
  const id = `ph${uid++}`;
  const w = Math.round(h * 0.487);
  const b = 11; // bezel
  const sx = x + b, sy = y + b, sw = w - 2 * b, sh = h - 2 * b;
  const r = w * 0.155;
  const top = 56, bottom = 92;
  const pw = Math.min(sw - 36, tw(domain, 16) + 70);
  return `<g filter="url(#shadow)"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="#0b0b0f"/></g>
  <rect x="${x + 1.5}" y="${y + 1.5}" width="${w - 3}" height="${h - 3}" rx="${r - 1}" fill="none" stroke="#4a4a52" stroke-width="3"/>
  <rect x="${x + w}" y="${y + h * 0.26}" width="4" height="${h * 0.11}" rx="2" fill="#2a2a30"/>
  <rect x="${x - 4}" y="${y + h * 0.2}" width="4" height="${h * 0.06}" rx="2" fill="#2a2a30"/>
  <rect x="${x - 4}" y="${y + h * 0.29}" width="4" height="${h * 0.09}" rx="2" fill="#2a2a30"/>
  <clipPath id="${id}"><rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="${r - b}"/></clipPath>
  <g clip-path="url(#${id})">
    <rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" fill="#fff"/>
    ${inner(sx, sy + top, sw, sh - top - bottom)}
    <rect x="${sx}" y="${sy}" width="${sw}" height="${top}" fill="#fff"/>
    <text x="${sx + 34}" y="${sy + 36}" font-size="17" font-weight="700" fill="#000">9:41</text>
    <g fill="#000">
      <rect x="${sx + sw - 96}" y="${sy + 30}" width="4" height="6" rx="1"/><rect x="${sx + sw - 90}" y="${sy + 27}" width="4" height="9" rx="1"/>
      <rect x="${sx + sw - 84}" y="${sy + 24}" width="4" height="12" rx="1"/><rect x="${sx + sw - 78}" y="${sy + 21}" width="4" height="15" rx="1"/>
      <rect x="${sx + sw - 56}" y="${sy + 23}" width="26" height="13" rx="4" fill="none" stroke="#000" stroke-opacity=".4" stroke-width="1.4"/>
      <rect x="${sx + sw - 54}" y="${sy + 25}" width="19" height="9" rx="2.5"/><rect x="${sx + sw - 28.5}" y="${sy + 27}" width="2.5" height="5" rx="1"/>
    </g>
    <rect x="${sx}" y="${sy + sh - bottom}" width="${sw}" height="${bottom}" fill="#f9f9fb"/>
    <rect x="${sx}" y="${sy + sh - bottom}" width="${sw}" height="1" fill="#dcdce0"/>
    <rect x="${sx + (sw - pw) / 2}" y="${sy + sh - bottom + 12}" width="${pw}" height="42" rx="13" fill="#e9e9ee"/>
    <rect x="${sx + sw / 2 - tw(domain, 16) / 2 - 16}" y="${sy + sh - bottom + 30}" width="10" height="8" rx="2" fill="#6e6e73"/>
    <path d="M${sx + sw / 2 - tw(domain, 16) / 2 - 14} ${sy + sh - bottom + 30}v-2.6a3 3 0 0 1 6 0v2.6" fill="none" stroke="#6e6e73" stroke-width="1.8"/>
    <text x="${sx + sw / 2 + 4}" y="${sy + sh - bottom + 39}" font-size="16" font-weight="500" fill="#1d1d1f" text-anchor="middle">${esc(domain)}</text>
    <rect x="${sx + sw / 2 - 62}" y="${sy + sh - 14}" width="124" height="5" rx="2.5" fill="#000"/>
  </g>
  <rect x="${x + w / 2 - w * 0.15}" y="${y + b + 14}" width="${w * 0.3}" height="${h * 0.036}" rx="${h * 0.018}" fill="#000"/>`;
}

export function glass(x, y, w, h, r = 30, strong = false) {
  return `<g filter="url(#${strong ? 'shadow' : 'soft'})"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#card)" stroke="#fff" stroke-opacity=".13" stroke-width="2"/></g>`;
}

export function ring(cx, cy, r, sw, pct, label, o = {}) {
  const { amber = false, size = r * 0.86, glow = true } = o;
  const c = 2 * Math.PI * r;
  const col = amber ? 'url(#ringAmber)' : 'url(#ring)';
  return `${glow ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${amber ? C.amber : C.teal}" stroke-width="${sw + 2}" opacity=".4" filter="url(#glow)"/>` : ''}
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#334155" stroke-width="${sw}"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${(c * pct / 100).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 ${cx} ${cy})"/>
  <text x="${cx}" y="${cy + size * 0.35}" text-anchor="middle" font-size="${size}" font-weight="800" fill="${amber ? C.amberL : '#fff'}" letter-spacing="${-size * 0.03}">${esc(label)}</text>`;
}

export function pill(x, y, s, o = {}) {
  const { size = 20, bg = C.teal, fg = '#fff', h = size * 2, stroke = '' } = o;
  const w = tw(s, size) + size * 1.5;
  return { w, svg: `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${bg}" ${stroke ? `stroke="${stroke}" stroke-width="2"` : ''}/>${t(x + w / 2, y + h / 2 + size * 0.35, s, { size, w: 700, fill: fg, anchor: 'middle' })}` };
}

/** Pills laid out left to right, wrapping at `maxW`. */
export function pills(x, y, items, o = {}) {
  const { maxW = 760, gap = 12, size = 20, dark = true } = o;
  let cx = x, cy = y, out = '';
  for (const s of items) {
    const p = pill(0, 0, s, { size, bg: dark ? '#1e293b' : '#ecfdf9', fg: dark ? '#e2e8f0' : C.tealD, stroke: dark ? '#334155' : '#99f6e4' });
    if (cx + p.w > x + maxW) { cx = x; cy += size * 2 + gap; }
    out += `<g transform="translate(${cx} ${cy})">${p.svg}</g>`;
    cx += p.w + gap;
  }
  return out;
}

export const check = (cx, cy, r = 15, color = C.teal) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/><path d="M${cx - r * 0.42} ${cy + r * 0.02}l${r * 0.3} ${r * 0.32} ${r * 0.56}-${r * 0.62}" fill="none" stroke="#fff" stroke-width="${r * 0.2}" stroke-linecap="round" stroke-linejoin="round"/>`;
export const cross = (cx, cy, r = 15, color = C.red) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/><path d="M${cx - r * 0.36} ${cy - r * 0.36}l${r * 0.72} ${r * 0.72}M${cx + r * 0.36} ${cy - r * 0.36}l-${r * 0.72} ${r * 0.72}" fill="none" stroke="#fff" stroke-width="${r * 0.2}" stroke-linecap="round"/>`;
export const num = (cx, cy, n, r = 17, color = C.teal) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>${t(cx, cy + r * 0.36, n, { size: r, w: 800, fill: '#fff', anchor: 'middle' })}`;
export const star = (cx, cy, r = 11, fill = C.amberL) => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5; const rr = i % 2 ? r * 0.45 : r; d += `${i ? 'L' : 'M'}${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`; } return `<path d="${d}Z" fill="${fill}"/>`; };
export const stars = (x, y, n = 5, r = 11, gap = 26) => Array.from({ length: n }, (_, i) => star(x + i * gap, y, r)).join('');

export function wrap(body, blob, seed = 0, flip = false) {
  uid = 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900" font-family="${F}">${defs(blob)}${backdrop(flip)}${body}${sparkles(seed)}</svg>`;
}
