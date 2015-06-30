/*global define*/

define([
    'underscore',
    'backbone',
    'collections/comments',
    'moment',
    'utils'
], function (_, Backbone, CommentsCollection, moment, Utils) {
    'use strict';

    var EventModel = Backbone.Model.extend({
        idAttribute: 'id',
        calendarId: '',

        setCalendarId: function(id){
            this.calendarId = id;
            return this;
        },

        url: function(){
            if(typeof (this.get('id')) !== 'undefined' && this.get('id') !== null && this.get('id') !== ''){
                return 'https://193.106.27.210/services/events/' + this.get('id');
            }

            return 'https://193.106.27.210/services/calendars/' + this.calendarId + '/events';
        },

        defaults: function(){
            return {
                "title":"title",
                "description":"Description",
                "startDate": '',
                "endDate":'',
                "assignTo": '',
                "createdBy": Utils.getUserId(),
                "modifyRequest":null,
                "conversation":null
            }
        },

        validate: function(attrs, options) {
        },

        parse: function(response, options)  {
            return response;
        }
    });

    return EventModel;
});
