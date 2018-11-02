// Get global library/lang parameters from the script.
var library = '';
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
library = getParamValue('lib');
lang = getParamValue('lang');
/*

 Alternative:   <script data-library="85111" data-lang="fi" src="../../js/main.js" type="text/javascript"></script>*/
// If lang and lib are undefined (not used in iframe)
if(lang == undefined && library == undefined){
    var scripts = document.getElementsByTagName('script');
    var lastScript = scripts[scripts.length-1];
    var scriptName = lastScript;
    library = scriptName.getAttribute('data-library'),
        lang = scriptName.getAttribute('data-lang')
}

// Set html lang, init translations & moment locale
$("html").attr("lang", lang);
var i18n = $('body').translate({lang: lang, t: dict}); // Use the correct language
moment.locale(lang);
var HHmmFormat = 'HH:mm';


function isBefore(timeOne, timeTwo) {
    if(moment(timeOne, HHmmFormat).isBefore(moment(timeTwo, HHmmFormat))) {
        return true;
    } else {
        return false;
    }
}

function isSame(timeOne, timeTwo) {
    if(moment(timeOne, HHmmFormat).isSame(moment(timeTwo, HHmmFormat))) {
        return true;
    } else {
        return false;
    }
}

function isSameOrBefore(timeOne, timeTwo) {
    if(moment(timeOne, HHmmFormat).isBefore(moment(timeTwo, HHmmFormat)) ||
        (moment(timeOne, HHmmFormat).isSame(moment(timeTwo, HHmmFormat)))) {
        return true;
    } else {
        return false;
    }
}

