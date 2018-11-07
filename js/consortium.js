// Get global library/lang parameters from the script.
var city = '';
var consortium = '';
var lang = '';
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
city = getParamValue('city');
consortium = getParamValue('consortium');
lang = getParamValue('lang');

$(document).ready(function() {
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
    else if(refUrl.indexOf("?korte ") > -1) {
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
    else if(refUrl.indexOf("?saynat") > -1 || refUrl.indexOf("?säynät") > -1) {
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
    // This is not really used, since library is set as a global variable in other files. In case this fails, define it.
    if(library === undefined || library === null) {
        library = 85159;
    }


    var libraryList = [];
    function finalizeSelect() {
        // Sort alphabetically. https://stackoverflow.com/questions/6712034/sort-array-by-firstname-alphabetically-in-javascript
        libraryList.sort(function(a, b){
            var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase();
            if (nameA < nameB) //sort string ascending
                return -1;
            if (nameA > nameB)
                return 1;
            return 0; //default return value (no sorting)
        });
        // Add items to the list
        for (var i=0; i<libraryList.length; i++) {
            var x = document.getElementById("librarySelector");
            var option = document.createElement("option");
            option.text = libraryList[i].name;
            option.value = libraryList[i].id;
            x.add(option, x[i]);
        }
        // Set selected & init niceSelect
        $("#librarySelector option[value='" + library + "']").attr("selected","selected");
        setTimeout(function(){
            $('#librarySelector').niceSelect();
            $('#librarySelectorContainer').addClass("always-visible");
        }, 50);
    }

    // Fetch libraries of city, that belong to the same consortium
    if(consortium !== undefined && city !== undefined) {
        $.getJSON("https://api.kirjastot.fi/v3/organisation?lang=" + lang + "&city.name=" + city, function(data) {
            for (var i=0; i<data.items.length; i++) {
                // Ignore mobile libraries & other consortiums.
                if(data.items[i].branch_type !== "mobile" && data.items[i].consortium == consortium) {
                    libraryList.push({name: data.items[i].name, id: data.items[i].id});
                }
            }
            finalizeSelect();
        });
    }

    // Fetch libraries of city
    if(consortium === undefined && city !== undefined) {
        $.getJSON("https://api.kirjastot.fi/v3/organisation?lang=" + lang + "&city.name=" + city, function(data) {
            for (var i=0; i<data.items.length; i++) {
                // Ignore mobile libraries
                if(data.items[i].branch_type !== "mobile") {
                    libraryList.push({name: data.items[i].name, id: data.items[i].id});
                }
                finalizeSelect();
            }
        });
    }

    // Fetch libraries of consortium
    if(consortium !== undefined && city === undefined) {
        $.getJSON("https://api.kirjastot.fi/v3/organisation?lang=" + lang + "&consortium=" + consortium, function(data) {
            for (var i=0; i<data.items.length; i++) {
                if(data.items[i].branch_type !== "mobile") {
                    libraryList.push({name: data.items[i].name, id: data.items[i].id});
                }
                finalizeSelect();
            }
        });
    }

    $("#librarySelector").change(function(){
        $("#pageContainer").replaceWith(divClone.clone()); // Restore main with a copy of divClone
        // Reset variables.
        accessibilityIsEmpty = true;
        transitIsEmpty = true;
        descriptionIsEmpty = true;
        transitAccessibilityTextSet = false;
        mapLoaded = false;
        sliderNeedsToRestart = true;
        contactsIsEmpty = true;
        noServices = true;
        indexItemClicked = false;
        // Set the global library parameter, so schedule switching won't mess things up.
        library = $(this).val();
        // Fetch data
        getWeekSchelude(0, $(this).val());
        fetchInformation(lang, $(this).val());
        fetchImagesAndSocialMedia($(this).val());
        // Re-bind navigation and other stuff.
        bindActions();
        bindScheduleKeyNavigation();
        // Add swiping detection for schedules & sliderbox if available.
        detectswipe("schedules", swipeNavigation);
        if(document.getElementById("sliderBox") != null) {
            detectswipe("sliderBox", swipeNavigation);
        }
    });

}); // OnReady
