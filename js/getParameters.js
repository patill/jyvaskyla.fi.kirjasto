// Get global library/lang parameters from the script.
var library;
var lang;
var city;
var consortium;
var largeSchedules = false;
// Get parameters from iframe url.
function getParamValue(paramName)
{
    var url = window.location.search.substring(1); //get rid of "?" in querystring
    var qArray = url.split('&'); //get key-value pairs
    for (var i = 0; i < qArray.length; i++)
    {
        var pArr = qArray[i].split('='); //split key and value
        if (pArr[0] == paramName)
            return pArr[1]; //return value
    }
}
library = getParamValue('lib');
lang = getParamValue('lang');
city = getParamValue('city');
consortium = getParamValue('consortium');
/* Large schedules are used in iDiD info screens. */
if(getParamValue('large') === 'true') {
    largeSchedules = true;
}
/* Old method, to be removed */
if(getParamValue('font') == 'l' || getParamValue('font') == 'xl') {
    largeSchedules = true;
}

/* Alternative:   <script data-library="85111" data-lang="fi" src="../../js/main.js" type="text/javascript"></script>*/
// If lang and lib are undefined (not used in iframe)
if(lang == undefined && library == undefined){
    var scripts = document.getElementsByTagName('script');
    var scriptName = scripts[scripts.length-1];
    library = scriptName.getAttribute('data-library'),
        lang = scriptName.getAttribute('data-lang')
}

// Setup the translations.
var i18n = $('body').translate({lang: lang, t: dict}); // Use the correct language
$("html").attr("lang", lang);

// Get referrer url (Iframe parent). If Library name is set, use that as the default.
var refUrl = (window.location != window.parent.location)
    ? document.referrer
    : document.location.href;
refUrl = refUrl.toLocaleLowerCase();
// We use ? to navigate right to library X, # is not passed in url.
// Check the libraries of JKL, by default the main library is used. (lib param from iframe)
if(refUrl.indexOf("?halssila") > -1) {
    library = 85305;
}
else if(refUrl.indexOf("?huhtasuo") > -1) {
    library = 85533;
}
else if(refUrl.indexOf("?keljo") > -1) {
    library = 85516;
}
else if(refUrl.indexOf("?keltin") > -1) {
    library = 85754;
}
else if(refUrl.indexOf("?korpi") > -1) {
    library = 85116;
}
else if(refUrl.indexOf("?korte") > -1) {
    library = 85160;
}
else if(refUrl.indexOf("?kuokka") > -1) {
    library = 86583;
}
else if(refUrl.indexOf("?lohi") > -1) {
    library = 85909;
}
else if(refUrl.indexOf("?palok") > -1) {
    library = 85732;
}
else if(refUrl.indexOf("?saynat") > -1 || refUrl.indexOf("s%c3%a4yn%c3%a4t") > -1 ||
    refUrl.indexOf("s%C3%A4yn%C3%A4tsalo") > -1 || refUrl.indexOf("?säynät") > -1) {
    library = 85117;
}
else if(refUrl.indexOf("?tikka") > -1) {
    library = 85111;
}
else if(refUrl.indexOf("?vaaja") > -1) {
    library = 85573;
}
else if(refUrl.indexOf("?vesan") > -1) {
    library = 85306;
}
// If no library parameter was provided.
if(library === undefined || library === null || library === '') {
    library = 85159;
}

// Navigate to contacts or services, if parameter is in the url.
// Active tab: 0 = info, 1 = contact details, 3 = services.
var activeTab = 0;
if(refUrl.indexOf("yhteys") > -1 || refUrl.indexOf("contact") > -1) {
    activeTab = 1;
}
else if(refUrl.indexOf("palvelu") > -1 || refUrl.indexOf("service") > -1) {
    activeTab = 2;
}
