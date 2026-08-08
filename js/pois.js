/* Lisszabon belváros (Baixa / Chiado / Cais do Sodré / Alfama széle) POI adatbázis.
   A koordináták kézzel gyűjtött, jó közelítésű értékek (jellemzően pár tíz méteren
   belül). A tényleges útvonaltervezést a natív Google Maps végzi, oda a pontos
   helynevet is átadjuk, így a kis eltérés nem okoz gondot. */

const CATEGORIES = [
  { id: 'sight',     label: 'Látnivaló',  emoji: '🏛️', color: '#1a73e8' },
  { id: 'view',      label: 'Kilátó',     emoji: '🌅', color: '#e8710a' },
  { id: 'food',      label: 'Étel & ital',emoji: '☕',  color: '#e52592' },
  { id: 'shop',      label: 'Vásárlás',   emoji: '🛍️', color: '#9334e6' },
  { id: 'nightlife', label: 'Este',       emoji: '🍸', color: '#12b5cb' },
  { id: 'transport', label: 'Közlekedés', emoji: '🚋', color: '#188038' }
];

const CITY = {
  name: 'Lisszabon belváros',
  center: [38.7112, -9.1385],
  zoom: 15,
  // A térkép ne lehessen kicsavarni a belvárosból
  bounds: [[38.6985, -9.1600], [38.7230, -9.1180]]
};

