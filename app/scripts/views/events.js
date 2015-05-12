/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'views/event',
    'collections/events',
    'moment',
    'utils'
], function ($, _, Backbone, Event, EventsCollection, moment, Utils) {
    'use strict';

    var mockedEvents = function(){
        var events = [];
        var offset =  Utils.getOffset();

        for (var i = 1; i <= Utils.getDays().length; i++) {
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
                eventName: 'Event name #' + id
            });
        }

        return events
    };

    var EventsView = Backbone.View.extend({
        items: [],

        renderItems: function(){
            this.items = [];
            this.collection = new EventsCollection(mockedEvents());
            console.log(this.collection);
            this.collection.each(function(event){
                var eventView = new Event({model: event});
                var eventItems = eventView.renderItem().items;
                $.merge(this.items, eventItems);
            }.bind(this), this);

            return this;
        }
    });

    return EventsView;
});
