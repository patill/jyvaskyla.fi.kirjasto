**About**

This repository contains pages (published as GitHub pages) to be implemented as iframes for libraries of Jyvaskyla on jyvaskyla.fi/kirjasto

Library data is pulled from the kirkanta-api: https://github.com/libraries-fi/kirkanta-api and the UI is heavily inspired by kirjastohakemisto.fi https://github.com/libraries-fi/kirjastohakemisto

Since the api does not support fetching accessibility details, they are fetched from ”Lisätiedot” fields instead. Example: https://imgur.com/a/Nr7EpfU

**saavutettavuus-info** – Accessibility description, this may contain HTML or just text. 

**saavutettavuus-palvelut** – the accessibility listing and icons, one  item per row.

Currently the following saavutettavuus-palvelut are shown as accessibility icons and translated to English:

- Esteetön sisäänpääsy
- Invapysäköinti
-  Esteetön wc
-  Hissi
-  Induktiosilmukka
-  Suuren kirjasinkoon kokoelma  (only translation, no icon)

Other rows are displayed in the list as they are.

**If city/consortium parameters are provided, Library selector will be shown** according to those parameters (mobile libraries are ignored). Following listings are supported:
A) Libraries of city, that belong to the same consortium ([https://olli-suutari-jkl.github.io/jyvaskyla.fi.kirjasto/pages/library.html?city=jyväskylä&lib=85159&consortium=2113&lang=fi)](https://olli-suutari-jkl.github.io/jyvaskyla.fi.kirjasto/pages/library.html?city=jyväskylä&lib=85159&consortium=2113&lang=fi) 
B) Libraries of city ([https://olli-suutari-jkl.github.io/jyvaskyla.fi.kirjasto/pages/library.html?city=jyväskylä&lib=85159&lang=fi)](https://olli-suutari-jkl.github.io/jyvaskyla.fi.kirjasto/pages/library.html?city=jyväskylä&lib=85159&lang=fi)
C) Libraries of consortium  ([https://olli-suutari-jkl.github.io/jyvaskyla.fi.kirjasto/pages/library.html?lib=85159&consortium=2113&lang=fi)](https://olli-suutari-jkl.github.io/jyvaskyla.fi.kirjasto/pages/library.html?lib=85159&consortium=2113&lang=fi)



**Library list**

| ID        	|     Alias     | URL  | On jyvaskyla.fi | Iframe |
| :-------------: |:-------------:| :-----: | --------------- | --------------- |
| 85159       | Pääkirjasto | https://hakemisto.kirjastot.fi/jyvaskyla/jyvaskyla_paakirjasto | https://www.jyvaskyla.fi/kirjasto/aukioloajat-ja-yhteystiedot/paakirjasto | <iframe allowfullscreen="" frameborder="0" height="2000px" src="https://olli-suutari-jkl.github.io/jyvaskyla.fi.kirjasto/pages/library.html?lib=85159&lang=fi" width="100%"></iframe> |
| 85305      | Halssilan lähikirjasto      | https://hakemisto.kirjastot.fi/jyvaskyla/halssila | https://www.jyvaskyla.fi/kirjasto/aukioloajat-ja-yhteystiedot/lahikirjastot/halssilan-kirjasto | <iframe allowfullscreen="" frameborder="0" height="1500px" src="https://olli-suutari-jkl.github.io/jyvaskyla.fi.kirjasto/pages/library.html?lib=85305&lang=fi" width="100%"></iframe> |
| 85533 | Huhtasuon lähikirjasto      | https://hakemisto.kirjastot.fi/jyvaskyla/huhtasuo | https://www.jyvaskyla.fi/kirjasto/aukioloajat-ja-yhteystiedot/lahikirjastot/huhtasuon-lahikirjasto | <iframe allowfullscreen="" frameborder="0" height="1500px" src="https://olli-suutari-jkl.github.io/jyvaskyla.fi.kirjasto/pages/library.html?lib=85533&lang=fi" width="100%"></iframe> |
| 85516 | Keljonkankaan lähikirjasto | https://hakemisto.kirjastot.fi/jyvaskyla/keljonkangas | https://www.jyvaskyla.fi/kirjasto/aukioloajat-ja-yhteystiedot/lahikirjastot/keljonkankaan-kirjasto | <iframe allowfullscreen="" frameborder="0" height="1500px" src="https://olli-suutari-jkl.github.io/jyvaskyla.fi.kirjasto/pages/library.html?lib=85516&lang=fi" width="100%"></iframe> |
| 85754 | Keltinmäen lähikirjasto | https://hakemisto.kirjastot.fi/jyvaskyla/keltinmaki | https://www.jyvaskyla.fi/kirjasto/aukioloajat-ja-yhteystiedot/lahikirjastot/keltinmaen-kirjasto | <iframe allowfullscreen="" frameborder="0" height="1800px" src="https://olli-suutari-jkl.github.io/jyvaskyla.fi.kirjasto/pages/library.html?lib=85754&lang=fi" width="100%"></iframe> |
| 85081 | Kirjastoauto Aino | https://hakemisto.kirjastot.fi/jyvaskyla/kirjastoautoaino-9198f |                                                              |  |
| 85302 | Kirjastoauto Martti | https://hakemisto.kirjastot.fi/jyvaskyla/kirjastoautomartti-a8675 |  |                                                              |
| 85923 | Kirjastoauto Wivi | https://hakemisto.kirjastot.fi/jyvaskyla/kirjastoautowivi-9437e |  |  |
| 85116 | Korpilahden lähikirjasto | https://hakemisto.kirjastot.fi/jyvaskyla/korpilahti | https://www.jyvaskyla.fi/kirjasto/aukioloajat-ja-yhteystiedot/lahikirjastot/korpilahden-kirjasto | <iframe allowfullscreen="" frameborder="0" height="1500px" src="https://olli-suutari-jkl.github.io/jyvaskyla.fi.kirjasto/pages/library.html?lib=85116&lang=fi" width="100%"></iframe> |
| 85160 | Kortepohjan lähikirjasto | https://hakemisto.kirjastot.fi/jyvaskyla/kortepohja | https://www.jyvaskyla.fi/kirjasto/aukioloajat-ja-yhteystiedot/lahikirjastot/kortepohjan-kirjasto | <iframe allowfullscreen="" frameborder="0" height="1700px" src="https://olli-suutari-jkl.github.io/jyvaskyla.fi.kirjasto/pages/library.html?lib=85160&lang=fi" width="100%"></iframe> |
| 86583 | Kuokkalan lähikirjasto | https://hakemisto.kirjastot.fi/jyvaskyla/roska-86583 | https://www.jyvaskyla.fi/kirjasto/aukioloajat-ja-yhteystiedot/lahikirjastot/kuokkalan-kirjasto | <iframe allowfullscreen="" frameborder="0" height="1500px" src="https://olli-suutari-jkl.github.io/jyvaskyla.fi.kirjasto/pages/library.html?lib=86583&lang=fi" width="100%"></iframe> |
| 85909 | Lohikosken pienkirjasto | https://hakemisto.kirjastot.fi/jyvaskyla/lohikoski | https://www.jyvaskyla.fi/kirjasto/aukioloajat-ja-yhteystiedot/lahikirjastot/lohikosken-kirjasto | <iframe allowfullscreen="" frameborder="0" height="1500px" src="https://olli-suutari-jkl.github.io/jyvaskyla.fi.kirjasto/pages/library.html?lib=85909&lang=fi" width="100%"></iframe> |
| 85732 | Palokan aluekirjasto | https://hakemisto.kirjastot.fi/jyvaskyla/palokka | https://www.jyvaskyla.fi/kirjasto/aukioloajat-ja-yhteystiedot/lahikirjastot/palokan-kirjasto | <iframe allowfullscreen="" frameborder="0" height="2000px" src="https://olli-suutari-jkl.github.io/jyvaskyla.fi.kirjasto/pages/library.html?lib=85732&lang=fi" width="100%"></iframe> |
| 85117 | Säynätsalon lähikirjasto | https://hakemisto.kirjastot.fi/jyvaskyla/saynatsalo | https://www.jyvaskyla.fi/kirjasto/aukioloajat-ja-yhteystiedot/lahikirjastot/saynatsalon-kirjasto | <iframe allowfullscreen="" frameborder="0" height="1800px" src="https://olli-suutari-jkl.github.io/jyvaskyla.fi.kirjasto/pages/library.html?lib=85117&lang=fi" width="100%"></iframe> |
| 85111 | Tikkakosken lähikirjasto | https://hakemisto.kirjastot.fi/jyvaskyla/tikkakoski | https://www.jyvaskyla.fi/kirjasto/aukioloajat-ja-yhteystiedot/lahikirjastot/tikkakosken-kirjasto | <iframe allowfullscreen="" frameborder="0" height="2500px" src="https://olli-suutari-jkl.github.io/jyvaskyla.fi.kirjasto/pages/library.html?lib=85111&lang=fi" width="100%"></iframe> |
| 85573 | Vaajakosken aluekirjasto | https://hakemisto.kirjastot.fi/jyvaskyla/vaajakoski | https://www.jyvaskyla.fi/kirjasto/aukioloajat-ja-yhteystiedot/lahikirjastot/vaajakosken-kirjasto | <iframe allowfullscreen="" frameborder="0" height="2500px" src="https://olli-suutari-jkl.github.io/jyvaskyla.fi.kirjasto/pages/library.html?lib=85573&lang=fi" width="100%"></iframe> |
| 85306 | Vesangan lähikirjasto | https://hakemisto.kirjastot.fi/jyvaskyla/vesanka | https://www.jyvaskyla.fi/kirjasto/aukioloajat-ja-yhteystiedot/lahikirjastot/vesangan-kirjasto | <iframe allowfullscreen="" frameborder="0" height="1500px" src="https://olli-suutari-jkl.github.io/jyvaskyla.fi.kirjasto/pages/library.html?lib=85306&lang=fi" width="100%"></iframe> |



**Limitations:**  

- Iframes must open links in new tab
- No JS is allowed on jyvaskyla.fi, thus dynamically resizing the frames becomes a bit difficult (eg. https://www.willmaster.com/library/tutorials/auto-resize-iframe-when-content-size-changes.php)



**TO DO**

- Adjust font sizes to match jyvaskyla.fi
- Cleanup css
- Naming conventions, code standards
- Other improvments