const POIS = [
  // ── Látnivalók ─────────────────────────────────────────────────────────────
  { id: 'comercio', name: 'Praça do Comércio', cat: 'sight', lat: 38.7075, lng: -9.1364,
    desc: 'A város hatalmas, folyóra nyíló főtere sárga árkádokkal. Az 1755-ös földrengés utáni újjáépítés jelképe.',
    tip: 'Napnyugtakor a Tejo felől jön a fény — ilyenkor a legszebb.' },
  { id: 'arco', name: 'Arco da Rua Augusta', cat: 'sight', lat: 38.7086, lng: -9.1366,
    desc: 'Diadalív a főtér és a Rua Augusta között. Lifttel és lépcsővel fel lehet menni a tetejére.',
    tip: 'A tetőterasz olcsó és sokkal kevésbé zsúfolt, mint a Santa Justa lift.' },
  { id: 'rua-augusta', name: 'Rua Augusta', cat: 'sight', lat: 38.7103, lng: -9.1379,
    desc: 'A Baixa mozaikköves, sétálóutcás főtengelye a diadalívtől a Rossióig.',
    tip: 'Az oldalutcákban feleannyiba kerül minden, mint a főutcán.' },
  { id: 'santa-justa', name: 'Elevador de Santa Justa', cat: 'sight', lat: 38.7122, lng: -9.1393,
    desc: 'Neogótikus vaslift 1902-ből, ami a Baixát köti össze a magasabban fekvő Chiadóval.',
    tip: 'Alulról hosszú a sor. A Carmo felől, a Largo do Carmo irányából ingyen odasétálhatsz a felső teraszhoz.' },
  { id: 'carmo', name: 'Convento do Carmo', cat: 'sight', lat: 38.7118, lng: -9.1404,
    desc: 'A földrengésben tető nélkül maradt gótikus templom romja, ma régészeti múzeum. A csupasz boltívek fölött az ég a mennyezet.',
    tip: 'A belváros legjobb hangulatú helye — a lista kihagyhatatlan pontja.' },
  { id: 'rossio', name: 'Praça do Rossio', cat: 'sight', lat: 38.7139, lng: -9.1394,
    desc: 'Hullámmintás kövezetű, szökőkutas főtér — a lisszaboni utcai élet központja évszázadok óta.' },
  { id: 'figueira', name: 'Praça da Figueira', cat: 'sight', lat: 38.7137, lng: -9.1367,
    desc: 'Tágas tér a Rossio mellett, innen indul a legtöbb villamos és onnan látszik a Castelo a dombon.' },
  { id: 'restauradores', name: 'Praça dos Restauradores', cat: 'sight', lat: 38.7159, lng: -9.1417,
    desc: 'Obeliszkes tér az 1640-es spanyol uralom alóli függetlenség emlékére. Innen indul az Avenida da Liberdade.' },
  { id: 'rossio-station', name: 'Estação do Rossio', cat: 'sight', lat: 38.7146, lng: -9.1409,
    desc: 'Manuelinstílusú pályaudvar patkó alakú kapukkal — inkább kastélynak néz ki, mint vasútállomásnak.' },
  { id: 'gloria', name: 'Elevador da Glória', cat: 'sight', lat: 38.7157, lng: -9.1435,
    desc: 'Sárga, graffitis siklóvasút, ami a Restauradorest köti össze a Bairro Altóval.' },
  { id: 'se', name: 'Sé de Lisboa (Katedrális)', cat: 'sight', lat: 38.7098, lng: -9.1332,
    desc: 'A város legrégebbi temploma, 1147-ből — inkább erőd, mint székesegyház.',
    tip: 'A 28-as villamos pont előtte kanyarodik el — itt készül a város legtöbbet fotózott képe.' },
  { id: 'castelo', name: 'Castelo de São Jorge', cat: 'sight', lat: 38.7139, lng: -9.1335,
    desc: 'Mór eredetű vár a domb tetején, körben a legszélesebb panorámával a városra.',
    tip: 'Felfelé meredek a séta — a 28-as villamos vagy a 737-es busz sokat spórol.' },
  { id: 'sao-domingos', name: 'Igreja de São Domingos', cat: 'sight', lat: 38.7146, lng: -9.1382,
    desc: 'Kívülről jelentéktelen, belül megrázó: a földrengés és egy 1959-es tűzvész sebeit szándékosan nem javították ki.' },
  { id: 'dmaria', name: 'Teatro Nacional D. Maria II', cat: 'sight', lat: 38.7148, lng: -9.1391,
    desc: 'A Rossio északi végét lezáró klasszicista nemzeti színház.' },
  { id: 'camoes', name: 'Praça Luís de Camões', cat: 'sight', lat: 38.7107, lng: -9.1428,
    desc: 'A Chiado és a Bairro Alto találkozási pontja — esténként itt gyűlik össze a fél város.' },
  { id: 'sao-roque', name: 'Igreja de São Roque', cat: 'sight', lat: 38.7141, lng: -9.1440,
    desc: 'Dísztelen homlokzat, mögötte Európa egyik leggazdagabb barokk belső tere aranyozott kápolnákkal.',
    tip: 'A templomba ingyen be lehet menni.' },
  { id: 'chiado-museu', name: 'Museu Nacional de Arte Contemporânea', cat: 'sight', lat: 38.7104, lng: -9.1409,
    desc: 'Portugál modern és kortárs művészet egy volt kolostor épületében.' },
  { id: 'casa-bicos', name: 'Casa dos Bicos', cat: 'sight', lat: 38.7091, lng: -9.1329,
    desc: 'Gyémántmintás kőhomlokzatú reneszánsz ház, ma a José Saramago Alapítvány otthona.' },
  { id: 'story-centre', name: 'Lisboa Story Centre', cat: 'sight', lat: 38.7078, lng: -9.1355,
    desc: 'Interaktív kiállítás a város történetéről — esőnap esetén jó menedék.' },

  // ── Kilátók ────────────────────────────────────────────────────────────────
  { id: 'portas-sol', name: 'Miradouro das Portas do Sol', cat: 'view', lat: 38.7120, lng: -9.1304,
    desc: 'Az Alfama cseréptetői fölött a folyóig ellátni. A klasszikus lisszaboni képeslap-nézet.',
    tip: 'Reggel a legjobb a fény és üresebb a terasz.' },
  { id: 'santa-luzia', name: 'Miradouro de Santa Luzia', cat: 'view', lat: 38.7118, lng: -9.1305,
    desc: 'Bougainvilleával befuttatott pergola azulejo-csempés falakkal, közvetlenül a Portas do Sol mellett.' },
  { id: 'sao-pedro', name: 'Miradouro de São Pedro de Alcântara', cat: 'view', lat: 38.7154, lng: -9.1441,
    desc: 'Kétszintes kerti terasz, szemben a Castelóval és az egész Baixával.',
    tip: 'Naplementekor él igazán — vigyél egy sört a szemközti kioszkból.' },
  { id: 'santa-catarina', name: 'Miradouro de Santa Catarina', cat: 'view', lat: 38.7099, lng: -9.1465,
    desc: 'Laza, fiatalos kilátó a folyóra és a 25 de Abril hídra. Gyakran gitároznak.' },

  // ── Étel & ital ────────────────────────────────────────────────────────────
  { id: 'brasileira', name: 'Café A Brasileira', cat: 'food', lat: 38.7108, lng: -9.1421,
    desc: '1905-ös legendás kávéház, kint Fernando Pessoa bronzszobrával.',
    tip: 'A pultnál állva feleannyi a kávé, mint a teraszon ülve. Ez az egész városban így van.' },
  { id: 'manteigaria', name: 'Manteigaria', cat: 'food', lat: 38.7104, lng: -9.1425,
    desc: 'Sokak szerint a város legjobb pastel de natája, a nyitott konyhában sülnek a szemed előtt.',
    tip: 'Kérd fahéjjal és porcukorral, és edd meg azonnal, még melegen.' },
  { id: 'confeitaria', name: 'Confeitaria Nacional', cat: 'food', lat: 38.7137, lng: -9.1376,
    desc: '1829 óta működő cukrászda a Praça da Figueirán, eredeti belsővel.' },
  { id: 'fabrica-nata', name: 'Fábrica da Nata', cat: 'food', lat: 38.7109, lng: -9.1385,
    desc: 'Nata a Rua Augustán, kényelmes megállóként séta közben.' },
  { id: 'timeout', name: 'Time Out Market', cat: 'food', lat: 38.7069, lng: -9.1454,
    desc: 'A régi Mercado da Ribeira csarnokában a város legjobb séfjeinek kis pultjai, közös hosszú asztalokkal.',
    tip: '12:30 és 13:30 között tömeg van — 11:30-kor vagy 15 óra után van hely.' },
  { id: 'bonjardim', name: 'Bonjardim — Rei dos Frangos', cat: 'food', lat: 38.7155, lng: -9.1408,
    desc: 'Régimódi grillcsirkés piri-piri szósszal, egy szűk sikátorban a Restauradores mellett.' },
  { id: 'ginjinha', name: 'A Ginjinha', cat: 'food', lat: 38.7146, lng: -9.1389,
    desc: 'Egy pultnyi hely 1840 óta, ahol csak meggylikőrt mérnek műanyag pohárban. Egy kortyra megállni kötelező.',
    tip: '"Com elas" = meggyszemekkel a pohárban.' },
  { id: 'santo-antonio', name: 'Pastelaria Santo António', cat: 'food', lat: 38.7113, lng: -9.1330,
    desc: 'Kis pékség a katedrális mellett — jó kávé a turistaárak nélkül.' },

  // ── Vásárlás ───────────────────────────────────────────────────────────────
  { id: 'armazens', name: 'Armazéns do Chiado', cat: 'shop', lat: 38.7110, lng: -9.1400,
    desc: 'Bevásárlóközpont a Chiado szívében, a legfelső emeleten teraszos étteremszinttel.' },
  { id: 'conserveira', name: 'Conserveira de Lisboa', cat: 'shop', lat: 38.7096, lng: -9.1345,
    desc: '1930 óta ugyanaz a bolt, gyönyörű retró papírba csomagolt konzervhalakkal. A legjobb ajándék hazavinni.' },

  // ── Este ───────────────────────────────────────────────────────────────────
  { id: 'pink-street', name: 'Pink Street', cat: 'nightlife', lat: 38.7071, lng: -9.1443,
    desc: 'Rózsaszínre festett utca a Cais do Sodrén, végig bárokkal. Régen a kikötő vöröslámpás negyede volt.' },
  { id: 'bairro-alto', name: 'Bairro Alto', cat: 'nightlife', lat: 38.7128, lng: -9.1445,
    desc: 'Szűk utcák hálózata, ahol este mindenki az utcán iszik. 22 óra előtt még csendes.' },

  // ── Közlekedés ─────────────────────────────────────────────────────────────
  { id: 'tram28', name: '28-as villamos — Martim Moniz', cat: 'transport', lat: 38.7160, lng: -9.1360,
    desc: 'A híres sárga 28-as végállomása. Innen indul, itt lehet még ülőhelyet kapni.',
    tip: 'Reggel 8 előtt vagy este 8 után sokkal élvezhetőbb.' },
  { id: 'baixa-chiado', name: 'Metró — Baixa-Chiado', cat: 'transport', lat: 38.7105, lng: -9.1396,
    desc: 'A belváros fő metróállomása. A hosszú mozgólépcső egyben lift a Baixa és a Chiado szintje között.' },
  { id: 'cais-sodre', name: 'Cais do Sodré', cat: 'transport', lat: 38.7062, lng: -9.1449,
    desc: 'Metró, vonat (Belém, Cascais) és komp (Cacilhas) egy csomópontban.' }
];

