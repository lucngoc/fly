
// ===========================
// Lấy giá Vietjet Air
// ===========================

function getFlight(ori, des, date, leg, airlines) {
    $(`#${airlines}title` + leg).html(ori + ' > ' + des + ' ' + date.format('DD-MM-YYYY'));

    if (airlines === 'VJ') {
        $.post('https://mapi.vietjetair.com/apimobileweb/get-flight2.php', { 'AdultCount': '1', 'ArrivalAirportCode': des, 'DepartureAirportCode': ori, 'OutboundDate': date.format('YYYY-MM-DD') })
            .done((data, textStatus, jqXHR) => {

                $(`#reload${airlines}` + leg).show();

                var html = '',
                    data = JSON.parse(data),
                    list = data.GetTravelOptionsResult.TravelOptions.OutboundOptions.Option;
                for (var i = 0; i < list.length; i++) {
                    var LegOption = list[i].Legs.LegOption;
                    if (LegOption.FareOptions.Adultfares.FareOption.length !== 0) {
                        var fas = LegOption.FareOptions.Adultfares.FareOption[0],
                            fls = LegOption.SegmentOptions.SegmentOption.Flight,
                            fprice = parseInt(fas.DiscountFare.toString().substring(0, fas.DiscountFare.toString().length - 3)) || 0,
                            flightInfo = '<tr ' + (fas.SeatsAvailable.toString() === '0' ? 'class="text-muted"' : '') + '><td>' + (i + 1) + '</td><th scope="row">' + fls.ETDLocal.substr(11, 5) + '</th><td>' + fls.Number + '</td><td>' + fas.FareClass + '</td><td>' + fprice + ' => ' + Math.round(fprice * 1.1 + 450) + '</td><td>' + (fas.SeatsAvailable.toString() === '0' ? 'Hết vé' : fas.SeatsAvailable) + '</td></tr>'
                        html = html + flightInfo;
                    }
                }
                if (html !== '') {

                    $(`#${airlines}fare` + leg).html('<table class="table table-sm table-striped"><thead><tr><th scope="col">STT</th><th scope="col">Thời gian</th><th scope="col">Số hiệu</th><th scope="col">Hạng vé</th><th scope="col">Giá</th><th scope="col">Ghế</th></tr></thead><tbody>' + html + '</tbody></table>');
                } else
                    $(`#${airlines}fare` + leg).html('<p><i class="far fa-grin-beam-sweat"></i> Không tìm thấy gì<p>');

            }).fail(() => {
                $(`#reload${airlines}` + leg).show();
                $(`#${airlines}fare` + leg).html('<p><i class="far fa-grin-beam-sweat"></i> Lỗi kết nối<p>');
                Swal.fire({
                    type: 'warning',
                    title: 'Lỗi kết nối',
                    text: 'Bạn nên xoá lịch sử web hoặc đổi IP',
                    confirmButtonText: 'Thử lại',
                    cancelButtonText: 'Bỏ',
                    showCancelButton: true

                }).then((result) => {
                    if (result.value) {
                        beginGetFlight(leg, airlines);
                    }
                });
            });
    }
}

function beginGetFlight(leg, airlines) {

    if ($(`#show${airlines}Fare` + leg).is(':checked')) {

        if (($('#origin').val() !== null) && ($('#origin').val() !== '') && ($('#destination').val() !== null) && ($('#destination').val() !== '')) {

            $(`#${airlines}title` + leg).html('');
            $(`#${airlines}fare` + leg).html('');
            $(`#reload${airlines}` + leg).hide();
            $(`#${airlines}fare` + leg).html('<p><i class="fas fa-spinner"></i> Đang cập nhật</p>');

            if (leg === '1') {
                setTimeout(() => {
                    getFlight($('#origin').val(), $('#destination').val(), caleran.config.startDate, leg, airlines);
                }, 1000);
            } else {
                setTimeout(() => {
                    getFlight($('#destination').val(), $('#origin').val(), caleran.config.endDate, leg, airlines);
                }, 1000);
            }
        } else {
            $(`#${airlines}fare` + leg).html('<p><i class="far fa-frown"></i> Hãy nhập đủ thông tin</p>');
        }

    }
}



$('.search-picker').change(() => {
    beginGetFlight('1', 'VJ');
    beginGetFlight('2', 'VJ');
});

$('#reloadVJ1').click(() => beginGetFlight('1', 'VJ'));
$('#reloadVJ2').click(() => beginGetFlight('2', 'VJ'));
$('#showVJFare1').click(() => beginGetFlight('1', 'VJ'));
$('#showVJFare2').click(() => beginGetFlight('2', 'VJ'));


// ===========================
// Khởi tạo html
// ===========================


var as = getItem('preSearch') || [],
    ar = [],
    ao = [],
    ad = [];

