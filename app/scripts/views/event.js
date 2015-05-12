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
                this.initPopover(options.timeLineEl);
            }.bind(this));
        },

        getItemsByEvent: function(){
            var items = [];
            var days = Utils.getDays();
            var eventStartDate = moment(this.model.get('startDate'));
            var eventEndDate = moment(this.model.get('endDate'));
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
                        id: this.model.get('id') + '-g-' + i,
                        eventId: this.model.get('id'),
                        className: 'event-item-' + this.model.get('id'),
                        userName: this.model.get('userName'),
                        eventName: this.model.get('eventName'),
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
            $(document).off('click', selector + ' .edit').on('click', selector + ' .edit', this.edit);
            $(document).off('click', selector + ' .remove').on('click', selector + ' .remove', this.removeEvent);
        },

        initPopover: function(timeLineEl){
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
            this.items = this.getItemsByEvent(this.days);
            return this;
        }
    });

    return EventView;
});
