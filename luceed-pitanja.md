# Luceed API pitanja

## TODO:

1. Na partnerima nema grupa_partnera_uid. Pod koji property postaviti ovo? - PoslovniPartneri.create: grupa_partnera_uid = 6-3228.

## DONE: NalogProdaje

1. Endpoint za dohvacanje svih mogucih statusa koji se mogu staviti na NalogProdaje.

Trebaju nam UID-jevi, ili sifra ako moze ici na NalogProdaje.
Statusi su nam potrebni da bismo mogli postaviti stanja:

- Kreirana narudzba,
- Otkazana narudzba,
- Payment greska, ...

Endpointovi za dohvacanje statusa vracaju gresku (rest/statusi).

2. Luceed NalogProdaje.ukupniIznos se izracunava samostalno (od strane Luceeda), bazirano na `NalogProdaje.stavke`?

Gleda se kolicina i mnozi sa cijenom iz sifrarnika?
Ne moramo to samostalno rucno postavljati?

3. Mozemo li dohvatiti iz Luceeda NalogProdaje.[stavke,placanja]?

Vidimo samo mogucnost dodavanja na NalogProdaje (stavke, placanja).
Mogu li se dohvatiti spremljene vrijednosti?
U dokumentaciji ne vidimo endpoint za detalje NalogaProdaje (stavke,placanja).

4. Kako rjesiti problematiku sa Mjestima - odnosno pravilno spremanje podataka za dostavu, U Luceed, iz Shopifya?

Ovdje je popis svih atributa koje imamo dostupne na Shopifyu,
kao dio narudzbe,
i koji govori o shipping data na Shopify Orderu.
https://shopify.dev/docs/api/customer/2024-01/objects/CustomerAddress

Imamo dostupno, iz Shopifya:

- postanski broj (ZIP code),
- city (The name of the city, district, village, or town.)
- address1 (The first line of the address. Typically the street address or PO Box number.),
- address2 (The second line of the address. This is typically the apartment, suite, or unit number.)

Mozemo li prema `city` parametru iz Shopifya,
pronaci Mjesto u Luceedu?
Hoce li ovo biti dovoljno tocno? Buduci da mi trebamo ID od mjesta iz Luceeda i ako faila search za upisanu vrijednost na Shopifyu - necemo dobiti Luceed ID za mjesto.

Obrnuto, popuniti Shopify lokacije sa vrijednostima iz Luceeda,
treba istraziti ako se moze.
Bilo bi jednostavnije da imamo nekakav fuzzy search za mjesta (iz Elasticsearcha) za dobar hit po Shopify `city` parametru.

5. Na NaloguProdaje ne zeli spremiti `na_skladiste_uid` property (iako smo ga postavili).

`sa_skladista_uid` je spremljeno.
To je vjerojatno povezano sa `skladiste_uid` koje smo morali postaviti
(opisano u proslim mailovima) (pa zbog `skladiste_uid` ne zeli prihvatiti `na_skladiste_uid`).
Ali ne mozemo maknuti `skladiste_uid` jer onda spremanje NalogaProdaje ne prolazi.

Provjeriti efekte ovoga i kako rjesiti i pravilno spremiti sve parametre
za skladiste/a.

6. Kreirali smo jednog (1) customera - Webshop Customer

Ispod tog customera (sa `parent partner uid`) postavljamo sve nove Webshop kupce.
Tako imamo grupirano sve s weba pod jednom stavkom.

Ovo je u redu?

## TODO: Kreiranje Naloga Prodaje

1. Create Nalog prodaje: Na nalogu prodaje `nalog_prodaje_b2b` je required data.
Od kud je ovo, gdje ovo dobiti?
Ovo postavljamo na istu vrijednost kao i `narudzba` field (orderId is Shopifya)?

2. Create Nalog prodaje: za "status": "Storno"...
Vraca da ne moze naci taj status.
Koji je UID za ovo?

Trenutacno saljemo {status: "01"}.
Da li je ovo predvidjeno (01)?

3. Create nalog prodaje: Vraca gresku pj_id mora biti postavljen
Postavili smo sa skladista, na skladiste i skl. dokument.
No, bez ovoga {"skladiste_uid":"1-3228"} (sklasite maloprodaje),
vraca `pj_id mora biti postavljeno`.
Pa smo stavili {"skladiste_uid":"1-3228"} i sad kreiranje narudzbe radi.

