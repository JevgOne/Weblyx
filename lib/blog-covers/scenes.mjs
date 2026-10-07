import { C, t, tw, sk, macWindow, iphone, glass, ring, pill, pills, check, cross, num, star, stars, esc } from './kit.mjs';

const big = (s) => (String(s).length <= 2 ? 190 : String(s).length <= 4 ? 130 : String(s).length <= 7 ? 92 : 70);

/** Glass card with one large figure and a caption. */
function statCard(x, y, w, h, o) {
  const size = o.size ?? Math.min(big(o.big), (w - 60) / (tw(o.big, 100) / 100));
  const lines = o.label ?? [];
  const cy = y + h / 2 - (lines.length * 34) / 2 + size * 0.3 + (o.pill ? 14 : 0);
  let out = glass(x, y, w, h, 34, true);
  if (o.pill) { const p = pill(0, 0, o.pill, { size: 18, bg: o.amber ? C.amber : C.teal, fg: o.amber ? C.ink : '#fff' }); out += `<g transform="translate(${x + w / 2 - p.w / 2} ${y + 30})">${p.svg}</g>`; }
  out += t(x + w / 2, cy, o.big, { size, w: 800, fill: o.amber ? C.amberL : '#fff', anchor: 'middle', ls: -size * 0.03 });
  lines.forEach((l, i) => { out += t(x + w / 2, cy + 52 + i * 34, l, { size: 26, w: 600, fill: C.slate, anchor: 'middle' }); });
  return out;
}

/** Small tilted card, top right. */
function miniCard(o, x = 1300, y = 96, rot = 7) {
  const w = Math.max(200, tw(o.big, 44) + 70), h = o.label ? 150 : 120;
  return `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})">${glass(x, y, w, h, 26)}
    ${t(x + w / 2, y + (o.label ? 70 : 76), o.big, { size: 44, w: 800, fill: o.amber ? C.amberL : C.tealL, anchor: 'middle' })}
    ${o.label ? t(x + w / 2, y + 112, o.label, { size: 20, w: 600, fill: C.slate, anchor: 'middle' }) : ''}</g>`;
}

/** Card overlapping the bottom-left of the main object. */
function noteCard(lines, x = 70, y = 690, w) {
  const width = w ?? Math.max(...lines.map((l) => tw(l.s, l.size ?? 24))) + 76;
  let out = glass(x, y, width, 44 + lines.length * 40, 26);
  lines.forEach((l, i) => { out += t(x + 38, y + 56 + i * 40, l.s, { size: l.size ?? 24, w: l.w ?? 700, fill: l.fill ?? '#fff', ls: l.ls ?? 0 }); });
  return out;
}

// ---------------------------------------------------------------- score ----

