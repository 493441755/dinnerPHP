/**
 * jquery.calendario.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2012, Codrops
 * http://www.codrops.com
 */
;( function( $, window, undefined ) {

    'use strict';

    $.Calendario = function( options, element ) {

        this.$el = $( element );
        this._init( options );

    };

    // the options
    $.Calendario.defaults = {
        /*
        you can also pass:
        month : initialize calendar with this month (1-12). Default is today.
        year : initialize calendar with this year. Default is today.
        caldata : initial data/content for the calendar.
        caldata format:
        {
            'MM-DD-YYYY' : 'HTML Content',
            'MM-DD-YYYY' : 'HTML Content',
            'MM-DD-YYYY' : 'HTML Content'
            ...
        }
        */
        weeks : [ '星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六' ],
        weekabbrs : [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ],
        months : [ '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月' ],
        monthabbrs : [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
        // choose between values in options.weeks or options.weekabbrs
        displayWeekAbbr : false,
        // choose between values in options.months or options.monthabbrs
        displayMonthAbbr : false,
        // left most day in the calendar
        // 0 - Sunday, 1 - Monday, ... , 6 - Saturday
        startIn : 1,
        onDayClick : function( $el, $content, dateProperties ) { return false; }
    };

    $.Calendario.prototype = {

        _init : function( options ) {

            // options
            this.options = $.extend( true, {}, $.Calendario.defaults, options );

            this.today = new Date();
            this.month = ( isNaN( this.options.month ) || this.options.month == null) ? this.today.getMonth() : this.options.month - 1;
            this.year = ( isNaN( this.options.year ) || this.options.year == null) ? this.today.getFullYear() : this.options.year;
            this.caldata = this.options.caldata || {};
            this._generateTemplate();
            this._initEvents();

        },
        _initEvents : function() {

            var self = this;

            this.$el.on( 'click.calendario', 'div.fc-row > div', function() {

                var $cell = $( this ),
                    idx = $cell.index(),
                    $content = $cell.children( 'div' ),
                    dateProp = {
                        day : $cell.children( 'span.fc-date' ).text(),
                        month : self.month + 1,
                        monthname : self.options.displayMonthAbbr ? self.options.monthabbrs[ self.month ] : self.options.months[ self.month ],
                        year : self.year,
                        weekday : idx + self.options.startIn,
                        weekdayname : self.options.weeks[ idx + self.options.startIn ]
                    };

                if( dateProp.day ) {
                    self.options.onDayClick( $cell, $content, dateProp );
                }

            } );

        },
        // Calendar logic based on http://jszen.blogspot.pt/2007/03/how-to-build-simple-calendar-with.html
        _generateTemplate : function( callback ) {

            var head = this._getHead(),
                body = this._getBody(),
                rowClass;

            switch( this.rowTotal ) {
                case 4 : rowClass = 'fc-four-rows'; break;
                case 5 : rowClass = 'fc-five-rows'; break;
                case 6 : rowClass = 'fc-six-rows'; break;
            }

            this.$cal = $( '<div class="fc-calendar ' + rowClass + '">' ).append( head, body );

            this.$el.find( 'div.fc-calendar' ).remove().end().append( this.$cal );

            if( callback ) { callback.call(); }

        },
        _getHead : function() {

            var html = '<div class="fc-head">';

            for ( var i = 0; i <= 6; i++ ) {

                var pos = i + this.options.startIn,
                    j = pos > 6 ? pos - 6 - 1 : pos;

                html += '<div>';
                html += this.options.displayWeekAbbr ? this.options.weekabbrs[ j ] : this.options.weeks[ j ];
                html += '</div>';

            }

            html += '</div>';

            return html;

        },
        _getBody : function() {

            var d = new Date( this.year, this.month + 1, 0 ),
                // number of days in the month
                monthLength = d.getDate(),
                firstDay = new Date( this.year, this.month, 1 );

            // day of the week
            this.startingDay = firstDay.getDay();

            var html = '<div class="fc-body"><div class="fc-row">',
                // fill in the days
                day = 1;

            // this loop is for weeks (rows)
            for ( var i = 0; i < 7; i++ ) {

                // this loop is for weekdays (cells)
                for ( var j = 0; j <= 6; j++ ) {

                    var pos = this.startingDay - this.options.startIn,
                        p = pos < 0 ? 6 + pos + 1 : pos,
                        inner = '',
                        today = this.month === this.today.getMonth() && this.year === this.today.getFullYear() && day === this.today.getDate(),
                        content = '';

                    if ( day <= monthLength && ( i > 0 || j >= p ) ) {

                        inner += '<span class="fc-date">' + day + '</span><span class="fc-weekday">' + this.options.weekabbrs[ j + this.options.startIn > 6 ? j + this.options.startIn - 6 - 1 : j + this.options.startIn ] + '</span>';

                        // this day is:
                        var strdate = ( this.month + 1 < 10 ? '0' + ( this.month + 1 ) : this.month + 1 ) + '-' + ( day < 10 ? '0' + day : day ) + '-' + this.year,
                            dayData = this.caldata[ strdate ];

                        if( dayData ) {
                            content = dayData;
                        }

                        if( content !== '' ) {
                            inner += '<div>' + content + '</div>';
                        }

                        ++day;

                    }
                    else {
                        today = false;
                    }

                    var cellClasses = today ? 'fc-today ' : '';
                    if( content !== '' ) {
                        cellClasses += 'fc-content';
                    }

                    html += cellClasses !== '' ? '<div class="' + cellClasses + '">' : '<div>';
                    html += inner;
                    html += '</div>';

                }

                // stop making rows if we've run out of days
                if (day > monthLength) {
                    this.rowTotal = i + 1;
                    break;
                }
                else {
                    html += '</div><div class="fc-row">';
                }

            }
            html += '</div></div>';

            return html;

        },
        // based on http://stackoverflow.com/a/8390325/989439
        _isValidDate : function( date ) {

            date = date.replace(/-/gi,'');
            var month = parseInt( date.substring( 0, 2 ), 10 ),
                day = parseInt( date.substring( 2, 4 ), 10 ),
                year = parseInt( date.substring( 4, 8 ), 10 );

            if( ( month < 1 ) || ( month > 12 ) ) {
                return false;
            }
            else if( ( day < 1 ) || ( day > 31 ) )  {
                return false;
            }
            else if( ( ( month == 4 ) || ( month == 6 ) || ( month == 9 ) || ( month == 11 ) ) && ( day > 30 ) )  {
                return false;
            }
            else if( ( month == 2 ) && ( ( ( year % 400 ) == 0) || ( ( year % 4 ) == 0 ) ) && ( ( year % 100 ) != 0 ) && ( day > 29 ) )  {
                return false;
            }
            else if( ( month == 2 ) && ( ( year % 100 ) == 0 ) && ( day > 29 ) )  {
                return false;
            }

            return {
                day : day,
                month : month,
                year : year
            };

        },
        _move : function( period, dir, callback ) {

            if( dir === 'previous' ) {

                if( period === 'month' ) {
                    this.year = this.month > 0 ? this.year : --this.year;
                    this.month = this.month > 0 ? --this.month : 11;
                }
                else if( period === 'year' ) {
                    this.year = --this.year;
                }

            }
            else if( dir === 'next' ) {

                if( period === 'month' ) {
                    this.year = this.month < 11 ? this.year : ++this.year;
                    this.month = this.month < 11 ? ++this.month : 0;
                }
                else if( period === 'year' ) {
                    this.year = ++this.year;
                }

            }

            this._generateTemplate( callback );

        },
        /*************************
         ******PUBLIC METHODS *****
         **************************/
        getYear : function() {
            return this.year;
        },
        getMonth : function() {
            return this.month + 1;
        },
        getMonthName : function() {
            return this.options.displayMonthAbbr ? this.options.monthabbrs[ this.month ] : this.options.months[ this.month ];
        },
        // gets the cell's content div associated to a day of the current displayed month
        // day : 1 - [28||29||30||31]
        getCell : function( day ) {

            var row = Math.floor( ( day + this.startingDay - this.options.startIn ) / 7 ),
                pos = day + this.startingDay - this.options.startIn - ( row * 7 ) - 1;

            return this.$cal.find( 'div.fc-body' ).children( 'div.fc-row' ).eq( row ).children( 'div' ).eq( pos ).children( 'div' );

        },
        setData : function( caldata ) {

            caldata = caldata || {};
            $.extend( this.caldata, caldata );
            this._generateTemplate();

        },
        // goes to today's month/year
        gotoNow : function( callback ) {

            this.month = this.today.getMonth();
            this.year = this.today.getFullYear();
            this._generateTemplate( callback );

        },
        // goes to month/year
        goto : function( month, year, callback ) {

            this.month = month;
            this.year = year;
            this._generateTemplate( callback );

        },
        gotoPreviousMonth : function( callback ) {
            this._move( 'month', 'previous', callback );
        },
        gotoPreviousYear : function( callback ) {
            this._move( 'year', 'previous', callback );
        },
        gotoNextMonth : function( callback ) {
            this._move( 'month', 'next', callback );
        },
        gotoNextYear : function( callback ) {
            this._move( 'year', 'next', callback );
        }

    };

    var logError = function( message ) {

        if ( window.console ) {

            window.console.error( message );

        }

    };

    $.fn.calendario = function( options ) {

        var instance = $.data( this, 'calendario' );

        if ( typeof options === 'string' ) {

            var args = Array.prototype.slice.call( arguments, 1 );

            this.each(function() {

                if ( !instance ) {

                    logError( "cannot call methods on calendario prior to initialization; " +
                        "attempted to call method '" + options + "'" );
                    return;

                }

                if ( !$.isFunction( instance[options] ) || options.charAt(0) === "_" ) {

                    logError( "no such method '" + options + "' for calendario instance" );
                    return;

                }

                instance[ options ].apply( instance, args );

            });

        }
        else {

            this.each(function() {

                if ( instance ) {

                    instance._init();

                }
                else {

                    instance = $.data( this, 'calendario', new $.Calendario( options, this ) );

                }

            });

        }

        return instance;

    };

} )( jQuery, window );




var codropsEvents = {
    // 一月
    '01-01-2013' : '<a>农历十一月二十</a> <a>元旦</a>',
    '01-05-2013' : '<a>农历十一月二十四</a><br><a href="http://www.17sucai.com/">小寒</a><br><a href="http://baike.baidu.com/view/25902.htm">在公历1月5-7日之间，太阳位于黄经285°</a>',
    '01-19-2013' : '<a>农历十二月初八</a> <a>腊八节</a>',
    '01-20-2013' : '<a>农历十二月初九</a><br><a href="http://www.17sucai.com/">大寒</a><br><a href="http://baike.baidu.com/view/25921.htm">每年1月20日前后太阳到达黄经300°时为大寒</a>',

    // 二月
    '02-03-2013' : '<a>农历十二月二十三</a> <a>小年</a>',
    '02-04-2013' : '<a>农历十二月二十四</a><br><a href="http://www.17sucai.com/">立春</a>',
    '02-09-2013' : '<a>农历十二月二十九</a> <a>除夕</a>',
    '02-10-2013' : '<a>农历正月初一</a> <a>春节</a>',
    '02-14-2013' : '<a>农历正月初五</a> <a>情人节</a>',
    '02-18-2013' : '<a>农历正月初九</a><br><a href="http://www.17sucai.com/">雨水</a>',
    '02-24-2013' : '<a>农历正月十五</a> <a>元宵节</a>',

    // 三月
    '03-05-2013' : '<a>农历正月二十四</a><br><a href="http://www.17sucai.com/">惊蛰</a>',
    '03-08-2013' : '<a>农历正月二十七</a> <a>妇女节</a>',
    '03-12-2013' : '<a>农历二月初一</a> <a>植树节</a>',
    '03-20-2013' : '<a>农历二月初九</a><br><a href="http://www.17sucai.com/">春分</a>',

    // 四月
    '04-01-2013' : '<a>农历二月二十一</a> <a>愚人节</a>',
    '04-04-2013' : '<a>农历二月二十四</a> <a>清明节</a><br><a href="http://www.17sucai.com/">清明</a>',
    '04-20-2013' : '<a>农历三月十一</a><br><a href="http://www.17sucai.com/">谷雨</a>',

    // 五月
    '05-01-2013' : '<a>农历三月二十二</a> <a>劳动节</a>',
    '05-04-2013' : '<a>农历三月二十五</a> <a>青年节</a>',
    '05-05-2013' : '<a>农历三月二十六</a><br><a href="http://www.17sucai.com/">立夏</a>',
    '05-12-2013' : '<a>农历四月初三</a> <a>母亲节</a>',
    '05-21-2013' : '<a>农历四月十二</a><br><a href="http://www.17sucai.com/">小满</a>',

    // 六月
    '06-01-2013' : '<a>农历四月二十三</a> <a>儿童节</a>',
    '06-05-2013' : '<a>农历四月二十七</a><br><a href="http://www.17sucai.com/">芒种</a>',
    '06-12-2013' : '<a>农历五月初五</a> <a>端午节</a>',
    '06-16-2013' : '<a>农历五月初九</a> <a>父亲节</a>',
    '06-21-2013' : '<a>农历五月十四</a><br><a href="http://www.17sucai.com/">夏至</a>',

    // 七月
    '07-01-2013' : '<a>农历五月二十四</a> <a>建党节</a>',
    '07-07-2013' : '<a>农历五月三十</a><br><a href="http://www.17sucai.com/">小暑</a>',
    '07-22-2013' : '<a>农历六月十五</a><br><a href="http://www.17sucai.com/">大暑</a>',

    // 八月
    '08-01-2013' : '<a>农历六月二十五</a> <a>建军节</a>',
    '08-07-2013' : '<a>农历七月初一</a><br><a href="http://www.17sucai.com/">立秋</a>',
    '08-13-2013' : '<a>农历七月初七</a> <a>七夕</a>',
    '08-23-2013' : '<a>农历七月十七</a><br><a href="http://www.17sucai.com/">处暑</a>',

    // 九月
    '09-07-2013' : '<a>农历八月初三</a><br><a href="http://www.17sucai.com/">白露</a>',
    '09-10-2013' : '<a>农历八月初六</a> <a>教师节</a>',
    '09-19-2013' : '<a>农历八月十五</a> <a>中秋节</a>',
    '09-23-2013' : '<a>农历八月十九</a><br><a href="http://www.17sucai.com/">秋分</a>',

    // 十月
    '10-01-2013' : '<a>农历八月二十七</a> <a>国庆节</a>',
    '10-08-2013' : '<a>农历九月初四</a><br><a href="http://www.17sucai.com/">寒露</a>',
    '10-13-2013' : '<a>农历九月初九</a> <a>重阳节</a>',
    '10-23-2013' : '<a>农历九月十九</a><br><a href="http://www.17sucai.com/">霜降</a>',

    // 十一月
    '11-07-2013' : '<a>农历十月初五</a><br><a href="http://www.17sucai.com/">立冬</a>',
    '11-22-2013' : '<a>农历十月二十</a><br><a href="http://www.17sucai.com/">小雪</a>',
    '11-28-2013' : '<a>农历十月二十六</a> <a>感恩节</a>',

    // 十二月
    '12-07-2013' : '<a>农历十一月初五</a><br><a href="http://www.17sucai.com/">大雪</a>',
    '12-22-2013' : '<a>农历十一月二十</a><br><a href="http://www.17sucai.com/">冬至</a>',
    '12-24-2013' : '<a>农历十一月二十二</a> <a>平安夜</a>',
    '12-25-2013' : '<a>农历十一月二十三</a> <a>圣诞节</a>'
};


