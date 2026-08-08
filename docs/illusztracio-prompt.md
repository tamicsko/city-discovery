# Prompt a nevezetesség-illusztrációk elkészítéséhez

Ezt a szöveget másold be a webes Claude-nak. **Egyszerre 2–3 épületet kérj, ne többet** —
hosszabb válasznál a stream megszakadhat (`connection lost mid-stream`). A kapott kódot
küldd vissza a fejlesztői beszélgetésbe, és bekerül az appba.

A lenti listából mindig csak az aktuális 2–3 tételt hagyd bent a prompt végén, a többit töröld.

---

## A PROMPT (innen másold)

Egy mobilos, kézzel rajzolt stílusú lisszaboni turista térkép appon dolgozom.
Nevezetesség-illusztrációkat kérek tőled **SVG-ben**, pontosan a meglévő rajzok
stílusában. Az illusztráció egyszerre két helyen jelenik meg: kis méretben jelölőként
a térképen, és nagyban a hely részletei panelen.

**A projekt (publikus):**
- Élő app: https://tamicsko.github.io/city-discovery/
- Repo: https://github.com/tamicsko/city-discovery
- A meglévő rajzok: https://raw.githubusercontent.com/tamicsko/city-discovery/main/js/landmarks.js

Ha eléred a fenti fájlt, nézd meg a benne lévő nyolc rajzot, és igazodj hozzájuk.
Ha nem éred el, minden szükséges információ itt van lent — abból is dolgozhatsz.

### Stílus — kötelező paraméterek

- **Vászon:** `viewBox="0 0 120 120"`. A rajz az x 8–112 sávban legyen, alul egy
  talajvonalon álljon (y ≈ 104–108), felül ne érjen y = 8 fölé.
- **Nézet:** enyhén rézsútos, madártávlati „papírtérkép" nézet — nem szigorú
  homlokzat, nem fotórealizmus. Olyan, mint egy nyomtatott turista térkép rajzolt
  épületei: felismerhető, leegyszerűsített, kedves.
- **Legyen valódi térbeli mélysége:** a főhomlokzat mellett látszódjon egy
  elforduló oldalfal is, sötétebb árnyalatban (a fal `#dcc8a2`, a kő `#c2b9a4`
  árnyékos változatával). Ne csak szemből nézett homlokzatot rajzolj.
- **Vonal:** minden alakzat közös tuskontúrt kap. A rajz egy csoportba kerül:
  `<g filter="url(#lm-rough)" fill="none" stroke="#453d31" stroke-width="1.7"
  stroke-linejoin="round" stroke-linecap="round">`
  Mivel a csoport alapértelmezése `fill="none"`, **minden kitöltött alakzatnak
  külön `fill` attribútumot kell adni.**
- **A kézi rajz szabálytalanságát egy SVG-szűrő adja** (feTurbulence +
  feDisplacementMap), tehát **te tiszta, szabályos geometriát rajzolj** — ne
  próbáld kézzel görbíteni a vonalakat, a szűrő elvégzi.
- **Nincs szöveg a rajzokon.** Feliratot, cégért, betűt ne rajzolj (számjegy
  kivételesen mehet, ha az a lényeg — pl. a villamos száma).
- **Átlátszó háttér**, keret és aláírás nélkül.
- **Jelölő méretben is olvashatónak kell lennie.** A rajz a térképen 62 képpont
  széles. Ezért töltse ki a vászon nagy részét, álljon a vízszintes talajvonalon,
  és a fő tömege legyen kompakt — az átlós, elnyújtott kompozíció ekkora méretben
  felismerhetetlen folttá esik szét.

### Színpaletta — csak ezekből dolgozz

| Szerep | Hex |
|---|---|
| tusvonal | `#453d31` |
| falfelület | `#f2e4c6` |
| fal árnyékos oldala | `#dcc8a2` |
| tetőcserép | `#bd5334` |
| tető árnyékos oldala | `#9b4126` |
| kő / vakolat | `#dcd5c4` |
| kő árnyékos oldala | `#c2b9a4` |
| vas, fém | `#8c8578` |
| üveg, ablak | `#7d94a3` |
| arany, sárgaréz | `#e0a52e` |
| növényzet | `#7ba05b` |
| világos belső felület | `#efe9db` |

Ha egy épületnek jellegzetes saját színe van (pl. rózsaszín utca, kék azulejo),
azt hozzáveheted — de maradjon tompa, papírszerű árnyalat.