Zbog cega i je li ovo sad dobro?
Na skladiste_uid treba biti MALOPRODAJA ili WEBSHOP?
S time da imamo i sa, na skladiste i skl. dokument (MSM) postavljeno.

4. Create nalog prodaje: Na koji nacin Luceed API postavlja `nalogProdaje.za_naplatu`?

Postavili smo `nalogProdaje.stavke[0].kolicina` = 12 (12 komada za 1 (jedan, jedini) proizvod, pod stavkama).
I stavili smo pod `nalogProdaje.placanja.iznos=123.45`.

Luceed API je postavio `nalogProdaje.za_naplatu` na `356.25`.

Kako postavljati placanja.iznos?
Moramo izracunati finalnu cijenu narudzbe (kolicina * MPC za svaki proizvod?)?

5. Treba nam popis svih dostupnih Statusa (01, 02, ... ili nazivi ili UID - najbolje sve).

Ne mozemo pronaci endpoint koji ih vraca u dokumentaciji.

## DONE

1. Zasto u nalogu prodaje tip cijene mora biti M?
A u customeru imamo tip cijene V defaultno?

2. Pise da prilikom kreiranja naloga prodaje - trebamo poslati poseban field - cijena S PDV-om.
Da li to znaci da cijene trebaju biti Veleprodajne ili maloprodajne na webu? S pdvom?
Da li to znaci da u stavkama naloga prodaje takodjer moramo navesti cijene s pdvom?

3. Dostava
Dakle, definiramo jednu sifru - Webshop dostava - stavimo fiksnu cijenu.
I uvijek u narudzbu ukljucimo (pod nalogProdaje, pod stavke) i taj artikli tj. uslugu dostave?

4. Potreban ID-SID (UID?) za placanje pouzecem
Ovo navodimo pod nalogom prodaje, pod vrste placanja.

5. Pri kreiranju naloga - moramo poslati 3 fielda - za skladiste - instrukcije Luceedu

- sa_skladista - ovdje ide UID? koja je sifra tocna?
- na_skladiste - ovdje ide UID? koja je sifra tocna?
- skladisni dokument MSM (medjuskaldisnica maloprodaje) - koji je tocan naziv fielda za skladisni dokument? i tocna vrijednost?

6. Kako dobivamo i kada saljemo racun na email kupca?
Primarno, za placanje pouzecem.

Trebamo li fiskalizirati racun prilikom slanja paketa i i ubaciti u paket?
Mozemo i poslati na mail (ovo je opcionalno)? (Prije ili nakon dostave paketa)?


7. Za stanje skladista

trebamo iskljucivo pozivati za - slati sifru - skladiste malorpdoaje 10?
ne za sve, jer ce onda vracati i za webshop skladiste?


## Za pitati - Customers/Partneri

1. Gdje dohvatiti sve postojece poslovne partnere, napravljene preko Webshopa? (Fizicke osobe)
1.1. U dokumentaciji ne vidimo LISTU za poslovne partnere, vec samo filtriranje (po mailu, id-u itd.).
1.2. Moze li se dohvatiti LISTA svih partnera?
2. Koja je razlika izmedju USERS i PARTNERI?
2.1. Sto sve obuhvaca USERS? Da li su partneri takodjer dio USERS-a?
3. Mjesto - ovo je na PARTNERu field.
3.1. Treba ovo postaviti ili ostaviti prazno?
3.2. Kako ovo sto jednostavnije dohvatiti putem API-a?
3.3. Sto ako korisnik unese mjesto drugacije nego je u Luceed bazi?
3.4. Na koji nacin da isprogramiramo dohvat i odabir mjesta (ID-a mjesta) za postavljanje na PARTNERU (prilikom kreiranja partnera)?
4. Kako gledamo promjenu statusa naloga prodaje u SCC-u?
4.1. Da mozemo poslati mail kupcu, kad je narudzba prihvacena, pripremljena, poslana i dostavljena.
4.2. Moramo povlaciti svaki puta sve naloge i provjeravati status ili mozete pozvati nas API i obavijestiti nas putem websocketa recimo?
5. Pri kreiranju kupca - navodimo tip_cijene V?
5.1. To znaci da na webshopu moramo prikazati sve VELEPRODAJNE cijene?
5.2. Moramo prije toga postaviti sve VELEPRODAJNE cijene s ili BEZ PDV-a? (bilo je nekog govora da ovo treba biti promijenjeno)
6. Pri kreiranju kupca - maticni_broj, mjesto - unosimo?
7. Jos su nam tu neka manja pitanja oko UID-jeva i slicnih stvari - pa predlazem da napravimo meeting cca pola sata danas (ako ste u mogucnosti), i kroz dva-tri dana ako bude trebalo nakon ovog sastanka.