var weekCounter = 0;
function getWeekSchelude(direction, lib) {
    // If no library is provided, use the default option.
    if(lib === undefined) {
        lib = library;
    }
    // +1 or -1;
    weekCounter = weekCounter + direction;
    // Do not allow going more than 10 weeks to the past or for more than 26 weeks.
    if(weekCounter < -10) {
        weekCounter = -10;
        return;
    }
    if(weekCounter > 26) {
        weekCounter = 26;
        return;
    }
    // Display week number.
    $( "#weekNumber" ).html( i18n.get("Viikko") + ' ' + moment().add(weekCounter, 'weeks').format('W'));
    $.getJSON("https://api.kirjastot.fi/v3/library/" + lib + "?lang=" + lang +
        "&with=schedules&period.start=" + weekCounter + "w&period.end=" + weekCounter + "w", function(data) {
        var date = moment().add(weekCounter, 'weeks');
        begin = moment(date).startOf('week').isoWeekday(1);
        // If lang == en, add 1 week. Otherwise last week will be shown... but why?
        if(lang == "en") {
            date = moment().add(weekCounter  + 1, 'weeks');
            begin = moment(date).startOf('week').isoWeekday(1);
        }
        var str = '';
        for (var i=0; i<7; i++) {
                // If today, add some colourfull classes!
                var isTodayClass = '';
                var dayInfo = '';
                var selfServiceInfo = '';
                var magazineInfo = '';
                var rowspanCount = 1;
                // Scheludes for: combined, selfServiceBefore, MagazinesBefore,  staffToday, selfServiceAfter & magazinesAfter
                var isClosed = true;
                var dayStart = '';
                var dayEnd = '';
                var selfServiceBefore = '';
                var magazinesBefore = '';
                var staffToday = '';
                var selfServiceAfter = '';
                var magazinesAfter = '';
                // ScheludeRow will be used to bring things together
                var scheludeRow = '';
                // Variables for schelude times.
                var staffPresentStart = '';
                var staffPresentEnd = '';
                var selfServiceStart = '';
                var selfServiceEnd = '';
                var magazinesStart = '';
                var magazinesEnd = '';
                // Capitalize 1st letter of dayname.
                var dayName = begin.format("dddd");
                dayName = dayName[0].toUpperCase() + dayName.substr(1);
                // If main schelude is not null (staff is present)
                if(data.schedules[i] != null) {
                    if (data.schedules[i].opens != null) {
                        // Increase rowspanCount to be used with DD.M. for each open section.
                        rowspanCount = rowspanCount + 1;
                        staffPresentStart = data.schedules[i].opens;
                        staffPresentEnd = data.schedules[i].closes;
                        dayStart = staffPresentStart;
                        dayEnd = staffPresentEnd;
                        // Store the row as a variable.
                        staffToday = '<tr class="time--sub time isTodayClass time--with-staff">' +
                            '<td class="trn"><i class="fa fa-long-arrow-right"></i> ' + i18n.get("Henkilökunta paikalla") + '</td>' +
                            '<td>' + staffPresentStart + ' – ' + staffPresentEnd + '</td>' +
                            '</tr>';
                        // Set isClosed to false.
                        isClosed = false;
                    }
                    // Info row.
                    if (data.schedules[i].info != null && data.schedules[i].info.length != 0) {
                        rowspanCount = rowspanCount +1;
                        dayInfo = '<tr class="time--sub isTodayClass">' +
                            '<td colspan="2"><i style="float: left" class="fa fa-info-circle" > </i><span class="info-text"> ' +  data.schedules[i].info + '</span></td>' +
                            '</tr>';
                    }
                }
                // Self service times.
            if(data.schedules[i] != null) {
                // selfservice times
                if(data.schedules[i].sections.selfservice != null) {
                    if(data.schedules[i].sections.selfservice.times[0] != null) {
                        // Get scheludes and check if starts before staff is present.
                        selfServiceStart = data.schedules[i].sections.selfservice.times[0].opens;
                        selfServiceEnd = data.schedules[i].sections.selfservice.times[0].closes;
                        if (isSameOrBefore(selfServiceStart, staffPresentStart)) {
                            // check if selfservice closes after general opening times
                            if (isSameOrBefore(staffPresentEnd, selfServiceEnd) ||
                                isSame(staffPresentStart, selfServiceStart)) {
                                if(!isSame(staffPresentStart, selfServiceStart)) {
                                    rowspanCount = rowspanCount + 1;
                                    isClosed = false;
                                    selfServiceBefore = '<tr class="time--sub time isTodayClass time--no-staff">' +
                                        '<td><i class="fa fa-long-arrow-right"></i> ' + i18n.get("Omatoimiaika") + '</td>' +
                                        '<td>' + selfServiceStart + ' – ' + staffPresentStart + '</td>' +
                                        '</tr>';
                                }
                                // If selfService does not close at the same time as the main opening time.
                                if(!isSame(staffPresentEnd, selfServiceEnd)) {
                                    if (!isBefore(selfServiceEnd, staffPresentEnd)) {
                                        if(isBefore(selfServiceStart, staffPresentEnd)) {
                                            selfServiceStart = staffPresentEnd;
                                        }
                                        rowspanCount = rowspanCount +1;
                                        isClosed = false;
                                        selfServiceAfter = '<tr class="time--sub time isTodayClass time--no-staff">' +
                                            '<td><i class="fa fa-long-arrow-right"></i> ' + i18n.get("Omatoimiaika") + ' </td>' +
                                            '<td>' + selfServiceStart + ' – ' + selfServiceEnd + '</td>' +
                                            '</tr>';
                                    }
                                }
                            }
                            else {
                                rowspanCount = rowspanCount + 1;
                                isClosed = false;
                                selfServiceBefore = '<tr class="time--sub time isTodayClass time--no-staff">' +
                                    '<td><i class="fa fa-long-arrow-right"></i> ' + i18n.get("Omatoimiaika") + '</td>' +
                                    '<td>' + selfServiceStart + ' – ' + selfServiceEnd + '</td>' +
                                    '</tr>';
                            }
                            if (dayStart === '' || !isBefore(dayStart, selfServiceStart)) {
                                dayStart = selfServiceStart;
                            }
                            if (dayEnd === '' || isBefore(dayEnd, selfServiceEnd)) {
                                dayEnd = selfServiceEnd;
                            }
                            if (data.schedules[i].sections.selfservice.times[1] != null) {
                                rowspanCount = rowspanCount +1;
                                selfServiceStart = data.schedules[i].sections.selfservice.times[1].opens;
                                selfServiceEnd = data.schedules[i].sections.selfservice.times[1].closes;
                                selfServiceAfter = '<tr class="time--sub time isTodayClass time--no-staff">' +
                                    '<td><i class="fa fa-long-arrow-right"></i> ' + i18n.get("Omatoimiaika") + '</td>' +
                                    '<td>' + selfServiceStart + ' – ' + selfServiceEnd + '</td>' +
                                    '</tr>';
                                if (dayEnd === '' || isBefore(dayEnd, selfServiceEnd)) {
                                    dayEnd = selfServiceEnd;
                                }
                            }
                        }
                        // If selfService does not start before staff is present or no staff is present at all.
                        else {
                            rowspanCount = rowspanCount + 1;
                            isClosed = false;
                            selfServiceAfter = '<tr class="time--sub time isTodayClass time--no-staff">' +
                                '<td><i class="fa fa-long-arrow-right"></i> ' + i18n.get("Omatoimiaika") + '</td>' +
                                '<td>' + selfServiceStart + ' – ' + selfServiceEnd + '</td>' +
                                '</tr>';
                            if (dayStart === '' || !isBefore(dayStart, selfServiceStart)) {
                                dayStart = selfServiceStart;
                            }
                            if (dayEnd === '' || isBefore(dayEnd, selfServiceEnd)) {
                                dayEnd = selfServiceEnd;
                            }
                        }
                    }
                    // Info row.
                    if(data.schedules[i].sections.selfservice != null) {
                        if (data.schedules[i].sections.selfservice.info != null &&
                            data.schedules[i].sections.selfservice.info !== undefined) {
                            if(data.schedules[i].sections.selfservice.info.length != 0) {
                                rowspanCount = rowspanCount +1;
                                selfServiceInfo = '<tr class="time--sub isTodayClass">' +
                                    '<td colspan="2"><i style="float: left" class="fa fa-info-circle" > </i><span class="info-text"> ' +  data.schedules[i].sections.selfService.info + '</span></td>' +
                                    '</tr>';
                            }
                        }
                    }

                }
                // Magazines dep
                if(data.schedules[i].sections.magazines != null) {
                    if(data.schedules[i].sections.magazines.times[0] != null) {
                        // Get scheludes and check if starts before staff is present.
                        magazinesStart = data.schedules[i].sections.magazines.times[0].opens;
                        magazinesEnd = data.schedules[i].sections.magazines.times[0].closes;
                        if (isSameOrBefore(magazinesStart, staffPresentStart)) {
                            // If magazines don't close at the same time as the main opening time.
                            if(isSameOrBefore(staffPresentEnd, magazinesEnd)) {
                                // Don't show the row if same starting time with the main times (9-9)
                                if(!isSame(staffPresentStart, magazinesStart)) {
                                    rowspanCount = rowspanCount + 1;
                                    isClosed = false;
                                    magazinesBefore = '<tr class="time--sub time isTodayClass time--no-staff">' +
                                        '<td><i class="fa fa-long-arrow-right"></i> ' + i18n.get("Lehtilukusali") + '</td>' +
                                        '<td>' + magazinesStart + ' – ' + staffPresentStart + '</td>' +
                                        '</tr>';
                                }
                            }
                             else {
                                rowspanCount = rowspanCount + 1;
                                isClosed = false;
                                magazinesBefore = '<tr class="time--sub time isTodayClass time--no-staff">' +
                                '<td><i class="fa fa-long-arrow-right"></i> ' + i18n.get("Lehtilukusali") + '</td>' +
                                '<td>' + magazinesStart + ' – ' + magazinesEnd + '</td>' +
                                '</tr>';
                            }
                            if (dayStart === '' || !isBefore(dayStart, magazinesStart)) {
                                dayStart = magazinesStart;
                            }
                            if (dayEnd === '' || isBefore(dayEnd, magazinesEnd)) {
                                dayEnd = magazinesEnd;
                            }
                            if (data.schedules[i].sections.magazines.times[1] != null) {
                                rowspanCount = rowspanCount +1;
                                magazinesStart = data.schedules[i].sections.magazines.times[1].opens;
                                magazinesEnd = data.schedules[i].sections.magazines.times[1].closes;
                                magazinesAfter = '<tr class="time--sub time isTodayClass time--no-staff">' +
                                    '<td><i class="fa fa-long-arrow-right"></i> ' + i18n.get("Lehtilukusali") + '</td>' +
                                    '<td>' + magazinesStart + ' – ' + magazinesEnd + '</td>' +
                                    '</tr>';
                                if (dayEnd === '' || isBefore(dayEnd, magazinesEnd)) {
                                    dayEnd = magazinesEnd;
                                }
                            }
                        }
                        // If magazines does not start before staff is present or no staff is present at all.
                        else {
                            rowspanCount = rowspanCount + 1;
                            isClosed = false;
                            magazinesAfter = '<tr class="time--sub time isTodayClass time--no-staff">' +
                                '<td><i class="fa fa-long-arrow-right"></i> ' + i18n.get("Lehtilukusali") + '</td>' +
                                '<td>' + magazinesStart + ' – ' + magazinesEnd + '</td>' +
                                '</tr>';
                            if (dayStart === '' || !isBefore(dayStart, magazinesStart)) {
                                dayStart = magazinesStart;
                            }
                            if (dayEnd === '' || isBefore(dayEnd, magazinesEnd)) {
                                dayEnd = magazinesEnd;
                            }
                        }
                    }
                    if (data.schedules[i].sections.magazines.info != null && data.schedules[i].sections.magazines.info.length != 0) {
                        rowspanCount = rowspanCount +1;
                        magazineInfo = '<tr class="time--sub isTodayClass">' +
                            '<td colspan="2"><i style="float: left" class="fa fa-info-circle" > </i><span class="info-text"> ' +  data.schedules[i].sections.magazines.info + '</span></td>' +
                            '</tr>';
                    }
                }
            }
                // If today, apply 'today' -class.
                if(moment(begin).isSame(moment(), 'day')) {
                    var isTodayClass =  "is-closed";
                    // var time = moment() gives you current time. no format required.
                    var time = moment(moment(), HHmmFormat),
                        openingTime = moment(staffPresentStart, HHmmFormat),
                        closingTime = moment(staffPresentEnd, HHmmFormat);
                    // Check if staff is present.
                    if (time.isBetween(openingTime, closingTime)) {
                        isTodayClass = "is-open";
                    }
                    // If not, check if self service time.
                    else {
                        var time = moment(moment(), HHmmFormat),
                            openingTime = moment(dayStart, HHmmFormat),
                            closingTime = moment(dayEnd, HHmmFormat);
                        if (time.isBetween(openingTime, closingTime)) {
                            isTodayClass = "is-self-service";
                        }
                    }
                    // Apply the class to the sections.
                    selfServiceBefore = selfServiceBefore.replace("isTodayClass", isTodayClass);
                    magazinesBefore = magazinesBefore.replace("isTodayClass", isTodayClass);
                    staffToday = staffToday.replace("isTodayClass", isTodayClass);
                    selfServiceAfter = selfServiceAfter.replace("isTodayClass", isTodayClass);
                    magazinesAfter = magazinesAfter.replace("isTodayClass", isTodayClass);
                    dayInfo = dayInfo.replace("isTodayClass", isTodayClass);
                    selfServiceInfo = selfServiceInfo.replace("isTodayClass", isTodayClass);
                    magazineInfo = magazineInfo.replace("isTodayClass", isTodayClass);
                }
                // If dayInfo is the same as selfServiceInfo or magazineInfo, don't show duplicated info.
                if(dayInfo !== "" && dayInfo === selfServiceInfo) {
                    selfServiceInfo = '';
                    rowspanCount = rowspanCount -1;
                }
                if(dayInfo !== "" && dayInfo === magazineInfo) {
                    magazineInfo = '';
                    rowspanCount = rowspanCount -1;
                }

            // If no selfService or magazines, don't display a separate row for "Staff present".
            if(selfServiceBefore.length === 0 && magazinesBefore.length === 0 &&
                selfServiceAfter.length === 0 && magazinesAfter.length === 0 ) {
                if(staffToday.length !== 0) {
                    staffToday = '';
                    rowspanCount = rowspanCount -1;
                }
            }
            if (isClosed) {
                scheludeRow = '<tr class="time ' + isTodayClass + '">' +
                '<th scope="row">' +
                    '<time datetime="' + begin.format('YYYY-MM-DD') + '">' + begin.format('D.M.') + '</time>' +
                '</th>' +
                    '<td>' + dayName + '</td>' +
                    '<td>' + i18n.get("Suljettu") + '</td>' +
                '</tr>'
            } else {
                scheludeRow = '<tr class="time ' + isTodayClass + '">' +
                '<th scope="row" rowspan="' + rowspanCount + '">' +
                    '<time datetime="' + begin.format('YYYY-MM-DD') + '">' + begin.format('D.M.') + '</time>' +
                '</th>' +
                    '<td>' + dayName + '</td>' +
                    '<td><time datetime="' + dayStart + '">' + dayStart + '</time> – <time datetime="' + dayEnd + '">'
                    + dayEnd + '</time></td></tr>' + selfServiceBefore + magazinesBefore + staffToday +
                    selfServiceAfter + magazinesAfter + dayInfo + selfServiceInfo + magazineInfo;
            }
            str += scheludeRow;
            begin.add(1, 'd');
        }
        $( "#weekSchelude" ).html( str );
        // If document has no title, set it to Library name.
        if(document.title === '') {
            if(data.name != null) {
                document.title = data.name;
            }
        }
    });
}

