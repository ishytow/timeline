/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'views/event'
], function ($, _, Backbone, Event) {
    'use strict';

    var EventsView = Backbone.View.extend({
        items: [],
        timeline: null,
        calendar: null,

        initialize: function(options){
            if(_.isObject(options) && _.isObject(options.timeline)){
                this.timeline = options.timeline;
            }
            if(_.isObject(options) && _.isObject(options.calendar)){
                this.calendar = options.calendar;
            }
        },

        renderItems: function(){
            this.items = [];
            this.collection.each(function(event){
                var eventView = new Event({
                    model: event,
                    timeline: this.timeline,
                    calendar: this.calendar});
                var eventItems = eventView.renderItem().items;
                $.merge(this.items, eventItems);
            }.bind(this), this);
            return this;
        }
    });

    return EventsView;
});
