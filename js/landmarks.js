/* Rajzolt nevezetességek.
   Minden illusztráció 120x120-as vászonra készül, azonos képi nyelven:
   krém falak, terrakotta tető, tusvonal. A kézi rajz szabálytalanságát egy
   közös SVG-szűrő adja (feTurbulence + feDisplacementMap) — így nem kell
   minden vonalat kézzel görbíteni, és minden rajz egy kézből valónak látszik. */

'use strict';

const LM = {
  ink:    '#453d31',
  wall:   '#f2e4c6',
  wallSh: '#dcc8a2',
  roof:   '#bd5334',
  roofSh: '#9b4126',
  stone:  '#dcd5c4',
  stoneSh:'#c2b9a4',
  iron:   '#8c8578',
  glass:  '#7d94a3',
  gold:   '#e0a52e',
  green:  '#7ba05b'
};

/* A szűrő definícióját egyszer tesszük ki a dokumentumba, a rajzok hivatkoznak rá. */
const LANDMARK_DEFS = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <filter id="lm-rough" x="-12%" y="-12%" width="124%" height="124%">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="7" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="2.1"
                         xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </defs>
</svg>`;

/* Közös burkoló: a rajzot a szűrővel és az egységes vonalstílussal adja vissza. */
function lmSvg(body, label) {
  return `<svg viewBox="0 0 120 120" role="img" aria-label="${label}"
     xmlns="http://www.w3.org/2000/svg">
  <g filter="url(#lm-rough)" fill="none" stroke="${LM.ink}" stroke-width="1.7"
     stroke-linejoin="round" stroke-linecap="round">${body}</g>
