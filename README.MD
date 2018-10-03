**About**

This repository contains pages (published as GitHub pages) to be implemented as iframes for libraries of Jyvaskyla on jyvaskyla.fi/kirjasto

Library data is pulled from the kirkanta-api: https://github.com/libraries-fi/kirkanta-api and the UI is heavily inspired by kirjastohakemisto.fi https://github.com/libraries-fi/kirjastohakemisto



**Library list**

| ID        	|     Alias     | URL  | On pori.fi | Iframe |
| :-------------: |:-------------:| :-----: | --------------- | --------------- |
| 85142       | Porin pääkirjasto | https://hakemisto.kirjastot.fi/|  | <iframe allowfullscreen="" frameborder="0" height="2000px" src="https://patill.github.io/pori.fi.kirjasto/pages/library.html?lib=85142&lang=fi#" width="100%"></iframe> |




**Limitations:**  

- Iframes must open links in new tab
- No JS is allowed on jyvaskyla.fi, thus dynamically resizing the frames becomes a bit difficult (eg. https://www.willmaster.com/library/tutorials/auto-resize-iframe-when-content-size-changes.php)



**TO DO**

- Improve the image slider
- Adjust font sizes to match jyvaskyla.fi
- Cleanup css
- Naming conventions, code standards
- Other improvments