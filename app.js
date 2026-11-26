/* Daily Deck: one card (fact) a day for 54 days. */
(() => {
  const TOTAL = 54;
  const KEY = 'dailyDeck.v1';
  const $ = (s) => document.querySelector(s);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // PLACEHOLDER colour mapping: waiting on confirmation (the brief lists both pairs as green).
  const SUITS = {
    H: { name: 'Hearts',   color: 'yellow' },
    D: { name: 'Diamonds', color: 'yellow' },
    C: { name: 'Clubs',    color: 'green' },
    S: { name: 'Spades',   color: 'green' },
    J: { name: 'Joker',    color: 'pink' }, // jokers: 1st pink, 2nd blue (see tagColours)
  };
  const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  // Sample facts used until deck.csv is placed next to index.html.
  const SAMPLE = [
    { fact: 'Octopuses have three hearts: two pump blood through the gills and one pumps it around the rest of the body.', source: 'Encyclopaedia Britannica', url: 'https://www.britannica.com/animal/octopus-mollusk' },
    { fact: 'Botanically speaking, bananas are berries, but strawberries are not.', source: 'Encyclopaedia Britannica', url: 'https://www.britannica.com/story/is-a-banana-a-berry' },
    { fact: 'Pots of honey found in ancient Egyptian tombs, thousands of years old, were still edible.', source: 'Smithsonian Magazine', url: 'https://www.smithsonianmag.com/science-nature/the-science-behind-honeys-eternal-shelf-life-1218690/' },
    { fact: 'Wombats are the only animals known to produce cube-shaped droppings.', source: 'Encyclopaedia Britannica', url: 'https://www.britannica.com/animal/wombat' },
  ];

  /* ---------- Deck ---------- */
  function standardOrder() {
    const out = [];
    for (const s of ['H', 'D', 'C', 'S']) for (const r of RANKS) out.push({ id: r + s, suit: s, rank: r });
    out.push({ id: 'JK1', suit: 'J', rank: 'Joker' }, { id: 'JK2', suit: 'J', rank: 'Joker' });
    return out;
  }

  function parseCSV(text) {
    const rows = []; let row = []; let cell = ''; let q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (c === '"') q = false;
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(cell); rows.push(row); row = []; cell = '';
      } else cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows.filter((r) => r.some((x) => x.trim()));
  }

  // deck.csv columns: Card, Rank, Suit, Headline, Fact, Source title, Source URL
  function rowsToDeck(rows) {
    const head = rows[0].map((h) => h.trim().toLowerCase());
    const col = (name) => head.indexOf(name);
    const c = { id: col('card'), image: col('image'), rank: col('rank'), suit: col('suit'), headline: col('headline'), fact: col('fact'), source: col('source title'), url: col('source url') };
    const get = (r, i) => (i >= 0 && r[i] ? r[i].trim() : '');
    return rows.slice(1, TOTAL + 1).map((r) => {
      const s = get(r, c.suit).toUpperCase();
      return {
        id: get(r, c.id).toUpperCase(),
        image: get(r, c.image), // optional: your own artwork for this card (file path or URL)
        suit: s.startsWith('J') ? 'J' : s[0],
        rank: get(r, c.rank),
        headline: get(r, c.headline),
        fact: get(r, c.fact),
        source: get(r, c.source),
        url: get(r, c.url),
      };
    });
  }

  // First joker in the deck is pink, the second is blue.
  function tagColours(deck) {
    let j = 0;
    deck.forEach((c) => { c.color = c.suit === 'J' ? (j++ === 0 ? 'pink' : 'blue') : SUITS[c.suit].color; });
    return deck;
  }

  // Fixed shuffle: the same "random" order on every device. Change SHUFFLE_SEED to get a different order.
  const SHUFFLE_SEED = 20261126;
  function fixedShuffle(deck) {
    const r = rng(SHUFFLE_SEED), out = [...deck];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  async function loadDeck() {
    try {
      const res = await fetch('deck.csv', { cache: 'no-store' });
      if (res.ok) {
        const deck = rowsToDeck(parseCSV(await res.text()));
        if (deck.length) return fixedShuffle(tagColours(deck));
      }
    } catch (_) { /* fall through to sample */ }
    return fixedShuffle(tagColours(standardOrder().map((c, i) => ({
      ...c,
      ...(SAMPLE[i] || { fact: `Placeholder fact for card ${i + 1}. Your real facts will appear here once deck.csv is added.`, source: 'Your source', url: '' }),
    }))));
  }

  /* ---------- Day tracking (per device) ---------- */
  const params = new URLSearchParams(location.search);
  if (params.has('reset')) { localStorage.removeItem(KEY); history.replaceState(null, '', location.pathname + (params.has('demo') ? '?demo' : '')); }
  // Day 1 starts at this phone's first visit; a new card unlocks every 24 hours after that.
  const DAY_MS = 24 * 60 * 60 * 1000;
  const state = JSON.parse(localStorage.getItem(KEY) || 'null') || { start: Date.now(), revealed: [] };
  if (typeof state.start !== 'number') state.start = new Date(state.start).getTime() || Date.now(); // older demo format
  const save = () => localStorage.setItem(KEY, JSON.stringify(state));
  save();
  const realDay = Math.floor((Date.now() - state.start) / DAY_MS) + 1;
  const override = parseInt(params.get('day'), 10);
  const day = Math.min(TOTAL + 1, Math.max(1, override || realDay)); // TOTAL + 1 = deck finished
  const finished = day > TOTAL;

  function nextCardNote(prefix) {
    if (day >= TOTAL) return 'That was the last card in the deck.';
    if (override) return `${prefix}Your next card arrives tomorrow.`;
    const hrs = Math.ceil((state.start + realDay * DAY_MS - Date.now()) / 3.6e6);
    return `${prefix}Your next card arrives in ${hrs <= 1 ? 'under an hour' : `about ${hrs} hours`}.`;
  }

  /* ---------- Drawing helpers ---------- */
  const PIPS = {
    H: 'M50 86C22 64 8 47 8 31 8 17 19 8 31 8c9 0 16 5 19 13 3-8 10-13 19-13 12 0 23 9 23 23 0 16-14 33-42 55Z',
    D: 'M50 5Q63 30 89 50 63 70 50 95 37 70 11 50 37 30 50 5Z',
    S: 'M50 6c10 20 40 34 40 54 0 14-11 22-22 20-8-1-13-6-16-10q2 14 10 22H38q8-8 10-22c-3 4-8 9-16 10-11 2-22-6-22-20 0-20 30-34 40-54Z',
    C: 'M50 12a18 18 0 0 1 14 29 18 18 0 1 1-6 32q1 12 8 19H34q7-7 8-19a18 18 0 1 1-6-32 18 18 0 0 1 14-29Z',
    J: 'M50 6l12 28 30 3-23 20 7 30-26-16-26 16 7-30L8 37l30-3Z',
  };
  const pipSvg = (suit, fill) => `<svg viewBox="0 0 100 100"><path d="${PIPS[suit]}" fill="${fill}" stroke="#3B2B2B" stroke-width="6" stroke-linejoin="round"/></svg>`;

  function rng(seed) { // mulberry32
    return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function blob(cx, cy, r, rand, n = 7) {
    const pts = Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2, rr = r * (0.75 + rand() * 0.4);
      return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
    });
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < n; i++) { // Catmull-Rom to cubic Bezier
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += `C${c1.map((v) => v.toFixed(1))} ${c2.map((v) => v.toFixed(1))} ${p2.map((v) => v.toFixed(1))}`;
    }
    return d + 'Z';
  }

  // Placeholder art: a unique, seeded doodle per card. To be replaced by bespoke, fact-related artwork.
  function artSvg(card, idx) {
    const r = rng(idx * 9973 + 17);
    const pal = { yellow: ['#F7E8A4', '#EBD27A', '#F3DDB0'], green: ['#CFE7C4', '#A8D29A', '#DCEBC0'], pink: ['#F8D3DC', '#EFAFC0', '#F6E0E4'], blue: ['#CFE2F3', '#A9C9E8', '#DDE9F5'] }[card.color];
    let s = `<svg viewBox="0 0 200 112" preserveAspectRatio="xMidYMid slice">`;
    for (let i = 0; i < 3; i++) s += `<path d="${blob(30 + r() * 140, 20 + r() * 72, 24 + r() * 26, r)}" fill="${pal[i]}" opacity=".75"/>`;
    for (let i = 0; i < 16; i++) { // light sprinkles around the edges only
      const x = 6 + r() * 188, y = 6 + r() * 100, t = r();
      if (Math.abs(x - 100) < 74 && y > 10 && y < 102) continue;
      if (t < .5) s += `<circle cx="${x}" cy="${y}" r="${1.2 + r() * 2}" fill="#3B2B2B" opacity=".45"/>`;
      else s += `<path d="M${x - 4} ${y}h8M${x} ${y - 4}v8" stroke="#C9525B" stroke-width="2" stroke-linecap="round" opacity=".7"/>`;
    }
    const drawing = window.CARD_ART ? window.CARD_ART(card.id, { f: pal[0], d: pal[1], l: pal[2] }) : '';
    if (drawing) s += drawing + '</svg>';
    else { // no drawing for this card: fall back to a smiling suit symbol
      s += `<g transform="translate(100 56) translate(-30 -30) scale(.6)">
        <path d="${PIPS[card.suit]}" fill="${pal[1]}" stroke="#3B2B2B" stroke-width="5" stroke-linejoin="round"/>
        <circle cx="40" cy="44" r="3.6" fill="#3B2B2B"/><circle cx="60" cy="44" r="3.6" fill="#3B2B2B"/>
        <path d="M44 53q6 6 12 0" fill="none" stroke="#3B2B2B" stroke-width="3.4" stroke-linecap="round"/>
      </g></svg>`;
    }
    return s;
  }

  /* ---------- Shuffle & fan ---------- */
  const stage = $('#stage'), cardsEl = $('#cards');

  let W, H, cw, ch;
  function measure() {
    W = stage.clientWidth; H = stage.clientHeight;
    cw = Math.min(W * 0.27, H * 0.19, 118); ch = cw * 1.4;
    stage.style.setProperty('--cw', cw + 'px');
    stage.style.setProperty('--ch', ch + 'px');
  }
  const tf = (x, y, r, s = 1) => `translate(${x}px,${y}px) rotate(${r}deg) scale(${s})`;
  const topPacket = (i) => tf(-W * 0.04 + i * 0.3, -H * 0.1 - i * 0.6, -10);
  const bottomPile = (i) => tf(W * 0.06 + (i % 3) - 1, H * 0.13 - i * 0.6, 6 + (i % 2 ? 1.5 : -1.5));
  const FAN = 9;
  function fanPos(i) {
    const a = -34 + (68 / (FAN - 1)) * i;
    const R = ch * 0.85, px = 0, py = H * 0.16;
    const rad = (a * Math.PI) / 180;
    return tf(px + Math.sin(rad) * R, py - Math.cos(rad) * R, a);
  }

  const N = 16;
  const cards = [];
  function buildCards() {
    for (let i = 0; i < N; i++) {
      const c = document.createElement('div');
      c.className = 'card card-back';
      c.style.transform = topPacket(i);
      c.style.zIndex = i;
      cardsEl.appendChild(c);
      cards.push(c);
    }
  }
  const anim = (el, to, opts) => el.animate([{ transform: el.style.transform }, { transform: to }], { duration: 400, easing: 'cubic-bezier(.3,.8,.3,1)', fill: 'forwards', ...opts })
    .finished.then((a) => { el.style.transform = to; a.cancel?.(); });

  async function overhand(round) {
    // Cards peel off the top packet and drop onto the pile below, a few at a time.
    const order = [...cards].sort((a, b) => b.style.zIndex - a.style.zIndex);
    const jobs = [];
    let k = 0;
    for (let i = 0; i < order.length; i++) {
      const c = order[i];
      const chunkDelay = Math.floor(i / 3) * 170 + (i % 3) * 25;
      jobs.push(sleep(chunkDelay).then(() => { c.style.zIndex = 100 + k++; return anim(c, bottomPile(k + round), { duration: 360 }); }));
    }
    await Promise.all(jobs);
    await sleep(120);
    // Gather the pile back up into the top packet.
    const pile = [...cards].sort((a, b) => a.style.zIndex - b.style.zIndex);
    await Promise.all(pile.map((c, i) => { c.style.zIndex = i; return anim(c, topPacket(i), { duration: 420, delay: i * 8 }); }));
  }

  async function toFan() {
    $('#status').style.opacity = 0;
    const keep = cards.slice(-FAN);
    cards.slice(0, N - FAN).forEach((c) => c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: 'forwards' }));
    await Promise.all(keep.map((c, i) => { c.style.zIndex = 10 + i; return anim(c, fanPos(i), { duration: 750, delay: 250 + i * 45, easing: 'cubic-bezier(.2,1.25,.4,1)' }); }));
    stage.classList.add('fanned');
    keep.forEach((c, i) => {
      c.classList.add('pickable');
      c.tabIndex = 0;
      c.setAttribute('role', 'button');
      c.setAttribute('aria-label', `Card ${i + 1} of ${FAN}`);
      const lift = () => { if (!picked) c.style.transform = fanPos(i) + ` translateY(-${ch * 0.12}px)`; };
      const drop = () => { if (!picked) c.style.transform = fanPos(i); };
      c.style.transition = 'transform .2s ease';
      c.addEventListener('pointerenter', lift);
      c.addEventListener('pointerleave', drop);
      c.addEventListener('click', () => pick(c));
      c.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(c); } });
    });
    cards.splice(0, cards.length, ...keep);
  }

  /* ---------- Reveal ---------- */
  let picked = false, deck;
  const PIP_FILL = { yellow: '#EBD27A', green: '#A8D29A', pink: '#EFAFC0', blue: '#A9C9E8' };
  const cardName = (card) => (card.suit === 'J' ? 'Joker' : `${card.rank} of ${SUITS[card.suit].name}`);
  const indexHtml = (card) => `<span>${card.suit === 'J' ? '★' : card.rank}</span>${card.suit === 'J' ? '' : pipSvg(card.suit, PIP_FILL[card.color])}`;

  // Draw a full card face for day d into element `front`.
  function renderFace(front, card, d) {
    front.className = `rc-face rc-front ${card.color}`;
    const idx = indexHtml(card);
    front.innerHTML = `
      <div class="idx tl">${idx}</div><div class="idx br">${idx}</div>
      <div class="art">${card.image ? '<img alt="">' : artSvg(card, d)}</div>
      <div class="fact"><small>Day ${d} · ${cardName(card)}</small><h2></h2><p></p></div>`;
    if (card.image) {
      const img = front.querySelector('.art img');
      img.src = card.image;
      img.onerror = () => { img.parentNode.innerHTML = artSvg(card, d); }; // missing file: use the drawing
    }
    front.querySelector('.fact h2').textContent = card.headline || '';
    front.querySelector('.fact p').textContent = card.fact;
    front.setAttribute('aria-label', `Day ${d} fact: ${card.headline ? card.headline + '. ' : ''}${card.fact}`);
  }

  function wireSource(panel, btn, card) {
    panel.textContent = '';
    panel.hidden = true;
    btn.textContent = 'View source';
    btn.setAttribute('aria-expanded', 'false');
    const label = document.createElement('div');
    label.textContent = card.source ? `Source: ${card.source}` : 'Source not listed';
    panel.appendChild(label);
    if (/^https?:\/\//i.test(card.url)) {
      const a = document.createElement('a');
      a.href = card.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.textContent = 'Open source ↗';
      panel.appendChild(a);
    }
    btn.onclick = () => {
      const open = panel.hidden;
      panel.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Hide source' : 'View source';
    };
  }

  function fillFront(card) {
    renderFace($('#rcFront'), card, day);
    wireSource($('#sourcePanel'), $('#sourceBtn'), card);
  }

  /* ---------- Archive (past days) ---------- */
  const pastDays = () => Array.from({ length: Math.min(day - 1, TOTAL) }, (_, i) => i + 1);
  const markSeen = (d) => { state.revealed = [...new Set([...state.revealed, d])]; save(); };

  function updateArchiveButtons() {
    const past = pastDays();
    const missed = past.filter((d) => !state.revealed.includes(d)).length;
    document.querySelectorAll('.archive-btn').forEach((b) => {
      b.hidden = past.length === 0;
      b.textContent = missed ? `Past cards · ${missed} missed` : 'Past cards';
    });
  }

  function openArchive() {
    const grid = $('#archiveGrid');
    grid.textContent = '';
    for (const d of pastDays()) {
      const card = deck[d - 1];
      const seen = state.revealed.includes(d);
      const tile = document.createElement('button');
      tile.className = seen ? `tile tile-face ${card.color}` : 'tile tile-back card-back';
      tile.setAttribute('aria-label', seen ? `Day ${d}: ${card.headline || cardName(card)}` : `Day ${d}: missed card, tap to reveal`);
      tile.innerHTML = seen
        ? `<span class="tile-idx">${indexHtml(card)}</span><span class="tile-head"></span><span class="tile-day">Day ${d}</span>`
        : `<span class="tile-day tile-missed">Day ${d}<br><b>missed</b></span>`;
      if (seen) tile.querySelector('.tile-head').textContent = card.headline || cardName(card);
      tile.onclick = () => openViewer(d, !seen);
      grid.appendChild(tile);
    }
    $('#archive').hidden = false;
    document.body.classList.add('locked');
    $('#archiveClose').focus();
  }
  function closeArchive() {
    $('#archive').hidden = true;
    document.body.classList.remove('locked');
    updateArchiveButtons();
  }

  async function openViewer(d, wasMissed) {
    const card = deck[d - 1];
    const vrc = $('#vrc');
    renderFace($('#vFront'), card, d);
    wireSource($('#vSourcePanel'), $('#vSourceBtn'), card);
    vrc.classList.toggle('flipped', !wasMissed);
    $('#viewer').hidden = false;
    $('#viewer').scrollTop = 0;
    $('#viewerBack').focus();
    if (wasMissed) {
      markSeen(d);
      await sleep(reduced ? 0 : 350);
      vrc.classList.add('flipped');
    }
  }
  function closeViewer() {
    $('#viewer').hidden = true;
    openArchive(); // refresh tiles so a just-revealed card shows its face
  }

  document.querySelectorAll('.archive-btn').forEach((b) => b.addEventListener('click', openArchive));
  $('#archiveClose').addEventListener('click', closeArchive);
  $('#viewerBack').addEventListener('click', closeViewer);
  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!$('#viewer').hidden) closeViewer();
    else if (!$('#archive').hidden) closeArchive();
  });

  function showCounter() {
    $('#counterText').textContent = `${day} of ${TOTAL}`;
    const left = TOTAL - day;
    $('#counterLeft').textContent = left ? `${left} card${left === 1 ? '' : 's'} left` : 'that\'s the whole deck ✿';
    $('#counter').hidden = false;
  }

  async function pick(el) {
    if (picked) return;
    picked = true;
    const from = el.getBoundingClientRect();
    cards.filter((c) => c !== el).forEach((c, i) => c.animate([{ opacity: 1 }, { opacity: 0, transform: c.style.transform + ` translateY(${H * 0.3}px)` }], { duration: 450, delay: i * 25, fill: 'forwards' }));
    el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 10, delay: 0, fill: 'forwards' });

    markSeen(day);

    stage.classList.add('gone');
    stage.style.position = 'absolute';
    stage.style.visibility = 'hidden';
    const reveal = $('#reveal');
    reveal.hidden = false;
    const rc = $('#rc');
    const to = rc.getBoundingClientRect();
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    const s = cw / to.width;
    await rc.animate([
      { transform: `translate(${dx}px,${dy}px) scale(${s})` },
      { transform: 'translate(0,-12px) scale(1.04)', offset: .7 },
      { transform: 'none' },
    ], { duration: reduced ? 1 : 700, easing: 'cubic-bezier(.3,.9,.3,1)' }).finished;
    rc.classList.add('flipped');
    await sleep(reduced ? 0 : 750);
    $('#after').classList.add('show');
    $('#note').textContent = nextCardNote('');
    updateArchiveButtons();
    showCounter();
  }

  function showRevealedStatic() {
    stage.hidden = true;
    $('#reveal').hidden = false;
    $('#rc').classList.add('flipped');
    $('#after').classList.add('show');
    $('#note').textContent = nextCardNote('You\'ve drawn today\'s card. ');
    updateArchiveButtons();
    showCounter();
  }

  function showFinished() {
    stage.hidden = true;
    $('#finished').hidden = false; // no facts or archive after the deck is done
  }

  /* ---------- Demo controls ---------- */
  // Hidden for visitors; open the site with ?demo to show these controls.
  if (!params.has('demo')) $('#demo').hidden = true;
  $('#demo').addEventListener('click', (e) => {
    const act = e.target.dataset?.act; if (!act) return;
    const go = (d) => { location.search = `?demo&day=${d}`; };
    if (act === 'replay') { state.revealed = state.revealed.filter((d) => d !== day); save(); go(day); }
    if (act === 'prev') go(Math.max(1, day - 1));
    if (act === 'next') go(Math.min(TOTAL + 1, day + 1));
    if (act === 'reset') { location.search = '?demo&reset'; }
  });

  /* ---------- Boot ---------- */
  (async () => {
    deck = await loadDeck();
    if (finished) return showFinished();
    fillFront(deck[day - 1] || deck[deck.length - 1]);
    if (state.revealed.includes(day)) return showRevealedStatic();
    measure();
    buildCards();
    if (!reduced) { await sleep(500); await overhand(0); await overhand(1); }
    await toFan();
  })();
  addEventListener('resize', () => {
    if (!stage.classList.contains('fanned') || picked) return;
    measure();
    cards.forEach((c, i) => { c.style.transform = fanPos(i); });
  });
})();
