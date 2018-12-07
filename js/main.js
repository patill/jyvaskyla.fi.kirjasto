function toggleFullScreen(target) {
    // if already full screen; exit
    // else go fullscreen
    // If slider, toggle small-slider class.
    if(target === "#sliderBox") {
        $('#sliderBox').toggleClass("small-slider");
    }
    else if(target === "#mapContainer") {
        $('#mapContainer').toggleClass("map-borders");
    }
    if (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    ) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } else {
        element = $(target).get(0);
        if (element.requestFullscreen) {
            element.requestFullscreen();
        }
        else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        }
        else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        }
        else if (element.msRequestFullscreen) {
            element.msRequestFullscreen()
        }
    }
}

// Function for adding a new palvelut item.
function addItem(item, listElement) {
    var name = item.name;
    // Use "custom_name", where available.
    if (item.custom_name != null && item.custom_name.length != 0) {
        name = item.custom_name;
    }
    // Add popup link if additional details are available.
    if(item.short_description != null && item.short_description.length != 0) {
        var description = item.short_description;
        var websiteLink = item.website;
        // Add "long" description where available.
        if (item.description != null && item.description.length != 0) {
            // Replace row splits with <br>
            var longDescription = item.description.replace(/\r\n/g, "<br>");
            description = description + '<br><br>' + longDescription;
        }
        // Add price where available.
        if (item.price != null && item.price.length != 0) {
            description = description + '<br><br>' + i18n.get("Hintatiedot") + ': ' +  item.price;
        }
        // Add the item to a desired element.
        $( listElement ).append('<li> ' +
            '<a class="index-item" data-message="' + description + '" data-website="' + websiteLink + '" tabindex="0" href="#"' +
            'role="button" aria-expanded="false" aria-controls="' + name + '"' +
            'title="' + name + '">' + name + '</a></li>');
        // If no description found, don't create the link
    } else {
        $( listElement ).append('<li> ' +
            name + '</li>');
    }
}

// Function for checking if element is empty.
function isEmpty( el ){
    return !$.trim(el.html())
}

var isInfoBoxVisible = false;
// Togles the visibility of the popover modal.
function toggleInfoBox(delay) {
    if(isInfoBoxVisible) {
        isInfoBoxVisible = false;
        $('#infoPopup').toggle(delay);
    }
    else {
        isInfoBoxVisible = true;
        $('#infoPopup').toggle(delay);
    }
}

// Map coordinates (marker)
var lon;
var lat;
// Used for hiding sections if null....
var accessibilityIsEmpty = true;
var transitIsEmpty = true;
var descriptionIsEmpty = true;
var transitAccessibilityTextSet = false;
var isReFetching = false;
var mapLoaded = false;
var contactsIsEmpty = true;
var noServices = true;
var indexItemClicked = false;
// divClone & active tab are used with consortium.js
var divClone = '';

