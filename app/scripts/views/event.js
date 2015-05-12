/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates',
    'moment',
    'utils',
    'EventListener'
], function ($, _, Backbone, JST, moment, Utils, EventListener) {
    'use strict';

    var EventView = Backbone.View.extend({
        items: [],

        edit: function(){
            console.log('edit');
        },

        removeEvent: function(){
            console.log('remove');
        },

        initialize: function () {
            EventListener.get('timeline').on('timeline-created', function(options){
                this.initPopovers(options.timeLineEl);
            }.bind(this));
        },

        getItemsByEvent: function(event){
            var items = [];
            var days = Utils.getDays();
            var eventStartDate = moment(event.get('startDate'));
            var eventEndDate = moment(event.get('endDate'));
            var startScaleDate = moment(Utils.getStartScaleDate());
            var endScaleDate = moment(Utils.getEndScaleDate());
            var lastDate = days[days.length - 1].clone();

            for (var i = 0; i < days.length; i++) {
                var start = null;
                var end = null;
                var nextDay = (days[i+1]) ? days[i+1] : lastDate.add(1, 'days');

                if(eventStartDate.isBetween(days[i], nextDay, 'minute')){
                    start = moment().hour(eventStartDate.hour()).minute(eventStartDate.minute()).second(0);
                }else if(eventStartDate.isBefore(days[i], 'minute') || eventStartDate.isSame(days[i], 'minute')){
                    start = startScaleDate;
                }

                if(eventEndDate.isBetween(days[i], nextDay, 'minute')){
                    end = moment().hour(eventEndDate.hour()).minute(eventEndDate.minute()).second(0);
                }else if(eventEndDate.isAfter(nextDay, 'minute') || eventEndDate.isSame(nextDay, 'minute')){
                    end = endScaleDate;
                }

                if(start !== null && end !== null){
                    items.push({
                        id: event.get('id') + '-g-' + i,
                        eventId: event.get('id'),
                        className: 'event-item-' + event.get('id'),
                        userName: event.get('userName'),
                        eventName: event.get('eventName'),
                        eventStartDate: eventStartDate.locale('en').format('MM.DD, HH:mm'),
                        eventEndDate: eventEndDate.locale('en').format('MM.DD, HH:mm'),
                        start: start,
                        end: end,
                        group: i});
                }
            }

            return items;
        },

        initEvents: function(){
            var selector = '.popover-content .event-id-'+this.model.get('id');
            $(document).on('click', selector + ' .edit', this.edit);
            $(document).on('click', selector + ' .remove', this.removeEvent);
        },

        initPopovers: function(timeLineEl){
            var _this = this;
            this.$el = timeLineEl.find('.event-item-' + this.model.get('id'));
            this.$el.popover({
                html : true,
                title: function() {
                    return $(this).parent().find('.popover-header').html();
                },
                content: function() {
                    return $(this).parent().find('.popover-content').html();
                },
                trigger: 'click',
                container: 'body',
                placement: 'top'
            });

            this.initEvents();
        },

        renderItem: function(){
            this.items = this.getItemsByEvent(this.model, this.days);
            return this;
        }
    });

    return EventView;
});
