/* Tollrajz réteg — az épületeket nem a MapLibre rajzolja ki, hanem mi.
   A vektorcsempékből kiolvassuk az alaprajzokat, és papírtérkép módjára
   újrarajzoljuk: axonometrikus oldalfalak, kétszer húzott, enyhén szabálytalan
   tuskontúr. A szabálytalanság magvetett — minden épület mindig ugyanúgy néz ki,
   így nem villog újrarajzoláskor. */

'use strict';

const Ink = (() => {
  const PALETTE = {
    roof:   '#e4ddcb',      // a tömbök határozottan elváljanak a papírtól
    roofHi: '#ece5d4',
    wall:   '#bfb6a1',      // az oldalfalak adják a plasztikát
    wallHi: '#d0c7b2',
    line:   '#57503f',
    shadow: 'rgba(90, 80, 60, 0.16)'
  };

  const MIN_AREA_PX   = 26;    // ennél kisebb tömböt nem rajzolunk ki
  const MAX_RISE_PX   = 46;    // a magasság ne uralja a képet
  const JITTER_PX     = 1.15;  // a tuskontúr szabálytalansága
  const MARGIN_PX     = 90;    // ennyivel a képernyőn kívülre is rajzolunk

  let canvas, ctx, map, dpr = 1;
  let anchor = null, anchorPx = null, anchorZoom = 0;   // a CSS-transzformhoz
  let enabled = true;
  let raf = 0;
  let route = null;            // a séta-útvonal pontjai [lng,lat] párokként

  // ── Magvetett véletlen: ugyanaz a bemenet mindig ugyanazt adja ────────────
  function rngFrom(seed) {
    let s = (seed >>> 0) || 1;
    return () => {
      s ^= s << 13; s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5;  s >>>= 0;
      return s / 4294967296;
    };
  }

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  // ── Geometria ────────────────────────────────────────────────────────────
  function signedArea(pts) {
    let a = 0;
    for (let i = 0, n = pts.length; i < n; i++) {
      const p = pts[i], q = pts[(i + 1) % n];
      a += p[0] * q[1] - q[0] * p[1];
    }
    return a / 2;
  }

  /* A kontúrt élenként rezgetjük: a hosszabb éleket felosztjuk, hogy a vonal
     ne csak a sarkokban, hanem hosszában is éljen. */
  function inkPath(pts, rnd, amp) {
    const out = [];
    for (let i = 0, n = pts.length; i < n; i++) {
      const p = pts[i], q = pts[(i + 1) % n];
      out.push([p[0] + (rnd() - 0.5) * amp, p[1] + (rnd() - 0.5) * amp]);
      const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
      const steps = Math.min(3, Math.floor(len / 26));
      for (let s = 1; s <= steps; s++) {
        const t = s / (steps + 1);
        out.push([
          p[0] + (q[0] - p[0]) * t + (rnd() - 0.5) * amp * 1.3,
          p[1] + (q[1] - p[1]) * t + (rnd() - 0.5) * amp * 1.3
        ]);
      }
    }
    return out;
  }

  function tracePath(pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
  }

  // ── Adatgyűjtés ──────────────────────────────────────────────────────────
  function collect() {
    let feats;
    try {
      feats = map.querySourceFeatures('openmaptiles', { sourceLayer: 'building' });
    } catch {
      return [];
    }
    if (!feats.length) return [];

    /* A csempehatárokon átnyúló épületek több darabban érkeznek. Azonosítónként
       a legnagyobb darabot tartjuk meg — így nem rajzolunk kétszer, és nem
       jelenik meg hamis, egyenes vágásél. A forrás legnagyobb zoomja 14, ezért
       a képernyőn jellemzően legfeljebb egy-két csempehatár fut át. */
    const best = new Map();
    for (const f of feats) {
      const g = f.geometry;
      if (!g) continue;
      const polys = g.type === 'Polygon' ? [g.coordinates]
                  : g.type === 'MultiPolygon' ? g.coordinates : null;
      if (!polys) continue;

      for (const poly of polys) {
        const ring = poly[0];
        if (!ring || ring.length < 4) continue;
        const key = f.id !== undefined ? String(f.id) : ring[0].join(',');
        const area = Math.abs(signedArea(ring));
        const prev = best.get(key);
        if (!prev || area > prev.area) {
          best.set(key, { ring, area, height: f.properties?.render_height ?? 9, key });
        }
      }
    }
    return [...best.values()];
  }

  // ── Rajzolás ─────────────────────────────────────────────────────────────
  function drawNow() {
    if (!enabled) { ctx.clearRect(0, 0, canvas.width, canvas.height); return; }

    const w = canvas.width / dpr, h = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const items = collect();
    if (!items.length) return;

    // Hány képernyőpixel egy méter ezen a zoomon és szélességen
    const lat = map.getCenter().lat;
    const mPerPx = 156543.03392 * Math.cos(lat * Math.PI / 180) / Math.pow(2, map.getZoom());
    const pxPerM = 1 / mPerPx;

    const drawn = [];
    for (const it of items) {
      const pts = new Array(it.ring.length - 1);
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (let i = 0; i < pts.length; i++) {
        const p = map.project(it.ring[i]);
        pts[i] = [p.x, p.y];
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      }
      const rise = Math.min(MAX_RISE_PX, it.height * pxPerM * 0.55);
      if (maxX < -MARGIN_PX || minX > w + MARGIN_PX ||
          maxY < -MARGIN_PX || minY > h + MARGIN_PX + rise) continue;
      if (Math.abs(signedArea(pts)) < MIN_AREA_PX) continue;
      drawn.push({ pts, rise, key: it.key, cy: maxY });
    }

    // Hátulról előre: a közelebbi tömbök takarják a távolabbiakat
    drawn.sort((a, b) => a.cy - b.cy);

    const dx = 0.32, dy = -1;                    // axonometrikus irány
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    for (const b of drawn) {
      const rnd = rngFrom(hash(b.key));
      const ox = dx * b.rise, oy = dy * b.rise;

      // Lágy vetett árnyék — a papírra fektetett rajz hatása
      ctx.fillStyle = PALETTE.shadow;
      tracePath(b.pts.map(p => [p[0] + 2.5, p[1] + 2.5]));
      ctx.fill();

      const roof = b.pts.map(p => [p[0] + ox, p[1] + oy]);
      const cw = signedArea(b.pts) > 0;

      // Oldalfalak — csak a néző felé néző élek
      for (let i = 0, n = b.pts.length; i < n; i++) {
        const p = b.pts[i], q = b.pts[(i + 1) % n];
        const ex = q[0] - p[0], ey = q[1] - p[1];
        const facing = (ex * oy - ey * ox) * (cw ? 1 : -1);
        if (facing <= 0) continue;

        const shade = Math.abs(ex) > Math.abs(ey) ? PALETTE.wallHi : PALETTE.wall;
        ctx.fillStyle = shade;
        ctx.beginPath();
        ctx.moveTo(p[0], p[1]);
        ctx.lineTo(q[0], q[1]);
        ctx.lineTo(q[0] + ox, q[1] + oy);
        ctx.lineTo(p[0] + ox, p[1] + oy);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = PALETTE.line;
        ctx.globalAlpha = 0.32;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(p[0], p[1]);
        ctx.lineTo(p[0] + ox, p[1] + oy);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Tető: kitöltés, majd kétszer húzott tuskontúr
      ctx.fillStyle = b.rise > 14 ? PALETTE.roofHi : PALETTE.roof;
      tracePath(inkPath(roof, rngFrom(hash(b.key)), JITTER_PX * 0.6));
      ctx.fill();

      ctx.strokeStyle = PALETTE.line;
      for (let pass = 0; pass < 2; pass++) {
        ctx.globalAlpha = pass ? 0.45 : 0.9;
        ctx.lineWidth = pass ? 0.6 : 1.05;
        tracePath(inkPath(roof, rngFrom(hash(b.key) + pass * 7919), JITTER_PX));
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    drawRoute();

    // A transzformhoz elmentjük, milyen nézetben készült a rajz
    anchor = map.getCenter();
    anchorZoom = map.getZoom();
    anchorPx = map.project(anchor);
    canvas.style.transform = '';
  }

  /* A séta-útvonal az épületek fölé kerül, kézzel húzott szaggatott vonalként.
     (A MapLibre saját vonalrétege a rajz alá esne, ezért rajzoljuk itt.) */
  function drawRoute() {
    if (!route || route.length < 2) return;
    const pts = route.map(ll => { const p = map.project(ll); return [p.x, p.y]; });
    const rnd = rngFrom(20250808);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let pass = 0; pass < 2; pass++) {
      ctx.strokeStyle = pass ? '#1a5fb4' : '#ffffff';
      ctx.lineWidth = pass ? 4.5 : 9;
      ctx.globalAlpha = pass ? 0.95 : 0.85;
      ctx.setLineDash(pass ? [11, 7] : []);
      ctx.beginPath();
      pts.forEach((p, i) => {
        const jx = p[0] + (rnd() - 0.5) * 1.6, jy = p[1] + (rnd() - 0.5) * 1.6;
        i ? ctx.lineTo(jx, jy) : ctx.moveTo(jx, jy);
      });
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  /* Mozgás közben nem rajzolunk újra — a kész képet CSS-sel toljuk-nagyítjuk,
     és csak megálláskor készül új, éles rajz. */
  function follow() {
    if (!anchor || !enabled) return;
    const scale = Math.pow(2, map.getZoom() - anchorZoom);
    const now = map.project(anchor);
    canvas.style.transform =
      `translate(${now.x - anchorPx.x * scale}px, ${now.y - anchorPx.y * scale}px) scale(${scale})`;
  }

  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(() => { raf = 0; drawNow(); });
  }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    schedule();
  }

  return {
    /* A vásznat a MapLibre saját vászontárolójába tesszük, közvetlenül a WebGL
       réteg után — így a később hozzáadott jelölők DOM-sorrend szerint fölé
       kerülnek, és a rajz nem takarja el őket. */
    init(mapInstance) {
      map = mapInstance;
      const host = map.getCanvasContainer();
      canvas = document.createElement('canvas');
      canvas.id = 'ink';
      host.appendChild(canvas);
      ctx = canvas.getContext('2d');
      resize();

      map.on('move', follow);
      map.on('moveend', schedule);
      map.on('zoomend', schedule);
      map.on('idle', schedule);
      map.on('sourcedata', e => { if (e.isSourceLoaded) schedule(); });
      window.addEventListener('resize', resize);
    },
    setEnabled(on) {
      enabled = on;
      canvas.style.display = on ? '' : 'none';
      if (on) schedule();
    },
    isEnabled: () => enabled,
    setRoute(coords) { route = coords; schedule(); },
    redraw: schedule
  };
})();