export function sceneScore(o) {
  const page = (x, y, w, h) => `
    <rect x="${x + 50}" y="${y + 62}" width="350" height="30" rx="9" fill="${C.ink}"/>
    <rect x="${x + 50}" y="${y + 106}" width="250" height="30" rx="9" fill="${C.ink}"/>
    ${sk(x + 50, y + 166, 340)}${sk(x + 50, y + 190, 300)}${sk(x + 50, y + 214, 220)}
    <rect x="${x + 50}" y="${y + 254}" width="156" height="46" rx="13" fill="${C.teal}"/>${sk(x + 76, y + 272, 78, 10, '#fff')}
    <rect x="${x + w - 350}" y="${y + 54}" width="300" height="236" rx="20" fill="url(#photo)"/>
    <circle cx="${x + w - 122}" cy="${y + 114}" r="30" fill="#fff" fill-opacity=".85"/>
    <path d="M${x + w - 350} ${y + 290}L${x + w - 260} ${y + 184}L${x + w - 200} ${y + 244}L${x + w - 150} ${y + 200}L${x + w - 50} ${y + 290}Z" fill="#0f766e" fill-opacity=".55"/>
    ${o.cookie ? `<rect x="${x + 30}" y="${y + h - 118}" width="${w - 60}" height="86" rx="20" fill="${C.ink}"/>
      <circle cx="${x + 82}" cy="${y + h - 75}" r="20" fill="${C.amber}"/><circle cx="${x + 75}" cy="${y + h - 82}" r="4" fill="${C.ink}"/><circle cx="${x + 89}" cy="${y + h - 73}" r="4" fill="${C.ink}"/><circle cx="${x + 100}" cy="${y + h - 90}" r="9" fill="${C.ink}"/>
      ${sk(x + 122, y + h - 90, 300, 11, '#64748b')}${sk(x + 122, y + h - 69, 220, 11, '#475569')}
      <rect x="${x + w - 284}" y="${y + h - 96}" width="104" height="42" rx="12" fill="#1e293b" stroke="#475569" stroke-width="2"/>
      <rect x="${x + w - 166}" y="${y + h - 96}" width="112" height="42" rx="12" fill="${C.teal}"/>` : `
      ${[0, 1, 2].map((i) => `<rect x="${x + 50 + i * 250}" y="${y + h - 150}" width="226" height="110" rx="16" fill="${C.soft}"/>${sk(x + 72 + i * 250, y + h - 122, 120, 14, '#94a3b8')}${sk(x + 72 + i * 250, y + h - 92, 170)}${sk(x + 72 + i * 250, y + h - 70, 130)}`).join('')}`}`;
  let out = macWindow(140, 140, 820, 570, o.domain, page);
  if (o.cookie) {
    const p = pill(0, 0, o.tag, { size: 21, bg: C.amber, fg: C.ink });
    out += `<rect x="158" y="580" width="784" height="110" rx="26" fill="none" stroke="${C.amber}" stroke-width="4" stroke-dasharray="14 10" stroke-linecap="round"/><g filter="url(#soft)" transform="translate(${918 - p.w} 557)">${p.svg}</g>`;
  }
  if (o.bars) {
    out += glass(80, 650, 400, 176, 28) + t(112, 694, o.bars.title, { size: 20, w: 700, fill: C.slate, ls: 1.5 });
    o.bars.rows.forEach((r, i) => { out += `<rect x="112" y="${716 + i * 50}" width="${r.w}" height="20" rx="10" fill="url(#${r.amber ? 'amberBar' : 'tealBar'})"/>` + t(128 + r.w, 734 + i * 50, r.s, { size: 24, w: 800, fill: r.amber ? C.amberL : C.tealL }); });
  }
  if (o.note) out += noteCard(o.note, 80, 664);
  out += glass(1010, 236, 440, 470, 40, true) + ring(1230, 440, 134, 28, o.pct, o.big, { amber: o.amber, size: String(o.big).length > 2 ? 86 : 118 }) + t(1230, 654, o.label, { size: 26, w: 700, fill: C.slate, anchor: 'middle', ls: 1 });
  if (o.mini) out += o.mini.ring != null
    ? `<g transform="rotate(7 1410 190)">${glass(1316, 112, 188, 160, 28)}${ring(1410, 192, 46, 12, o.mini.ring, o.mini.big, { amber: !o.mini.teal, size: 36, glow: false })}</g>`
    : miniCard(o.mini, 1290, 100);
  return out;
}

// ----------------------------------------------------------------- list ----

export function sceneList(o) {
  const rows = o.rows.slice(0, 5);
  const page = (x, y, w) => {
    let s = '';
    o.heading.forEach((l, i) => { s += t(x + 50, y + 74 + i * 46, l, { size: 36, w: 800 }); });
    const y0 = y + 62 + o.heading.length * 46;
    rows.forEach((r, i) => {
      const ry = y0 + i * 76, hl = i === o.hl;
      s += `<rect x="${x + 50}" y="${ry}" width="${w - 100}" height="64" rx="16" fill="${hl ? '#ecfdf9' : C.soft}" ${hl ? `stroke="${C.teal}" stroke-width="2.5"` : ''}/>`;
      s += o.mark === 'check' ? check(x + 88, ry + 32, 16) : o.mark === 'cross' ? cross(x + 88, ry + 32, 16, C.amber) : num(x + 88, ry + 32, i + 1, 17, o.mark === 'warn' ? C.amber : C.teal);
      s += t(x + 122, ry + 40, r, { size: 22, w: 600 });
    });
    return s;
  };
  let out = macWindow(110, 120, 880, 650, o.domain, page);
  out += statCard(1040, 220, 440, 400, o.stat);
  if (o.mini) out += miniCard(o.mini);
  if (o.note) out += noteCard(o.note);
  if (o.pills) out += pills(1040, 660, o.pills, { maxW: 470 });
  return out;
}

