moment.locale(lang);
var HHmmFormat = 'HH:mm';

function isBefore(timeOne, timeTwo) {
    return !!moment(timeOne, HHmmFormat).isBefore(moment(timeTwo, HHmmFormat));
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

/* Split string after the word in the middle
* https://stackoverflow.com/questions/18087416/split-string-in-half-by-word */
function splitString(s) {
    var middle = Math.floor(s.length / 2);
    var before = s.lastIndexOf(' ', middle);
    var after = s.indexOf(' ', middle + 1);
    if (before == -1 || (after != -1 && middle - before >= after - middle)) {
        middle = after;
    } else {
        middle = before;
    }
    var s1 = s.substr(0, middle);
    var s2 = s.substr(middle + 1);
    return s1 + '<br>' + s2;
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
        // totalRows is used to dynamically adjust font sizes for info-screens.
        var totalRows = 0;
        for (var i=0; i<7; i++) {
            // If today, add some colourful classes!
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
            function increaseRowCount(isInfo) {
                // Increase rowspanCount to be used with DD.M. for each open section.
                rowspanCount = rowspanCount + 1;
                // Don't set library as open for info rows
                if(!isInfo) {
                    isClosed = false;
                }
            }
            // If schedules exists
            if(data.schedules[i] != null) {
                // If main schelude is not null (staff is present)
                if (data.schedules[i].opens != null) {
                    staffPresentStart = data.schedules[i].opens;
                    staffPresentEnd = data.schedules[i].closes;
                    dayStart = staffPresentStart;
                    dayEnd = staffPresentEnd;
                    // Store the row as a variable.
                    staffToday = '<tr class="time--sub time isTodayClass time--with-staff">' +
                        '<td class="trn"><i class="fa fa-level-up fa-rotate-90"></i> ' + i18n.get("Henkilökunta paikalla") + '</td>' +
                        '<td>' + staffPresentStart + ' – ' + staffPresentEnd + '</td>' +
                        '</tr>';
                    increaseRowCount();
                }
                // Info row for main schedules..
                if (data.schedules[i].info != null && data.schedules[i].info.length != 0) {
                    if(JSON.stringify(data.schedules[i].info).indexOf("null") === -1) {
                        // Split long info strings in half, ignore longer than 60/80 chars.
                        var infoText = data.schedules[i].info;
                        if(largeSchedules) {
                            if (infoText.length > 30 && infoText.length < 80) {
                                infoText = splitString(infoText);
                                totalRows = totalRows +1;
                            }
                            else if(infoText.length > 80) {
                                totalRows = totalRows +1;
                            }
                        }
                        else {
                            if (infoText.length > 40 && infoText.length < 90) {
                                infoText = splitString(infoText);
                                totalRows = totalRows +1;
                            }
                            else if(infoText.length > 90) {
                                totalRows = totalRows +1;
                            }
                        }
                        dayInfo = '<tr class="info-row time--sub isTodayClass">' +
                            '<td colspan="2"><span class="info-text"><i class="fa fa-info-circle" > </i> ' + infoText + '</span></td>' +
                            '</tr>';
                        increaseRowCount(true);
                    }
                }
                // Self service times.
                if(data.schedules[i].sections.selfservice != null) {
                    // Info row for selfService.
                    if (data.schedules[i].sections.selfservice.info != null &&
                        data.schedules[i].sections.selfservice.info !== undefined) {
                        if(data.schedules[i].sections.selfservice.info.length != 0) {
                            // Apparently the API has started returning {"fi":null} in JSON if no English info is found...
                            if(JSON.stringify(data.schedules[i].sections.selfservice.info).indexOf("null") === -1) {
                                selfServiceInfo = '<tr class="time--sub isTodayClass">' +
                                    '<td colspan="2"><span class="info-text"><i class="fa fa-info-circle" > </i>' +
                                    data.schedules[i].sections.selfService.info + '</span></td>' +
                                    '</tr>';
                                increaseRowCount(true);
                            }
                        }
                    }
                    if(data.schedules[i].sections.selfservice.times[0] != null) {
                        // Get scheludes
                        selfServiceStart = data.schedules[i].sections.selfservice.times[0].opens;
                        selfServiceEnd = data.schedules[i].sections.selfservice.times[0].closes;
                        // If selfService opens at the same as the main opening time & closes at the same time or before it.
                        if (isSame(staffPresentStart, selfServiceStart) && isSameOrBefore(selfServiceEnd, staffPresentEnd)) {
                            // Return silently.. We could put the rest inside of inverted version of this if clause, but that would add an another indentation.
                        }
                        // If selfService starts at the same time as the main opening (but closes after it).
                        else if (isSame(staffPresentStart, selfServiceStart)) {
                            selfServiceStart = staffPresentEnd;
                            selfServiceAfter = '<tr class="time--sub time isTodayClass time--no-staff">' +
                                '<td><i class="fa fa-level-up fa-rotate-90"></i> ' + i18n.get("Omatoimiaika") + ' </td>' +
                                '<td>' + selfServiceStart + ' – ' + selfServiceEnd + '</td>' +
                                '</tr>';
                            increaseRowCount();
                        }
                        // Self service starts before the main opening time.
                        else if (isBefore(selfServiceStart, staffPresentStart)) {
                            dayStart = selfServiceStart;
                            // If selfService ends after the main opening time.
                            if (isBefore(staffPresentEnd, selfServiceEnd)) {
                                // Show selfService before up to staffPresentStart
                                selfServiceBefore = '<tr class="time--sub time isTodayClass time--no-staff">' +
                                    '<td><i class="fa fa-level-up fa-rotate-90"></i> ' + i18n.get("Omatoimiaika") + '</td>' +
                                    '<td>' + selfServiceStart + ' – ' + staffPresentStart + '</td>' +
                                    '</tr>';
                                increaseRowCount();
                                // Add the remaining time as selfServiceAfter
                                selfServiceAfter = '<tr class="time--sub time isTodayClass time--no-staff">' +
                                    '<td><i class="fa fa-level-up fa-rotate-90"></i> ' + i18n.get("Omatoimiaika") + '</td>' +
                                    '<td>' + staffPresentEnd + ' – ' + selfServiceEnd + '</td>' +
                                    '</tr>';
                                dayEnd = selfServiceEnd;
                                increaseRowCount();
                            }
                            // SelfService closes before staff is present.
                            else {
                                selfServiceBefore = '<tr class="time--sub time isTodayClass time--no-staff">' +
                                    '<td><i class="fa fa-level-up fa-rotate-90"></i> ' + i18n.get("Omatoimiaika") + '</td>' +
                                    '<td>' + selfServiceStart + ' – ' + staffPresentStart + '</td>' +
                                    '</tr>';
                                increaseRowCount();
                            }
                        }
                        else {
                            selfServiceAfter = '<tr class="time--sub time isTodayClass time--no-staff">' +
                                '<td><i class="fa fa-level-up fa-rotate-90"></i> ' + i18n.get("Omatoimiaika") + ' </td>' +
                                '<td>' + selfServiceStart + ' – ' + selfServiceEnd + '</td>' +
                                '</tr>';
                            increaseRowCount();
                        }
                        if (dayStart === '' || !isBefore(dayStart, selfServiceStart)) {
                            dayStart = selfServiceStart;
                        }
                        if (dayEnd === '' || isBefore(dayEnd, selfServiceEnd)) {
                            dayEnd = selfServiceEnd;
                        }
                        if (data.schedules[i].sections.selfservice.times[1] != null) {
                            selfServiceStart = data.schedules[i].sections.selfservice.times[1].opens;
                            selfServiceEnd = data.schedules[i].sections.selfservice.times[1].closes;
                            selfServiceAfter = '<tr class="time--sub time isTodayClass time--no-staff">' +
                                '<td><i class="fa fa-level-up fa-rotate-90"></i> ' + i18n.get("Omatoimiaika") + '</td>' +
                                '<td>' + selfServiceStart + ' – ' + selfServiceEnd + '</td>' +
                                '</tr>';
                            if (dayEnd === '' || isBefore(dayEnd, selfServiceEnd)) {
                                dayEnd = selfServiceEnd;
                            }
                            increaseRowCount();
                        }
                    }
                } // Self service
                // Magazines.
                if(data.schedules[i].sections.magazines != null) {
                    // Info row for magazines.
                    if (data.schedules[i].sections.magazines.info != null &&
                        data.schedules[i].sections.magazines.info !== undefined) {
                        if(data.schedules[i].sections.magazines.info.length != 0) {
                            // Apparently the API has started returning {"fi":null} in JSON if no English info is found...
                            if(JSON.stringify(data.schedules[i].sections.magazines.info).indexOf("null") === -1) {
                                magazineInfo = '<tr class="info-row time--sub isTodayClass">' +
                                    '<td colspan="2"><span class="info-text"><i class="fa fa-info-circle" > </i> ' +
                                    data.schedules[i].sections.magazines.info + '</span></td>' +
                                    '</tr>';
                                increaseRowCount(true);
                            }
                        }
                    }
                    if(data.schedules[i].sections.magazines.times[0] != null) {
                        // Get scheludes
                        magazinesStart = data.schedules[i].sections.magazines.times[0].opens;
                        magazinesEnd = data.schedules[i].sections.magazines.times[0].closes;
                        // If opens at the same as the main opening time & closes at the same time or before it.
                        if (isSame(staffPresentStart, magazinesStart) && isSameOrBefore(magazinesEnd, staffPresentEnd)) {
                            // Return silently.. We could put the rest inside of inverted version of this if clause, but that would add an another indentation.
                        }
                        // If starts at the same time as the main opening (but closes after it).
                        else if (isSame(staffPresentStart, magazinesStart)) {
                            magazinesStart = staffPresentEnd;
                            magazinesAfter = '<tr class="time--sub time isTodayClass time--no-staff">' +
                                '<td><i class="fa fa-level-up fa-rotate-90"></i> ' + i18n.get("Lehtilukusali") + ' </td>' +
                                '<td>' + magazinesStart + ' – ' + magazinesEnd + '</td>' +
                                '</tr>';
                            increaseRowCount();
                        }
                        // Starts before the main opening time.
                        else if (isBefore(magazinesStart, staffPresentStart)) {
                            dayStart = magazinesStart;
                            // Ends after the main opening time.
                            if (isBefore(staffPresentEnd, magazinesEnd)) {
                                // Show before up to staffPresentStart
                                magazinesBefore = '<tr class="time--sub time isTodayClass time--no-staff">' +
                                    '<td><i class="fa fa-level-up fa-rotate-90"></i> ' + i18n.get("Lehtilukusali") + '</td>' +
                                    '<td>' + magazinesStart + ' – ' + staffPresentStart + '</td>' +
                                    '</tr>';
                                increaseRowCount();
                                // Add the remaining time as magazinesAfter
                                magazinesAfter = '<tr class="time--sub time isTodayClass time--no-staff">' +
                                    '<td><i class="fa fa-level-up fa-rotate-90"></i> ' + i18n.get("Lehtilukusali") + '</td>' +
                                    '<td>' + staffPresentEnd + ' – ' + magazinesEnd + '</td>' +
                                    '</tr>';
                                dayEnd = magazinesEnd;
                                increaseRowCount();
                            }
                            // Closes before staff is present.
                            else {
                                magazinesBefore = '<tr class="time--sub time isTodayClass time--no-staff">' +
                                    '<td><i class="fa fa-level-up fa-rotate-90"></i> ' + i18n.get("Lehtilukusali") + '</td>' +
                                    '<td>' + magazinesStart + ' – ' + staffPresentStart + '</td>' +
                                    '</tr>';
                                increaseRowCount();
                            }
                        }
                        else {
                            magazinesAfter = '<tr class="time--sub time isTodayClass time--no-staff">' +
                                '<td><i class="fa fa-level-up fa-rotate-90"></i> ' + i18n.get("Lehtilukusali") + ' </td>' +
                                '<td>' + magazinesStart + ' – ' + magazinesEnd + '</td>' +
                                '</tr>';
                            increaseRowCount();
                        }
                        if (dayStart === '' || !isBefore(dayStart, magazinesStart)) {
                            dayStart = magazinesStart;
                        }
                        if (dayEnd === '' || isBefore(dayEnd, magazinesEnd)) {
                            dayEnd = magazinesEnd;
                        }
                        if (data.schedules[i].sections.magazines.times[1] != null) {
                            magazinesStart = data.schedules[i].sections.magazines.times[1].opens;
                            magazinesEnd = data.schedules[i].sections.magazines.times[1].closes;
                            magazinesAfter = '<tr class="time--sub time isTodayClass time--no-staff">' +
                                '<td><i class="fa fa-level-up fa-rotate-90"></i> ' + i18n.get("Lehtilukusali") + '</td>' +
                                '<td>' + magazinesStart + ' – ' + magazinesEnd + '</td>' +
                                '</tr>';
                            if (dayEnd === '' || isBefore(dayEnd, magazinesEnd)) {
                                dayEnd = magazinesEnd;
                            }
                            increaseRowCount();
                        }
                    }
                } // Magazines
            }
            // If today, apply 'today' -class.
            if(moment(begin).isSame(moment(), 'day')) {
                isTodayClass =  "is-closed";
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
                    time = moment(moment(), HHmmFormat),
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
            // Replace : with . in schedules.
            selfServiceBefore = selfServiceBefore.replace(/:/g, ".");
            magazinesBefore = magazinesBefore.replace(/:/g, ".");
            staffToday = staffToday.replace(/:/g, ".");
            selfServiceAfter = selfServiceAfter.replace(/:/g, ".");
            magazinesAfter = magazinesAfter.replace(/:/g, ".");
            // If dayInfo is the same as selfServiceInfo or magazineInfo, don't show duplicated infos.
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
                // Add info row on closed days.
                var closedRowSpan =  1;
                if(dayInfo !== "" || selfServiceInfo !== "" || magazineInfo !== "") {
                    closedRowSpan = 2;
                }
                scheludeRow = '<tr class="time ' + isTodayClass + '">' +
                    '<th class="date-container" scope="row" rowspan="' + closedRowSpan + '">' +
                    '<time datetime="' + begin.format('YYYY-MM-DD') + '">' + begin.format('D.M.') + '</time>' +
                    '</th>' +
                    '<td class="day-name">' + dayName + '</td>' +
                    '<td class="main-schedule closed">' + i18n.get("Suljettu") + '</td>' +
                    '</tr>' + dayInfo + selfServiceInfo + magazineInfo;
            } else {
                scheludeRow = '<tr class="time ' + isTodayClass + '">' +
                    '<th class="date-container" scope="row" rowspan="' + rowspanCount + '">' +
                    '<time datetime="' + begin.format('YYYY-MM-DD') + '">' + begin.format('D.M.') + '</time>' +
                    '</th>' +
                    '<td class="day-name">' + dayName + '</td>' +
                    '<td class="main-schedule"><time datetime="' + dayStart + '">' + dayStart.replace(/:/g, ".") + '</time> – <time datetime="' + dayEnd + '">'
                    + dayEnd.replace(/:/g, ".") + '</time></td></tr>' + selfServiceBefore + magazinesBefore + staffToday +
                    selfServiceAfter + magazinesAfter + dayInfo + selfServiceInfo + magazineInfo;
            }
            totalRows = totalRows + rowspanCount;
            str += scheludeRow;
            begin.add(1, 'd');
        }
        $( "#weekSchelude" ).html( str );
        /* Large schedules are used in iDiD info screens. */
        if(largeSchedules) {
            $(".library-schedules").removeClass('col-lg-4 col-xl-3 schedules-widget xxl-font xl-font m-font');
            $('#schedules').addClass("large-schedules col-md-12");
            // If less than 16 rows, apply the xxl font.
            if(totalRows < 16) {
                $(".library-schedules").addClass('xxl-font');
            }
            // If 24 rows or less, apply the xl font.
            else if(totalRows <= 24) {
                $(".library-schedules").addClass('xl-font');
            }
            // If more than 28 rows, change to 'medium' font.
            else if(totalRows > 28) {
                $(".library-schedules").addClass('m-font');
            }
        }
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
    // Add swiping detection for schedules & sliderbox if available.
    detectswipe("schedules", swipeNavigation);
    if(document.getElementById("sliderBox") != null) {
        detectswipe("sliderBox", swipeNavigation);
    }
}); // OnReady
