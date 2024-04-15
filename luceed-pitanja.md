# Luceed API pitanja

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
