define([
    'underscore',
    'backbone',
    'utils'
], function (_, Backbone, Utils) {
    'use strict';

    var CalendarModel = Backbone.Model.extend({

        idAttribute: 'uuid',

        defaults: function() {
            return {
                uuid: Utils.getUuid(),
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
