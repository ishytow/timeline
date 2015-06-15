/*global define*/

define([
    'underscore',
    'backbone',
    'models/calendar',
    'utils'
], function (_, Backbone, CalendarModel, Utils) {
    'use strict';

    var CalendarsCollection = Backbone.Collection.extend({
        url: function(){
            return 'https://193.106.27.210/services/users/' + Utils.getUserId() + '/calendars'
        },

        comparator: function(a, b) {
            a = a.get('position');
            b = b.get('position');
            return a > b ? 1 : a < b ? -1 : 0;
        },

        update: function(){
            Backbone.sync('update', this, {});
        },

        model: CalendarModel
    });

    return CalendarsCollection;
});
