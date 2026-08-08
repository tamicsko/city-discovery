/* City Discovery — Lisszabon belváros
   Egyetlen oldalas térképes app. A térkép OpenStreetMap adatból (CARTO csempék),
   a tényleges navigáció a telefonra telepített Google Maps appban indul. */

'use strict';

// ── Állapot ────────────────────────────────────────────────────────────────
const LS = {
  fav:     'cd.favourites',
  visited: 'cd.visited',
  mode:    'cd.travelmode'
};

const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};
const save = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* privát mód */ }
};

const state = {
  cats: new Set(),                       // üres = minden kategória
  savedOnly: false,
  query: '',
  fav: new Set(load(LS.fav, [])),
  visited: new Set(load(LS.visited, [])),
  travelMode: load(LS.mode, 'walking'),
  walk: false,
  selected: null,
  userPos: null
};

const catById = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));
const poiById = Object.fromEntries(POIS.map(p => [p.id, p]));
const $ = sel => document.querySelector(sel);

// ── Térkép ─────────────────────────────────────────────────────────────────
const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;

const map = L.map('map', {
  center: CITY.center,
  zoom: CITY.zoom,
  minZoom: 13,
  maxZoom: 19,
  zoomControl: false,
  attributionControl: true,
  maxBounds: L.latLngBounds(CITY.bounds).pad(0.35),
  maxBoundsViscosity: 0.7
});

L.tileLayer(
  `https://{s}.basemaps.cartocdn.com/rastertiles/${dark ? 'dark_all' : 'voyager'}/{z}/{x}/{y}{r}.png`,
  {
    subdomains: 'abcd',
    maxZoom: 19,
    detectRetina: true,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }
).addTo(map);

// A felső sáv és az alsó lap ne takarja el a középre igazított pontot
const PAD = { paddingTopLeft: [0, 150], paddingBottomRight: [0, 180] };

// ── Jelölők ────────────────────────────────────────────────────────────────
const markers = new Map();

function pinIcon(poi, { number = null, selected = false } = {}) {
  const cat = catById[poi.cat];
  const inner = number !== null ? String(number) : cat.emoji;
  const cls = ['pin', number !== null ? 'numbered' : '', selected ? 'selected' : '',
               state.visited.has(poi.id) ? 'done' : ''].filter(Boolean).join(' ');
  return L.divIcon({
    className: '',
    html: `<div class="${cls}" style="--pin:${cat.color}"><span>${inner}</span></div>`,
    iconSize: [30, 38],
    iconAnchor: [15, 38]
  });
}

for (const poi of POIS) {
  const m = L.marker([poi.lat, poi.lng], { icon: pinIcon(poi), title: poi.name, riseOnHover: true })
    .on('click', () => selectPoi(poi.id, { fly: true }));
  markers.set(poi.id, m);
}

function refreshMarkers() {
  const visible = new Set(filtered().map(p => p.id));
  const order = state.walk ? WALK.stops : [];
  for (const [id, m] of markers) {
    const poi = poiById[id];
    const idx = order.indexOf(id);
    const show = state.walk ? idx >= 0 : visible.has(id);
    if (show && !map.hasLayer(m)) m.addTo(map);
    if (!show && map.hasLayer(m)) m.remove();
    if (show) {
      m.setIcon(pinIcon(poi, {
        number: idx >= 0 ? idx + 1 : null,
        selected: state.selected === id
      }));
    }
  }
}

// ── Séta-útvonal ───────────────────────────────────────────────────────────
const routeLine = L.polyline(WALK.path, {
  color: dark ? '#8ab4f8' : '#1a73e8',
  weight: 6, opacity: .85, lineJoin: 'round', lineCap: 'round'
});

function setWalk(on) {
  state.walk = on;
  $('#fab-walk').setAttribute('aria-pressed', String(on));
  if (on) {
    routeLine.addTo(map);
    map.fitBounds(routeLine.getBounds(), PAD);
  } else {
    routeLine.remove();
  }
  render();
}