// -------------------------------------------------------------- compare ----

export function sceneCompare(o) {
  const side = (d, good) => (x, y, w, h) => {
    let s = t(x + 44, y + 76, d.title, { size: 34, w: 800 });
    if (d.sub) s += t(x + 44, y + 112, d.sub, { size: 20, w: 500, fill: '#64748b' });
    d.rows.forEach((r, i) => {
      const ry = y + 150 + i * 66;
      s += `<rect x="${x + 36}" y="${ry}" width="${w - 72}" height="54" rx="14" fill="${C.soft}"/>` + ((d.good ?? good) ? check(x + 68, ry + 27, 14) : d.neutral ? `<circle cx="${x + 68}" cy="${ry + 27}" r="7" fill="#94a3b8"/>` : cross(x + 68, ry + 27, 14, C.red)) + t(x + 96, ry + 34, r, { size: 20, w: 600 });
    });
    if (d.foot) {
      const p = pill(0, 0, d.foot, { size: 22, bg: good ? C.teal : d.neutral ? '#e2e8f0' : '#fef3c7', fg: good ? '#fff' : d.neutral ? C.ink : '#92400e' });
      s += `<g transform="translate(${x + 44} ${y + h - 78})">${p.svg}</g>`;
    }
    return s;
  };
  let out = macWindow(80, 150, 670, 610, o.left.domain, side(o.left, false)) + macWindow(850, 150, 670, 610, o.right.domain, side(o.right, true));
  out += `<g filter="url(#soft)"><circle cx="800" cy="455" r="48" fill="${C.ink}" stroke="${C.teal}" stroke-width="4"/></g>` + t(800, 466, o.vs ?? 'vs', { size: 30, w: 800, fill: '#fff', anchor: 'middle' });
  if (o.mini) out += miniCard(o.mini, 1330, 60, 6);
  return out;
}

// ---------------------------------------------------------------- phone ----

