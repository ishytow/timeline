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

        renderItems: function(calendar){
            this.items = [];
            this.collection.each(function(event){
                var eventView = new Event({model: event});
                var eventItems = eventView.renderItem(calendar).items;
                $.merge(this.items, eventItems);
            }.bind(this), this);
            return this;
        },

        updateItems: function(calendar){
            this.items = [];
            this.collection.each(function(event){
                var eventView = new Event({model: event});
                var eventItems = eventView.renderItem(calendar).items;
                $.merge(this.items, eventItems);
            }.bind(this), this);
            return this;
        }
    });

    return EventsView;
});
