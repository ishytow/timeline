/*global define*/

define([
    'underscore',
    'backbone',
    'collections/comments'
], function (_, Backbone, CommentsCollection) {
    'use strict';

    var EventModel = Backbone.Model.extend({
        url: '',

        initialize: function() {
        },

        defaults: {
            id: '',
            userId: '',
            startDate: '',
            endDate: '',
            title: '',
            comments: new CommentsCollection()
        },

        validate: function(attrs, options) {
        },

        parse: function(response, options)  {
            return response;
        }
    });

    return EventModel;
});
