define([
    'underscore',
    'backbone',
    'models/user'
], function (_, Backbone, UserModel) {
    'use strict';

    var UsersCollection = Backbone.Collection.extend({
        model: UserModel,
        calendarId: '',

        setCalendarId: function(id){
            this.calendarId = id;
            return this;
        },

        url: function(){
            return 'https://193.106.27.210/services/calendars/' + this.calendarId + '/users'
        }
    });

    return UsersCollection;
});
