define(['moment', 'templates'],function(moment, JST){
    var utils = null;

    var initUtils = function(){
        utils = {
            calendars: [],
            config: {
                week: 0,
                daysCount: 7,
                defaultEventTimeStep: 0.25,
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

            getUuid: function(){
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }
                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            },
            getWeek: function(){
                return this.config.week;
            },

            setWeek: function(week){
                if(typeof (week) === 'number'){
                    this.config.week = week;
                }
            },
            getOffset: function(){
               return this.config.daysCount * this.getWeek();
            },

            getGroups: function(){
                var days = this.getDays();
                var groups = [];
                for (var i = 0; i < days.length; i++) {
                    groups.push({
                        id: i,
                        content: days[i].format('ddd, DD.MM'),
                        className: 'tileline-group-' + i,
                        style: 'min-height: 47px; width: 85px;',
                        day: days[i]
                    });
                }
                return groups;
            },

            getDays: function(){
                var days = [];
                var offSet = this.getOffset();
                for (var i = 0; i < this.config.daysCount; i++){
                    var offSetDelta = i + offSet;
                    days.push(moment().add(i + offSet, 'days').hour(0).minute(0).second(0).locale('en'));
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
                    startDate: date.hour(mSnappedTime.hour()).minute(mSnappedTime.minute()).second(0),
                    endDate: date.clone().add(this.config.defaultEventTimeStep, 'hours')
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
                            minute: 'HH:mm',
                            hour: 'HH:mm'
                        }
                    }
                };
            },

            getEventIdByItemId: function(itemId){
                return itemId.substr(0, itemId.indexOf('-g-'));
            },

            getMockedEvents: function(calendar){
                var events = [];
                var offset =  this.getOffset();

                for (var i = 1; i <= this.getDays().length; i++) {
                    var id = i+offset;

                    var startItemTime = new Date();
                    startItemTime.setDate(startItemTime.getDate() + i);
                    startItemTime.setHours(id+4,0,0,0);

                    var endItemTime = new Date();
                    endItemTime.setDate(endItemTime.getDate() + i);
                    endItemTime.setHours(id+8,0,0,0);

                    var uuid = this.getUuid();

                    events.push({
                        uuid: uuid,
                        assignTo: 'assignTo-' + id,
                        calendarId: 'calendar-id-' + calendar.get('uuid'),
                        startDate: startItemTime,
                        endDate: endItemTime,
                        title: 'Event title #' + uuid.substr(0, 4),
                        description: 'Awesome description of awesome event with uuid ' + uuid
                    });
                }

                return events
            },
            getMockedCalendars: function(){
                var calendars = [];
                for (var i = 0; i <= 3; i++) {
                    var uuid = this.getUuid();

                    calendars.push({
                        uuid: uuid,
                        title: 'Cal ' + i,
                        startTime: {
                            hours: i,
                            minutes: 0
                        },
                        endTime: {
                            hours: 24 - i,
                            minutes: 0
                        }
                    });
                }

                return calendars
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
