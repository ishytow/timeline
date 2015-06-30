define(['moment', 'templates'],function(moment, JST){
    var utils = null;

    var initUtils = function(){
        utils = {
            calendars: [],
            config: {
                week: 0,
                offset: 0,
                daysCount: 7,
                depth: 7,
                use24: true,
                defaultEventMinHours: 0.25,
                defaultEventMaxHours: 24,
                dates: {
                    startTime: {
                        hours: 0,
                        minutes: 0
                    },
                    endTime: {
                        hours: 24,
                        minutes: 0
                    }
                }
            },

            getUserId: function(){
              return 2;
            },

            isUse24: function(){
                return this.config.use24;
            },

            setUse24: function(use24){
                this.config.use24 = use24;
            },

            getUuid: function(){
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }
                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            },

            getHoursFormat: function(){
                if(this.config.use24 === true){
                    return 'HH:mm'
                }
                return 'hh:mm A'
            },

            getGroups: function(offset, depth){
                var days = this.getDays(offset, depth);
                var groups = [];
                for (var i = 0; i < days.length; i++) {
                    groups.push({
                        id: i,
                        content: days[i].format('ddd, DD.MM'),
                        className: 'tileline-group-' + i,
                        style: 'min-height: 47px; width: 85px;',
                        day: days[i],
                        subgroupOrder: function(a, b){
                            a = moment(a.startDate, 'MMM DD, ' + this.getHoursFormat(), 'en').toDate().getTime();
                            b = moment(b.startDate, 'MMM DD, ' + this.getHoursFormat(), 'en').toDate().getTime();
                            return a > b ? 1 : a < b ? -1 : 0;
                        }.bind(this)
                    });
                }
                return groups;
            },

            getDays: function(offset, depth){
                var days = [];
                for (var i = 0; i < depth; i++){
                    var offSetDelta = i + offset;
                    days.push(moment().add(offSetDelta, 'days').hour(0).minute(0).second(0).locale('en'));
                }
                return days;
            },

            getStartScaleDate: function(calendar){
                var startTime = moment();
                var timeOptions = (calendar && calendar.get('startTime') && $.isPlainObject(calendar.get('startTime'))) ? calendar.get('startTime') : {};
                var time = $.extend({}, this.config.dates.startTime, timeOptions);
                startTime.hour(time.hours).minute(time.minutes).second(0);
                return startTime;
            },

            setStartScaleDate: function(timeOptions){
                $.extend(this.config.dates.startTime, timeOptions);
            },

            getEndScaleDate: function(calendar){
                var endTime = moment();
                var timeOptions = (calendar && calendar.get('endTime') && $.isPlainObject(calendar.get('endTime'))) ? calendar.get('endTime') : {};
                var time = $.extend({}, this.config.dates.endTime, timeOptions);
                return endTime.hour(time.hours).minute(time.minutes).second(0);
            },

            setEndScaleDate: function(timeOptions){
                $.extend(this.config.dates.startTime, endTime);
            },

            getItemTemplate: function(item){
                var template = JST['app/scripts/templates/item.hbs'];
                return template(item);
            },

            getNewEventDefaultDates: function(groupDay, snappedTime){
                var mSnappedTime = moment(snappedTime);
                var date = groupDay.clone();
                return {
                    startDate: date.hour(mSnappedTime.hour()).minute(mSnappedTime.minute()).second(0).locale('en').toDate().getTime(),
                    endDate: date.clone().add(this.config.defaultEventMinHours, 'hours').locale('en').toDate().getTime()
                }
            },

            getTimelineOptions: function(calendar){
                return {
                    orientation: 'top',
                    template: this.getItemTemplate,
                    zoomable: false,
                    editable: false,
                    showMajorLabels: false,
                    start: this.getStartScaleDate(calendar),
                    end: this.getEndScaleDate(calendar),
                    timeAxis: {scale: 'hour', step: 2},
                    margin: {axis: 10},
                    min: this.getStartScaleDate(calendar),
                    max: this.getEndScaleDate(calendar),
                    showCurrentTime: false,
                    stack: false,
                    format: {
                        minorLabels: {
                            minute: this.getHoursFormat(),
                            hour: this.getHoursFormat()
                        }
                    }
                };
            },

            getEventIdByItemId: function(itemId){
                return itemId.substr(0, itemId.indexOf('-g-'));
            }
        }
    };

    var getUtils = function(){
        if(utils === null){
            initUtils();
        }
        return utils;
    };

    return getUtils();
});