### Kimeneti formátum

Minden épületet így adj vissza, egyetlen összefüggő kódblokkban:

```js
  'azonosito': lmSvg(`
    <path d="M8 104 H112" stroke-width="2.2"/>
    ... a rajz többi eleme ...`, 'Megjelenítendő név'),
```

Az `lmSvg()` egy meglévő segédfüggvény — csak a **belső tartalmat** írd meg,
az `<svg>` és a `<g>` burkolót ne. Az azonosítót és a nevet pontosan a lentebbi
listából vedd.

### Kidolgozott minta — ehhez igazodj

Ez a Praça do Comércio a meglévő készletből:

```js
  comercio: lmSvg(`
    <path d="M8 96 H112" stroke-width="2.2"/>
    <path d="M12 62 H108 V96 H12 Z" fill="#f2e4c6"/>
    <path d="M14 74 V85 a5.5 5.5 0 0 1 11 0 V96 Z" fill="#c2b9a4"/>
    <path d="M12 62 L18 52 H102 L110 62 Z" fill="#bd5334"/>
    <path d="M44 52 V34 H76 V52 Z" fill="#f2e4c6"/>
    <rect x="50" y="40" width="5" height="7" rx="1" fill="#7d94a3"/>
    <path d="M42 34 L60 20 L78 34 Z" fill="#bd5334"/>
    <path d="M60 20 V12" stroke-width="1.4"/>
    <circle cx="60" cy="10" r="2.6" fill="#e0a52e"/>`, 'Praça do Comércio'),
```

Figyeld meg: talajvonal, tömör falfelület, árkádok árnyékosabb kővel, terrakotta
tető, néhány üvegszínű ablak, egy arany hangsúly. Ennyi elég — a részletgazdagság
nem cél, a felismerhetőség igen.

---

## Az elkészítendő épületek

Minden sorban: **azonosító** — Megjelenítendő név — *mit ábrázoljon*.

### 1. adag — a legfontosabb hiányzók