function bindScheduleKeyNavigation() {
    // This prevents the page from jumping to "nextWeek", when hovering over the schedules.
    var element = document.getElementById('nextWeek');
    element.focus({
        preventScroll: false
    });
    // Blur, since the previous thing would leave focus to the element by default.
    $("#nextWeek").blur();
    // Activate arrow navigation when hovering over the schedules.
    $("#schedules").mouseenter (function(){
        if(!$(".library-schedules").hasClass('hovering')) {
            $(".library-schedules").addClass('hovering');
            // If we blur instantly, arrow navigation won't work unless something has been clicked in the document.
            setTimeout(function(){ $("#nextWeek").blur(); }, 5);
        }
    });
    $( "#schedules" ).mouseleave(function() {
        $(".library-schedules").removeClass('hovering');
    });
}

$(document).ready(function() {
    // Scheludes
    getWeekSchelude(0, library);
    // UI texts.
    $('#scheludesSr').append(i18n.get("Aikataulut"));
    bindScheduleKeyNavigation();
    // Detect left/right on schedules or move backwards/forwards in slider if in fullscreen mode or when hovering small slider..
    $(document).keydown(function(e) {
        switch(e.which) {
            case 37: // left
                if($(".library-schedules").hasClass("hovering")
                    || $("#lastWeek").is(":focus") || $("#nextWeek").is(":focus")) {
                    $("#lastWeek").focus();
                    $("#lastWeek").click();
                }
                // Slider hovering is not really used with schedules, but it's better to do it here instead of adding another $(document).keydown(function(e) {
                else if(!$("#sliderBox").hasClass("small-slider") || $("#sliderBox").hasClass("hovering")
                    || $("#sliderPrevious").is(":focus") || $("#sliderForward").is(":focus")) {
                    $("#sliderPrevious").focus();
                    $("#sliderPrevious").click();
                }
                else if($(".nav-pills").hasClass("hovering")
                    || $("#navEsittely").is(":focus") || $("#navYhteystiedot").is(":focus")|| $("#navPalvelut").is(":focus")) {
                    if(activeTab === 1) {
                        $("#navEsittely").focus();
                        $("#navEsittely").click();
                    }
                    else if(activeTab === 2) {
                        $("#navYhteystiedot").focus();
                        $("#navYhteystiedot").click();
                    }
                }
                break;
            case 39: // right
                if($(".library-schedules").hasClass("hovering")
                    || $("#lastWeek").is(":focus") || $("#nextWeek").is(":focus")) {
                    $("#nextWeek").focus();
                    $("#nextWeek").click();
                }
                // Slider hovering is not really used with schedules, but it's better to do it here instead of adding another $(document).keydown(function(e) {
                else if(!$("#sliderBox").hasClass("small-slider") || $("#sliderBox").hasClass("hovering")
                    || $("#sliderPrevious").is(":focus") || $("#sliderForward").is(":focus")) {
                    // Go to slide
                    $("#sliderForward").focus();
                    $("#sliderForward").click();
                }
                else if($(".nav-pills").hasClass("hovering")
                    || $("#navEsittely").is(":focus") || $("#navYhteystiedot").is(":focus")|| $("#navPalvelut").is(":focus")) {
                    if(activeTab === 0) {
                        $("#navYhteystiedot").focus();
                        $("#navYhteystiedot").click();
                    }
                    else if(activeTab === 1) {
                        $("#navPalvelut").focus();
                        $("#navPalvelut").click();
                    }
                }
                break;
            default: return; // exit this handler for other keys
        }
    });

    // Swiping for schedules & image slider. https://stackoverflow.com/questions/15084675/how-to-implement-swipe-gestures-for-mobile-devices
    function detectswipe(el,func) {
        swipe_det = new Object();
        swipe_det.sX = 0; swipe_det.sY = 0; swipe_det.eX = 0; swipe_det.eY = 0;
        var min_x = 30;  // min x swipe for horizontal swipe
        var max_x = 1;  // max x difference for vertical swipe (ignored)
        var min_y = 1;  // min y swipe for vertical swipe (ignored)
        var max_y = 60;  // max y difference for horizontal swipe
        var direc = "";
        ele = document.getElementById(el);
        ele.addEventListener('touchstart',function(e){
            var t = e.touches[0];
            swipe_det.sX = t.screenX;
            swipe_det.sY = t.screenY;
        },false);
        ele.addEventListener('touchmove',function(e){
            var t = e.touches[0];
            swipe_det.eX = t.screenX;
            swipe_det.eY = t.screenY;
        },false);
        ele.addEventListener('touchend',function(e){
            // horizontal detection
            if ((((swipe_det.eX - min_x > swipe_det.sX) || (swipe_det.eX + min_x < swipe_det.sX)) && ((swipe_det.eY < swipe_det.sY + max_y) && (swipe_det.sY > swipe_det.eY - max_y) && (swipe_det.eX > 0)))) {
                e.preventDefault();
                if(swipe_det.eX > swipe_det.sX) direc = "r";
                else direc = "l";
            }
            // vertical detection
            else if ((((swipe_det.eY - min_y > swipe_det.sY) || (swipe_det.eY + min_y < swipe_det.sY)) && ((swipe_det.eX < swipe_det.sX + max_x) && (swipe_det.sX > swipe_det.eX - max_x) && (swipe_det.eY > 0)))) {
                return;
                //if(swipe_det.eY > swipe_det.sY) direc = "d";
                //else direc = "u";
            }
            // Call the swipeNavigation function with the right direction.
            if (direc != "") {
                if(typeof func == 'function') func(el,direc);
            }
            direc = "";
            swipe_det.sX = 0; swipe_det.sY = 0; swipe_det.eX = 0; swipe_det.eY = 0;
        },false);
    }
    // Navigate schedules or image slider by swiping.
    function swipeNavigation(el,d) {
        if (el === "schedules") {
            //alert("Thou swiped on element with id '"+el+"' to "+d+" direction");
            if(d === "r") {
                $("#lastWeek").focus();
                $("#lastWeek").click();
            } else if (d === "l") {
                $("#nextWeek").focus();
                $("#nextWeek").click();
            }
        }
        else if(el === "sliderBox") {
            if(d === "r") {
                $("#sliderPrevious").focus();
                $("#sliderPrevious").click();
            } else if (d === "l") {
                $("#sliderForward").focus();
                $("#sliderForward").click();
            }
        }
    }
    // Add swiping detection for schedules & sliderbox if available.
    detectswipe("schedules", swipeNavigation);
    if(document.getElementById("sliderBox") != null) {
        detectswipe("sliderBox", swipeNavigation);
    }
}); // OnReady