for (var i = 0; i < as.length; i++) {
    ar[i] = as[i].substring(0, 6);
    ao[i] = ar[i].substring(0, 3);
    ad[i] = ar[i].substring(3, 6);
}

var recent_origins_options = '',
    recent_destinations_options = '',

    origins_options = '',
    destinations_options = '',

    recent_origins_array = [],
    recent_destinations_array = [],
    recent_origins = sort_array_occurrence(ao),
    recent_destinations = sort_array_occurrence(ad);

$.each(airport, (key, val) => {
    var pos_origin = recent_origins.indexOf(val.code),
        pos_destinations = recent_destinations.indexOf(val.code),
        option = `<option value="${val.code}" data-subtext="${val.contry}">${val.name} (${val.code})</option>`;

    if (pos_origin === -1)
        origins_options += option;
    else
        recent_origins_array[pos_origin] = option;

    if (pos_destinations === -1)
        destinations_options += option;
    else
        recent_destinations_array[pos_destinations] = option;
});

for (var i = 0; i < recent_origins_array.length; i++) {
    recent_origins_options += recent_origins_array[i];
}
for (var i = 0; i < recent_destinations_array.length; i++) {
    recent_destinations_options += recent_destinations_array[i];
}


$('#origin').html(`<optgroup label="Gần đây">${recent_origins_options}</optgroup><optgroup label="Sân bay">${origins_options}</optgroup>`);
$('#destination').html(`<optgroup label="Gần đây">${recent_destinations_options}</optgroup><optgroup label="Sân bay">${destinations_options}</optgroup>`);

$('#origin').selectpicker('render');
$('#destination').selectpicker('render');

// Hàm xử lý thông tin lưu

$('#children').html(init_select(0, 8, 'CHD'));
$('#infants').html(init_select(0, 6, 'INF'));
$('#adults').html(init_select(1, 230, 'ADT'));

$('.selectpicker').selectpicker('render');


$('#airline-select').html(() => {
    var html = '';
    for (var i = 0; i < airlines.length; i++) {
        html = html + `<label style=" padding-left: 6px; padding-right: 6px; " class="btn btn-light" id="${airlines[i]}-select" data-toggle="tooltip" data-placement="top" title="${airlinesName[i]}"><input type="checkbox" name="airlines" id="${airlines[i].toLowerCase()}" autocomplete="off">
        ${airlineslogo[i]}
        </label>`;
    }
    return html;
});

$(document).ready(() => {
    if (getItem('preSearch') !== null)
        restoreSearch(getItem('preSearch')[getItem('preSearch').length - 1]);

    $('[data-toggle="tooltip"]').tooltip();

    $("#date").mouseenter(() => showLunarDate());

    restoreAirlines(airlines);

    $(':checkbox').change(() => saveAirlines(airlines));

    // Lưu giá trị khi nhấn enter
    $('input').keyup(function(event) { if (event.which === 13) { $(this).blur(); } });

});

function showLunarDate() {
    var sda = getLunarDate(caleran.config.startDate.date(), caleran.config.startDate.month() + 1, caleran.config.startDate.year()),
        eda = caleran.config.singleDate ? '' : ' - ' + getLunarDate(caleran.config.endDate.date(), caleran.config.endDate.month() + 1, caleran.config.endDate.year());
    $("#date").tooltip('hide')
        .attr('data-original-title', `Tức ${sda + eda} Âm lịch`)
        .tooltip('show');
}

// ===========================
// Xử lý nhập ngày
// ===========================
$(".caleran").caleran({
    hideOutOfRange: true,
    showFooter: true,
    showHeader: false,
    showOn: "top",
    arrowOn: "left",
    calendarCount: ($(window).width() >= 700) ? 3 : 1,
    showOn: "top",
    arrowOn: "center",
    minDate: moment(),
    maxDate: moment().add(12, 'months'),
    startOnMonday: true,
    locale: 'vi',
    format: 'L',
    enableYearSwitcher: false,
    singleDate: getItem('oneway') || false,
    onafterselect: function(caleran, startDate, endDate) {
        showLunarDate();
        beginGetFlight('1', 'VJ');
        beginGetFlight('2', 'VJ');
        beginGetFlight('1', 'JS');
        beginGetFlight('2', 'JS');
    },
    onrangeselect: function(caleran, range) {
        showLunarDate();
        beginGetFlight('1', 'VJ');
        beginGetFlight('2', 'VJ');
        beginGetFlight('1', 'JS');
        beginGetFlight('2', 'JS');
    },
    onafterhide: function(caleran) {
        $("#date").tooltip('hide');
    },
    ranges: rangeCustom,
    rangeLabel: "Quick "
});

var caleran = $(".caleran").data("caleran");


