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



**Library list**

| ID        	|     Alias     | URL  | On pori.fi | Iframe |
| :-------------: |:-------------:| :-----: | --------------- | --------------- |
| 85142       | Porin pääkirjasto | https://hakemisto.kirjastot.fi/pori/pori_paakirjasto | https://www.pori.fi/kirjasto/aukioloajat-ja-yhteystiedot/paakirjasto | <iframe allowfullscreen="" frameborder="0" height="2000px" src="https://patill.github.io/pori.fi.kirjasto/pages/library.html?lib=85142&lang=fi#" width="100%"></iframe> |




**Limitations:**  

- Iframes must open links in new tab
- No JS is allowed on jyvaskyla.fi, thus dynamically resizing the frames becomes a bit difficult (eg. https://www.willmaster.com/library/tutorials/auto-resize-iframe-when-content-size-changes.php)



**TO DO**

- Improve the image slider
- Adjust font sizes to match jyvaskyla.fi
- Cleanup css
- Naming conventions, code standards
- Other improvments