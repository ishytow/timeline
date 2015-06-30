/*global define*/

define([
    'underscore',
    'backbone',
    'models/event'
], function (_, Backbone, EventModel) {
    'use strict';

    var EventsCollection = Backbone.Collection.extend({
        model: EventModel,
        calendarId: '',

        initialize: function(options){
            this.calendarId = options.calendarId;
            return this;
        },

        url: function(){
            return 'https://193.106.27.210/services/calendars/' + this.calendarId + '/events'
        },

        parse: function(response){
            if(_.isObject(response) && _.isObject(response.result)){
                this.count = response.count;
                this.offset = response.offset;
                return response.result;
            }
        }
    });

    return EventsCollection;
});