$('#trip-type').click(() => {
    if ($('#trip-type').text() === 'Một chiều') {
        $('#trip-type').text('Khứ hồi');
        caleran.config.singleDate = false;
        setItem('oneway', false);
    } else {
        $('#trip-type').text('Một chiều');
        caleran.config.singleDate = true;
        setItem('oneway', true);
    }
    caleran.setDisplayDate();
    caleran.showDropdown();
});

// ===========================
// Xử lý chọn chặng từ select
// ===========================
$('#origin').change(() => {

    $('#destination option').show();
    $('#destination option[value="' + $('#origin').val() + '"]').hide();
    $('#destination').selectpicker('refresh');

    var trip_f = sort_array_occurrence(ar),
        trip_s = false;
    for (var i = 0; i < trip_f.length; i++) {
        if (trip_f[i].substring(0, 3) === $('#origin').val()) {
            $('#destination').selectpicker('val', trip_f[i].substring(3, 6));
            trip_s = true;
            break;
        }
    }
    if (!trip_s) {
        $('#destination').selectpicker('val', '');
    }
});

// Hành động cho nút hoán đổi
$('#hoan-doi').click(() => {
    if (($('#origin').val() !== null) && ($('#destination').val() !== null)) {
        var temp = $('#origin').val();
        $('#origin').selectpicker('val', $('#destination').val()).change();
        $('#destination').selectpicker('val', temp);
    }
});

// ===========================
// Xử lý tìm kiếm
// ===========================

var url = null;

$('#flight-search').click(() => {

    var search_params = { origin: $('#origin').val(), destination: $('#destination').val(), isoneway: ($('#trip-type').text() === 'Một chiều'), adults: $('#adults').val(), children: $('#children').val(), infants: $('#infants').val(), promo: $('#promo-code').val(), sd: caleran.config.startDate, ed: caleran.config.endDate };
    url = getUrlSearch(search_params);

    if (url) {
        var air_check = false;
        for (var i = 0; i < airlines.length; i++) {
            if ($('#' + airlines[i]).is(':checked')) {
                air_check = true;
                saveSearch();
                window.open(url[airlines[i].toLowerCase()]);
            }
        }
        if (!air_check)
            $('#flight-search').addClass('btn-outline-danger').tooltip('hide')
            .attr('data-original-title', 'Chưa chọn hãng bay')
            .tooltip('show');


    } else {
        $('#flight-search').addClass('btn-outline-danger').tooltip('hide')
            .attr('data-original-title', 'Kiểm tra lại dữ liệu')
            .tooltip('show');
    }
}).mouseout(() => {
    $('#flight-search').removeClass('btn-outline-danger').tooltip('hide')
        .attr('data-original-title', '');
});
// ========================================
// Mở vé
// ========================================
function check_input(airlines) {
    var code = $('#open-code').val().trim().toUpperCase(),
        last_name = $('#open-lastname').val().trim().toUpperCase(),
        check_code = ((airlines === 'vj') && (code.length === 8) && (!isNaN(code))) || (code.length === 6) && (/^[a-zA-Z0-9 ]+$/.test(code)),
        dont_request_last_name = (airlines === 'vj') || ((airlines === 'bav') && (!$('#checkin-code').is(':checked'))),
        check_last_name = dont_request_last_name ? true : ((/^[a-zA-Z]+$/.test(last_name)) && (last_name.length >= 1));
    if (check_code && check_last_name) {

        return true;
    } else {
        return false;
    }
}


$('#open-vj').click(() => {
    var code = $('#open-code').val().trim(),
        last_name = $('#open-lastname').val().trim().toUpperCase();

    if (check_input('vj')) {
        if ($('#checkin-code').is(':checked'))
            window.open(`https://booking.vietjetair.com/SearchResCheckin.aspx?lang=vi`);
        else
            window.open(`https://vietjet-api.intelisys.ca/banknetvnwebreceiver/receivebanknetvnUPI.aspx?lang=vi&vpc_Merchant=VIETJETAIR&vpc_OrderInfo=${code}`);
    } else {
        $('#open-vj').addClass('btn-outline-danger').tooltip('hide')
            .attr('data-original-title', 'Kiểm tra dữ liệu')
            .tooltip('show');
    }
});


$('#open-vn').click(() => {
    var code = $('#open-code').val().trim(),
        last_name = $('#open-lastname').val().trim().toUpperCase();

    if (check_input('')) {
        if ($('#checkin-code').is(':checked'))
            window.open(`https://checkin.vietnamairlines.com/SSW2010/VNM0/#checkin?deepLinkPage=true&searchOption=PNR&pnr=${code}&lastName=${last_name}&lang=vi_VN`);
        else
            window.open(`https://fly.vietnamairlines.com/dx/VNDX/#/myb?pnr=${code}&lastName=${last_name}&locale=vi-VI`);
    } else {
        $('#open-vn').addClass('btn-outline-danger').tooltip('hide')
            .attr('data-original-title', 'Kiểm tra dữ liệu')
            .tooltip('show');
    }

});

