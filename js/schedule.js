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

$("html").attr("lang", lang);

var i18n = $('body').translate({lang: lang, t: dict}); // Use the correct language

var weekCounter = 0;
// jsonp_url base
var jsonp_url = "https://api.kirjastot.fi/v3/library/" + library + "?lang=" + lang;
function getWeekSchelude(direction) {
    // +1 or -1;
    weekCounter = weekCounter + direction;
    // Do not allow going past current week.
    if(weekCounter < 0) {
        weekCounter = 0;
        return;
    }
    // Set moment locale
    moment.locale(lang);
    // Display week number.
    $( "#weekNumber" ).html( i18n.get("Viikko") + ' ' + moment().add(weekCounter, 'weeks').format('W'));
    $.getJSON(jsonp_url + "&with=schedules&period.start=" + weekCounter + "w&period.end=" + weekCounter + "w", function(data) {
        var format = 'hh:mm';
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
                }
                // Self service times.
            if(data.schedules[i] != null) {
                // selfservice times
                if(data.schedules[i].sections.selfservice != null) {
                    if(data.schedules[i].sections.selfservice.times[0] != null) {
                        // Get scheludes and check if starts before staff is present.
                        selfServiceStart = data.schedules[i].sections.selfservice.times[0].opens;
                        selfServiceEnd = data.schedules[i].sections.selfservice.times[0].closes;
                        if (moment(selfServiceStart, format).isBefore(moment(staffPresentStart, format)) ||
                            (moment(selfServiceStart, format).isSame(moment(staffPresentStart, format)))) {
                            rowspanCount = rowspanCount + 1;
                            isClosed = false;
                            selfServiceBefore = '<tr class="time--sub time isTodayClass time--no-staff">' +
                                '<td><i class="fa fa-long-arrow-right"></i> ' + i18n.get("Omatoimiaika") + '</td>' +
                                '<td>' + selfServiceStart + ' – ' + selfServiceEnd + '</td>' +
                                '</tr>';
                            dayStart = selfServiceStart;
                            if (dayEnd === '') {
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
                                dayEnd = selfServiceEnd;
                            }
                        }
                        // If selfservice does not start before staff is present or no staff is present at all.
                        else {
                            rowspanCount = rowspanCount + 1;
                            isClosed = false;
                            selfServiceAfter = '<tr class="time--sub time isTodayClass time--no-staff">' +
                                '<td><i class="fa fa-long-arrow-right"></i> ' + i18n.get("Omatoimiaika") + '</td>' +
                                '<td>' + selfServiceStart + ' – ' + selfServiceEnd + '</td>' +
                                '</tr>';
                            dayStart = selfServiceStart;
                            if (dayEnd === '') {
                                dayEnd = selfServiceEnd;
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
                        if (moment(magazinesStart, format).isBefore(moment(staffPresentStart, format)) ||
                            (moment(magazinesStart, format).isSame(moment(staffPresentStart, format)))) {
                            rowspanCount = rowspanCount + 1;
                            isClosed = false;
                            magazinesBefore = '<tr class="time--sub time isTodayClass time--no-staff">' +
                                '<td><i class="fa fa-long-arrow-right"></i> ' + i18n.get("Lehtilukusali") + '</td>' +
                                '<td>' + magazinesStart + ' – ' + magazinesEnd + '</td>' +
                                '</tr>';
                            dayStart = magazinesStart;
                            if (dayEnd === '') {
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
                                dayEnd = magazinesEnd;
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
                            dayStart = magazinesStart;
                            if (dayEnd === '') {
                                dayEnd = magazinesEnd;
                            }
                        }
                    }
                }
            }
                // If today, apply 'today' -class.
                if(moment(begin).isSame(moment(), 'day')) {
                    var isTodayClass =  "is-closed";
                    var format = 'hh:mm';
                    // var time = moment() gives you current time. no format required.
                    var time = moment(moment(), format),
                        openingTime = moment(staffPresentStart, format),
                        closingTime = moment(staffPresentEnd, format);
                    // Check if staff is present.
                    if (time.isBetween(openingTime, closingTime)) {
                        isTodayClass = "is-open";
                    }
                    // If not, check if self service time.
                    else {
                        var time = moment(moment(), format),
                            openingTime = moment(dayStart, format),
                            closingTime = moment(dayEnd, format);
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
                }
                // If no selfService or magazines, don't display a separate row for "Staff present".
                if(selfServiceBefore.length == 0 && magazinesBefore.length == 0 && selfServiceAfter.length == 0 && magazinesAfter.length == 0 ) {
                    if(staffToday.length != 0) {
                        staffToday = '';
                        rowspanCount = rowspanCount -1;
                    }
                }
                // Info row.
                if (data.schedules[i] != null) {
                    if (data.schedules[i].info != null && data.schedules[i].info.length != 0) {
                        rowspanCount = rowspanCount +1;
                        dayInfo = '<tr class="time--sub ' + isTodayClass + '">' +
                            '<td colspan="2"><i style="float: left" class="fa fa-info-circle" > </i><span style="float: left; margin-left: 10px;"> ' +  data.schedules[i].info + '</span></td>' +
                            '</tr>';
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
                        '<td><time datetime="' + dayStart + '">' + dayStart + '</time> – <time datetime="' + dayEnd + '">' + dayEnd + '</time></td>' +
                    '</tr>' + selfServiceBefore + magazinesBefore + staffToday + selfServiceAfter + magazinesAfter + dayInfo;
                }
            str += scheludeRow;
            begin.add(1, 'd');
        }
        $( "#weekSchelude" ).html( str );
    });
}

$(document).ready(function() {
    // Scheludes
    getWeekSchelude(0);
    // UI texts.
    $('#scheludesSr').append(i18n.get("Aikataulut"));
}); // OnReady
