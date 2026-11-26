/* Simple placeholder drawings, one per fact, keyed by the "Card" column in deck.csv.
   Each function gets the card's palette {f: base, d: deeper, l: light} and returns SVG
   markup for a 200 x 112 canvas. Your own artwork (CSV "Image" column) replaces these. */
(() => {
  const I = '#3B2B2B', P = '#FFFDF7', R = '#C9525B', O = '#E8875A', Y = '#F5C842', B = '#8FB8DE', G = '#B9B0A8', BR = '#B38B6D', GR = '#7FB77E';
  const F = 'font-family="Fraunces, Georgia, serif" font-weight="700"';
  const N = 'font-family="Nunito, system-ui, sans-serif" font-weight="800"';
  const heart = (x, y, s, fill = R) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 9C-7 4-10 0-10-4c0-3 2-6 5-6 2 0 4 1 5 3 1-2 3-3 5-3 3 0 5 3 5 6 0 4-3 8-10 13Z" fill="${fill}"/>`;
  const sparkle = (x, y, s = 1) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0-8Q1-1 8 0 1 1 0 8-1 1-8 0-1-1 0-8Z" fill="${Y}"/>`;
  const waves = (y, c = B) => `<path d="M20 ${y}q10-6 20 0t20 0 20 0 20 0 20 0 20 0 20 0 20 0" stroke="${c}"/>`;
  const javelin = (x1, y1, x2, y2) => {
    const mx = x1 + (x2 - x1) * 0.45, my = y1 + (y2 - y1) * 0.45, gx = x1 + (x2 - x1) * 0.55, gy = y1 + (y2 - y1) * 0.55;
    return `<path d="M${x1} ${y1}L${x2} ${y2}" stroke-width="4"/><path d="M${mx} ${my}L${gx} ${gy}" stroke="${R}" stroke-width="8"/>`;
  };
  const cloud = (x, y, s, fill) => `<path transform="translate(${x} ${y}) scale(${s})" d="M-22 10a11 11 0 0 1 2-20 14 14 0 0 1 26-4 11 11 0 0 1 16 12 9 9 0 0 1-2 12Z" fill="${fill}"/>`;
  const txt = (x, y, size, t, fill = I, font = F, extra = '') => `<text x="${x}" y="${y}" font-size="${size}" ${font} text-anchor="middle" fill="${fill}" stroke="none" ${extra}>${t}</text>`;

  function isoCube(cx, top, s, cols) {
    const h = s * 0.87;
    const T = [cx, top], Rr = [cx + h, top + s / 2], C = [cx, top + s], L = [cx - h, top + s / 2];
    const down = (p) => [p[0], p[1] + s];
    const face = (a, b, c, d, fill) => `<path d="M${a}L${b}L${c}L${d}Z" fill="${fill}"/>`;
    const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    const grid = (a, b, c, d) => [1 / 3, 2 / 3].map((t) => `<path d="M${lerp(a, b, t)}L${lerp(d, c, t)}M${lerp(a, d, t)}L${lerp(b, c, t)}" stroke-width="2"/>`).join('');
    return face(T, Rr, C, L, cols[0]) + grid(T, Rr, C, L) +
      face(L, C, down(C), down(L), cols[1]) + grid(L, C, down(C), down(L)) +
      face(C, Rr, down(Rr), down(C), cols[2]) + grid(C, Rr, down(Rr), down(C));
  }

  const ART = {
    /* ---- Hearts: the mind ---- */
    AH: (p) => `<rect x="70" y="12" width="60" height="88" rx="6" fill="${P}"/>
      <rect x="80" y="26" width="12" height="12" rx="2" fill="${p.d}"/><path d="M82 32l4 4 9-11" stroke="${R}"/><path d="M100 32h20"/>
      <rect x="80" y="48" width="12" height="12" rx="2" fill="${P}"/><path d="M100 54h20"/>
      <rect x="80" y="70" width="12" height="12" rx="2" fill="${P}"/><path d="M100 76h10" stroke-dasharray="3 5"/>
      <path d="M146 30q8 4 4 12" stroke="${R}"/><circle cx="148" cy="50" r="2" fill="${R}" stroke="none"/>`,
    '2H': (p) => `<path d="M62 76l12-34h52l12 34z" fill="${BR}"/><path d="M70 76l-6 22M130 76l6 22M100 76v22"/>
      <path d="M150 20v24q0 6 6 6h18" stroke-width="10"/><path d="M150 20v24q0 6 6 6h18" stroke="${G}" stroke-width="4"/>
      ${heart(100, 56, 1.4, p.d)}`,
    '3H': (p) => `<circle cx="92" cy="50" r="28" fill="${P}"/><circle cx="92" cy="50" r="20" fill="${p.l}" stroke-width="2"/>
      <path d="M112 70l26 26" stroke-width="12"/><path d="M112 70l26 26" stroke="${BR}" stroke-width="6"/>
      ${txt(92, 57, 18, 'new!', I, N)}${sparkle(140, 26)}${sparkle(56, 92, .7)}${sparkle(156, 52, .6)}`,
    '4H': (p) => `${txt(100, 74, 50, '7&#177;2', p.d, F, `stroke="${I}" stroke-width="2.5" paint-order="stroke"`)}
      ${[0, 1, 2, 3].map((i) => `<circle cx="${70 + i * 20}" cy="94" r="6" fill="${R}"/>`).join('')}`,
    '5H': (p) => `<path d="M76 82V34l36-8v48"/><path d="M76 44l36-8" stroke-width="5"/>
      <ellipse cx="68" cy="82" rx="10" ry="7" fill="${I}"/><ellipse cx="104" cy="74" rx="10" ry="7" fill="${I}"/>
      ${heart(140, 40, 1.6, p.d)}${heart(152, 76, .9)}`,
    '6H': () => `<rect x="50" y="26" width="100" height="60" rx="12" fill="${P}"/>${txt(100, 70, 36, 'RED', GR, N)}`,
    '7H': (p) => [[60, 70], [84, 60], [108, 66], [132, 58], [150, 74], [72, 92], [100, 88], [128, 90]].map(([x, y], i) =>
      `<path d="M${x - 11} ${y + 22}q0-14 11-14t11 14" fill="${i % 2 ? p.d : P}"/><circle cx="${x}" cy="${y}" r="8" fill="${P}"/>`).join('') + heart(100, 24, 1.2),
    '8H': (p) => `<path d="M56 16v78h96"/><path d="M60 22c10 46 26 58 88 64" stroke="${R}" stroke-width="4"/>
      ${[0, 1, 2].map((i) => `<circle cx="${84 + i * 24}" cy="${62 + i * 7}" r="4" fill="${p.d}"/>`).join('')}`,
    '9H': (p) => `<rect x="70" y="20" width="60" height="72" rx="16" fill="${P}"/>
      <rect x="86" y="38" width="7" height="16" rx="2" fill="${I}"/><rect x="107" y="38" width="7" height="16" rx="2" fill="${I}"/>
      <ellipse cx="100" cy="72" rx="7" ry="6" fill="${I}"/><ellipse cx="80" cy="64" rx="5" ry="3" fill="#E8A0A0" stroke="none"/><ellipse cx="120" cy="64" rx="5" ry="3" fill="#E8A0A0" stroke="none"/>`,
    '10H': (p) => `<rect x="72" y="14" width="52" height="84" fill="${P}"/><path d="M72 14l26 8v84l-26-8z" fill="${p.d}"/>
      <circle cx="92" cy="60" r="3" fill="${I}"/>${txt(150, 56, 40, '?', R)}<path d="M40 98h120"/>`,
    JH: (p) => `<path d="M60 30h44L82 56z" fill="${P}"/><path d="M82 56v28M70 86h24"/><circle cx="76" cy="38" r="5" fill="${GR}"/>
      <path d="M116 18h44a8 8 0 0 1 8 8v18a8 8 0 0 1-8 8h-28l-10 10v-10h-6a8 8 0 0 1-8-8V26a8 8 0 0 1 8-8z" fill="${P}"/>
      ${txt(138, 42, 14, 'Hey you!', R, N)}`,
    QH: (p) => `<g transform="rotate(-28 100 56)"><rect x="62" y="40" width="76" height="30" rx="15" fill="${P}"/>
      <path d="M100 40h23a15 15 0 0 1 0 30h-23z" fill="${p.d}"/></g>${sparkle(146, 28)}${sparkle(54, 86, .7)}`,
    KH: () => `<rect x="40" y="84" width="40" height="14" rx="3" fill="${P}"/><path d="M48 91h24" stroke-dasharray="3 3"/>
      ${cloud(76, 66, 1, G)}${cloud(110, 44, 1.2, '#CFC8C0')}${cloud(150, 24, 1, '#E3DDD6')}`,

    /* ---- Diamonds: things people built ---- */
    AD: (p) => `<path d="M100 8L92 56 74 100h14q12-24 24 0h14L108 56z" fill="${p.d}"/><path d="M92 48h16M84 74h32M98 8v-4" />
      <path d="M92 56l16 0"/>${sparkle(146, 30, .8)}`,
    '2D': (p) => `${waves(98)}<rect x="44" y="80" width="112" height="10" fill="${p.d}"/>
      <path d="M56 80q6-40 32-50-6 26 0 50z" fill="${P}"/><path d="M84 80q8-46 38-56-10 32-4 56z" fill="${P}"/><path d="M118 80q6-28 28-34-6 18-2 34z" fill="${P}"/>`,
    '3D': () => `<path d="M68 18h64v50l-20 20H68z" fill="#F6E27A"/><path d="M132 68h-20v20" fill="#E8CF5A"/>
      <path d="M80 36h36M80 50h28" stroke-width="2.5"/>`,
    '4D': () => `${waves(100)}<rect x="68" y="16" width="10" height="76" fill="${O}"/><rect x="122" y="16" width="10" height="76" fill="${O}"/>
      <path d="M24 46q30-14 49-28 27 56 54 0 19 14 49 28" stroke="${O}" stroke-width="3"/>
      <rect x="20" y="66" width="160" height="8" fill="${O}"/>${cloud(44, 30, .6, P)}`,
    '5D': (p) => [62, 80, 98, 116].map((x, i) => `<path d="M${x} 96V${44 - i % 2 * 10}q7-${28 + i % 2 * 6} 14 0V96z" fill="${i % 2 ? p.d : P}"/>`).join('') +
      `<path d="M150 96V18h28M150 26l20-8M174 18v16"/><path d="M40 96h140"/>`,
    '6D': () => `<path d="M30 40h70l30 30h40" stroke="${R}" stroke-width="7"/><path d="M60 98V64l30-30h80" stroke="${B}" stroke-width="7"/>
      <path d="M24 70h150" stroke="${GR}" stroke-width="7"/>
      ${[[100, 40], [130, 70], [60, 70], [90, 34]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="${P}"/>`).join('')}`,
    '7D': (p) => `<path d="M82 102V48h6V34h6V20h4V6h4v14h4v14h6v14h6v54z" fill="${p.d}"/>
      ${[56, 68, 80, 92].map((y) => `<path d="M90 ${y}h20" stroke-width="2" stroke-dasharray="3 4"/>`).join('')}<path d="M40 102h120"/>`,
    '8D': (p) => txt(100, 82, 64, 'Aa', p.d, 'font-family="Helvetica, Arial, sans-serif" font-weight="700"', `stroke="${I}" stroke-width="2.5" paint-order="stroke"`),
    '9D': (p) => `<path d="M40 98L100 22l60 76z" fill="#F3D68A"/><path d="M100 22l60 76h-34z" fill="${p.d}"/>
      <path d="M70 60h40M56 80h70" stroke-width="2"/><circle cx="160" cy="28" r="10" fill="${Y}"/><path d="M24 98h152"/>`,
    '10D': () => `<g transform="rotate(10 100 98)"><rect x="82" y="18" width="36" height="80" rx="4" fill="${P}"/>
      ${[32, 46, 60, 74, 88].map((y) => `<path d="M82 ${y}h36" stroke-width="2"/>`).join('')}<rect x="88" y="10" width="24" height="8" rx="2" fill="${P}"/></g>
      <path d="M40 98h120"/>`,
    JD: () => 'QWERTY'.split('').map((c, i) => `<rect x="${37 + i * 22}" y="30" width="19" height="19" rx="4" fill="${P}"/>${txt(46.5 + i * 22, 44, 12, c, I, N)}`).join('') +
      'ASDFG'.split('').map((c, i) => `<rect x="${46 + i * 22}" y="56" width="19" height="19" rx="4" fill="${P}"/>${txt(55.5 + i * 22, 70, 12, c, I, N)}`).join('') +
      `<rect x="70" y="82" width="64" height="12" rx="4" fill="${P}"/>`,
    QD: () => `<path d="M60 64v38M72 66v36M84 66v36" stroke="${B}" stroke-width="4"/><path d="M40 102h120"/>
      <rect x="100" y="14" width="16" height="70" fill="#C9A27A"/><rect x="52" y="34" width="96" height="14" fill="${P}"/>
      <rect x="70" y="52" width="70" height="12" fill="${P}"/><path d="M120 34V22h18v12"/>`,
    KD: () => {
      const rows = ['..####..', '.######.', '#o####o#', '########', '#o####o#', '##oooo##', '.######.', '..####..'];
      let s = '';
      rows.forEach((r, y) => r.split('').forEach((c, x) => {
        if (c !== '.') s += `<rect x="${64 + x * 9}" y="${20 + y * 9}" width="9" height="9" fill="${c === 'o' ? I : Y}" stroke-width="1"/>`;
      }));
      return s;
    },

    /* ---- Clubs: nature & sport ---- */
    AC: (p) => `<ellipse cx="84" cy="66" rx="36" ry="24" fill="${BR}"/><circle cx="118" cy="58" r="17" fill="${BR}"/>
      <path d="M106 44l-2-8 8 4"/><circle cx="122" cy="54" r="2.5" fill="${I}"/><ellipse cx="132" cy="62" rx="5" ry="4" fill="${I}"/>
      <path d="M66 88v6M100 88v6"/>${[[44, 82], [30, 88], [40, 96]].map(([x, y]) => `<rect x="${x}" y="${y - 8}" width="10" height="10" rx="1.5" fill="#8B6A50" stroke-width="2"/>`).join('')}`,
    '2C': () => `<path d="M24 98Q100-6 180 70" stroke="${G}" stroke-dasharray="4 7"/>${javelin(54, 84, 150, 28)}${txt(160, 100, 16, '104.80m', R, N)}`,
    '3C': () => `<circle cx="116" cy="58" r="32" fill="#F3C98A"/><path d="M92 46q24-10 48 4M90 64q26 8 52-4" stroke-width="2.5"/>
      <circle cx="46" cy="30" r="12" fill="${Y}"/><path d="M46 10v-4M46 54v-4M26 30h-4M70 30h-4"/>
      <path d="M160 82q-30 26-78 8" stroke="${R}"/><path d="M82 90l8-8M82 90l10 4" stroke="${R}"/>`,
    '4C': () => `<path d="M80 24h40v18a20 20 0 0 1-40 0z" fill="${Y}"/><path d="M80 30h-10q0 14 12 16M120 30h10q0 14-12 16"/>
      <path d="M100 62v10M88 80h24l-4-8h-16z" fill="${Y}"/>${txt(100, 104, 16, '98.48 m', R, N)}${javelin(30, 90, 70, 20)}`,
    '5C': (p) => `<path d="M72 62q-2-42 28-42t28 42z" fill="#E9A9B4"/>
      ${[76, 88, 100, 112, 124].map((x, i) => `<path d="M${x} 60q${i % 2 ? 6 : -6} 14 0 24t${i % 2 ? -4 : 4} 14" />`).join('')}
      <circle cx="90" cy="44" r="3" fill="${I}"/><circle cx="110" cy="44" r="3" fill="${I}"/>
      ${heart(148, 26, .9)}${heart(164, 44, .9)}${heart(146, 60, .9)}`,
    '6C': () => `<circle cx="78" cy="58" r="26" fill="${P}"/><path d="M62 38q10 20 0 40M94 38q-10 20 0 40" stroke="${R}" stroke-width="2.5"/>${javelin(118, 94, 176, 22)}`,
    '7C': () => `<rect x="70" y="34" width="60" height="64" rx="14" fill="${Y}"/><rect x="74" y="20" width="52" height="16" rx="4" fill="${BR}"/>
      <path d="M80 36q0 10 6 10t4-10" fill="${Y}"/><rect x="82" y="58" width="36" height="20" rx="4" fill="${P}"/>${txt(100, 72, 10, 'HONEY', I, N)}`,
    '8C': () => `${javelin(30, 86, 170, 26)}<ellipse cx="92" cy="74" rx="10" ry="16" transform="rotate(-24 92 74)" stroke="${BR}" stroke-width="4"/>
      <path d="M100 82l8 14" stroke="${BR}" stroke-width="4"/>`,
    '9C': (p) => `${waves(86)}<path d="M44 84q14-42 36-48-8 26 4 48z" fill="#9BB4C4"/>
      <rect x="140" y="56" width="10" height="34" fill="${BR}"/><circle cx="145" cy="44" r="22" fill="${p.d}"/><path d="M120 90h50"/>`,
    '10C': () => `<path d="M48 36q6 54 70 50-46-6-56-50z" fill="#F5D86A"/><path d="M48 36l-4-6"/>
      <path d="M132 50q-14 0-14 16 0 18 18 30 18-12 18-30 0-16-14-16z" fill="${R}"/><path d="M128 48l8-10 8 10" fill="${GR}"/>
      ${[[130, 62], [142, 62], [136, 74], [128, 80], [144, 80]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="${P}" stroke="none"/>`).join('')}`,
    JC: () => `<path d="M106 8L74 62h24L86 104l46-60h-26l14-36z" fill="${Y}"/>
      <circle cx="156" cy="30" r="12" fill="#F6E27A"/><path d="M156 10v-4M156 54v-4M136 30h-4M180 30h-4" />`,
    QC: () => `${javelin(40, 92, 120, 20)}<circle cx="150" cy="62" r="20" fill="${Y}"/>${txt(150, 70, 20, '1st', I)}
      <path d="M138 44l-8-24M162 44l8-24" stroke="${R}" stroke-width="5"/>`,
    KC: () => `<path d="M84 14l16 34 16-34" stroke="${O}" stroke-width="8"/><path d="M84 14l16 34 16-34" stroke="${GR}" stroke-width="3"/>
      <circle cx="100" cy="68" r="26" fill="${Y}"/><path d="M100 52l5 10 11 1-8 8 2 11-10-6-10 6 2-11-8-8 11-1z" fill="#F6E27A" stroke-width="2"/>`,

    /* ---- Spades: history & games ---- */
    AS: () => `<ellipse cx="88" cy="64" rx="36" ry="24" fill="${G}"/><circle cx="124" cy="52" r="18" fill="${G}"/>
      <path d="M138 58q10 16 4 34" stroke-width="8"/><path d="M138 58q10 16 4 34" stroke="${G}" stroke-width="3"/>
      <path d="M112 40q-14 4-10 24 10 2 14-6" fill="#CFC8C0"/><circle cx="130" cy="48" r="2.5" fill="${I}"/>
      <path d="M66 86v8M80 86v8M100 86v8"/><path d="M134 66q6 4 10 0" stroke="${P}" stroke-width="3"/>`,
    '2S': () => `<path d="M76 18a34 34 0 1 0 32 58 30 30 0 0 1-32-58z" fill="#EFE8D8"/>
      <g transform="translate(146 58) rotate(30)"><path d="M0-30q12 12 12 34H-12q0-22 12-34z" fill="${P}"/><circle cx="0" cy="-8" r="5" fill="${B}"/>
      <path d="M-12 4l-8 10h8M12 4l8 10h-8" fill="${R}"/><path d="M-6 6q6 18 12 0" fill="${Y}"/></g>${sparkle(40, 30, .6)}${sparkle(176, 20, .6)}`,
    '3S': () => `<path d="M48 70l24-22 24 22v26H48z" fill="${GR}"/><rect x="66" y="78" width="12" height="18" fill="${P}"/>
      <rect x="116" y="46" width="44" height="44" rx="8" fill="${P}"/>${[[126, 56], [150, 56], [138, 68], [126, 80], [150, 80]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="${I}" stroke="none"/>`).join('')}`,
    '4S': (p) => `<path d="M70 52v20q30 14 60 0V52" fill="${p.d}"/><path d="M100 24l52 20-52 20-52-20z" fill="#4A3A3A"/>
      <path d="M100 44l36 6v26" stroke="${Y}" stroke-width="3"/><circle cx="136" cy="80" r="4" fill="${Y}"/>`,
    '5S': () => {
      const sq = (x, y, c) => `<rect x="${x}" y="${y}" width="16" height="16" rx="2" fill="${c}"/>`;
      return [[56, 70], [72, 70], [88, 70], [72, 54]].map(([x, y]) => sq(x, y, R)).join('') +
        [[112, 38], [112, 54], [112, 70], [128, 70]].map(([x, y]) => sq(x, y, B)).join('') +
        [[60, 22], [76, 22], [76, 38], [92, 38]].map(([x, y]) => sq(x, y, Y)).join('') + '<path d="M40 88h120"/>';
    },
    '6S': () => `<circle cx="100" cy="60" r="34" fill="${P}"/><rect x="94" y="16" width="12" height="10" rx="2" fill="${R}"/>
      <path d="M100 60V36M100 60l14 8" stroke-width="3.5"/>${txt(100, 88, 13, '45 min', R, N)}`,
    '7S': () => `<rect x="94" y="18" width="76" height="52" rx="6" fill="${P}"/><rect x="102" y="26" width="60" height="36" rx="3" fill="#7EA6CF"/>
      <path d="M124 70l-6 16h28l-6-16"/><g transform="translate(66 62)"><path d="M-14 30h28l-6-18q10-6 4-14a10 10 0 1 0-24 0q-6 8 4 14z" fill="#4A3A3A"/></g>`,
    '8S': () => `<path d="M44 74q56-66 112 0-56-14-112 0z" fill="#4A3A3A"/><circle cx="100" cy="46" r="10" fill="${B}" stroke-width="2"/>
      <circle cx="100" cy="46" r="6" fill="${P}" stroke="none"/><circle cx="100" cy="46" r="3" fill="${R}" stroke="none"/>`,
    '9S': () => isoCube(100, 14, 42, [Y, R, B]),
    '10S': () => `<path d="M48 76q-4-40 40-42 40 0 44 34" fill="#A3765A"/><circle cx="132" cy="58" r="20" fill="#A3765A"/>
      <path d="M146 66q8 18-2 32" stroke-width="8"/><path d="M146 66q8 18-2 32" stroke="#A3765A" stroke-width="3"/>
      <path d="M134 74q16 22 34 6" stroke-width="6"/><path d="M134 74q16 22 34 6" stroke="${P}" stroke-width="2"/>
      <circle cx="136" cy="52" r="2.5" fill="${I}"/><path d="M62 76v18M84 76v18M112 74v20"/>
      <path d="M58 46l4-6M74 38l3-7M92 36l2-7" stroke-width="2"/>`,
    JS: () => [['S', 1], ['U', 1], ['N', 1]].map(([c, n], i) => `<rect x="${52 + i * 34}" y="${36 + (i % 2) * 6}" width="30" height="30" rx="5" fill="#F3E3C0"/>
      ${txt(67 + i * 34, 58 + (i % 2) * 6, 18, c, I)}${txt(76 + i * 34, 62 + (i % 2) * 6, 7, n, I, N)}`).join(''),
    QS: () => `<path d="M70 14v88M100 14v88"/>${[26, 44, 62, 80, 98].map((y) => `<path d="M70 ${y}h30"/>`).join('')}
      <path d="M132 18q-26 14 0 30t0 32 0 20" stroke-width="12"/><path d="M132 18q-26 14 0 30t0 32 0 20" stroke="${GR}" stroke-width="6"/>
      <circle cx="134" cy="16" r="9" fill="${GR}"/><circle cx="137" cy="14" r="1.8" fill="${I}"/>`,
    KS: () => `<path d="M58 84l-4-46 24 20 22-30 22 30 24-20-4 46z" fill="${Y}"/><rect x="58" y="84" width="84" height="10" rx="3" fill="${Y}"/>
      <circle cx="100" cy="68" r="5" fill="${R}"/><circle cx="78" cy="72" r="4" fill="${B}"/><circle cx="122" cy="72" r="4" fill="${B}"/>`,

    /* ---- Jokers ---- */
    JK1: (p) => `<path d="M60 84Q52 46 36 32q34 8 50 30 4-34 14-48 10 14 14 48 16-22 50-30-16 14-24 52z" fill="${p.d}"/>
      <rect x="56" y="80" width="88" height="14" rx="6" fill="${P}"/>${[[36, 32], [100, 14], [164, 32]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="${Y}"/>`).join('')}`,
    JK2: (p) => `<path d="M64 44l4-28 22 16h20l22-16 4 28q8 14 4 30-10 26-40 26t-40-26q-4-16 4-30z" fill="${p.d}"/>
      <circle cx="86" cy="60" r="4" fill="${I}"/><circle cx="114" cy="60" r="4" fill="${I}"/><path d="M96 72l4 4 4-4z" fill="${R}"/>
      <path d="M100 76q-4 6-8 4M100 76q4 6 8 4"/><path d="M60 70h20M60 78l20-4M140 70h-20M140 78l-20-4" stroke-width="2"/>`,
  };

  window.CARD_ART = (id, palette) => {
    const fn = ART[id];
    return fn ? `<g stroke="${I}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" fill="none">${fn(palette)}</g>` : '';
  };
})();