$('#open-bav').click(() => {

    var code = $('#open-code').val().trim(),
        last_name = $('#open-lastname').val().trim().toUpperCase();

    if (check_input('bav')) {
        if ($('#checkin-code').is(':checked'))
            window.open(`https://www.bambooairways.com/WebCheckIn/web/checkin`);
        else
            window.open(`https://www.bambooairways.com/reservation/ibe/modify?locale=vi&wvm=WVMD&channel=PB&confirmationCode=${code}&mode=UAVItinInter`);
    } else {
        $('#open-bav').addClass('btn-outline-danger').tooltip('hide')
            .attr('data-original-title', 'Kiểm tra dữ liệu')
            .tooltip('show');
    }
});


$('#down-bav').click(() => {
    var code = $('#open-code').val().trim(),
        last_name = $('#open-lastname').val().trim().toUpperCase();

    if (check_input('bav')) {
        window.open(`https://www.bambooairways.com/reservation/ibe/modify?locale=vi&wvm=WVMD&channel=PB&confirmationCode=${code}&mode=UAVItinInter&ticketFlow=eTicket&withFare=true&paxId=ALL`);
    }
})

$('#open-vu').click(() => {
    var code = $('#open-code').val().trim(),
        last_name = $('#open-lastname').val().trim().toUpperCase();

    if (check_input('vu')) {
        window.open(`https://booking.vietravelairlines.vn/vi/manage?confirmationNumber=${code}&bookingLastName=${last_name}`);
    } else {
        $('#open-vu').addClass('btn-outline-danger').tooltip('hide')
            .attr('data-original-title', 'Kiểm tra dữ liệu')
            .tooltip('show');
    }
})


$('.open-area button').mouseout(() => {
    $('.open-area button').removeClass('btn-outline-danger').tooltip('hide')
        .attr('data-original-title', '');
});

$('#open-code').focus(() => {
    $('#vj-extra').collapse('hide');
})

$('#checkin-code').click(() => {
    if ($('#checkin-code').is(':checked')) {
        $('#down-bav').hide();
        $('#open-vu').hide();
    } else {
        $('#open-vu').show();
        $('#down-bav').show();
    }
})


// ========================================
// Định nghĩa lại drawFooter
// ========================================

caleran.drawFooter = function() {
    if (this.config.showFooter === true) {
        if (this.config.rangeOrientation === "horizontal" || this.globals.isMobile) {
            this.input.append("<div class='caleran-ranges'></div>");
        } else {
            this.input.addClass("caleran-input-vertical-range");
            this.input.wrapInner("<div class='caleran-left'></div>");
            $("<div class='caleran-right' style='max-width: " + this.config.verticalRangeWidth + "px; min-width: " + this.config.verticalRangeWidth + "px'><div class='caleran-ranges'></div></div>").insertAfter(this.input.find(".caleran-left"));
        }
        var ranges = this.input.parent().find(".caleran-ranges");
        ranges.append("<span class='caleran-range-header-container'><i class='fa fa-retweet'></i><div class='caleran-range-header'>" + this.config.rangeLabel + "</div></span>");
        for (var range_id = 0; range_id < this.config.ranges.length; range_id++) {
            ranges.append("<div class='caleran-range" + ((this.config.ranges[range_id].selected) ? " caleran-range-selected" : "") + "' data-id='" + range_id + "'>" + this.config.ranges[range_id].title + "</div>");
        }
    }
    if (this.globals.isMobile && !this.config.inline) {
        if (this.config.singleDate === true || this.config.showFooter === false) {
            this.input.append("<div class='caleran-filler'></div>");
        }
    }
    if ((this.globals.isMobile && !this.config.inline) || (!this.globals.isMobile && !this.config.inline && this.config.showButtons)) {
        if (this.config.rangeOrientation === "horizontal" || this.globals.isMobile) {
            this.input.append("<div class='caleran-footer'></div>");
        } else {
            this.input.find(".caleran-right").append("<div class='caleran-footer'></div>");
        }
        this.footer = this.input.find(".caleran-footer");
        this.footer.append("<button type='button' class='caleran-cancel'>" + this.config.cancelLabel + "</button>");
        this.footer.append("<button type='button' class='caleran-apply'>" + this.config.applyLabel + "</button>");
        if (this.globals.firstValueSelected === false && this.config.startEmpty == true) {
            this.footer.find(".caleran-apply").attr("disabled", "disabled");
        }
        if (this.globals.isMobile && this.globals.endSelected === false) {
            this.footer.find(".caleran-apply").attr("disabled", "disabled");
        }
    }
}