const screens = {
  /** AI answer with sources. */
  chat: (o) => (x, y, w) => `
    <rect x="${x + 70}" y="${y + 22}" width="${w - 90}" height="62" rx="20" fill="${C.teal}"/>${t(x + 92, y + 61, o.q, { size: 17, w: 600, fill: '#fff' })}
    <rect x="${x + 20}" y="${y + 104}" width="${w - 60}" height="300" rx="20" fill="${C.soft}"/>
    <circle cx="${x + 48}" cy="${y + 134}" r="13" fill="${C.ink}"/><use href="#spark" transform="translate(${x + 48} ${y + 134}) scale(9)" fill="${C.tealL}"/>
    ${t(x + 70, y + 141, o.a, { size: 17, w: 700 })}
    ${[0, 1, 2, 3, 4].map((i) => sk(x + 40, y + 172 + i * 26, [w - 110, w - 140, w - 120, w - 170, w - 200][i], 12)).join('')}
    ${o.sources.map((s2, i) => `<rect x="${x + 40}" y="${y + 312 + i * 0}" width="0" height="0"/>`).join('')}
    ${pills(x + 40, y + 318, o.sources, { maxW: w - 80, size: 14, dark: false })}
    <rect x="${x + 20}" y="${y + 424}" width="${w - 40}" height="56" rx="28" fill="#fff" stroke="${C.line}" stroke-width="2"/>${sk(x + 44, y + 446, 150, 12)}<circle cx="${x + w - 48}" cy="${y + 452}" r="18" fill="${C.ink}"/>`,
  /** Review cards with stars. */
  reviews: (o) => (x, y, w) => `${t(x + 24, y + 48, o.title, { size: 24, w: 800 })}${stars(x + 34, y + 82, 5, 12, 28)}${t(x + 178, y + 90, o.rating, { size: 20, w: 700, fill: '#64748b' })}
    ${[0, 1, 2].map((i) => `<rect x="${x + 20}" y="${y + 116 + i * 132}" width="${w - 40}" height="118" rx="18" fill="${C.soft}"/><circle cx="${x + 52}" cy="${y + 150 + i * 132}" r="18" fill="${['#14b8a6', '#6366f1', '#f59e0b'][i]}"/>${sk(x + 82, y + 138 + i * 132, 110, 12, '#94a3b8')}${stars(x + 88, y + 164 + i * 132, 5, 7, 16)}${sk(x + 40, y + 190 + i * 132, w - 90)}${sk(x + 40, y + 210 + i * 132, w - 150)}`).join('')}`,
  /** Business profile: name, rating, actions, photos. */
  profile: (o) => (x, y, w) => `<rect x="${x}" y="${y}" width="${w}" height="150" fill="url(#photo)"/><path d="M${x} ${y + 150}L${x + 110} ${y + 60}L${x + 190} ${y + 120}L${x + 250} ${y + 80}L${x + w} ${y + 150}Z" fill="#0f766e" fill-opacity=".5"/>
    ${t(x + 24, y + 196, o.name, { size: 24, w: 800 })}${stars(x + 34, y + 224, 5, 10, 24)}${t(x + 156, y + 231, o.rating, { size: 17, w: 600, fill: '#64748b' })}
    ${o.actions.map((a, i) => `<rect x="${x + 20 + i * ((w - 40) / 3)}" y="${y + 254}" width="${(w - 64) / 3}" height="64" rx="16" fill="${i === 0 ? C.teal : C.soft}"/>${t(x + 20 + i * ((w - 40) / 3) + (w - 64) / 6, y + 293, a, { size: 15, w: 700, fill: i === 0 ? '#fff' : C.ink, anchor: 'middle' })}`).join('')}
    ${[0, 1, 2].map((i) => `<rect x="${x + 20 + i * ((w - 40) / 3)}" y="${y + 340}" width="${(w - 64) / 3}" height="92" rx="14" fill="${['#ccfbf1', '#e0e7ff', '#fef3c7'][i]}"/>`).join('')}${sk(x + 24, y + 456, w - 90)}${sk(x + 24, y + 478, w - 150)}`,
  /** Map with a pin and the top local result. */
  map: (o) => (x, y, w) => `<rect x="${x}" y="${y}" width="${w}" height="300" fill="#e8f5f1"/>
    <path d="M${x} ${y + 90}H${x + w}M${x} ${y + 210}H${x + w}M${x + 90} ${y}V${y + 300}M${x + 230} ${y}V${y + 300}" stroke="#fff" stroke-width="16"/>
    <path d="M${x} ${y + 260}L${x + w} ${y + 40}" stroke="#fde68a" stroke-width="14"/><rect x="${x + 110}" y="${y + 110}" width="100" height="82" rx="8" fill="#c7ead9"/>
    <g filter="url(#soft)"><path d="M${x + w / 2} ${y + 176}c-34-40-46-60-46-80a46 46 0 0 1 92 0c0 20-12 40-46 80z" fill="${C.teal}"/></g><circle cx="${x + w / 2}" cy="${y + 96}" r="17" fill="#fff"/>
    <rect x="${x + 16}" y="${y + 318}" width="${w - 32}" height="112" rx="18" fill="#ecfdf9" stroke="${C.teal}" stroke-width="2.5"/>${num(x + 48, y + 354, 1, 15)}${t(x + 74, y + 361, o.name, { size: 19, w: 800 })}${stars(x + 44, y + 394, 5, 9, 21)}${t(x + 152, y + 400, o.rating, { size: 16, w: 600, fill: '#64748b' })}
    <rect x="${x + 16}" y="${y + 442}" width="${w - 32}" height="70" rx="18" fill="${C.soft}"/>${sk(x + 40, y + 464, 150, 12, '#94a3b8')}${sk(x + 40, y + 486, 100)}`,
  /** Cookie consent sheet over a page. */
  cookie: (o) => (x, y, w, h) => `${sk(x + 24, y + 30, w - 120, 22, C.ink)}${sk(x + 24, y + 64, w - 180, 22, C.ink)}${sk(x + 24, y + 110, w - 70)}${sk(x + 24, y + 132, w - 110)}
    <rect x="${x + 24}" y="${y + 164}" width="${w - 48}" height="110" rx="16" fill="url(#photo)"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.ink}" fill-opacity=".35"/>
    <rect x="${x + 12}" y="${y + h - 286}" width="${w - 24}" height="274" rx="26" fill="#fff"/>
    <circle cx="${x + 50}" cy="${y + h - 244}" r="18" fill="${C.amber}"/><circle cx="${x + 44}" cy="${y + h - 250}" r="3.5" fill="#fff"/><circle cx="${x + 56}" cy="${y + h - 241}" r="3.5" fill="#fff"/>
    ${t(x + 80, y + h - 236, o.title, { size: 21, w: 800 })}${sk(x + 32, y + h - 204, w - 90)}${sk(x + 32, y + h - 182, w - 130)}
    <rect x="${x + 28}" y="${y + h - 150}" width="${w - 56}" height="52" rx="14" fill="${C.teal}"/>${t(x + w / 2, y + h - 117, o.yes, { size: 18, w: 700, fill: '#fff', anchor: 'middle' })}
    <rect x="${x + 28}" y="${y + h - 88}" width="${w - 56}" height="52" rx="14" fill="${C.soft}"/>${t(x + w / 2, y + h - 55, o.no, { size: 18, w: 700, anchor: 'middle' })}`,
  /** Inbox. */
  mail: (o) => (x, y, w) => `${t(x + 24, y + 50, o.title, { size: 28, w: 800 })}
    ${o.rows.map((r, i) => `<rect x="${x + 16}" y="${y + 74 + i * 96}" width="${w - 32}" height="84" rx="16" fill="${i === 0 ? '#ecfdf9' : C.soft}" ${i === 0 ? `stroke="${C.teal}" stroke-width="2.5"` : ''}/><circle cx="${x + 34}" cy="${y + 104 + i * 96}" r="5" fill="${i < 2 ? C.teal : 'none'}"/>${t(x + 50, y + 110 + i * 96, r, { size: 17, w: 700 })}${sk(x + 50, y + 126 + i * 96, w - 130, 11)}`).join('')}`,
  /** Product page with a buy button. */
  shop: (o) => (x, y, w) => `<rect x="${x + 20}" y="${y + 20}" width="${w - 40}" height="250" rx="22" fill="url(#photo)"/><rect x="${x + w / 2 - 54}" y="${y + 84}" width="108" height="130" rx="14" fill="#fff" fill-opacity=".9"/><path d="M${x + w / 2 - 26} ${y + 84}a26 26 0 0 1 52 0" fill="none" stroke="#0f766e" stroke-width="6"/>
    ${sk(x + 24, y + 296, w - 130, 20, C.ink)}${stars(x + 34, y + 342, 5, 9, 21)}${t(x + 24, y + 398, o.price, { size: 30, w: 800 })}
    <rect x="${x + 20}" y="${y + 424}" width="${w - 40}" height="58" rx="16" fill="${C.teal}"/>${t(x + w / 2, y + 461, o.cta, { size: 19, w: 700, fill: '#fff', anchor: 'middle' })}`,
  /** Social feed post. */
  feed: (o) => (x, y, w) => `<circle cx="${x + 46}" cy="${y + 46}" r="22" fill="#6366f1"/>${sk(x + 80, y + 32, 130, 13, C.ink)}${sk(x + 80, y + 54, 80, 10)}
    <rect x="${x}" y="${y + 86}" width="${w}" height="230" fill="url(#photo)"/>${sk(x + 24, y + 340, w - 90)}${sk(x + 24, y + 362, w - 150)}
    <rect x="${x + 20}" y="${y + 398}" width="${w - 40}" height="90" rx="18" fill="#fef3c7"/>${t(x + w / 2, y + 436, o.l1, { size: 17, w: 800, fill: '#92400e', anchor: 'middle' })}${t(x + w / 2, y + 462, o.l2, { size: 15, w: 600, fill: '#b45309', anchor: 'middle' })}`,
};

