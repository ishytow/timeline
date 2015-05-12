/*global define*/

define([
    'underscore',
    'backbone',
    'models/user'
], function (_, Backbone, UserModel) {
    'use strict';

    var UsersCollection = Backbone.Collection.extend({
        model: UserModel
    });

    return UsersCollection;
});
