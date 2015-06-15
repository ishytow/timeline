define([
    'underscore',
    'backbone',
    'utils'
], function (_, Backbone, Utils) {
    'use strict';

    var CalendarModel = Backbone.Model.extend({

        idAttribute: 'id',

        url: function(){
            if(typeof (this.get('id')) !== 'undefined' && this.get('id') !== null && this.get('id') !== ''){
                return 'https://193.106.27.210/services/calendars/' + this.get('id');
            }

            return 'https://193.106.27.210/services/users/' + Utils.getUserId() + '/calendars';
        },

        defaults: function() {
            return {
                title: 'Default calendar',
                startTime: {
                    hours: 0,
                    minutes: 0
                },
                endTime: {
                    hours: 24,
                    minutes: 0
                }
            }
        }
    });

    return CalendarModel;
});
