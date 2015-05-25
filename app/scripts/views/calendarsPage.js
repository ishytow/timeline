/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'templates',
    'utils',
    'EventListener',
    'collections/calendars',
    'collections/users',
    'views/calendars',
    'views/users'
], function ($, _, Backbone, JST, Utils, EventListener, CalendarsCollection, UsersCollection, CalendarsView, UsersView) {
    'use strict';

    var CalendarsPage = Backbone.View.extend({
        template: JST['app/scripts/templates/calendars-page.hbs'],
        tagName: 'div',
        calendarsCollection: null,
        calendarsView: null,

        initialize: function(){
            var mockedUsers = function(){
                var users = [];
                for (var i = 0; i < 10; i++){
                    users.push({
                        uuid: i,
                        firstName: 'FName' + i,
                        lastName: 'LName' + i
                    })
                }
                return users;
            };
            this.calendarsCollection = new CalendarsCollection();
            this.usersCollection = new UsersCollection(mockedUsers());
        },

        render: function () {
            this.$el.html(this.template());
            this.calendarsCollection.fetch({
                success: function(){
                    this.calendarsView = new CalendarsView({collection: this.calendarsCollection});
                    this.$el.find('#calendars-container').html(this.calendarsView.render().$el);
                }.bind(this)
            });
            this.usersView = new UsersView({collection: this.usersCollection});
            this.$el.find('#user-container').html(this.usersView.render().el);
            return this;
        }
    });

    return CalendarsPage;
});