// ── Segédfüggvények ────────────────────────────────────────────────────────
function distanceM(a, b) {
  const R = 6371000, toRad = d => d * Math.PI / 180;
  const dLat = toRad(b[0] - a[0]), dLng = toRad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const fmtDist = m => m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`;
const walkMin = m => `${Math.max(1, Math.round(m / 80))} perc séta`;

// Ékezetek levágása, hogy a "Praca" is megtalálja a "Praça"-t
const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function filtered() {
  const q = normalize(state.query.trim());
  return POIS.filter(p => {
    if (state.cats.size && !state.cats.has(p.cat)) return false;
    if (state.savedOnly && !state.fav.has(p.id)) return false;
    if (q && !(normalize(p.name).includes(q) ||
               normalize(p.desc).includes(q) ||
               normalize(catById[p.cat].label).includes(q))) return false;
    return true;
  });
}

function anchor() {
  return state.userPos || [map.getCenter().lat, map.getCenter().lng];
}

let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
}

// ── Google Maps átadás ─────────────────────────────────────────────────────
function navigateTo(poi) {
  const url = 'https://www.google.com/maps/dir/?api=1' +
    `&destination=${poi.lat},${poi.lng}` +
    `&travelmode=${state.travelMode}`;
  window.open(url, '_blank', 'noopener');
}

function openInMaps(poi) {
  const q = encodeURIComponent(`${poi.name}, Lisboa, Portugal`);
  window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank', 'noopener');
}

// A Google Maps URL API legfeljebb 9 köztes pontot fogad el.
const MAX_WAYPOINTS = 9;

function navigateWalk() {
  const stops = WALK.stops.map(id => poiById[id]);
  const origin = stops[0], destination = stops[stops.length - 1];
  let middle = stops.slice(1, -1);
  let dropped = 0;

  if (middle.length > MAX_WAYPOINTS) {
    // Egyenletesen ritkítunk, hogy az útvonal alakja megmaradjon
    const step = middle.length / MAX_WAYPOINTS;
    const kept = [];
    for (let i = 0; i < MAX_WAYPOINTS; i++) kept.push(middle[Math.floor(i * step)]);
    dropped = middle.length - kept.length;
    middle = kept;
  }

  const url = 'https://www.google.com/maps/dir/?api=1' +
    `&origin=${origin.lat},${origin.lng}` +
    `&destination=${destination.lat},${destination.lng}` +
    `&waypoints=${middle.map(p => `${p.lat},${p.lng}`).join('|')}` +
    '&travelmode=walking';

  if (dropped) {
    toast(`A Google Maps max. ${MAX_WAYPOINTS} köztes megállót fogad — ${dropped} megálló kimaradt az útvonalból.`);
  }
  window.open(url, '_blank', 'noopener');
}

// ── Lista ──────────────────────────────────────────────────────────────────
function render() {
  const list = $('#list');
  const from = anchor();

  if (state.walk) {
    $('#sheet-title').textContent = WALK.name;
    $('#sheet-count').textContent = `${WALK.distance} · ${WALK.duration}`;
    const items = WALK.stops.map((id, i) => ({ poi: poiById[id], n: i + 1 }));
    list.innerHTML =
      `<div style="padding:12px 16px 4px">
         <button class="btn primary" id="walk-start" style="width:100%">
           ➤ Útvonal indítása a Google Mapsben
         </button>
       </div>` +
      items.map(({ poi, n }) => poiRow(poi, from, n)).join('');
    $('#walk-start').addEventListener('click', navigateWalk);
  } else {
    const items = filtered()
      .map(p => ({ p, d: distanceM(from, [p.lat, p.lng]) }))
      .sort((a, b) => a.d - b.d);
    $('#sheet-title').textContent = state.savedOnly ? 'Mentett helyek' : CITY.name;
    $('#sheet-count').textContent = `${items.length} hely`;
    list.innerHTML = items.length
      ? items.map(({ p }) => poiRow(p, from)).join('')
      : `<p class="empty">Nincs találat.<br>Próbálj más keresőszót vagy szűrőt.</p>`;
  }

  list.querySelectorAll('[data-poi]').forEach(el => {
    el.addEventListener('click', () => selectPoi(el.dataset.poi, { fly: true }));
  });

  refreshMarkers();
}

function poiRow(poi, from, number = null) {
  const cat = catById[poi.cat];
  const d = distanceM(from, [poi.lat, poi.lng]);
  const badge = number !== null
    ? `<div class="poi-pin" style="background:${cat.color};color:#fff;font-weight:700">${number}</div>`
    : `<div class="poi-pin">${cat.emoji}</div>`;
  const flags =
    (state.fav.has(poi.id) ? '<span title="Mentve">⭐</span>' : '') +
    (state.visited.has(poi.id) ? '<span title="Voltam itt">✅</span>' : '');
  return `
    <button class="poi" data-poi="${poi.id}">
      ${badge}
      <div class="poi-main">
        <p class="poi-name">${poi.name}</p>
        <div class="poi-meta"><span>${cat.label}</span><span>·</span><span>${fmtDist(d)}</span><span>·</span><span>${walkMin(d)}</span></div>
        <p class="poi-desc">${poi.desc}</p>
      </div>
      <div class="poi-flags">${flags}</div>
    </button>`;
}

// ── Részletek ──────────────────────────────────────────────────────────────
function selectPoi(id, { fly = false } = {}) {
  const poi = poiById[id];
  if (!poi) return;
  state.selected = id;

  $('#d-name').textContent = poi.name;
  $('#d-cat').textContent = `${catById[poi.cat].emoji} ${catById[poi.cat].label}`;
  $('#d-desc').textContent = poi.desc;
  const tip = $('#d-tip');
  tip.hidden = !poi.tip;
  if (poi.tip) tip.innerHTML = `<b>Tipp:</b> ${poi.tip}`;

  syncDetailToggles();
  $('#detail').classList.add('open');
  $('#detail').setAttribute('aria-hidden', 'false');
  $('#scrim').classList.add('open');

  if (fly) map.flyTo([poi.lat, poi.lng], Math.max(map.getZoom(), 17), { duration: .5 });
  refreshMarkers();
}

function closeDetail() {
  state.selected = null;
  $('#detail').classList.remove('open');
  $('#detail').setAttribute('aria-hidden', 'true');
  $('#scrim').classList.remove('open');
  refreshMarkers();
}

function syncDetailToggles() {
  const id = state.selected;
  const fav = $('#d-fav'), vis = $('#d-visited');
  const isFav = state.fav.has(id), isVis = state.visited.has(id);
  fav.setAttribute('aria-pressed', String(isFav));
  fav.textContent = isFav ? '★ Mentve' : '☆ Mentés';
  vis.setAttribute('aria-pressed', String(isVis));
  vis.textContent = isVis ? '✓ Voltam' : '✓ Voltam?';
  document.querySelectorAll('.mode').forEach(b =>
    b.setAttribute('aria-pressed', String(b.dataset.mode === state.travelMode)));
}

// ── Szűrő-chipek ───────────────────────────────────────────────────────────
function buildChips() {
  const box = $('#chips');
  const chips = [
    { key: 'saved', label: 'Mentett', emoji: '⭐' },
    ...CATEGORIES.map(c => ({ key: c.id, label: c.label, emoji: c.emoji }))
  ];
  box.innerHTML = chips.map(c =>
    `<button class="chip" data-key="${c.key}" aria-pressed="false">
       <span aria-hidden="true">${c.emoji}</span>${c.label}
     </button>`).join('');

  box.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      if (key === 'saved') {
        state.savedOnly = !state.savedOnly;
      } else {
        state.cats.has(key) ? state.cats.delete(key) : state.cats.add(key);
      }
      if (state.walk) setWalk(false);
      syncChips();
      render();
      openSheet('half');
    });
  });
}

function syncChips() {
  document.querySelectorAll('.chip').forEach(btn => {
    const key = btn.dataset.key;
    const on = key === 'saved' ? state.savedOnly : state.cats.has(key);
    btn.setAttribute('aria-pressed', String(on));
  });
}

// ── Helymeghatározás ───────────────────────────────────────────────────────
let meMarker = null, meCircle = null, watchId = null;

function locate() {
  if (!navigator.geolocation) return toast('Ez a böngésző nem támogatja a helymeghatározást.');
  const fab = $('#fab-locate');
  fab.classList.add('locating');

  if (watchId !== null) navigator.geolocation.clearWatch(watchId);
  watchId = navigator.geolocation.watchPosition(
    pos => {
      fab.classList.remove('locating');
      const { latitude: lat, longitude: lng, accuracy } = pos.coords;
      const first = !state.userPos;
      state.userPos = [lat, lng];

      if (!meMarker) {
        meMarker = L.marker([lat, lng], {
          icon: L.divIcon({ className: '', html: '<div class="me"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }),
          zIndexOffset: 1000, interactive: false
        }).addTo(map);
        meCircle = L.circle([lat, lng], { radius: accuracy, color: '#1a73e8', weight: 1, fillOpacity: .12 }).addTo(map);
      } else {
        meMarker.setLatLng([lat, lng]);
        meCircle.setLatLng([lat, lng]).setRadius(accuracy);
      }

      if (first) {
        const inCity = L.latLngBounds(CITY.bounds).pad(0.5).contains([lat, lng]);
        if (inCity) map.flyTo([lat, lng], 17, { duration: .6 });
        else toast('Jelenleg nem Lisszabon belvárosában vagy — a térkép a belvároson marad.');
      }
      render();
    },
    err => {
      fab.classList.remove('locating');
      toast(err.code === err.PERMISSION_DENIED
        ? 'A helymeghatározás le van tiltva ennek az oldalnak.'
        : 'Nem sikerült meghatározni a helyzetedet.');
    },
    { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
  );
}

// ── Alsó lap húzása ────────────────────────────────────────────────────────
const sheet = $('#sheet');
const snaps = () => {
  const h = sheet.getBoundingClientRect().height;
  return { peek: h - 132, half: h * 0.45, full: 0 };
};
let sheetY = null;

function openSheet(which) {
  const s = snaps();
  sheetY = s[which] ?? s.peek;
  sheet.style.transform = `translateY(${sheetY}px)`;
  positionFabs();
}

// A gombok mindig a lap teteje fölött maradjanak, de a képernyő felénél ne följebb
function positionFabs() {
  const h = sheet.getBoundingClientRect().height;
  const visible = h - (sheetY ?? snaps().peek);
  const bottom = Math.min(visible + 12, window.innerHeight * 0.55);
  $('#fabs').style.bottom = `${Math.max(bottom, 60)}px`;
}

const DRAG_THRESHOLD = 8;   // ennyi px alatt koppintásnak számít, nem húzásnak

(function enableDrag() {
  let startY = 0, startTranslate = 0, pointerId = null;
  let tracking = false, dragging = false, fromBody = false;

  const onDown = e => {
    if (e.target.closest('.sheet-body') && $('#list').scrollTop > 0) return;
    tracking = true;
    dragging = false;
    fromBody = !!e.target.closest('.sheet-body');
    startY = e.clientY;
    startTranslate = sheetY ?? snaps().peek;
    pointerId = e.pointerId;
  };

  const onMove = e => {
    if (!tracking) return;
    const dy = e.clientY - startY;

    if (!dragging) {
      if (Math.abs(dy) < DRAG_THRESHOLD) return;
      // A listán belülről csak lefelé húzva zárjuk a lapot — felfelé görgetni kell
      if (fromBody && dy < 0) { tracking = false; return; }
      dragging = true;
      sheet.classList.add('dragging');
      sheet.setPointerCapture?.(pointerId);
    }

    const s = snaps();
    sheetY = Math.min(s.peek + 40, Math.max(-10, startTranslate + dy));
    sheet.style.transform = `translateY(${sheetY}px)`;
    positionFabs();
  };

  const onUp = () => {
    if (!tracking) return;
    tracking = false;
    if (!dragging) return;          // sima koppintás: a click esemény mehet tovább
    dragging = false;
    sheet.classList.remove('dragging');
    const s = snaps();
    const nearest = ['full', 'half', 'peek']
      .map(k => ({ k, d: Math.abs(s[k] - sheetY) }))
      .sort((a, b) => a.d - b.d)[0].k;
    openSheet(nearest);
  };

  sheet.addEventListener('pointerdown', onDown);
  sheet.addEventListener('pointermove', onMove);
  sheet.addEventListener('pointerup', onUp);
  sheet.addEventListener('pointercancel', onUp);

  $('#grabber').addEventListener('click', () => {
    const s = snaps();
    openSheet(Math.abs(sheetY - s.peek) < 20 ? 'half' : 'peek');
  });
})();

// A részletek lapot lefelé húzva is be lehet csukni
(function enableDetailSwipe() {
  const detail = $('#detail');
  const handle = $('#detail-grabber');
  let startY = null;

  handle.addEventListener('pointerdown', e => {
    startY = e.clientY;
    detail.style.transition = 'none';
    handle.setPointerCapture?.(e.pointerId);
  });

  handle.addEventListener('pointermove', e => {
    if (startY === null) return;
    const dy = Math.max(0, e.clientY - startY);
    detail.style.transform = `translateY(${dy}px)`;
  });

  const end = e => {
    if (startY === null) return;
    const dy = Math.max(0, (e.clientY ?? startY) - startY);
    startY = null;
    detail.style.transition = '';
    detail.style.transform = '';
    if (dy > 80) closeDetail();
  };

  handle.addEventListener('pointerup', end);
  handle.addEventListener('pointercancel', end);
})();

// ── Eseménykötések ─────────────────────────────────────────────────────────
$('#search').addEventListener('input', e => {
  state.query = e.target.value;
  $('#clear-search').hidden = !state.query;
  if (state.walk && state.query) setWalk(false);
  render();
  if (state.query) openSheet('half');
});

$('#clear-search').addEventListener('click', () => {
  state.query = '';
  $('#search').value = '';
  $('#clear-search').hidden = true;
  render();
});

$('#fab-walk').addEventListener('click', () => {
  const on = !state.walk;
  if (on) { state.query = ''; $('#search').value = ''; $('#clear-search').hidden = true; }
  setWalk(on);
  openSheet('half');
});

$('#fab-locate').addEventListener('click', locate);
$('#d-close').addEventListener('click', closeDetail);
$('#scrim').addEventListener('click', closeDetail);

$('#d-nav').addEventListener('click', () => navigateTo(poiById[state.selected]));
$('#d-search').addEventListener('click', e => {
  e.preventDefault();
  openInMaps(poiById[state.selected]);
});

$('#d-fav').addEventListener('click', () => {
  const id = state.selected;
  state.fav.has(id) ? state.fav.delete(id) : state.fav.add(id);
  save(LS.fav, [...state.fav]);
  syncDetailToggles();
  render();
});

$('#d-visited').addEventListener('click', () => {
  const id = state.selected;
  state.visited.has(id) ? state.visited.delete(id) : state.visited.add(id);
  save(LS.visited, [...state.visited]);
  syncDetailToggles();
  render();
});

document.querySelectorAll('.mode').forEach(btn => {
  btn.addEventListener('click', () => {
    state.travelMode = btn.dataset.mode;
    save(LS.mode, state.travelMode);
    syncDetailToggles();
  });
});

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDetail(); });

let moveTimer;
map.on('moveend', () => {
  if (state.userPos) return;            // saját pozícióhoz képest rendezünk, ne ugráljon
  clearTimeout(moveTimer);
  moveTimer = setTimeout(render, 250);
});

window.addEventListener('resize', () => openSheet('peek'));

// ── Indulás ────────────────────────────────────────────────────────────────
buildChips();
render();
requestAnimationFrame(() => openSheet('peek'));

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