var jsonp_url = "https://api.kirjastot.fi/v3/library/" + library + "?lang=" + lang;
function fetchInformation(language, lib) {
    if (lib === undefined) {
        lib = library;
    }
    jsonp_url = "https://api.kirjastot.fi/v3/library/" + lib + "?lang=" + language;
    // Generic details
    $.getJSON(jsonp_url + "&with=extra", function (data) {
        if ($("#blockquote").is(':empty')) {
            if (data.extra.slogan !== null && data.extra.slogan.length !== 0) {
                $("#blockquote").append(' <blockquote class="blockquote library-slogan">' + data.extra.slogan + '</blockquote>');
            }
        }
        if (isEmpty($('#introContent'))) {
            var description = data.extra.description;
            if (description != null && description.length !== 0) {
                // Turn bolded Ajankohtaista/Tervetuloa to <h2>
                description = description.replace("<strong>Ajankohtaista</strong>", "<h2>Ajankohtaista</h2>");
                description = description.replace("<p><h2>Ajankohtaista</h2></p>", "<h2>Ajankohtaista</h2>");
                description = description.replace("<strong>Tervetuloa kirjastoon!</strong>", "<h2>Tervetuloa kirjastoon!</h2>");
                description = description.replace("<p><h2>Tervetuloa kirjastoon!</h2></p>", "<h2>Tervetuloa kirjastoon!</h2>");
                // Remove <br> and it's variations since everything is inside <p> anyways...
                // https://stackoverflow.com/questions/4184272/remove-all-br-from-a-string
                description = description.replace(/(<|&lt;)br\s*\/*(>|&gt;)/g, ' ');
                // Remove multiple spaces
                description = description.replace(/^(&nbsp;)+/g, '');
                // Remove empty paragraphs
                description = description.replace(/(<p>&nbsp;<\/p>)+/g, "");
                // Add target="_blank" to links. Same url links would open inside Iframe, links to outside  wouldn't work.
                description = description.replace(/(<a )+/g, '<a target="_blank" ');
                $("#introContent").append(description);
                descriptionIsEmpty = false;
            } else {
                // If no description, display the transit & accessibility details (if hidden)
                if ($("#transitAccessibilityMarker").hasClass("fa-eye") && language === "fi") {
                    $("#transitAccessibilityToggle").click();
                }
            }
        }
        if (isEmpty($('#genericTransit'))) {
            if (data.extra.transit.transit_directions != null && data.extra.transit.transit_directions.length != 0) {
                transitIsEmpty = false;
                $('.transit-details').css('display', 'block');
                $('#genericTransit').append('<h4>' + i18n.get("Ohjeita liikenteeseen") + '</h4><p>' + data.extra.transit.transit_directions.replace(/(<a )+/g, '<a target="_blank" ') + '</p>')
            }
            if (data.extra.transit.buses != null && data.extra.transit.buses !== "") {
                transitIsEmpty = false;
                $('.transit-details').css('display', 'block');
                $('#genericTransit').append('<h4>' + i18n.get("Linja-autot") + ':</h4><p>' + data.extra.transit.buses + '</p>')
            }
        }
        if (isEmpty($('#parkingDetails'))) {
            if (data.extra.transit.parking_instructions != null && data.extra.transit.parking_instructions !== "") {
                transitIsEmpty = false;
                $('.transit-details').css('display', 'block');
                // Replace row splits with <br>
                var parking_instructions = data.extra.transit.parking_instructions.replace(/\r\n/g, "<br>");
                $('#parkingDetails').append('<h4>' + i18n.get("Pysäköinti") + '</h4><p>' + parking_instructions + '</p>')
            }
        }
        // Table "Rakennuksen tiedot".
        var triviaIsEmpty = true;
        if (isEmpty($('#buildingDetails'))) {
            // If display none by default, colspan gets messed up.
            $('#buildingDetails').append('<tr id="triviaThead" class="thead-light" style="text-align: center;"> ' +
                '<th colspan="3" >' + i18n.get("Tietoa kirjastosta") + '</th>' +
                '</tr>');
            if (data.address != null) {
                if (data.address.street != null) {
                    triviaIsEmpty = false;
                    $("#buildingDetails").append('<tr><td><strong>' + i18n.get("Osoite") + ': </strong></td>' +
                        '<td>' + data.address.street + ', ' + data.address.zipcode + ', ' + data.address.city + '</td></tr>');
                }
            }
            if (data.extra.founded != null) {
                triviaIsEmpty = false;
                $("#buildingDetails").append('<tr><td><strong>' + i18n.get("Perustamisvuosi") + ': </strong></td>' +
                    '<td>' + data.extra.founded + '</td></tr>');
            }
            if (data.extra.building.building_name != null) {
                triviaIsEmpty = false;
                $("#buildingDetails").append('<tr><td><strong>' + i18n.get("Rakennus") + ': </strong></td>' +
                    '<td>' + data.extra.building.building_name + '</td></tr>');
            }
            if (data.extra.building.construction_year != null && data.extra.building.construction_year != 0) {
                triviaIsEmpty = false;
                $("#buildingDetails").append('<tr><td><strong>' + i18n.get("Rakennettu") + ': </strong></td>' +
                    '<td>' + data.extra.building.construction_year + '</td></tr>');
            }
            if (data.extra.building.building_architect != null) {
                triviaIsEmpty = false;
                $("#buildingDetails").append('<tr><td><strong>' + i18n.get("Arkkitehti") + ': </strong></td>' +
                    '<td>' + data.extra.building.building_architect + '</td></tr>');
            }
            if (data.extra.building.interior_designer != null) {
                triviaIsEmpty = false;
                $("#buildingDetails").append('<tr><td><strong>' + i18n.get("Sisustus") + ': </strong></td>' +
                    '<td>' + data.extra.building.interior_designer + '</td></tr>');
            }
            if (triviaIsEmpty) {
                $("#triviaThead").css("display", "none");
            }
        }
        // Accessibility details from extras.
        data.extra.data.forEach(function (element) {
            if (element.id == "saavutettavuus-info") {
                if (isEmpty($('#accessibilityDetails'))) {
                    if (element.value != null && element.value.length != 0) {
                        accessibilityIsEmpty = false;
                        $(".accessibility-details").css("display", "block");
                        $("#accessibilityDetails").append('<p>' + element.value.replace(/(<a )+/g, '<a target="_blank" ') + '</p>');
                    }
                }
            }
            if (element.id == "saavutettavuus-palvelut") {
                if (isEmpty($('#accessibility-images')) && isEmpty($('#accessibilityList'))) {
                    accessibilityIsEmpty = false;
                    $(".accessibility-details").css("display", "block");
                    var splittedValues = element.value.split("\r\n");
                    $.each(splittedValues, function (index, value) {
                        if (value == "Esteetön sisäänpääsy") {
                            $(".accessibility-images").append(' <img alt="' + i18n.get("Esteetön sisäänpääsy") + '" src="../images/accessibility/Esteetön_kulku_saavutettavuus.png" /> ');
                            $("#accessibilityList").append('<li>' + i18n.get("Esteetön sisäänpääsy") + '</li>');
                        }
                        else if (value == "Invapysäköinti") {
                            $(".accessibility-images").append(' <img alt="' + i18n.get("Invapysäköinti") + '" src="../images/accessibility/Esteetön_parkki.png" /> ');
                            $("#accessibilityList").append('<li>' + i18n.get("Invapysäköinti") + '</li>');
                        }
                        else if (value == "Esteetön wc") {
                            $(".accessibility-images").append(' <img alt="' + i18n.get("Esteetön wc") + '" src="../images/accessibility/Esteetön_wc.png" /> ');
                            $("#accessibilityList").append('<li>' + i18n.get("Esteetön wc") + '</li>');
                        }
                        else if (value == "Hissi") {
                            $(".accessibility-images").append(' <img alt="' + i18n.get("Hissi") + '" src="../images/accessibility/Esteetön_hissi.png" /> ');
                            $("#accessibilityList").append('<li>' + i18n.get("Hissi") + '</li>');
                        }
                        else if (value == "Pyörätuoliluiska") {
                            $(".accessibility-images").append(' <img alt="' + i18n.get("Ramppi") + '" src="../images/accessibility/Esteetön_ramppi.png" /> ');
                            $("#accessibilityList").append('<li>' + i18n.get("Ramppi") + '</li>');
                        }
                        else if (value == "Induktiosilmukka") {
                            $(".accessibility-images").append(' <img alt="' + i18n.get("Induktiosilmukka") + '" src="../images/accessibility/Esteetön_induktiosilmukka.png" /> ');
                            $("#accessibilityList").append('<li>' + i18n.get("Induktiosilmukka") + '</li>');
                        }
                        else if (value == "Suuren kirjasinkoon kokoelma") {
                            $("#accessibilityList").append('<li>' + i18n.get("Suuren kirjasinkoon kokoelma") + '</li>');
                        }
                        else {
                            if (value != null && value.length != 0) {
                                $("#accessibilityList").append('<li>' + value + '</li>');
                            }
                        }
                    });
                }
            }
        });
        if (!transitIsEmpty || !accessibilityIsEmpty) {
            // Display the UI Text based on if transit/accessibility details are available.
            if (!transitIsEmpty && !accessibilityIsEmpty && !transitAccessibilityTextSet ) {
                if(language === "fi") {
                    $('#transitAccessibilityToggle').append(i18n.get("Liikenneyhteydet ja saavutettavuus"));
                    transitAccessibilityTextSet = true;
                }
            }
            else if (!transitIsEmpty && accessibilityIsEmpty && !transitAccessibilityTextSet) {
                if(language === "fi") {
                    $('#transitAccessibilityToggle').append(i18n.get("Liikenneyhteydet"));
                    transitAccessibilityTextSet = true;
                }
            }
            else if (!transitAccessibilityTextSet) {
                if(language === "fi") {
                    $('#transitAccessibilityToggle').append(i18n.get("Saavutettavuus"));
                    transitAccessibilityTextSet = true;
                }
            }
            $("#transitAccessibilityToggle").addClass("always-visible");
            if (!descriptionIsEmpty) {
                $("#newsDescriptionToggle").addClass("always-visible");
            }
        }
        // Hide news/description toggler if no transit/accessibility details && not on mobile.
        else if (lang === "fi" && $(window).width() < 500) {
            if (!descriptionIsEmpty) {
                $("#newsDescriptionToggle").css("display", "block");
            }
        }
        // If no content is provided for the left collumn.
        if (descriptionIsEmpty && transitIsEmpty && accessibilityIsEmpty && language === "fi") {
            // Hide the content on left, make the sidebar 100% in width.
            $(".details").css("display", "none");
            $("#introductionSidebar").addClass("col-md-12");
            $("#introductionSidebar").removeClass("col-lg-5 col-xl-4 order-2 sidebar");
        }
        // Update the title to match data.name.
        if(document.title !== data.name && !isReFetching) {
            if(data.name != null) {
                document.title = data.name;
            }
        }
    });
    /*
     Yhteystiedot
     */
    // Generic details
    $.getJSON(jsonp_url + "&with=mail_address", function (data) {
        if (data.address != null) {
            contactsIsEmpty = false;
            if (isEmpty($('#streetAddress'))) {
                if (data.address.street != null && data.address.zipcode != null && data.address.city != null) {
                    $("#streetAddress").append(data.name + '<br>' + data.address.street + '<br>' + data.address.zipcode + ' ' + data.address.city);
                }
            }
            if (isEmpty($('#postalAddress'))) {
                if (data.mail_address != null) {
                    var boxNumber = '';
                    if (data.mail_address.box_number != null) {
                        boxNumber = 'PL ' + data.mail_address.box_number + '<br>';
                    }
                    $("#postalAddress").append(data.name + '<br>' + boxNumber + data.mail_address.zipcode + ' ' + data.mail_address.area);
                }
            }
            // Get coordinates to be used in loadMap function.
            // Map coordinates (marker)
            if (data.address.coordinates != null) {
                lon = data.address.coordinates.lon;
                lat = data.address.coordinates.lat;
            }
        }
        if (isEmpty($('#email'))) {
            if (data.email != null) {
                contactsIsEmpty = false;
                $("#email").append(data.email);
            }
        }
        // Show navigation if content.
        if (!contactsIsEmpty) {
            $('#navEsittely').css('display', 'block');
            $('#navYhteystiedot').css('display', 'block');
        }
    });
    // Phone numbers.
    if (isEmpty($('#phoneNumbers'))) {
        $.getJSON(jsonp_url + "&with=phone_numbers", function (data) {
            for (var i = 0; i < data.phone_numbers.length; i++) {
                $("#phoneNumbers").append('<tr>' +
                    '<td>' + data.phone_numbers[i].name + '</td>' +
                    '<td>' + data.phone_numbers[i].number + '</td>' +
                    '</tr>');
            }
            // Show navigation if content.
            if (!isEmpty($('#phoneNumbers'))) {
                $('#navEsittely').css('display', 'block');
                $('#navYhteystiedot').css('display', 'block');
            }
        });
    }
    // Staff list
    if (isEmpty($('#staffMembers'))) {
        $.getJSON(jsonp_url + "&with=persons", function (data) {
            for (var i = 0; i < data.persons.length; i++) {

                var staffDetail = "";
                if(data.persons[i].first_name !== null) {
                    staffDetail += '<td>' + data.persons[i].first_name + ' ' + data.persons[i].last_name + '</td>';
                }
                if(data.persons[i].job_title !== null) {
                    staffDetail += '<td>' + data.persons[i].job_title + '</td>'
                }
                if(data.persons[i].email !== null) {
                    staffDetail += '<td>' + data.persons[i].email + '</td>'
                }
                    $("#staffMembers").append('<tr>' +
                        staffDetail +
                    '</tr>');
            }
            // Show navigation if content.
            if (!isEmpty($('#staffMembers'))) {
                $('#navEsittely').css('display', 'block');
                $('#navYhteystiedot').css('display', 'block');
            }
        });
    }
    /*
     Palvelut
    */
    $.getJSON(jsonp_url + "&with=services", function (data) {
        var collectionCount = 0;
        var hardwareCount = 0;
        var roomCount = 0;
        var serviceCount = 0;
        var collectionsAdded = true;
        var hardwareAdded = true;
        var roomsAdded = true;
        var servicesAdded = true;
        if (isEmpty($('#collectionItems'))) {
            collectionsAdded = false;
        }
        if (isEmpty($('#hardwareItems'))) {
            hardwareAdded = false;
        }
        if (isEmpty($('#roomItems'))) {
            roomsAdded = false;
        }
        if (isEmpty($('#serviceItems'))) {
            servicesAdded = false;
        }
        for (var i = 0; i < data.services.length; i++) {
            // Collections
            if (data.services[i].name != null && data.services[i].name.length != 0 || data.services[i].custom_name != null) {
                if (data.services[i].type == "collection") {
                    if (!collectionsAdded) {
                        collectionCount = collectionCount + 1;
                        addItem(data.services[i], '#collectionItems');
                    }
                }
                // Hardware
                else if (data.services[i].type == "hardware") {
                    if (!hardwareAdded) {
                        hardwareCount = hardwareCount + 1;
                        addItem(data.services[i], '#hardwareItems');
                    }
                }
                // Rooms
                else if (data.services[i].type == "room") {
                    if (!roomsAdded) {
                        roomCount = roomCount + 1;
                        addItem(data.services[i], '#roomItems');
                    }
                }
                // Services
                else if (data.services[i].type == "service") {
                    if (!servicesAdded) {
                        serviceCount = serviceCount + 1;
                        addItem(data.services[i], '#serviceItems');
                    }
                }
            }
        }
        // Show titles & counts if found.
        if (collectionCount != 0) {
            $("#collection").css('display', 'block');
            $("#collectionsTitle").prepend(i18n.get("Kokoelmat"));
            $("#collectionBadge").append('(' + collectionCount + ')');
            noServices = false;
        }
        if (hardwareCount != 0) {
            $("#hardware").css('display', 'block');
            $("#hardwareTitle").prepend(i18n.get("Laitteisto"));
            $("#hardwareBadge").append('(' + hardwareCount + ')');
            noServices = false;
        }
        if (roomCount != 0) {
            $("#room").css('display', 'block');
            $("#roomTitle").prepend(i18n.get("Tilat"));
            $("#roomBadge").append('(' + roomCount + ')');
            noServices = false;
        }
        if (serviceCount != 0) {
            $("#service").css('display', 'block');
            $("#serviceTitle").prepend(i18n.get("Palvelut"));
            $("#serviceBadge").append('(' + serviceCount + ')');
            noServices = false;
        }
        if (!collectionsAdded || !hardwareAdded || !roomsAdded || !servicesAdded) {
            if (noServices) {
                if (lang == "fi") {
                    //$('#servicesInfo').append(i18n.get("Ei palveluita"));
                    // Hide the whole navigation if no contact details are listed either...
                    if (contactsIsEmpty && isEmpty($('#staffMembers')) && isEmpty($('#phoneNumbers'))) {
                        $('.nav-pills').css('display', 'none');
                    }
                }
            } else {
                $('#navEsittely').css('display', 'block');
                $('#navPalvelut').css('display', 'block');
                // Add event listener for clicking links.
                $(".index-item").on('click', function () {
                    if (!indexItemClicked) {
                        indexItemClicked = true;
                        // If infobox already visible, hide it instantly to avoid wonky animations.
                        if (isInfoBoxVisible) {
                            toggleInfoBox(0);
                        }
                        // Get element position
                        var posX = $(this).offset().left,
                            // Set top to be slightly under the element
                            posY = $(this).offset().top + 20;


                        // Set popup position & content, toggle visibility.
                        $("#infoPopup").css('transform', 'translate3d(' + posX + 'px,' + posY + 'px, 0px');
                        $("#popoverContent").html('<p id="popoverContent">' + $(this).data('message') + '</p>');
                        // If website is not null and contains stuff. Sometimes empty website is shown unless lenght is checked.
                        if ($(this).data('website') != null && $(this).data('website').length > 5) {
                            // Use _blank, because iframes don't like moving to new pages.
                            $("#linkToInfo").html('<p id="linkToInfo"><a target="_blank" href="' + $(this).data('website') +
                                '" class="external-link">' + i18n.get("Lisätietoja") + '</a></p>');
                        } else {
                            $("#linkToInfo").html('<p id="linkToInfo"></p>');
                        }
                        toggleInfoBox(100);
                        // Add timeout. This prevents duplicated click events if we have changed library.
                        setTimeout(function(){
                            indexItemClicked = false;
                        }, 30);
                    }
                });
            }
        }
    }); // Palvelut
    // If lang is english, do this again with Finnish to add missing infos.
    if (language == "en") {
        setTimeout(function () {
            fetchInformation("fi", lib);
            isReFetching = true;
            $("header").append('<small>Note: If information is missing in English, Finnish version is used where available.</small>');
        }, 400);
    }
}

function fetchImagesAndSocialMedia(lib) {
    // Images
    if(lib !== undefined) {
        jsonp_url = "https://api.kirjastot.fi/v3/library/" + library + "?lang=" + lang;
    }
    $.getJSON(jsonp_url + "&with=pictures", function (data) {
        for (var i = 0; i < data.pictures.length; i++) {
            var altCount = i + 1;
            // Use medium image size, large scales smaller images a lot...
            var altText = i18n.get("Kuva kirjastolta") + ' (' + altCount + '/' + data.pictures.length + ')';
            $(".rslides").append('<li><img src="' + data.pictures[i].files.medium + '" alt="' + altText + '"></li>');
        }
        // If no pictures found, hide the slider...
        if (data.pictures.length === 0) {
            $('#sliderBox').css('display', 'none');
        }
        else {
            $('#currentSlide').html(1);
            $('.top-left').append('/' + data.pictures.length);
            $(".rslides").responsiveSlides({
                navContainer: "#sliderBox" // Selector: Where controls should be appended to, default is after the 'ul'
            });
            // Exit fullscreen if clicking the .rslides and not within 75px range from the center.
            $('.rslides').on('click', function () {
                if (!$("#sliderBox").hasClass("small-slider")) {
                    var centerPos = $(window).scrollTop() + $(window).height() / 2;
                    if (!(event.clientY >= centerPos - 75 && event.clientY <= centerPos + 75)) {
                        toggleFullScreen("#sliderBox");
                    }
                }
            });
            // Ignore clicks on selected image && add hover class.
            // We re-do this in responsiveslides.js every time the image is changed.
            $(".rslides1_on").click(function (event) {
                event.stopPropagation();
                $("#sliderBox").addClass('hovering');
            });
            // Activate arrow navigation when hovering over the small slider.
            $("#sliderBox").mouseenter(function () {
                if (!$("#sliderBox").hasClass('hovering') && $("#sliderBox").hasClass("small-slider")) {
                    // If element is never focused, navigation may not work.
                    $("#sliderBox").addClass('hovering');
                    $("#sliderForward").focus();
                    // If we blur instantly, arrow navigation won't work unless something has been clicked in the document.
                    setTimeout(function () {
                        $("#sliderForward").blur();
                    }, 5);
                    //$("#sliderForward").blur();
                }
            });
            $("#sliderBox").mouseleave(function () {
                if ($("#sliderBox").hasClass('hovering') && $("#sliderBox").hasClass("small-slider")) {
                    $("#sliderBox").removeClass('hovering');
                }
            });
            $( "#expandSlider" ).on('click', function () {
                toggleFullScreen('#sliderBox');
            });
        }
    });

    // Social media links
    $.getJSON(jsonp_url + "&with=link_groups", function (data) {
        // Loop the links of group category [0].
        data.link_groups[0].links.forEach(function (element) {
            // Get url.
            var url = element.url;
            if (url.indexOf("facebook") !== -1) {
                $(".some-links").append('<a target="_blank" ' +
                    'href="' + url + '" title="' + element.name + '"> <img src="../images/icons/facebook.svg" alt="' +
                    i18n.get("Kirjaston") + ' Facebook"/>' +
                    '</a>');
            }
            else if (url.indexOf("instagram") !== -1) {
                $(".some-links").append('<a target="_blank" ' +
                    'href="' + url + '" title="' + element.name + '"> <img src="../images/icons/instagram.svg" alt="' +
                    i18n.get("Kirjaston") + ' Instagram"/>' +
                    '</a>');
            }
        });
    });
}

// Check if element is visible on screen. If this is not used, visibility togglers are lost on mobile when sections are shown.
// https://stackoverflow.com/questions/5353934/check-if-element-is-visible-on-screen
function checkVisible(elm) {
    var rect = elm.getBoundingClientRect();
    var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
    return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}

function loadMap() {
    var map = L.map('mapContainer').setView([lat, lon], 15.5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    var greenIcon = L.icon({
        // https://material.io/tools/icons/?style=baseline
        iconUrl: '../images/icons/local_library.svg',
        popupAnchor:  [-11, -5], // point from which the popup should open relative to the iconAnchor
        iconSize:     [36, 36], // size of the icon
    });
    L.marker([lat, lon], {icon: greenIcon}).addTo(map)
        .bindPopup(document.title)
        .openPopup();
    // add Wikimedia map styles to the map.
    L.tileLayer.provider('Wikimedia').addTo(map);
    // Min/max zoom levels.
    map.options.minZoom = 6;
    map.options.maxZoom = 17.9;
}

function bindActions() {
    $( "#transitAccessibilityToggle" ).on('click', function () {
        setTimeout(function(){
            // Scroll to navigation if not visible.
            if(!checkVisible(document.getElementById('navEsittely'))) {
                document.getElementById('navEsittely').scrollIntoView();
            }
        }, 501);
        $('#transitAccessibilityMarker').toggleClass("fa-eye").toggleClass("fa-eye-slash");
        $(".transit-accessibility").toggle(500);
    });

    // Hide/Show sections on mobile
    $( "#newsDescriptionToggle" ).on('click', function () {
        // Perform only if we are showing the information..
        if($( "#newsDescriptionMarker" ).hasClass( "fa-eye" )) {
            setTimeout(function(){
                // Scroll to element if not visible or on mobile.
                if(!checkVisible(document.getElementById('newsDescriptionToggle')) || $(window).width() < 500) {
                    document.getElementById('newsDescriptionToggle').scrollIntoView();
                }
            }, 501);
        }
        $('#newsDescriptionMarker').toggleClass("fa-eye").toggleClass("fa-eye-slash");
        $(".news-description").toggle(500);
    });

    // Navigation events
    function navigateToDefault() {
        // Hide other sections & active nav styles.
        $("#navYhteystiedot").removeClass( "active" );
        $("#navPalvelut").removeClass( "active" );
        $(".yhteystiedot").hide(600);
        $(".palvelut").hide(600);
        // Show selected section + add active to nav
        $("#navEsittely").addClass( "active" );
        $(".esittely").show(600);
        // Hide infobox if visible.
        if(isInfoBoxVisible) {
            toggleInfoBox();
        }
        activeTab = 0;
    }

    $( "#navEsittely" ).on('click', function () {
        navigateToDefault();
    });

    $( "#navYhteystiedot" ).on('click', function () {
        // Hide other sections & active nav styles.
        $("#navEsittely").removeClass( "active" );
        $("#navPalvelut").removeClass( "active" );
        $(".esittely").hide(600);
        $(".palvelut").hide(600);
        // Show selected section + add active to nav.
        $("#navYhteystiedot").addClass( "active" );
        $(".yhteystiedot").show(600);
        // Hide infobox if visible.
        if(isInfoBoxVisible) {
            toggleInfoBox();
        }
        activeTab = 1;
        // Map zoom gets messed if the map is loaded before hiding the map div.
        if(!mapLoaded && lat != null) {
            setTimeout(function(){
                loadMap();
            }, 750);
            mapLoaded = true;
        }
    });
    // When item link is clicked.
    $( "#navPalvelut" ).on('click', function () {
        // Hide other sections & active nav styles.
        $("#navEsittely").removeClass( "active" );
        $("#navYhteystiedot").removeClass( "active" );
        $(".esittely").hide(600);
        $(".yhteystiedot").hide(600);
        // Show selected section + add active to nav.
        $("#navPalvelut").addClass( "active" );
        $(".palvelut").show(600);
        activeTab = 2;
    });

    // Activate arrow navigation when hovering over the navigation.
    $(".nav-pills").mouseenter(function () {
        if (!$(".nav-pills").hasClass('hovering')) {
            // If element is never focused, navigation may not work.
            $(".nav-pills").addClass('hovering');
            $(".nav-pills").focus();
            // If we blur instantly, arrow navigation won't work unless something has been clicked in the document.
            setTimeout(function () {
                $(".nav-pills").blur();
            }, 5);
            //$("#sliderForward").blur();
        }
    });
    $(".nav-pills").mouseleave(function () {
        if ($(".nav-pills").hasClass('hovering')) {
            $(".nav-pills").removeClass('hovering');
        }
    });

    if(activeTab === 1) {
        $("#navEsittely").removeClass( "active" );
        $("#navPalvelut").removeClass( "active" );
        $(".esittely").hide(0);
        $(".palvelut").hide(0);
        // Show selected section + add active to nav.
        $("#navYhteystiedot").addClass( "active" );
        $(".yhteystiedot").show(0);
        // If no timeout is used, map may not load correctly. If if clause is not inside the timeout, map won't be loaded if contacts is the default tab.
        setTimeout(function(){
            if(!mapLoaded && lat != null) {
                loadMap();mapLoaded = true;
            }
        }, 750);

        // Hide infobox if visible.
        if(isInfoBoxVisible) {
            toggleInfoBox();
        }
        // Navigate to default after the timeout, if tab is empty.
        setTimeout(function(){
            if(contactsIsEmpty) {
                navigateToDefault();
            }
        }, 100);

    }
    if(activeTab === 2) {
        // Hide other sections & active nav styles.
        $("#navEsittely").removeClass( "active" );
        $("#navYhteystiedot").removeClass( "active" );
        $(".esittely").hide(0);
        $(".yhteystiedot").hide(0);
        // Show selected section + add active to nav.
        $("#navPalvelut").addClass( "active" );
        $(".palvelut").show(0);
        // Hide infobox if visible.
        if(isInfoBoxVisible) {
            toggleInfoBox();
        }
        // Navigate to default after the timeout, if tab is empty.
        setTimeout(function(){
            if(noServices) {
                navigateToDefault();
            }
        }, 100);
    }
}

$(document).ready(function() {
    bindActions();
    $( "#closeInfoBtn" ).on('click', function () {
        toggleInfoBox(200);
    });
    // UI texts.
    if($('#librarySelectorTitle')) {
        $('#librarySelectorTitle').append(i18n.get("Kirjaston valinta"));
    }
    $('#navEsittely').append(i18n.get("Esittely"));
    $('#navYhteystiedot').append(i18n.get("Yhteystiedot"));
    $('#navPalvelut').append(i18n.get("Palvelut"));
    $('#newsDescriptionToggle').append(i18n.get("Ajankohtaista ja esittely"));
    $('#transitTitle').append(i18n.get("Liikenneyhteydet"));
    $('#accessibilityTitle').append(i18n.get("Saavutettavuus"));
    $('#socialMediaSr').append(i18n.get("Sosiaalinen media"));
    $('#scheludesSr').append(i18n.get("Aikataulut"));
    document.getElementById('expandSlider').title = i18n.get("Avaa tai sulje kokoruututila");
    // Yhteystiedot UI texts.
    document.getElementById('expandMap').title = i18n.get("Avaa tai sulje kokoruututila");
    $('#contactsTitle').append(i18n.get("Yhteystiedot"));
    $('#addressTh').append(i18n.get("Osoite"));
    $('#postalTh').append(i18n.get("Postiosoite"));
    $('#emailTh').append(i18n.get("Sähköposti"));
    // Phone numbers
    $('#phonesTitle').append(i18n.get("Puhelinnumerot"));
    $('#sectionTh').append(i18n.get("Osasto"));
    $('#numberTh').append(i18n.get("Numero"));
    // Staff
    $('#staffTitle').append(i18n.get("Henkilökunta"));
    $('#nameTh').append(i18n.get("Nimi"));
    $('#titleTh').append(i18n.get("Työnimike"));
    $('#contactDetailsTh').append(i18n.get("Yhteystiedot"));
    // Services
    $('#servicesInfo').append(i18n.get("Palvelun lisätiedot"));
    $('#closeInfoBtn').append(i18n.get("Sulje"));
    // Apparently IOS does not support Full screen API:  https://github.com/googlevr/vrview/issues/112
    // Hide fullscreen toggler & increase slider/map sizes a bit on larger screens to compensate the lack of full screen.
    // Since navigation buttons on slider do not apparently work either, hide them too... we got swiping after all!
    // https://stackoverflow.com/questions/7944460/detect-safari-browser
    var isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
        navigator.userAgent &&
        navigator.userAgent.indexOf('CriOS') == -1 &&
        navigator.userAgent.indexOf('FxiOS') == -1;
    if(isSafari || /^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
        $('#expandSlider').css('display', 'none');
        $('#expandMap').css('display', 'none');
        if($(window).width() > 767) {
            $('.small-slider').css('height', '330px');
            $('#contactsFirstCol').addClass("col-md-12");
            $('#contactsFirstCol').removeClass("col-md-8");
            $('#contactsMapCol').addClass("col-md-12");
            $('#contactsMapCol').removeClass("col-md-col-md-4");
            $('#contactsMapCol').css('height', '500px');
        }
    }
    // Clone page, to be restored if library selector is used.
    divClone = $("#pageContainer").clone();
    // Fetch details.
    fetchInformation(lang);
    fetchImagesAndSocialMedia(library);
}); // OnReady
