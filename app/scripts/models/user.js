define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    'use strict';

    var UserModel = Backbone.Model.extend({
        url: '',

        initialize: function() {
        },

        defaults: {
            uuid: '',
            firstName: 'FName',
            lastName: 'LName',
            imgUrl: 'http://tpstatic.com/img/profile/default_user.jpg'
        }
    });

    return UserModel;
});
