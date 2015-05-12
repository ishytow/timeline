/*global define*/

define([
    'underscore',
    'backbone',
    'models/event'
], function (_, Backbone, EventModel) {
    'use strict';

    var EventsCollection = Backbone.Collection.extend({
        model: EventModel
    });

    return EventsCollection;
});
