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
        // Fetch data
        getWeekSchelude(0, $(this).val());
        fetchInformation(lang, $(this).val());
        fetchImagesAndSocialMedia($(this).val());
        // Re-bind navigation and other stuff.
        bindActions();
        bindScheduleKeyNavigation();
    });

}); // OnReady