- **casa-bicos** — Casa dos Bicos — *Négyemeletes reneszánsz ház, a homlokzat alsó
  két szintje sűrűn borítva gúla alakú, kiálló kőtüskékkel (ez a lényeg, ettől
  „csőrös ház"). Felül két sor keskeny reneszánsz ablak.*
- **restauradores** — Praça dos Restauradores — *Magas, karcsú obeliszk lépcsős
  talapzaton, tetején kis szárnyas alak. Körben lapos, hullámmintás burkolat.*
- **dmaria** — Teatro Nacional D. Maria II — *Klasszicista színház: hat magas ión
  oszlop előcsarnok, fölötte háromszögű oromzat, azon egy álló szobor.*
- **sao-roque** — Igreja de São Roque — *Szándékosan dísztelen, lapos reneszánsz
  homlokzat: három egyszerű ajtó, kevés apró ablak, alacsony nyeregtető. A nyitott
  középső ajtón át egy arany villanás sejlik ki (belül aranyozott barokk).*
- **gloria** — Elevador da Glória — *Sárga siklóvasúti kocsi meredek, macskaköves
  utcán, alatta két sín. A kocsi oldala graffitis, ferde padlóvonallal.*
- **portas-sol** — Miradouro das Portas do Sol — *Kilátóterasz fehér korláttal,
  mellette egy ernyőfenyő, alatta lefelé lépcsőző, terrakotta cseréptetős alfamai
  háztetők, a háttérben egy csík kék folyó.*
- **tram28** — 28-as villamos — *A klasszikus sárga lisszaboni villamos háromnegyed
  nézetből: lekerekített sarkok, nagy ablakok, íves tető, áramszedő rúd. Elöl a
  „28" szám mehet.*

### 2. adag — terek és templomok

- **rossio** — Praça do Rossio — *Magas oszlop tetején álló királyszobor, előtte
  barokk szökőkút kerek medencével, alatta hullámmintás fekete-fehér burkolat.*
- ~~**figueira** — Praça da Figueira~~ — **ELHAGYVA.** Két nekifutásból sem lett
  belőle olvasható lovas szobor: 62 képponton a ló szükségszerűen alaktalan
  tömbbé esik össze, mert a felismerhetőségét a finom körvonal adná. Ez a hely
  marad a színes kategória-tűvel.
- **camoes** — Praça Luís de Camões — *Bronz állószobor magas, nyolcszögű
  talapzaton, körülötte négy kisebb ülő alak, két oldalt fa.*
- **sao-domingos** — Igreja de São Domingos — *Egyszerű barokk templomhomlokzat egy
  nagy kapuval, fölötte kerek ablak és háromszögű oromzat. A kő legyen foltos,
  megviselt hatású (tűzvész nyomai).*
- **chiado-museu** — Museu Nacional de Arte Contemporânea — *Volt kolostorépület:
  hosszú, nyugodt homlokzat magas, félköríves ablakokkal, egyszerű kapu, lapos tető.*
- **story-centre** — Lisboa Story Centre — *Egy árkádnyi részlet a főtér sárga
  árkádsorából: két boltív, közöttük egy bejárat, fölötte kis erkély.*
- **rua-augusta** — Rua Augusta — *Nem épület: sétálóutca perspektívában, két oldalt
  árkádos homlokzatsor, középen hullámmintás kőburkolat, két napernyő.*

### 3. adag — kilátók és éjszaka

- **santa-luzia** — Miradouro de Santa Luzia — *Fehér oszlopos pergola, befuttatva
  bíbor bougainvilleával, mögötte kék-fehér azulejo csempés fal, előtte korlát.*
- **sao-pedro** — Miradouro de São Pedro de Alcântara — *Kétszintes kertterasz:
  felső korlátos szint, lépcső, alsó szinten kis kioszk, két fa, egy mellszobor
  talapzaton.*
- **santa-catarina** — Miradouro de Santa Catarina — *Egyszerű terasz korláttal,
  rajta a szikla alakú Adamastor-szobor, a háttérben egy piros függőhíd pillére.*
- **pink-street** — Pink Street — *Utcarészlet: a burkolat élénk, tompított
  rózsaszín, két oldalt keskeny bárhomlokzatok, fölöttük átfeszített füzérfények.*
- **bairro-alto** — Bairro Alto — *Szűk utca két oldalán magas, keskeny házak,
  apró erkélyekkel és kifeszített ruhaszárító kötelekkel.*
- **cais-sodre** — Cais do Sodré — *Alacsony terminálépület órával a homlokzatán,
  előtte móló, azon egy komp orra.*
- **baixa-chiado** — Metró — Baixa-Chiado — *Metróbejárat: piros „M" tábla oszlopon,
  mellette korlátos lépcsőlejárat a föld alá.*

### 4. adag — üzletek és kávézók

*Ezek kis homlokzatok. Mindegyik egy bolt- vagy kávézóportál legyen: ajtó, kirakat,
ponyva vagy cégérsáv — de felirat nélkül. A méret és a nézőpont ugyanaz, mint a
nagy épületeknél, hogy egy készletbe illjenek.*

- **brasileira** — Café A Brasileira — *Sötétzöld-fabarna szecessziós kávézóportál
  arany díszsávval, kint egy kis kerek asztal és rajta ülő bronzalak.*
- **manteigaria** — Manteigaria — *Keskeny bolt, kirakatban márványpult, kék-fehér
  csempeburkolat, a pulton egy sor pasztéta.*
- **confeitaria** — Confeitaria Nacional — *Régi cukrászdaportál faléces
  kirakatkerettel, arany cégérsávval, a kirakatban torták.*
- **fabrica-nata** — Fábrica da Nata — *Kis üzlet azulejo csempés homlokzattal,
  kirakatban süteménytálcák.*
- **bonjardim** — Bonjardim — Rei dos Frangos — *Szűk sikátorbeli étterem: ponyva,
  két asztal kint, a kirakatban forgó grillnyárs csirkékkel.*
- **ginjinha** — A Ginjinha — *Egészen kicsi lyuk-a-falban bár: egyetlen ajtó, egy
  apró pultablak, meggypiros hangsúly, előtte két álló alak.*
- **santo-antonio** — Pastelaria Santo António — *Sarki pékség ponyvával, kis
  kirakattal, előtte egy asztal.*
- **armazens** — Armazéns do Chiado — *Történelmi homlokzatba épített modern
  bevásárlóközpont-bejárat: nagy üvegportál, íves üvegtető-előtető.*
- **conserveira** — Conserveira de Lisboa — *Nagyon kicsi régi bolt csíkos
  ponyvával, a kirakatban polcokon színes halkonzerv-dobozok sorai.*

---

Ha valamelyiket nem tudod jól megoldani, inkább jelezd, mint hogy felismerhetetlen
rajzot adj — azt később kézzel pótoljuk.
