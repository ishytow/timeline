/*global define*/

define([
    'underscore',
    'backbone',
    'models/calendar'
], function (_, Backbone, CalendarModel) {
    'use strict';

    var CalendarsCollection = Backbone.Collection.extend({
        url: 'https://193.106.27.210/services/stub/calendars?id=3',

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
