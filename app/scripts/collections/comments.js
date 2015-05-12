/*global define*/

define([
    'underscore',
    'backbone',
    'models/comment'
], function (_, Backbone, CommentModel) {
    'use strict';

    var CommentsCollection = Backbone.Collection.extend({
        model: CommentModel
    });

    return CommentsCollection;
});