</svg>`;
}

// Ismétlődő elemek
const arches = (x, y, w, h, n, fill) => {
  let s = '';
  const step = w / n;
  for (let i = 0; i < n; i++) {
    const ax = x + i * step + step * 0.16, aw = step * 0.68;
    s += `<path d="M${ax} ${y + h} V${y + aw / 2} a${aw / 2} ${aw / 2} 0 0 1 ${aw} 0 V${y + h} Z"
            fill="${fill}"/>`;
  }
  return s;
};

const windows = (x, y, cols, rows, dx, dy, w, h) => {
  let s = '';
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    s += `<rect x="${x + c * dx}" y="${y + r * dy}" width="${w}" height="${h}"
             rx="1" fill="${LM.glass}"/>`;
  }
  return s;
};

const LANDMARKS = {

  // ── Praça do Comércio: árkádos szárnyak, középen tornyos pavilon ─────────
  comercio: lmSvg(`
    <path d="M8 96 H112" stroke-width="2.2"/>
    <path d="M12 62 H108 V96 H12 Z" fill="${LM.wall}"/>
    ${arches(14, 74, 92, 22, 8, LM.stoneSh)}
    ${windows(18, 66, 8, 1, 11.5, 0, 6, 6)}
    <path d="M10 62 L18 52 H102 L110 62 Z" fill="${LM.roof}"/>
    <path d="M44 52 V34 H76 V52 Z" fill="${LM.wall}"/>
    ${windows(50, 40, 3, 1, 8, 0, 5, 7)}
    <path d="M42 34 L60 20 L78 34 Z" fill="${LM.roof}"/>
    <path d="M60 20 V12" stroke-width="1.4"/>
    <circle cx="60" cy="10" r="2.6" fill="${LM.gold}"/>
    <path d="M52 96 V88 h16 v8" fill="${LM.stoneSh}"/>`, 'Praça do Comércio'),

  // ── Arco da Rua Augusta: diadalív szoborcsoporttal ───────────────────────
  arco: lmSvg(`
    <path d="M8 100 H112" stroke-width="2.2"/>
    <path d="M22 100 V40 H98 V100" fill="${LM.stone}"/>
    <path d="M46 100 V64 a14 14 0 0 1 28 0 V100 Z" fill="#efe9db"/>
    <path d="M30 100 V56 h8 v44 Z M82 100 V56 h8 v44 Z" fill="${LM.stoneSh}"/>
    <path d="M18 40 H102 V32 H18 Z" fill="${LM.stone}"/>
    <path d="M34 32 V22 h52 v10 Z" fill="${LM.stone}"/>
    <circle cx="60" cy="15" r="5" fill="${LM.stoneSh}"/>
    <path d="M48 22 l4 -8 M72 22 l-4 -8" stroke-width="1.4"/>
    <circle cx="47" cy="12" r="3" fill="${LM.stoneSh}"/>
    <circle cx="73" cy="12" r="3" fill="${LM.stoneSh}"/>
    <path d="M40 52 h40" stroke-width="1.2"/>`, 'Arco da Rua Augusta'),

  // ── Elevador de Santa Justa: vaslift rácsos szerkezettel ────────────────
  // Karcsú, magas vastorony — a rácsozat a jellegadó eleme
  'santa-justa': lmSvg(`
    <path d="M14 112 H106" stroke-width="2.2"/>
    <path d="M48 112 V30 H72 V112" fill="#f3eee2"/>
    <path d="M48 30 H72 M48 46 H72 M48 62 H72 M48 78 H72 M48 95 H72"
          stroke="${LM.iron}" stroke-width="1.2"/>
    <path d="M48 30 L72 46 M72 30 L48 46
             M48 46 L72 62 M72 46 L48 62
             M48 62 L72 78 M72 62 L48 78
             M48 78 L72 95 M72 78 L48 95"
          stroke="${LM.iron}" stroke-width="1.1"/>
    <path d="M48 112 V95 h24 v17" fill="${LM.stoneSh}"/>
    <rect x="55" y="99" width="10" height="13" rx="1" fill="${LM.glass}"/>
    <path d="M36 30 H84 V23 H36 Z" fill="${LM.iron}"/>
    <path d="M38 23 V14 M48 23 V14 M60 23 V14 M72 23 V14 M82 23 V14"
          stroke-width="1.2"/>
    <path d="M34 14 H86" stroke-width="1.7"/>
    <path d="M54 14 V7 a6 6 0 0 1 12 0 V14 Z" fill="${LM.iron}"/>
    <path d="M84 30 q14 -6 22 -14" stroke-width="1.5"/>`,
    'Elevador de Santa Justa'),

  // ── Convento do Carmo: tető nélküli gótikus rom ──────────────────────────
  /* Tető nélküli gótikus rom: csúcsíves árkádsor, fölötte nyitott ég,
     a falak teteje csorba — ettől olvasható romként. */
  carmo: lmSvg(`
    <path d="M8 106 H112" stroke-width="2.2"/>
    <path d="M16 106 V40 l5 -6 4 7 5 -8 4 7 V106 Z" fill="${LM.stoneSh}"/>
    <path d="M92 106 V38 l5 -7 4 8 5 -7 4 6 V106 Z" fill="${LM.stoneSh}"/>
    <path d="M34 106 V50 L47 28 L60 50 V106 Z" fill="#f3eee2"/>
    <path d="M60 106 V50 L73 28 L86 50 V106 Z" fill="#efe9db"/>
    <path d="M34 50 L47 28 L60 50 M60 50 L73 28 L86 50" stroke-width="1.7"/>
    <path d="M41 106 V72 L47 60 L53 72 V106 Z" fill="${LM.stone}"/>
    <path d="M67 106 V72 L73 60 L79 72 V106 Z" fill="${LM.stone}"/>
    <path d="M34 50 V106 M60 50 V106 M86 50 V106" stroke-width="1.4"/>
    <path d="M47 28 V20 M73 28 V20" stroke-width="1.2"/>
    <path d="M28 62 h6 M86 60 h6" stroke-width="1.2"/>`, 'Convento do Carmo'),

  // ── Estação do Rossio: patkóíves manuelin homlokzat ──────────────────────
  'rossio-station': lmSvg(`
    <path d="M8 104 H112" stroke-width="2.2"/>
    <path d="M16 104 V38 H104 V104 Z" fill="${LM.wall}"/>
    <path d="M30 104 V66 q0 -16 14 -16 t14 16 V104 Z" fill="${LM.stoneSh}"/>
    <path d="M62 104 V66 q0 -16 14 -16 t14 16 V104 Z" fill="${LM.stoneSh}"/>
    ${windows(24, 44, 6, 1, 13, 0, 7, 7)}
    <path d="M14 38 H106 V30 H14 Z" fill="${LM.stone}"/>
    <path d="M18 30 V22 h6 v8 M96 30 V22 h6 v8" fill="${LM.stone}"/>
    <path d="M21 22 l0 -8 M99 22 l0 -8" stroke-width="1.4"/>
    <circle cx="60" cy="24" r="7" fill="#efe9db"/>
    <path d="M60 24 V19 M60 24 l4 3" stroke-width="1.3"/>
    <path d="M44 34 h32" stroke-width="1.2"/>`, 'Estação do Rossio'),

  // ── Sé de Lisboa: erődszerű katedrális két toronnyal ─────────────────────
  se: lmSvg(`
    <path d="M8 104 H112" stroke-width="2.2"/>
    <path d="M18 104 V40 h26 v64 Z" fill="${LM.stone}"/>
    <path d="M76 104 V40 h26 v64 Z" fill="${LM.stoneSh}"/>
    <path d="M44 104 V52 h32 v52 Z" fill="#efe9db"/>
    <path d="M18 40 h4 v-7 h6 v7 h6 v-7 h6 v7 h4" fill="${LM.stone}"/>
    <path d="M76 40 h4 v-7 h6 v7 h6 v-7 h6 v7 h4" fill="${LM.stoneSh}"/>
    <circle cx="60" cy="70" r="10" fill="${LM.glass}"/>
    <path d="M60 60 V80 M50 70 H70 M53 63 L67 77 M67 63 L53 77" stroke-width="1.1"/>
    <path d="M52 104 V90 q8 -10 16 0 v14 Z" fill="${LM.ink}" opacity="0.75"/>
    <path d="M28 56 v10 M34 56 v10 M86 56 v10 M92 56 v10" stroke-width="1.2"/>`,
    'Sé de Lisboa'),

  // ── Castelo de São Jorge: bástyás várfal a dombon ────────────────────────
  castelo: lmSvg(`
    <path d="M6 106 q30 -14 54 -14 t54 14" fill="${LM.green}"/>
    <path d="M22 92 V54 h18 v38 Z" fill="${LM.stone}"/>
    <path d="M80 92 V50 h18 v42 Z" fill="${LM.stoneSh}"/>
    <path d="M40 92 V64 h40 v28 Z" fill="#efe9db"/>
    <path d="M22 54 h4 v-6 h5 v6 h5 v-6 h4 v6" fill="${LM.stone}"/>
    <path d="M80 50 h4 v-6 h5 v6 h5 v-6 h4 v6" fill="${LM.stoneSh}"/>
    <path d="M40 64 h5 v-6 h5 v6 h5 v-6 h5 v6 h5 v-6 h5 v6 h5 v-6 h5 v6" fill="#efe9db"/>
    <rect x="28" y="66" width="6" height="9" rx="1" fill="${LM.glass}"/>
    <rect x="86" y="62" width="6" height="9" rx="1" fill="${LM.glass}"/>
    <path d="M56 92 V78 q4 -6 8 0 v14 Z" fill="${LM.ink}" opacity="0.7"/>
    <path d="M31 48 V40 l9 4 -9 4" fill="${LM.roof}"/>`, 'Castelo de São Jorge'),

  // ── Time Out Market: kupolás vásárcsarnok ────────────────────────────────
  timeout: lmSvg(`
    <path d="M8 104 H112" stroke-width="2.2"/>
    <path d="M14 104 V62 H106 V104 Z" fill="${LM.wall}"/>
    ${arches(20, 72, 80, 32, 6, LM.stoneSh)}
    <path d="M12 62 H108 V54 H12 Z" fill="${LM.roof}"/>
    <path d="M44 54 a16 14 0 0 1 32 0 Z" fill="${LM.roofSh}"/>
    <path d="M60 40 V32" stroke-width="1.4"/>
    <circle cx="60" cy="30" r="2.4" fill="${LM.gold}"/>
    <path d="M30 54 V46 h10 v8 M80 54 V46 h10 v8" fill="${LM.roofSh}"/>`,
    'Time Out Market')
};
