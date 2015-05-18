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
        url: '',

        idAttribute: 'uuid',

        initialize: function() {

        },

        defaults: function(){
            return {
                uuid: Utils.getUuid(),
                title: "Default title",
                description: "Default description",
                startDate: moment().toDate().getTime(),
                endDate: moment().add(2, 'hour').toDate().getTime(),
                assignTo: '',
                createdBy: '',
                calendarId: '',
                modRequest: '',
                conversationId: ''
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
