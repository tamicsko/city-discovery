# City Discovery — Lisszabon belváros

Mobilra tervezett, telepíthető webalkalmazás (PWA) Lisszabon belvárosának felfedezéséhez.
Térkép, 38 kiválogatott hely, ajánlott gyalogos körséta, és egy gombnyomással
átadott navigáció a telefonon lévő **Google Maps** appnak.

Nincs szükség laptopra, fejlesztői környezetre vagy Android Studióra — telefonról
telepíthető és használható.

---

## Mit tud

| | |
|---|---|
| 🗺️ **Térkép** | Lisszabon belvárosa (Baixa, Chiado, Cais do Sodré, Alfama széle), a nézet a belvároson belül marad |
| 🏛️ **38 hely** | Látnivalók, kilátók, kávézók és éttermek, boltok, esti helyek, közlekedési csomópontok — mindegyikhez rövid leírás és egy gyakorlati tipp |
| 🔎 **Keresés & szűrés** | Név, leírás és kategória szerint; az ékezetek nem számítanak („praca" megtalálja a „Praça"-t) |
| ➤ **Navigáció** | A „Navigálás" gomb a natív Google Maps appot nyitja meg valódi, lépésenkénti útvonallal — gyalog, tömegközlekedéssel vagy autóval |
| 🚶 **Séta-útvonal** | 11 megállós, ~3,5 km-es körséta a térképen kirajzolva; egy gombbal az egész útvonal átadható a Google Mapsnek |
| ⭐ **Mentés** | Kedvencek és „itt voltam" jelölés, a telefonon helyben tárolva |
| 📍 **Hol vagyok** | Élő pozíció a térképen; a lista a hozzád legközelebbi helyekkel kezdődik |
| 🌙 **Sötét mód** | Automatikusan követi a telefon beállítását |
| 📴 **Offline** | Az app váza és a már megnézett térképcsempék offline is betöltődnek |

## Telepítés a telefonra

1. Nyisd meg a publikált címet Chrome-ban.
2. Jobb felül **⋮** → **Alkalmazás telepítése** (vagy *Hozzáadás a kezdőképernyőhöz*).
3. Ezután saját ikonnal, böngészősáv nélkül indul — úgy viselkedik, mint egy rendes app.

Első indításkor engedélyezd a helymeghatározást, ha szeretnéd a „hol vagyok" funkciót.

## Közzététel GitHub Pages-en

A repo statikus fájlokból áll, nincs build lépés:

**Settings → Pages → Source: `Deploy from a branch` → Branch: `main` / `/ (root)` → Save.**

Egy-két perc múlva elérhető a `https://<felhasználó>.github.io/city-discovery/` címen.

## Felépítés

```
index.html               az egyetlen oldal
css/styles.css           Google Maps-szerű felület, világos és sötét témával
js/pois.js               a helyek adatai, kategóriák és a séta-útvonal
js/app.js                térkép, szűrés, alsó lap, navigációs átadás
vendor/                  Leaflet 1.9.4 (helyben, CDN nélkül)
icons/                   PWA ikonok
manifest.webmanifest     telepíthetőség
sw.js                    service worker (offline váz + csempe-gyorsítótár)
```

**Térkép:** [Leaflet](https://leafletjs.com/) + OpenStreetMap adat, CARTO csempékkel.
Nem kell hozzá API kulcs és bankkártya.

**Navigáció:** a Google Maps URL API-n keresztül (`/maps/dir/?api=1&…`), ami Androidon
közvetlenül a telepített Google Maps appot nyitja meg. Az útvonal átadásakor a Google
legfeljebb 9 köztes megállót fogad el — a séta ehhez igazodik, így egy megálló sem esik ki.

## Helyek szerkesztése

Minden adat a `js/pois.js` fájlban van, egyszerű objektumokként:

```js
{ id: 'carmo', name: 'Convento do Carmo', cat: 'sight',
  lat: 38.7118, lng: -9.1404,
  desc: 'Rövid leírás…',
  tip: 'Opcionális gyakorlati tipp.' }
```

Új hely felvételéhez elég egy sort hozzáadni a `POIS` tömbhöz — a `cat` a `CATEGORIES`
egyik `id`-je legyen. A koordinátákat a Google Mapsben egy pontra hosszan nyomva
lehet kimásolni. A szerkesztés a GitHub webes felületén, telefonról is elvégezhető.

> A koordináták kézzel gyűjtött, jó közelítésű értékek (jellemzően pár tíz méteren
> belül). A pontos útvonaltervezést a Google Maps végzi, így ez a gyakorlatban nem
> okoz eltérést.

## Licenc

MIT — a térképadat © OpenStreetMap közreműködői (ODbL), a csempék © CARTO.
