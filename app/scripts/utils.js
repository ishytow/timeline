define(['moment', 'templates'],function(moment, JST){
    var utils = null;

    var initUtils = function(){
        utils = {
            config: {
                week: 0,
                daysCount: 7,
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
                    groups.push({id: i, content: days[i].format('ddd, DD.MM'), className: 'tileline-group-' + i, style: 'min-height: 47px;'});
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

            getStartScaleDate: function(timeOptions){
                var startTime = moment().toDate();
                var time = $.extend({}, this.config.dates.startTime, timeOptions);
                startTime.setHours(time.hours, time.minutes, 0, 0);
                return startTime;
            },

            getEndScaleDate: function(timeOptions){
                var endTime = moment().toDate();
                var time = $.extend({}, this.config.dates.endTime, timeOptions);
                endTime.setHours(time.hours, time.minutes, 0, 0);
                return endTime;
            },

            getItemTemplate: function(item){
                var template = JST['app/scripts/templates/item.hbs'];
                return template(item);
            },

            getTimelineOptions: function(){
                return {
                    orientation: 'top',
                    template: this.getItemTemplate,
                    zoomable: false,
                    editable: false,
                    showMajorLabels: false,
                    start: this.getStartScaleDate(),
                    end: this.getEndScaleDate(),
                    timeAxis: {scale: 'hour', step: 2},
                    margin: {axis: 10},
                    min: this.getStartScaleDate(),
                    max: this.getEndScaleDate(),
                    showCurrentTime: false,
                    stack: false,
                    format: {
                        minorLabels: {
                            minute: 'HH:mm',
                            hour: 'HH:mm'
                        }
                    },
                    onAdd: this.onAdd,
                    onUpdate: this.onUpdate,
                    onMove: this.onMove,
                    onMoving: this.onMoving,
                    onRemove: this.onRemove
                };
            },


            getMockedEvents: function(){
                var events = [];
                var offset =  this.getOffset();

                for (var i = 1; i <= this.getDays().length; i++) {
                    var id = i+offset;

                    var startItemTime = new Date();
                    startItemTime.setDate(startItemTime.getDate() + i);
                    startItemTime.setHours(id+2,0,0,0);

                    var endItemTime = new Date();
                    endItemTime.setDate(endItemTime.getDate() + i);
                    endItemTime.setHours(id+8,0,0,0);

                    events.push({
                        id: 'event-id-' + id,
                        userId: 'uid-'+ id,
                        startDate: startItemTime,
                        endDate: endItemTime,
                        userName: 'User name #' + id,
                        eventTitle: 'Event title #' + id,
                        eventDescription: 'Awesome description of awesome event with number ' + id
                    });
                }

                return events
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
