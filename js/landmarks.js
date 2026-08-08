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
    'Time Out Market'),

  // ── Casa dos Bicos: gúlaköves reneszánsz homlokzat ───────────────────────
  'casa-bicos': lmSvg(`
    <path d="M8 106 H112" stroke-width="2.2"/>
    <path d="M92 32 L106 25 V98 L92 106 Z" fill="#dcc8a2"/>
    <path d="M22 32 H92 V106 H22 Z" fill="#f2e4c6"/>
    <path d="M20 32 H94 V26 H20 Z" fill="#dcd5c4"/>
    <path d="M94 26 L108 19 V25 L94 32 Z" fill="#c2b9a4"/>
    <path d="M20 26 l5 -5 5 5 5 -5 5 5 5 -5 5 5 5 -5 5 5 5 -5 5 5 5 -5 5 5 5 -5 5 5 H20 Z" fill="#dcd5c4"/>
    <rect x="30" y="38" width="6" height="9" rx="1" fill="#7d94a3"/>
    <rect x="43" y="38" width="6" height="9" rx="1" fill="#7d94a3"/>
    <rect x="56" y="38" width="6" height="9" rx="1" fill="#7d94a3"/>
    <rect x="69" y="38" width="6" height="9" rx="1" fill="#7d94a3"/>
    <rect x="82" y="38" width="6" height="9" rx="1" fill="#7d94a3"/>
    <rect x="30" y="54" width="6" height="9" rx="1" fill="#7d94a3"/>
    <rect x="43" y="54" width="6" height="9" rx="1" fill="#7d94a3"/>
    <rect x="56" y="54" width="6" height="9" rx="1" fill="#7d94a3"/>
    <rect x="69" y="54" width="6" height="9" rx="1" fill="#7d94a3"/>
    <rect x="82" y="54" width="6" height="9" rx="1" fill="#7d94a3"/>
    <path d="M96 40 L102 37 V45 L96 48 Z" fill="#7d94a3"/>
    <path d="M96 56 L102 53 V61 L96 64 Z" fill="#7d94a3"/>
    <path d="M22 68 H92" stroke-width="1.2"/>
    <path d="M29 70 L33 74 L29 78 L25 74 Z" fill="#dcc8a2" stroke-width="1.1"/>
    <path d="M40 70 L44 74 L40 78 L36 74 Z" fill="#dcc8a2" stroke-width="1.1"/>
    <path d="M51 70 L55 74 L51 78 L47 74 Z" fill="#dcc8a2" stroke-width="1.1"/>
    <path d="M62 70 L66 74 L62 78 L58 74 Z" fill="#dcc8a2" stroke-width="1.1"/>
    <path d="M73 70 L77 74 L73 78 L69 74 Z" fill="#dcc8a2" stroke-width="1.1"/>
    <path d="M84 70 L88 74 L84 78 L80 74 Z" fill="#dcc8a2" stroke-width="1.1"/>
    <path d="M34 82 L38 86 L34 90 L30 86 Z" fill="#dcc8a2" stroke-width="1.1"/>
    <path d="M45 82 L49 86 L45 90 L41 86 Z" fill="#dcc8a2" stroke-width="1.1"/>
    <path d="M56 82 L60 86 L56 90 L52 86 Z" fill="#dcc8a2" stroke-width="1.1"/>
    <path d="M67 82 L71 86 L67 90 L63 86 Z" fill="#dcc8a2" stroke-width="1.1"/>
    <path d="M78 82 L82 86 L78 90 L74 86 Z" fill="#dcc8a2" stroke-width="1.1"/>
    <path d="M29 94 L33 98 L29 102 L25 98 Z" fill="#dcc8a2" stroke-width="1.1"/>
    <path d="M40 94 L44 98 L40 102 L36 98 Z" fill="#dcc8a2" stroke-width="1.1"/>
    <path d="M73 94 L77 98 L73 102 L69 98 Z" fill="#dcc8a2" stroke-width="1.1"/>
    <path d="M84 94 L88 98 L84 102 L80 98 Z" fill="#dcc8a2" stroke-width="1.1"/>
    <path d="M98 68 L101 71 L98 74 L95 71 Z" fill="#c2b9a4" stroke-width="1.1"/>
    <path d="M98 82 L101 85 L98 88 L95 85 Z" fill="#c2b9a4" stroke-width="1.1"/>
    <path d="M52 106 V100 a6 6 0 0 1 12 0 V106 Z" fill="#c2b9a4"/>`,
    'Casa dos Bicos'),

  // ── Praça dos Restauradores: obeliszk lépcsős talapzaton ─────────────────
  restauradores: lmSvg(`
    <path d="M8 106 H112" stroke-width="2.2"/>
    <path d="M14 106 a8 7 0 0 1 16 0 Z" fill="#7ba05b"/>
    <path d="M90 106 a8 7 0 0 1 16 0 Z" fill="#7ba05b"/>
    <path d="M32 100 H88 V106 H32 Z" fill="#dcd5c4"/>
    <path d="M88 100 L94 96 V102 L88 106 Z" fill="#c2b9a4"/>
    <path d="M40 94 H80 V100 H40 Z" fill="#dcd5c4"/>
    <path d="M80 94 L86 90 V96 L80 100 Z" fill="#c2b9a4"/>
    <path d="M48 66 H72 V94 H48 Z" fill="#dcd5c4"/>
    <path d="M72 66 L78 62 V90 L72 94 Z" fill="#c2b9a4"/>
    <rect x="54" y="74" width="12" height="12" rx="1" fill="#8c8578"/>
    <path d="M48 66 H72 M48 70 H72" stroke-width="1.2"/>
    <path d="M50 66 L55 28 H65 L70 66 Z" fill="#dcd5c4"/>
    <path d="M60 28 V66" stroke-width="1.1"/>
    <path d="M55 28 L60 22 L65 28 Z" fill="#c2b9a4"/>
    <path d="M60 22 V13" stroke-width="1.3"/>
    <path d="M57 20 L60 13 L63 20 Z" fill="#e0a52e"/>
    <path d="M60 16 L52 12 L53 17 Z" fill="#e0a52e"/>
    <path d="M60 16 L68 12 L67 17 Z" fill="#e0a52e"/>
    <circle cx="60" cy="10" r="2.2" fill="#e0a52e"/>`,
    'Praça dos Restauradores'),

  // ── 28-as villamos: háromnegyed nézet, íves tető, áramszedő ──────────────
  tram28: lmSvg(`
    <path d="M8 106 H112" stroke-width="2.2"/>
    <circle cx="34" cy="100" r="5.5" fill="#8c8578"/>
    <circle cx="88" cy="96" r="5.5" fill="#8c8578"/>
    <path d="M42 96 L100 92 q6 -0.5 6 -6 V56 q0 -6 -6 -5 L42 58 Z" fill="#d8ae3f"/>
    <path d="M14 100 L42 96 V58 q-14 -10 -28 6 Z" fill="#e6bf52"/>
    <path d="M14 100 L106 92 V86 L14 94 Z" fill="#efe9db"/>
    <rect x="48" y="61" width="12" height="16" rx="2" fill="#7d94a3"/>
    <rect x="63" y="60" width="12" height="16" rx="2" fill="#7d94a3"/>
    <rect x="78" y="59" width="12" height="16" rx="2" fill="#7d94a3"/>
    <rect x="93" y="58" width="10" height="16" rx="2" fill="#7d94a3"/>
    <path d="M19 68 H38 V82 L19 84 Z" fill="#7d94a3"/>
    <path d="M22 58 H38 V66 H22 Z" fill="#efe9db"/>
    <text x="30" y="65" font-family="Georgia, serif" font-size="8"
          font-weight="700" text-anchor="middle" fill="#453d31" stroke="none">28</text>
    <path d="M42 58 L100 51" stroke-width="1.2"/>
    <path d="M60 55 L86 22" stroke-width="1.4"/>
    <circle cx="87" cy="20" r="2.2" fill="#8c8578"/>
    <rect x="57" y="53" width="6" height="3" rx="1" fill="#8c8578"/>`,
    '28-as villamos'),

  // ── Teatro Nacional D. Maria II: ión oszlopcsarnok, oromzati szoborral ───
  dmaria: lmSvg(`
    <path d="M8 106 H112" stroke-width="2.2"/>
    <path d="M88 30 L104 22 V96 L88 104 Z" fill="#dcc8a2"/>
    <path d="M22 30 H88 V104 H22 Z" fill="#f2e4c6"/>
    <rect x="92" y="40" width="6" height="10" rx="1" fill="#7d94a3"/>
    <rect x="92" y="60" width="6" height="10" rx="1" fill="#7d94a3"/>
    <path d="M22 96 H88 V104 H22 Z" fill="#c2b9a4"/>
    <path d="M26 96 V44 H84 V96 Z" fill="#efe9db"/>
    <path d="M34 96 V62 a5 5 0 0 1 10 0 V96 Z" fill="#c2b9a4"/>
    <path d="M55 96 V62 a5 5 0 0 1 10 0 V96 Z" fill="#c2b9a4"/>
    <path d="M76 96 V62 a5 5 0 0 1 10 0 V96 Z" fill="#c2b9a4"/>
    <path d="M22 92 H88" stroke-width="1.2"/>
    <path d="M26 44 H84 V40 H26 Z" fill="#dcd5c4"/>
    <path d="M26 88 L26 46 M37 88 L37 46 M48 88 L48 46 M59 88 L59 46 M70 88 L70 46 M81 88 L81 46"
          stroke="#453d31" stroke-width="1.1"/>
    <path d="M23 88 H30 V46 H23 Z" fill="#dcd5c4"/>
    <path d="M34 88 H41 V46 H34 Z" fill="#dcd5c4"/>
    <path d="M45 88 H52 V46 H45 Z" fill="#dcd5c4"/>
    <path d="M56 88 H63 V46 H56 Z" fill="#dcd5c4"/>
    <path d="M67 88 H74 V46 H67 Z" fill="#dcd5c4"/>
    <path d="M78 88 H85 V46 H78 Z" fill="#dcd5c4"/>
    <path d="M22 46 H88 M22 88 H88" stroke-width="1.3"/>
    <path d="M22 46 a3 3 0 0 1 6 0 M33 46 a3 3 0 0 1 6 0 M44 46 a3 3 0 0 1 6 0
             M55 46 a3 3 0 0 1 6 0 M66 46 a3 3 0 0 1 6 0 M77 46 a3 3 0 0 1 6 0"
          stroke-width="1.1"/>
    <path d="M20 40 H90 V32 H20 Z" fill="#dcd5c4"/>
    <path d="M90 32 L106 24 V32 L90 40 Z" fill="#c2b9a4"/>
    <path d="M18 32 L55 14 L92 32 Z" fill="#efe9db"/>
    <path d="M18 32 L55 14 L92 32" stroke-width="1.7"/>
    <path d="M28 30 L55 17 L82 30" stroke-width="1.1"/>
    <path d="M55 14 V11" stroke-width="1.3"/>
    <path d="M52 11 L55 5 L58 11 Z" fill="#e0a52e"/>
    <path d="M55 8 L49 7 M55 8 L61 6" stroke-width="1.1"/>
    <path d="M40 96 h6 M61 96 h6" stroke-width="1.1"/>`,
    'Teatro Nacional D. Maria II'),

  // ── Igreja de São Roque: dísztelen homlokzat, aranyszín a nyitott ajtóban ─
  'sao-roque': lmSvg(`
    <path d="M8 106 H112" stroke-width="2.2"/>
    <path d="M90 42 L106 34 V98 L90 106 Z" fill="#dcc8a2"/>
    <path d="M24 42 H90 V106 H24 Z" fill="#f2e4c6"/>
    <path d="M22 42 L57 28 L92 42 Z" fill="#dcd5c4"/>
    <path d="M92 42 L106 34 L92 30 L57 28 Z" fill="#c2b9a4"/>
    <path d="M22 42 L57 28 L92 42" stroke-width="1.7"/>
    <path d="M24 46 H90" stroke-width="1.2"/>
    <path d="M57 28 V22" stroke-width="1.3"/>
    <path d="M52 22 H62 M57 22 V14" stroke-width="1.4"/>
    <rect x="32" y="54" width="7" height="9" rx="1" fill="#7d94a3"/>
    <rect x="53" y="54" width="8" height="9" rx="1" fill="#7d94a3"/>
    <rect x="75" y="54" width="7" height="9" rx="1" fill="#7d94a3"/>
    <rect x="94" y="52" width="6" height="9" rx="1" fill="#7d94a3"/>
    <rect x="94" y="72" width="6" height="9" rx="1" fill="#7d94a3"/>
    <path d="M24 70 H90" stroke-width="1.2"/>
    <path d="M30 106 V80 h14 v26 Z" fill="#dcd5c4"/>
    <path d="M32 106 V82 h10 v24 Z" fill="#c2b9a4"/>
    <path d="M76 106 V80 h14 v26 Z" fill="#dcd5c4"/>
    <path d="M78 106 V82 h10 v24 Z" fill="#c2b9a4"/>
    <path d="M50 106 V78 h20 v28 Z" fill="#dcd5c4"/>
    <path d="M52 106 V80 h16 v26 Z" fill="#e0a52e"/>
    <path d="M52 106 V80 h5 v26 Z" fill="#efe9db"/>
    <path d="M63 106 V80 h5 v26 Z" fill="#efe9db"/>
    <path d="M50 78 h20" stroke-width="1.4"/>
    <path d="M46 106 h-4 M74 106 h4" stroke-width="1.1"/>`,
    'Igreja de São Roque'),

  // ── Elevador da Glória: lépcsős szekrényű siklókocsi ─────────────────────
  gloria: lmSvg(`
    <path d="M8 106 H112" stroke-width="2.2"/>
    <path d="M96 100 L112 84" stroke="#c2b9a4" stroke-width="1.4"/>
    <path d="M18 102 H102" stroke="#8c8578" stroke-width="1.4"/>
    <path d="M22 108 H106" stroke="#8c8578" stroke-width="1.4"/>
    <circle cx="34" cy="99" r="4.5" fill="#8c8578"/>
    <circle cx="76" cy="99" r="4.5" fill="#8c8578"/>
    <path d="M84 30 L98 24 V56 L92 60 V84 L84 88 Z" fill="#dcc8a2"/>
    <path d="M22 96 V60 H50 V44 H84 V88 H56 V96 Z" fill="#e6bf52"/>
    <path d="M22 60 H50 V44 H84 L98 24 H64 L50 38 H36 Z" fill="#d8ae3f"/>
    <path d="M22 96 V60 H50 V44 H84 V88 H56 V96 Z" stroke-width="1.7"/>
    <path d="M84 44 L98 24 M84 88 L98 60" stroke-width="1.4"/>
    <path d="M22 90 H56 V82 H84" stroke-width="1.2"/>
    <path d="M22 88 H56 V96 H22 Z" fill="#efe9db"/>
    <path d="M56 82 H84 V88 H56 Z" fill="#efe9db"/>
    <rect x="27" y="66" width="20" height="18" rx="2" fill="#7d94a3"/>
    <rect x="53" y="52" width="12" height="24" rx="2" fill="#7d94a3"/>
    <rect x="70" y="52" width="11" height="24" rx="2" fill="#7d94a3"/>
    <path d="M66 52 V78 M68 52 V78" stroke-width="1.1"/>
    <path d="M86 48 L96 34 V58 L86 66 Z" fill="#7d94a3"/>
    <path d="M25 86 q7 -6 13 -1 q6 5 12 -3" stroke="#9b4126" stroke-width="1.5"/>
    <path d="M28 92 q8 -4 15 0" stroke="#7ba05b" stroke-width="1.4"/>
    <path d="M60 86 q7 -5 13 0" stroke="#bd5334" stroke-width="1.4"/>
    <path d="M50 44 V60 H22" stroke-width="1.4"/>
    <path d="M64 44 L64 30" stroke-width="1.3"/>
    <circle cx="64" cy="28" r="2.2" fill="#8c8578"/>
    <path d="M40 60 h10 M56 44 h8" stroke-width="1.1"/>`,
    'Elevador da Glória'),

  // ── Miradouro das Portas do Sol: terasz, ernyőfenyő, alfamai tetők ──────
  'portas-sol': lmSvg(`
    <path d="M8 106 H112" stroke-width="2.2"/>
    <path d="M12 52 H108 V60 H12 Z" fill="#7d94a3"/>
    <path d="M18 60 H46 V78 H18 Z" fill="#f2e4c6"/>
    <path d="M46 60 L54 64 V82 L46 78 Z" fill="#dcc8a2"/>
    <path d="M16 60 L32 52 L54 60 Z" fill="#bd5334"/>
    <path d="M32 52 L54 60 L54 64 L46 60 Z" fill="#9b4126"/>
    <path d="M58 66 H86 V84 H58 Z" fill="#f2e4c6"/>
    <path d="M86 66 L94 70 V88 L86 84 Z" fill="#dcc8a2"/>
    <path d="M56 66 L72 58 L94 66 Z" fill="#bd5334"/>
    <path d="M72 58 L94 66 L94 70 L86 66 Z" fill="#9b4126"/>
    <path d="M28 82 H58 V96 H28 Z" fill="#f2e4c6"/>
    <path d="M58 82 L66 86 V100 L58 96 Z" fill="#dcc8a2"/>
    <path d="M26 82 L42 74 L66 82 Z" fill="#bd5334"/>
    <path d="M42 74 L66 82 L66 86 L58 82 Z" fill="#9b4126"/>
    <path d="M70 88 H98 V100 H70 Z" fill="#f2e4c6"/>
    <path d="M68 88 L82 82 L100 88 Z" fill="#bd5334"/>
    <rect x="24" y="66" width="6" height="7" rx="1" fill="#7d94a3"/>
    <rect x="36" y="66" width="6" height="7" rx="1" fill="#7d94a3"/>
    <rect x="64" y="72" width="6" height="7" rx="1" fill="#7d94a3"/>
    <rect x="76" y="72" width="6" height="7" rx="1" fill="#7d94a3"/>
    <rect x="34" y="87" width="6" height="7" rx="1" fill="#7d94a3"/>
    <rect x="46" y="87" width="6" height="7" rx="1" fill="#7d94a3"/>
    <rect x="76" y="92" width="6" height="6" rx="1" fill="#7d94a3"/>
    <path d="M10 96 H112" stroke-width="1.4"/>
    <path d="M10 96 H112 V106 H10 Z" fill="#dcd5c4" opacity="0.55"/>
    <path d="M10 96 H112" stroke-width="1.6"/>
    <path d="M10 88 H112" stroke-width="1.6"/>
    <path d="M16 88 V96 M28 88 V96 M40 88 V96 M52 88 V96 M64 88 V96 M76 88 V96 M88 88 V96 M100 88 V96"
          stroke-width="1.2"/>
    <path d="M92 88 V44" stroke-width="1.7"/>
    <path d="M70 44 q22 -18 42 0 q-20 -8 -42 0 Z" fill="#7ba05b"/>
    <path d="M74 38 q18 -14 34 0 q-16 -7 -34 0 Z" fill="#7ba05b"/>
    <path d="M84 56 l8 -6 M100 56 l-8 -6" stroke-width="1.2"/>`,
    'Miradouro das Portas do Sol'),

  // ── Praça do Rossio: királyszobor oszlopon, mellette barokk szökőkút ────
  rossio: lmSvg(`
    <path d="M8 106 H112" stroke-width="2.2"/>
    <path d="M34 100 H72 V106 H34 Z" fill="#dcd5c4"/>
    <path d="M72 100 L80 96 V102 L72 106 Z" fill="#c2b9a4"/>
    <path d="M40 94 H66 V100 H40 Z" fill="#dcd5c4"/>
    <path d="M66 94 L74 90 V96 L66 100 Z" fill="#c2b9a4"/>
    <path d="M44 66 H62 V94 H44 Z" fill="#dcd5c4"/>
    <path d="M62 66 L70 62 V90 L62 94 Z" fill="#c2b9a4"/>
    <path d="M44 66 H62 M44 70 H62" stroke-width="1.2"/>
    <rect x="49" y="76" width="8" height="10" rx="1" fill="#8c8578"/>
    <path d="M42 66 H64 V62 H42 Z" fill="#dcd5c4"/>
    <path d="M48 62 L50 30 H56 L58 62 Z" fill="#dcd5c4"/>
    <path d="M53 30 V62" stroke-width="1.1"/>
    <path d="M46 30 H60 V26 H46 Z" fill="#c2b9a4"/>
    <path d="M48 26 H58 V22 H48 Z" fill="#dcd5c4"/>
    <path d="M50 22 V13 h6 V22 Z" fill="#e0a52e"/>
    <circle cx="53" cy="10" r="3" fill="#e0a52e"/>
    <path d="M50 8 h6" stroke-width="1.2"/>
    <path d="M56 16 l8 -4" stroke-width="1.3"/>
    <path d="M78 106 a16 5 0 0 1 32 0 Z" fill="#7d94a3"/>
    <path d="M78 106 a16 5 0 0 1 32 0" stroke-width="1.7"/>
    <path d="M78 101 a16 5 0 0 0 32 0" stroke-width="1.4"/>
    <path d="M90 100 h8 v-14 h-8 Z" fill="#dcd5c4"/>
    <path d="M82 86 h24 a12 5 0 0 1 -24 0 Z" fill="#dcd5c4"/>
    <path d="M82 86 h24" stroke-width="1.4"/>
    <path d="M92 86 V74 h4 v12 Z" fill="#c2b9a4"/>
    <path d="M86 74 h16 a8 4 0 0 1 -16 0 Z" fill="#dcd5c4"/>
    <path d="M86 74 h16" stroke-width="1.3"/>
    <path d="M94 74 V66" stroke-width="1.3"/>
    <circle cx="94" cy="63" r="3" fill="#e0a52e"/>
    <path d="M94 60 q-8 8 -10 14 M94 60 q8 8 10 14" stroke="#7d94a3" stroke-width="1.2"/>
    <path d="M20 106 a8 6 0 0 1 16 0 Z" fill="#7ba05b"/>`,
    'Praça do Rossio')
};