export function scenePhone(o) {
  let out = iphone(170, 60, 780, o.domain, screens[o.screen](o.data));
  const [a, b] = o.stats;
  out += statCard(640, 150, 420, 330, a);
  if (b) out += statCard(1100, 290, 400, 330, b);
  if (o.pills) out += pills(640, b ? 660 : 530, o.pills, { maxW: 860 });
  if (o.mini) out += miniCard(o.mini, 1310, 70);
  return out;
}

// ----------------------------------------------------------------- serp ----

export function sceneSerp(o) {
  const page = (x, y, w) => {
    let s = `<rect x="${x + 50}" y="${y + 36}" width="${w - 100}" height="58" rx="29" fill="#fff" stroke="${C.line}" stroke-width="2.5"/><circle cx="${x + 84}" cy="${y + 63}" r="9" fill="none" stroke="#64748b" stroke-width="3"/><path d="M${x + 91} ${y + 70}l8 8" stroke="#64748b" stroke-width="3" stroke-linecap="round"/>` + t(x + 112, y + 72, o.query, { size: 22, w: 500 });
    o.results.forEach((r, i) => {
      const ry = y + 122 + i * 142, hl = i === 0;
      s += `<rect x="${x + 50}" y="${ry}" width="${w - 100}" height="126" rx="18" fill="${hl ? '#ecfdf9' : C.soft}" ${hl ? `stroke="${C.teal}" stroke-width="2.5"` : ''}/>` + num(x + 88, ry + 38, i + 1, 17, hl ? C.teal : '#cbd5e1') + sk(x + 122, ry + 22, 180, 11, '#94a3b8') + t(x + 122, ry + 62, r, { size: 23, w: 700, fill: hl ? C.tealD : '#334155' }) + sk(x + 122, ry + 82, w - 330) + sk(x + 122, ry + 102, w - 430);
    });
    return s;
  };
  let out = macWindow(110, 120, 880, 650, o.domain, page) + statCard(1040, 220, 440, 400, o.stat);
  if (o.pills) out += pills(1040, 660, o.pills, { maxW: 470 });
  if (o.mini) out += miniCard(o.mini);
  return out;
}

