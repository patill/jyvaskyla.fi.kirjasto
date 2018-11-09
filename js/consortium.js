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
    else if(consortium === undefined && city !== undefined) {
        $.getJSON("https://api.kirjastot.fi/v3/organisation?lang=" + lang + "&city.name=" + city, function(data) {
            for (var i=0; i<data.items.length; i++) {
                // Ignore mobile libraries
                if(data.items[i].branch_type !== "mobile") {
                    libraryList.push({name: data.items[i].name, id: data.items[i].id});
                }
            }
            finalizeSelect();
        });
    }

    // Fetch libraries of consortium
    else if(consortium !== undefined && city === undefined) {
        $.getJSON("https://api.kirjastot.fi/v3/organisation?lang=" + lang + "&consortium=" + consortium, function(data) {
            for (var i=0; i<data.items.length; i++) {
                if(data.items[i].branch_type !== "mobile") {
                    libraryList.push({name: data.items[i].name, id: data.items[i].id});
                }
            }
            finalizeSelect();
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
        isReFetching = false;
        // Set the global library parameter, so schedule switching won't mess things up.
        library = $(this).val();
        // Fetch data
        getWeekSchelude(0, library);
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