/* Ajánlott gyalogos körséta. A `path` a térképen megrajzolt vonal: kézzel felvett,
   utcákat követő közelítés — a pontos, lépésenkénti navigációt a Google Maps adja. */
const WALK = {
  name: 'Baixa & Chiado körséta',
  duration: '≈ 3 óra megállókkal',
  distance: '≈ 3,5 km',
  // 11 megálló: az első és az utolsó a start/cél, a 9 köztes pont pont belefér
  // a Google Maps URL-limitjébe, így egy megálló sem esik ki az átadáskor.
  // (A Rua Augustán amúgy is végigsétálsz a 2. és 3. megálló között.)
  stops: ['comercio', 'arco', 'santa-justa', 'carmo', 'sao-roque',
          'sao-pedro', 'brasileira', 'camoes', 'santa-catarina', 'pink-street', 'timeout'],
  path: [
    [38.7075, -9.1364], [38.7080, -9.1365], [38.7086, -9.1366], [38.7095, -9.1372],
    [38.7103, -9.1379], [38.7112, -9.1386], [38.7118, -9.1390], [38.7122, -9.1393],
    [38.7121, -9.1398], [38.7118, -9.1404], [38.7124, -9.1412], [38.7130, -9.1424],
    [38.7136, -9.1434], [38.7141, -9.1440], [38.7147, -9.1442], [38.7154, -9.1441],
    [38.7148, -9.1441], [38.7141, -9.1440], [38.7132, -9.1439], [38.7124, -9.1436],
    [38.7116, -9.1430], [38.7110, -9.1424], [38.7108, -9.1421], [38.7107, -9.1428],
    [38.7104, -9.1440], [38.7101, -9.1452], [38.7099, -9.1465], [38.7091, -9.1462],
    [38.7083, -9.1455], [38.7076, -9.1448], [38.7071, -9.1443], [38.7068, -9.1448],
    [38.7069, -9.1454]
  ]
};