## DONE 2

0. Za pocetak cemo raditi samo Placanje POUZECEM.
0.1. Sto je potrebno podesiti (pri NaloguProdaje, stavkama proizvoda na nalogu ili placanjima na nalogu)?

1. Kreiramo Narudzbe ili NalogeProdaje za Webshop narudzbe?
1.1. Pretpostavljamo - NalogProdaje. A `narudzba` je parametar ulazni (na NaloguProdaje), gdje postavljamo ID s shopify-a za narudzbu.?
1.2. Kreiranje SCC narudzbe ide na 1) datasnap/rest/Narudzbe/snimi/ ili 2) /NaloziProdaje/snimi/? Potonje?
1.3. Na `nalogProdaje.narudzba` postavljamo nas custom orderId s Shopifya?
1.4. Ne trebamo kreirati Narudzbe (kroz poseban endpoint na Luceed API-ju), vec samo NalogProdaje i na njega zakaciti, putem fielda (.narudzba), string orderId od narudzbe na Shopifyu?

2. Koji su required i optional parametri za NalogProdaje?
2.1. Puno je navedenih u docsima.
2.2. Primjer: `nalog_prodaje_b2b` stoji kao required. Sto je ovo? I za ostale isto tako - koji su zaista potrebni?

3. Isto pitanje (za required i optioanl fieldove) za Stavke (za nalog prodaje) i Customer (za nalog prodaje).

4. Luceed: Dohvacanje postojecih NalogaProdaje (GET) iz SCC-a.
4.1. BITNO: Koji su statusi koji se salju u requestu?
4.2. Gdje su navedeni moguci statusi? Trebaju nam svi nalozi, pa cemo filtrirati na backendu.

5. U kojem slucaju se kreira JIR broj (nalog ili narudzba se fiskalizira?)? Da prilikom testiranja slucajno ne fiskaliziramo.
5.1. Samo kad se potvrdi u SCC (nalog prodaje) - onda se fiskalizira?

6. Mozemo li dobiti poziv na nas API, kada se u SCC [potvrdi,odbije] narudzba (spremljena u Luceed, nakon kreiranja na Webshopu)?
6.1. Ovo nam koristi da i u Shopifyu znamo koje od narudzbi su potvrdjene (rjesene) ili otkazane.

7. Mozemo li spremiti custom podatak na svakoj narudzbi koju saljemo u SCC (s webshopa)?
7.1. Primjerice - shopifyOrder.id.
7.2. Ovime mozemo tocno matchirati order iz Shopifya, prema orderu u Luceedu. Da znamo gdje sto treba aktivirati, obrisati ili promijeniti u slucaju potrebe.
7.3. Ovo je `narudzba` field na NaloguProdaje? Trebamo li jos sto postaviti vezano uz Narudzbu ili NalogProdaje?

## DONE 1

1. Nalog (Narudzba s Webshopa) se moze SPREMITI putem Luceed API-ja KOLIKO GOD ZELIMO?
1.1. Mozemo testirati i kreirati koliko god naloga? (Ne brinemo o nikakvim efektima na Luceed?)
1.2. Nalog je potrebno prihvatiti u SCC i tek onda se bilo sto BITNO dogadja?
1.3. Ako ne prihvatimo u SCC-u, onda svejedno mozemo prodavati sve u fizickoj trgovini (neovisno koliko je rezervirano, a nije potvrdjeno u SCC-u)?
2. Luceed API na endpointu Artikli (/datasnap/rest/artikli/lista/[0,1000]) vraca null za stanje i raspolozivo. Za sve proizvode.
2.1. Mozemo li ovdje dobiti tocno stanje i raspolozivo? Da ne pozivamo drugi endpoint (jer tamo nema sifre artikla (na StanjeSkladista endpointu)).
3. Luceed API samo na endpointu StanjeSkladista (/datasnap/rest/stanjezalihe/skladiste) vraca stanje i raspolozivo. Ali tamo imamo SAMO product UID.
3.1. Samo imamo UID - pa onda moramo skuziti koja je to sifra artikla, sto duze traje (skupo je zbog dodatnih poziva i procesiranja).
3.2. Moze li se dobiti sve na Endpointu Artikli, da imamo odmah sifru artikla (a ne SAMO aritkl-uid)?