// ---------------------------------------------------------------- price ----

export function scenePrice(o) {
  const page = (x, y, w) => {
    let s = '';
    o.heading.forEach((l, i) => { s += t(x + 50, y + 74 + i * 46, l, { size: 36, w: 800 }); });
    const y0 = y + 62 + o.heading.length * 46;
    o.rows.forEach((r, i) => {
      const ry = y0 + i * 70;
      s += `<rect x="${x + 50}" y="${ry}" width="${w - 100}" height="58" rx="14" fill="${C.soft}"/>` + (r.bad ? cross(x + 84, ry + 29, 14, C.amber) : check(x + 84, ry + 29, 14)) + t(x + 112, ry + 37, r.s, { size: 21, w: 600 }) + (r.v ? t(x + w - 74, ry + 38, r.v, { size: 21, w: 800, anchor: 'end' }) : r.bad ? '' : sk(x + w - 164, ry + 23, 90, 13, '#94a3b8'));
    });
    return s;
  };
  let out = macWindow(110, 120, 880, 650, o.domain, page) + statCard(1040, 220, 440, 400, o.stat);
  if (o.mini) out += miniCard(o.mini);
  if (o.note) out += noteCard(o.note);
  if (o.pills) out += pills(1040, 660, o.pills, { maxW: 470 });
  return out;
}

// ---------------------------------------------------------------- steps ----

export function sceneSteps(o) {
  let out = '';
  o.steps.forEach((s, i) => {
    const x = 90 + i * 330;
    out += glass(x, 170 + i * 36, 300, 300, 30, true) + `<g transform="translate(${x + 30} ${200 + i * 36})">${pill(0, 0, s.tag, { size: 18 }).svg}</g>` + t(x + 30, 300 + i * 36, s.title, { size: 34, w: 800, fill: '#fff' }) + t(x + 30, 344 + i * 36, s.sub, { size: 21, w: 600, fill: C.slate }) + t(x + 30, 420 + i * 36, s.big, { size: 46, w: 800, fill: C.tealL });
    if (i < o.steps.length - 1) out += `<path d="M${x + 306} ${330 + i * 36}c20 0 12 30 26 34" fill="none" stroke="${C.tealL}" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 12"/>`;
  });
  out += glass(1090, 250, 400, 440, 38, true) + ring(1290, 440, 120, 26, o.pct, o.big, { size: 104 }) + t(1290, 640, o.label, { size: 26, w: 700, fill: C.slate, anchor: 'middle', ls: 1 });
  if (o.pills) out += pills(110, 640, o.pills, { maxW: 940, size: 24 });
  if (o.mini) out += miniCard(o.mini, 1310, 90);
  return out;
}
