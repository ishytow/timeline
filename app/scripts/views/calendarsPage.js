/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates',
    'utils',
    'EventListener',
    'collections/calendars',
    'views/calendars'
], function ($, _, Backbone, JST, Utils, EventListener, CalendarsCollection, CalendarsView) {
    'use strict';

    var CalendarsPage = Backbone.View.extend({
        template: JST['app/scripts/templates/calendars-page.hbs'],
        tagName: 'div',
        calendarsCollection: null,
        calendarsView: null,

        initialize: function(){
            var mockedCalendar = [
                {
                    uuid: 'cal1',
                    title: 'First calendar',
                    startTime: {
                        hours: 0,
                        minutes: 0
                    },
                    endTime: {
                        hours: 24,
                        minutes: 0
                    }
                },
                {
                    uuid: 'cal2',
                    title: 'second calendar',
                    startTime: {
                        hours: 0,
                        minutes: 0
                    },
                    endTime: {
                        hours: 24,
                        minutes: 0
                    }
                }
            ];
            this.calendarsCollection = new CalendarsCollection();


        },

        render: function () {
            this.$el.html(this.template());
            this.calendarsCollection.fetch({
                success: function(){
                    this.calendarsView = new CalendarsView({collection: this.calendarsCollection});
                    this.$el.find('#calendars-container').html(this.calendarsView.render().$el);
                }.bind(this)
            });
            return this;
        }
    });

    return CalendarsPage;
});
