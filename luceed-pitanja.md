# Luceed API pitanja

1. Nalog (Narudzba s Webshopa) se moze SPREMITI putem Luceed API-ja KOLIKO GOD ZELIMO?
1.1. Mozemo testirati i kreirati koliko god naloga? (Ne brinemo o nikakvim efektima na Luceed?)
1.2. Nalog je potrebno prihvatiti u SCC i tek onda se bilo sto BITNO dogadja?
1.3. Ako ne prihvatimo u SCC-u, onda svejedno mozemo prodavati sve u fizickoj trgovini (neovisno koliko je rezervirano, a nije potvrdjeno u SCC-u)?
2. Luceed API na endpointu Artikli (/datasnap/rest/artikli/lista/[0,1000]) vraca null za stanje i raspolozivo. Za sve proizvode.
2.1. Mozemo li ovdje dobiti tocno stanje i raspolozivo? Da ne pozivamo drugi endpoint (jer tamo nema sifre artikla (na StanjeSkladista endpointu)).
3. Luceed API samo na endpointu StanjeSkladista (/datasnap/rest/stanjezalihe/skladiste) vraca stanje i raspolozivo. Ali tamo imamo SAMO product UID.
3.1. Samo imamo UID - pa onda moramo skuziti koja je to sifra artikla, sto duze traje (skupo je zbog dodatnih poziva i procesiranja).
3.2. Moze li se dobiti sve na Endpointu Artikli, da imamo odmah sifru artikla (a ne SAMO aritkl-uid)?
