# Luceed API pitanja

## TODO: Za pitati

1. Kreiramo Narudzbe ili NalogeProdaje za Webshop narudzbe?
1.1. Pretpostavljamo - NalogProdaje. A narudzba je parametar ulazni, gdje postavljamo ID s shopify-a za narudzbu.?

2. Koji su required i optional parametri za NalogProdaje?
2.1. Puno je navedenih u docsima.
2.2. Primjer: `nalog_prodaje_b2b` stoji kao required. Sto je ovo? I za ostale isto tako - koji su zaista potrebni?

3. Isto pitanje za Stavke i Customer.

4. Luceed: Dohvacanje postojecih NalogaProdaje (GET).
4.1. Koji su statusi koji se salju u requestu?
4.2. Gdje su navedeni? Trebaju nam svi nalozi, pa cemo filtrirati na backendu.

2. U kojem slucaju se kreira JIR broj (nalog ili narudzba se fiskalizira?)? Da prilikom testiranja slucajno ne fiskaliziramo.

3. Kreiranje SCC narudzbe ide na 1) datasnap/rest/Narudzbe/snimi/ ili 2) /NaloziProdaje/snimi/?

4. Mozemo li dobiti poziv na nas API, kada se u SCC [potvrdi,odbije] narudzba (kreirana na Webshopu)?
4.1. Ovo nam koristi da i u Shopifyu znamo koje od narudzbi su potvrdjene (rjesene) ili otkazane.

5. Mozemo li spremiti custom podatak na svakoj narudzbi koju saljemo u SCC (s webshopa)?
5.1. Primjerice - shopifyOrder.id.
5.2. Ovime mozemo tocno matchirati order iz Shopifya, prema orderu u Luceedu. Da znamo gdje sto treba aktivirati, obrisati ili promijeniti u slucaju potrebe.

## DONE

1. Nalog (Narudzba s Webshopa) se moze SPREMITI putem Luceed API-ja KOLIKO GOD ZELIMO?
1.1. Mozemo testirati i kreirati koliko god naloga? (Ne brinemo o nikakvim efektima na Luceed?)
1.2. Nalog je potrebno prihvatiti u SCC i tek onda se bilo sto BITNO dogadja?
1.3. Ako ne prihvatimo u SCC-u, onda svejedno mozemo prodavati sve u fizickoj trgovini (neovisno koliko je rezervirano, a nije potvrdjeno u SCC-u)?
2. Luceed API na endpointu Artikli (/datasnap/rest/artikli/lista/[0,1000]) vraca null za stanje i raspolozivo. Za sve proizvode.
2.1. Mozemo li ovdje dobiti tocno stanje i raspolozivo? Da ne pozivamo drugi endpoint (jer tamo nema sifre artikla (na StanjeSkladista endpointu)).
3. Luceed API samo na endpointu StanjeSkladista (/datasnap/rest/stanjezalihe/skladiste) vraca stanje i raspolozivo. Ali tamo imamo SAMO product UID.
3.1. Samo imamo UID - pa onda moramo skuziti koja je to sifra artikla, sto duze traje (skupo je zbog dodatnih poziva i procesiranja).
3.2. Moze li se dobiti sve na Endpointu Artikli, da imamo odmah sifru artikla (a ne SAMO aritkl-uid)?