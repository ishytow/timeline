/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates',
    'views/user'
], function ($, _, Backbone, JST, UserView) {
    'use strict';

    var UsersView = Backbone.View.extend({
        template: JST['app/scripts/templates/users.hbs'],

        tagName: 'div',

        initialize: function () {

        },

        render: function () {
            this.$el.html(this.template());
            this.collection.each(function(user){
                var userView = new UserView({model: user});
                this.$el.append(userView.render().$el);
            }.bind(this), this);
            return this;
        }
    });

    return UsersView;
});
